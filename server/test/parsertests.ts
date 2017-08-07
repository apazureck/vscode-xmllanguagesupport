import { expect } from "chai";
import * as fs from "fs";
import { slow, suite, test, timeout } from "mocha-typescript";
import { XmlMissingClosingTagError, XmlParser } from "../src/xml/xmlparser";

@suite
class ParserTests {
    @test
    public parseSimpleDocument() {
        const file = this.getSimpleFile();
        const parser = new XmlParser(file);
        const element = parser.parse();
    }

    @test
    public missingClosingTag() {
        try {
            const file = fs.readFileSync("../server/test/input/missingclosingtag.xml", { encoding: "utf-8" });
            const parser = new XmlParser(file);
            const element = parser.parse();
            throw new Error("Parser did not throw any exception.");
        } catch (error) {
            expect(error).instanceOf(XmlMissingClosingTagError);
            if (error instanceof XmlMissingClosingTagError) {
                expect(error.foundClosingTag.fullName).to.equal("note");
                expect(error.startingTag.fullName).to.equal("body");
            }
        }
    }

    @test
    public bodyIsSetCorectly() {
        const file = this.getSimpleFile();
        const element = new XmlParser(file).parse();
        expect(element.fullName).to.equal("note");
        expect(element.children[0].body).to.equal("Tove");
        expect(element.children[1].body).to.equal("Jani");
    }

    private getSimpleFile(): string {
        return fs.readFileSync("../server/test/input/simple.xml", { encoding: "utf-8" });
    }
}
