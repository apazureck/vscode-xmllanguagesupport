"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xmlparser_1 = require("../xmlparser");
const SchemaError_1 = require("./SchemaError");
const XsdComplexType_1 = require("./XsdComplexType");
const XsdSimpleType_1 = require("./XsdSimpleType");
class XmlSchema {
    constructor(text) {
        this.text = text;
        const schema = new xmlparser_1.XmlParser(text).parse();
        if (schema.name !== "schema") {
            throw new SchemaError_1.SchemaError("Root element is not a schema");
        }
        this.xsnamespace = schema.namespace;
        try {
            this.targetNamespace = schema.attributes.find(x => x.name === "targetNamespace").value;
        }
        catch (error) {
            throw new SchemaError_1.SchemaError("Schema does not define a target namespace");
        }
        this.getContent(schema);
    }
    static createElement(source) {
        if (source.children.some(x => x.name === "complexType")) {
            return new XsdComplexType_1.XsdComplexType(source);
        }
        else {
            return new XsdSimpleType_1.XsdSimpleType(source);
        }
    }
    getContent(schema) {
        this.content = schema.children.filter(x => !x.isClosingTag).map(x => XmlSchema.createElement(x));
    }
    /**
     * Finds type for single element.
     *
     * @param {IElement} element
     * @returns {IXsdType | undefined} Will return undefined, if type is not found in schema
     * @memberof XsdSchema
     */
    findTypeFor(element) {
        return this.content.find(x => x.name === element.name);
    }
}
exports.XmlSchema = XmlSchema;
//# sourceMappingURL=XmlSchema.js.map