"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SchemaError_1 = require("./SchemaError");
const Xsd_1 = require("./Xsd");
const XsdSequence_1 = require("./XsdSequence");
class XsdComplexType {
    constructor(source) {
        this.checkables = [];
        this.name = source.attributes.find(x => x.name === "name").value;
        if (!this.name) {
            throw new SchemaError_1.ElementError(source, Xsd_1.noElementMessage);
        }
        const ctype = source.children.find(x => x.name === "complexType");
        // Check if type has the definition in itself. Handle inheritance here later, too
        if (ctype.children.some(x => x.name === "complexContent"))
            this.complexContent = ctype.children.find(x => x.name === "complexContent");
        if (!this.complexContent) {
            throw new SchemaError_1.ElementError(source, Xsd_1.noComplexTypeMessage);
        }
        // get sequences
        try {
            if (this.complexContent.children.some(x => x.name === "sequence"))
                this.checkables.push(new XsdSequence_1.XsdSequence(this.complexContent));
        }
        catch (error) {
            // do nothing
        }
    }
    checkElement(element) {
        let ret = [];
        for (const check of this.checkables) {
            ret = ret.concat(check.checkElement(element));
        }
        return ret;
    }
}
exports.XsdComplexType = XsdComplexType;
//# sourceMappingURL=XsdComplexType.js.map