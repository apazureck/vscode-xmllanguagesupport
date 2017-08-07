import { IElement } from "../Element";
import { ElementError, IXsdCheckable, IXsdDiagnostic, IXsdType, noComplexTypeMessage, noElementMessage } from "./Xsd";
import { XsdSequence } from "./XsdSequence";
export class XsdComplexType implements IXsdType {
    public raw: IElement;
    public name: string;
    public rules: IXsdCheckable[];
    private readonly complexContent: IElement;
    private readonly checkables: IXsdCheckable[];
    constructor(source: IElement) {
        this.checkables = [];
        this.name = source.attributes.find(x => x.name === "name").value;
        if (!this.name) {
            throw new ElementError(source, noElementMessage);
        }
        const ctype = source.children.find(x => x.name === "complexType");
        // Check if type has the definition in itself. Handle inheritance here later, too
        if (ctype.children.some(x => x.name === "complexContent"))
            this.complexContent = ctype.children.find(x => x.name === "complexContent");
        if (!this.complexContent) {
            throw new ElementError(source, noComplexTypeMessage);
        }

        // get sequences
        try {
            if (this.complexContent.children.some(x => x.name === "sequence"))
                this.checkables.push(new XsdSequence(this.complexContent));
        } catch (error) {
            // do nothing
        }
    }

    public checkElement(element: IElement): IXsdDiagnostic[] {
        let ret: IXsdDiagnostic[] = [];
        for (const check of this.checkables) {
            ret = ret.concat(check.checkElement(element));
        }
        return ret;
    }
}