import { IAttribute } from "../Attribute";
import { IElement } from "../Element";
import { ElementError } from "./SchemaError";
import {
    IXsdCheckable,
    IXsdDiagnostic,
    IXsdType,
    noElementMessage,
    simpleDeclaredDefaultAndFixMessage,
    XsdDiagnosticCode,
} from "./Xsd";
import { XsdComplexType } from "./XsdComplexType";
import { XsdDiagnostic } from "./XsdDiagnostic";

interface ITypeCheck {
    check: (type: XsdSimpleType, element: IElement) => XsdDiagnostic[];
}

class RegexTypeCheck implements ITypeCheck {
    private pMessage: (match: RegExpMatchArray) => string;
    constructor(private regex: RegExp, message: string | ((match: RegExpMatchArray) => string), private diagCode: XsdDiagnosticCode) {
        if (typeof message === "string") {
            this.pMessage = () => message;
        } else {
            this.pMessage = message;
        }
    }
    public check(type: XsdSimpleType, element: IElement): XsdDiagnostic[] {
        const match = this.regex.exec(element.body);
        if (match) {
            return [new XsdDiagnostic(this.diagCode, this.pMessage(match), element, type)];
        }
        return [];
    }
}

export class XsdSimpleType implements IXsdType {
    public static addTypeCheck(type: string, check: ITypeCheck): void {
        XsdSimpleType.typeChecks[type] = check;
    }
    private static typeChecks: { [key: string]: ITypeCheck } = {
        "xs:boolean": new RegexTypeCheck(/^((?!^true$|^false$)[\s\S])*$/, (match) => "Unallowed character(s) '" + match[0] + "' in boolean type. Only true or false allowed, no spaces.", XsdDiagnosticCode.BooleanNotValid),
        "xs:date": new RegexTypeCheck(/^((?!^\d{4}-\d{2}-\d{2}(?:Z$|[+-]\d{2}:\d{2}$)?)[\s\S])*$/gm, "Date format is not valid", XsdDiagnosticCode.DateIsNotValid),
        "xs:decimal": new RegexTypeCheck(/^((?!^[+-]?\.?\d+(\.\d+)?$)[\s\S])*$/, (match) => "Unallowed characters '" + match[0] + "' in decimal type. No spaces allowed, no scientific notation or thousand separators", XsdDiagnosticCode.DecimalNotValid),
        "xs:integer": new RegexTypeCheck(/^[+-]?\d+$/gm, "Integer contains unallowed characters", XsdDiagnosticCode.UnallowedCharacter),
        "xs:string": new RegexTypeCheck(/^((?![<>"'])(?!&(?!\w*\b;))[\s\S])*$/, "Unallowed character in string. Do not use <, >, \" or '", XsdDiagnosticCode.UnallowedCharacter),
        "xs:time": new RegexTypeCheck(/^([01][0-9]|2[0-3])(:[0-5][0-9]){2}([+-]([01][0-9]|2[0-3]):[0-5][0-9]|Z|\.\d+)?$/, "Unallowed time value", XsdDiagnosticCode.TimeInvalid),
    };
    public readonly raw: IElement;
    public readonly name: string;
    public readonly type: string;
    public readonly default?: IAttribute;
    public readonly fixed?: IAttribute;
    private readonly xsdType;
    constructor(source: IElement) {
        this.name = source.attributes.find(x => x.name === "name").value;
        if (!this.name)
            throw new ElementError(source, noElementMessage);
        this.type = source.attributes.find(x => x.name === "type").value;
        if (!this.type) {
            throw new ElementError(source);
        }
        this.xsdType = this.type.replace(source.namespace + ":", "xs:");
        this.default = source.attributes.find(x => x.name === "default");
        this.fixed = source.attributes.find(x => x.name === "fixed");
        if (this.fixed !== undefined && this.default !== undefined) {
            throw new ElementError(source, simpleDeclaredDefaultAndFixMessage);
        }
    }

    public checkElement(element: IElement): IXsdDiagnostic[] {
        if (XsdSimpleType.typeChecks[this.xsdType]) {
            return XsdSimpleType.typeChecks[this.xsdType].check(this, element);
        }
        return [new XsdDiagnostic(XsdDiagnosticCode.SimpleTypeUnknown, "Requested Type " + this.name + " is not known", element, this)];
    }
}
