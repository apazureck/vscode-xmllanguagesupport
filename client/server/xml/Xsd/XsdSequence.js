"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const XmlSchema_1 = require("./XmlSchema");
const Xsd_1 = require("./Xsd");
const XsdDiagnostic_1 = require("./XsdDiagnostic");
const wrongElement = "Unexpected Element in Sequence";
class XsdSequence {
    constructor(raw) {
        this.raw = raw;
        this.sequenceElements = this.raw.children.find(x => x.name === "sequence").children.map(x => XmlSchema_1.XmlSchema.createElement(x));
    }
    checkElement(element) {
        let diags = [];
        for (let i = 0; i < element.children.length && i < this.sequenceElements.length; i++) {
            // Check if element is allowed here
            switch (this.sequenceElements[i].name) {
                case "choice":
                    break;
                default:
                    if (this.sequenceElements[i].name !== element.children[i].name) {
                        diags.push(new XsdDiagnostic_1.XsdDiagnostic(Xsd_1.XsdDiagnosticCode.SequenceWrongElement, wrongElement, element.children[i], this.sequenceElements[i]));
                    }
                    break;
            }
            // Pass checks to element
            diags = diags.concat(this.sequenceElements[i].checkElement(element.children[i]));
        }
        return diags;
    }
}
exports.XsdSequence = XsdSequence;
//# sourceMappingURL=XsdSequence.js.map