
import { IAttribute } from "../Attribute";
import { IXmlBase } from "../base";
import { IElement } from "../Element";
import { XmlParser } from "../xmlparser";
import { IXsdType, SchemaError } from "./Xsd";
import { XsdComplexType } from "./XsdComplexType";
import { XsdSimpleType } from "./XsdSimpleType";

export class XmlSchema {
    public static createElement(source: IElement): IXsdType {
        if (source.children.some(x => x.name === "complexType")) {
            return new XsdComplexType(source);
        } else {
            return new XsdSimpleType(source);
        }
    }
    public content: IXsdType[];
    public readonly targetNamespace: string;
    private xsnamespace: string;
    constructor(private text: string) {
        const schema = new XmlParser(text).parse();
        if (schema.name !== "schema") {
            throw new SchemaError("Root element is not a schema");
        }
        this.xsnamespace = schema.namespace;
        try {
            this.targetNamespace = schema.attributes.find(x => x.name === "targetNamespace").value;
        } catch (error) {
            throw new SchemaError("Schema does not define a target namespace");
        }
        this.getContent(schema);
    }

    public getContent(schema: IElement): void {
        this.content = schema.children.filter(x => !x.isClosingTag).map(x => XmlSchema.createElement(x));
    }

    /**
     * Finds type for single element.
     *
     * @param {IElement} element
     * @returns {IXsdType | undefined} Will return undefined, if type is not found in schema
     * @memberof XsdSchema
     */
    public findTypeFor(element: IElement): IXsdType | undefined {
        return this.content.find(x => x.name === element.name);
    }
}