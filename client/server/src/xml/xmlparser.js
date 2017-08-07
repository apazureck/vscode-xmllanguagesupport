"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Element_1 = require("./Element");
class XmlParser {
    constructor(xmlString) {
        this.xmlString = xmlString;
        this.ElementRegex = /<(?:!--[\s\S]+?-->|((\/)?(?:(\w+):)?(\w+))(?:>|((?:\s+(?:[\w-]*?:)?[\w-]+=(["'])[\s\S]*?\6\s*?)*?)(\/)?>))/gm;
    }
    parse() {
        return this.parseString(this.xmlString);
    }
    parseString(xmlString) {
        let match;
        let baseElement;
        // Get base element
        try {
            baseElement = new Element_1.Element(this.ElementRegex.exec(xmlString));
            baseElement.addNamespace("xml", "http://www.w3.org/XML/1998/namespace");
            baseElement.addNamespace("xs", "http://www.w3.org/2001/XMLSchema");
        }
        catch (error) {
            throw new XmlParserError(0, "Could not find root element");
        }
        let parent = baseElement;
        while (match = this.ElementRegex.exec(xmlString)) {
            // Skip comments
            if (match[0].startsWith("<!--")) {
                continue;
            }
            const element = new Element_1.Element(match, parent);
            if (element.isClosingTag) {
                parent = parent ? parent.parent : undefined;
            }
            else if (element.isOpeningTag) {
                parent = element;
            }
        }
        return baseElement;
    }
}
exports.XmlParser = XmlParser;
class XmlParserError extends Error {
    constructor(index, message) {
        super(message);
        this.index = index;
    }
}
exports.XmlParserError = XmlParserError;
//# sourceMappingURL=xmlparser.js.map