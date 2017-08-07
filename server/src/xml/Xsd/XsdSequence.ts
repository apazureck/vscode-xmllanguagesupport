import { IElement } from "../Element";
import { IXsdCheckable, IXsdDiagnostic, IXsdType, XsdDiagnostic, XsdDiagnosticCode } from "./Xsd";

export class XsdSequence implements IXsdCheckable {
    public readonly sequenceElements: IXsdType[];
    constructor(public readonly raw: IElement) {
        this.sequenceElements = this.raw.children.find(x => x.name === "sequence").children as any[];
    }

    public checkElement(element: IElement): IXsdDiagnostic[] {
        const diags: IXsdDiagnostic[] = [];
        for (let i: number = 0; i < element.children.length && i < this.sequenceElements.length; i++) {
            if (element.children[i].type !== this.sequenceElements[i]) {
                if (element.type) {
                    diags.push(new XsdDiagnostic(XsdDiagnosticCode.SequenceWrongElement,
                        `Expected Element "${this.sequenceElements[i].name}", but found Element "${element.children[i].name}" on Element "${element.fullName}"`,
                        element.children[i],
                        this.sequenceElements[i]));
                } else {
                    diags.push(new XsdDiagnostic(XsdDiagnosticCode.SequenceUnknownType,
                        `Unkown element ${element.fullName} found in Sequence ${this.raw.name}`,
                        element,
                        this.sequenceElements[i]));
                }
            }
        }
        return diags;
    }
}
