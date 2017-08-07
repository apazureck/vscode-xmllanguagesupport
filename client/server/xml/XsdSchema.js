"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xmlparser_1 = require("./xmlparser");
const noElementMessage = "Element is not a valid XSD element";
const simpleDeclaredDefaultAndFixMessage = "Source element must not declare default and fixed attribute";
const simpleNoSimpleElement = "Source element is not a simple element. It is missing its 'type' attribute";
const noComplexTypeMessage = "Element is not a complex XSD element";
class XsdSchema {
    constructor(text) {
        this.text = text;
        const schema = new xmlparser_1.XmlParser(text).parse();
        if (schema.name !== "schema") {
            throw new SchemaError("Root element is not a schema");
        }
        this.xsnamespace = schema.namespace;
        try {
            this.targetNamespace = schema.attributes.find(x => x.name === "targetNamespace").value;
        }
        catch (error) {
            throw new SchemaError("Schema does not define a target namespace");
        }
        this.getContent(schema);
    }
    static createElement(source) {
        if (source.children.some(x => x.name === "complexType")) {
            return new XsdComplexType(source);
        }
        else {
            return new XsdSimpleType(source);
        }
    }
    getContent(schema) {
        this.rootElements = schema.children.map(x => XsdSchema.createElement(x));
    }
    /**
     * Finds type for single element.
     *
     * @param {IElement} element
     * @returns {IXsdType | undefined} Will return undefined, if type is not found in schema
     * @memberof XsdSchema
     */
    findTypeFor(element) {
        return this.rootElements.find(x => x.name === element.name);
    }
}
exports.XsdSchema = XsdSchema;
class XsdSimpleType {
    constructor(source) {
        this.name = source.attributes.find(x => x.name === "name").value;
        if (!this.name)
            throw new ElementError(source, noElementMessage);
        this.type = source.attributes.find(x => x.name === "type").value;
        if (!this.type) {
            throw new ElementError(source);
        }
        this.default = source.attributes.find(x => x.name === "default");
        this.fixed = source.attributes.find(x => x.name === "fixed");
        if (this.fixed !== undefined && this.default !== undefined) {
            throw new ElementError(source, simpleDeclaredDefaultAndFixMessage);
        }
    }
}
exports.XsdSimpleType = XsdSimpleType;
class XsdComplexType {
    constructor(source) {
        this.name = source.attributes.find(x => x.name === "name").value;
        if (!this.name) {
            throw new ElementError(source, noElementMessage);
        }
        this.complexContent = source.children.find(x => x.name === "complexType");
        if (!this.complexContent) {
            throw new ElementError(source, noComplexTypeMessage);
        }
        // get sequences
        try {
            if (this.complexContent.children.some(x => x.name === "sequence"))
                this.sequence = new XsdSequence(this.complexContent);
        }
        catch (error) {
            // do nothing
        }
    }
}
exports.XsdComplexType = XsdComplexType;
class XsdSequence {
    constructor(raw) {
        this.raw = raw;
        this.sequenceElements = this.raw.children.find(x => x.name === "sequence").children;
    }
    check(element) {
        const diags = [];
        for (let i = 0; i < element.children.length && i < this.sequenceElements.length; i++) {
            if (element.children[i].type !== this.sequenceElements[i]) {
                diags.push(new XsdDiagnostic(XsdDiagnosticCode.SequenceWrongElement, `Expected Element "${this.sequenceElements[i].name}", but found Element "${element.children[i].name}" on Element "${element.fullName}"`, element.children[i], this.sequenceElements[i]));
            }
        }
        return diags;
    }
}
exports.XsdSequence = XsdSequence;
class XsdDiagnostic {
    constructor(errorCode, message, element, type) {
        this.errorCode = errorCode;
        this.message = message;
        this.element = element;
        this.type = type;
    }
}
var XsdDiagnosticCode;
(function (XsdDiagnosticCode) {
    XsdDiagnosticCode[XsdDiagnosticCode["Unknown"] = 0] = "Unknown";
    XsdDiagnosticCode[XsdDiagnosticCode["SequenceWrongElement"] = 1] = "SequenceWrongElement";
})(XsdDiagnosticCode = exports.XsdDiagnosticCode || (exports.XsdDiagnosticCode = {}));
class SchemaError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.SchemaError = SchemaError;
class ElementError extends SchemaError {
    constructor(source, message) {
        super(message);
        this.source = source;
    }
}
exports.ElementError = ElementError;
//# sourceMappingURL=XsdSchema.js.map