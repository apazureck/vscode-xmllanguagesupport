import { XsdDiagnosticCode } from '../src/xml/Xsd/Xsd';
import { expect } from "chai";
import * as fs from 'fs';
import { slow, suite, test, timeout } from "mocha-typescript";
import { XmlMissingClosingTagError, XmlParser } from "../src/xml/xmlparser";
import { XmlSchema } from "../src/xml/Xsd/XmlSchema";

@suite
class SimpleTypeTests {
    @test
    public loadSimpleSchema() {
        const file = this.getSimpleElementSchemaFile();
        const schema = new XmlSchema(file);
        const i = 0;
    }

    @test
    public checkSimpleSchemaOk() {
        const xsdfile = this.getSimpleElementSchemaFile();
        const xmlfile = this.getSimpleElementFile();
        const schema = new XmlSchema(xsdfile);
        const xmldata = new XmlParser(xmlfile).parse();
        const type = schema.findTypeFor(xmldata);
        const diag = type.checkElement(xmldata);
        expect(diag.length).to.equal(0);
    }

    @test
    public checkWrongNumber() {
        const xsdfile = this.getSimpleElementSchemaFile();
        const xmlfile = fs.readFileSync("../server/test/input/schema/simpleElement/testNoNumber.xml", { encoding: "utf-8" });
        const schema = new XmlSchema(xsdfile);
        const xmldata = new XmlParser(xmlfile).parse();
        const type = schema.findTypeFor(xmldata);
        const diag = type.checkElement(xmldata);
        expect(diag.length).to.equal(1);
        expect(diag[0].errorCode).to.equal(XsdDiagnosticCode.UnallowedCharacter);
    }

    @test
    public checkWrongDate() {
        const xsdfile = this.getSimpleElementSchemaFile();
        const xmlfile = fs.readFileSync("../server/test/input/schema/simpleElement/testNoDate.xml", { encoding: "utf-8" });
        const schema = new XmlSchema(xsdfile);
        const xmldata = new XmlParser(xmlfile).parse();
        const type = schema.findTypeFor(xmldata);
        const diag = type.checkElement(xmldata);
        expect(diag.length).to.equal(1);
        expect(diag[0].errorCode).to.equal(XsdDiagnosticCode.DateIsNotValid);
    }

    @test
    public checkWrongString() {
        const xsdfile = this.getSimpleElementSchemaFile();
        const xmlfile = fs.readFileSync("../server/test/input/schema/simpleElement/testNoString.xml", { encoding: "utf-8" });
        const schema = new XmlSchema(xsdfile);
        const xmldata = new XmlParser(xmlfile).parse();
        const type = schema.findTypeFor(xmldata);
        const diag = type.checkElement(xmldata);
        expect(diag.length).to.equal(1);
        expect(diag[0].errorCode).to.equal(XsdDiagnosticCode.UnallowedCharacter);
    }

    @test
    public checkReplaceType() {
        const xsdfile = this.getSchemaFileWithOtherNamespace();
        let xmlfile = this.getSimpleElementFile();
        let schema = new XmlSchema(xsdfile);
        let xmldata = new XmlParser(xmlfile).parse();
        let type = schema.findTypeFor(xmldata);
        let diag = type.checkElement(xmldata);
        expect(diag.length).to.equal(0);
        // Check wrong type
        xmlfile = fs.readFileSync("../server/test/input/schema/simpleElement/testNoString.xml", { encoding: "utf-8" });
        schema = new XmlSchema(xsdfile);
        xmldata = new XmlParser(xmlfile).parse();
        type = schema.findTypeFor(xmldata);
        diag = type.checkElement(xmldata);
        expect(diag.length).to.equal(1);
    }

    private getSimpleElementSchemaFile(): string {
        return fs.readFileSync("../server/test/input/schema/simpleElement/simpleElement.xsd", { encoding: "utf-8" });
    }

    private getSchemaFileWithOtherNamespace(): string {
        return fs.readFileSync("../server/test/input/schema/simpleElement/simpleElementOtherXsNamespace.xsd", { encoding: "utf-8" });
    }

    private getSimpleElementFile(): string {
        return fs.readFileSync("../server/test/input/schema/simpleElement/testsimpleelement.xml", { encoding: "utf-8"});
    }
}
