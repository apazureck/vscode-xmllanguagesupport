import { expect } from "chai";
import * as fs from "fs";
import { slow, suite, test, timeout } from "mocha-typescript";
import { XmlMissingClosingTagError, XmlParser } from "../src/xml/xmlparser";
import { XsdSchema } from "../src/xml/XsdSchema";

@suite
class ParserTests {
    @test
    public loadSimpleSchema() {
        const file = this.getSimpleElementSchemaFile();
        const schema = new XsdSchema(file);
        const i = 0;
    }

    @test
    public checkSimpleSchemaOk() {
        const xsdfile = this.getSimpleElementSchemaFile();
        const xmlfile = this.getSimpleElementFile();
        const schema = new XsdSchema(xsdfile);
        const xmldata = new XmlParser(xmlfile).parse();
        const type = schema.findTypeFor(xmldata);
        const diag = type.checkElement(xmldata);
        expect(diag.length).to.equal(0);
    }

    private getSimpleElementSchemaFile(): string {
        return fs.readFileSync("../server/test/input/schema/simpleElement/simpleElement.xsd", { encoding: "utf-8" });
    }

    private getSimpleElementFile(): string {
        return fs.readFileSync("../server/test/input/schema/simpleElement/testsimpleelement.xml", { encoding: "utf-8"});
    }
}
