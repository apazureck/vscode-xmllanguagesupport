import { Element, IElement } from "./Element";

export class XmlParser {
    public readonly ElementRegex: RegExp = /<(?:!--[\s\S]+?-->|(\/)?((?:(\w+):)?(\w+))(?:>|((?:\s+(?:[\w-]*?:)?[\w-]+=(["'])[\s\S]*?\6\s*?)*?)(\/)?>))/gm;
    constructor(public readonly xmlString: string) {
    }

    public parse(): IElement {
        return this.parseString(this.xmlString);
    }

    private parseString(xmlString: string): IElement {
        let match: RegExpMatchArray;
        let baseElement: Element;
        // Get base element
        try {
            baseElement = new Element(this.ElementRegex.exec(xmlString));
            baseElement.addNamespace("xml", "http://www.w3.org/XML/1998/namespace");
            baseElement.addNamespace("xs", "http://www.w3.org/2001/XMLSchema");
        } catch (error) {
            throw new XmlParserError(0, "Could not find root element");
        }
        let parent: Element = baseElement;
        while (match = this.ElementRegex.exec(xmlString)) {
            // Skip comments
            if (match[0].startsWith("<!--")) {
                continue;
            }
            const element = new Element(match, parent);

            if (element.isClosingTag) {
                if (element.openingTag.fullName !== element.fullName) {
                    throw new XmlMissingClosingTagError(element.openingTag, element);
                }
                parent = parent ? parent.parent as Element : undefined;
            } else if (element.isOpeningTag) {
                parent = element;
            }
        }

        return baseElement;
    }
}

export class XmlParserError extends Error {
    constructor(public readonly index: number, message?: string) {
        super(message);
    }
}

export class XmlMissingClosingTagError extends XmlParserError {
    constructor(public readonly startingTag: IElement, public readonly foundClosingTag: IElement) {
        super(foundClosingTag.start, "Missing closing tag");
    }
}
