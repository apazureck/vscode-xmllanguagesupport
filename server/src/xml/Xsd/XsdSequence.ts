import { IElement } from "../Element";
import { XmlSchema } from "./XmlSchema";
import { IXsdCheckable, IXsdDiagnostic, IXsdType, XsdDiagnosticCode } from "./Xsd";
import { XsdDiagnostic } from "./XsdDiagnostic";

const wrongElement: string = "Unexpected Element in Sequence";

export class XsdSequence implements IXsdCheckable {
    public readonly sequenceElements: IXsdType[];
    constructor(public readonly raw: IElement) {
        this.sequenceElements = this.raw.children.find(x => x.name === "sequence").children.map(x => XmlSchema.createElement(x));
    }

    public checkElement(element: IElement): IXsdDiagnostic[] {
        let diags: IXsdDiagnostic[] = [];
        for (let i: number = 0; i < element.children.length && i < this.sequenceElements.length; i++) {
            // Check if element is allowed here
            switch (this.sequenceElements[i].name) {
                case "choice":
                    break;
                default:
                    if (this.sequenceElements[i].name !== element.children[i].name) {
                        diags.push(new XsdDiagnostic(XsdDiagnosticCode.SequenceWrongElement, wrongElement, element.children[i], this.sequenceElements[i]));
                    }
                    break;
            }

            // Pass checks to element
            diags = diags.concat(this.sequenceElements[i].checkElement(element.children[i]));
        }
        return diags;
    }
}
