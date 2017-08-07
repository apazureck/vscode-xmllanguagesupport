import { IAttribute } from "../Attribute";
import { IElement } from "../Element";
import {
    ElementError,
    IXsdCheckable,
    IXsdDiagnostic,
    IXsdType,
    noElementMessage,
    simpleDeclaredDefaultAndFixMessage,
} from "./Xsd";

export class XsdSimpleType implements IXsdType {
    public readonly raw: IElement;
    public readonly name: string;
    public readonly type: string;
    public readonly default?: IAttribute;
    public readonly fixed?: IAttribute;
    constructor(source: IElement) {
        this.name = source.attributes.find(x => x.name === "name").value;
        if (!this.name)
            throw new ElementError(source, noElementMessage);
        this.type = source.attributes.find(x => x.name === "type").value;
        if (!this.type) {
            throw new ElementError(source, );
        }
        this.default = source.attributes.find(x => x.name === "default");
        this.fixed = source.attributes.find(x => x.name === "fixed");
        if (this.fixed !== undefined && this.default !== undefined) {
            throw new ElementError(source, simpleDeclaredDefaultAndFixMessage);
        }
    }

    public checkElement(element: IElement): IXsdDiagnostic[] {
        return [];
    }
}