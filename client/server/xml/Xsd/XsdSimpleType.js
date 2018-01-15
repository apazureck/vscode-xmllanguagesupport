"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SchemaError_1 = require("./SchemaError");
const Xsd_1 = require("./Xsd");
const XsdDiagnostic_1 = require("./XsdDiagnostic");
class RegexTypeCheck {
    constructor(regex, message, diagCode) {
        this.regex = regex;
        this.message = message;
        this.diagCode = diagCode;
    }
    check(type, element) {
        const match = this.regex.exec(element.body);
        if (!match) {
            return [new XsdDiagnostic_1.XsdDiagnostic(this.diagCode, this.message, element, type)];
        }
        return [];
    }
}
class XsdSimpleType {
    constructor(source) {
        this.name = source.attributes.find(x => x.name === "name").value;
        if (!this.name)
            throw new SchemaError_1.ElementError(source, Xsd_1.noElementMessage);
        this.type = source.attributes.find(x => x.name === "type").value;
        if (!this.type) {
            throw new SchemaError_1.ElementError(source);
        }
        this.default = source.attributes.find(x => x.name === "default");
        this.fixed = source.attributes.find(x => x.name === "fixed");
        if (this.fixed !== undefined && this.default !== undefined) {
            throw new SchemaError_1.ElementError(source, Xsd_1.simpleDeclaredDefaultAndFixMessage);
        }
    }
    static addTypeCheck(type, check) {
        XsdSimpleType.typeChecks[type] = check;
    }
    checkElement(element) {
        if (XsdSimpleType.typeChecks[this.type.split(":").pop()]) {
            return XsdSimpleType.typeChecks[this.type.split(":").pop()].check(this, element);
        }
        return [new XsdDiagnostic_1.XsdDiagnostic(Xsd_1.XsdDiagnosticCode.SimpleTypeUnknown, "Requested Type " + this.name + " is not known", element, this)];
    }
}
XsdSimpleType.typeChecks = {
    date: new RegexTypeCheck(/^\d{4}-\d{2}-\d{2}(?:Z|[+-]\d{2}:\d{2})?$/, "Date format is not valid", Xsd_1.XsdDiagnosticCode.DateIsNotValid),
    integer: new RegexTypeCheck(/^\d+$/, "Integer contains unallowed characters", Xsd_1.XsdDiagnosticCode.UnallowedCharacter),
    string: new RegexTypeCheck(/([<>"'])/, "Unallowed character in string. Do not use <, >, \" or '", Xsd_1.XsdDiagnosticCode.UnallowedCharacter),
};
exports.XsdSimpleType = XsdSimpleType;
//# sourceMappingURL=XsdSimpleType.js.map