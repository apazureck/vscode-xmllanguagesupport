"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Attribute_1 = require("./Attribute");
class Element {
    /**
     * Creates an instance of Element.
     * @param {RegExpMatchArray} match Match that resulted in this element. See XMLParser class for corresponding match array.
     * 1: Full Tag name (For example "myNamespace:MyTag")
     * 2: Closing tag starting /
     * 3: Namespace only
     * 4: TagName only
     * 5: Full content of the element
     * 6: Attribute quote (will always show the opening quote of the last attribute)
     * 7: Closing / on self-closing element
     * @param {IElement} [parent] Parent of the element
     * @memberof Element
     */
    constructor(match, parent) {
        this.pIsClosingTag = false;
        this.attributeRegex = /((\s+)((?:([\w-]*?):)?([\w-]+))=(["']))([\s\S]*?)\6/gm;
        // Basic stuff
        this.knownNamespaces = {};
        this.children = [];
        this.attributes = [];
        this.start = match.index;
        this.end = match.index + match[0].length;
        this.fullText = match[0];
        this.isSelfClosingTag = match[7] === "/";
        this.namespace = match[3] || "";
        this.name = match[4];
        this.fullName = match[1];
        // Check stuff on parent
        this.pParent = parent;
        this.isClosingTag = match[2] === "/";
        if (parent) {
            if (this.isClosingTag) {
                // If is closing tag set parent's parent as parent (go one up)
                // set this parent as the closing tag parent and set starting and ending tags
                this.setNewParent(parent.parent);
                this.setStartingTag(parent);
                parent.setClosingTag(this);
            }
            this.setXPath(parent);
            this.predecessor = parent.children[parent.children.length - 1];
            this.predecessor.setSuccessor(this);
            parent.children.push(this);
            for (const ns in parent.knownNamespaces) {
                if (ns) {
                    this.knownNamespaces[ns] = parent.knownNamespaces[ns];
                }
            }
        }
        else {
            this.pXpath = this.fullName;
        }
        this.isOpeningTag = !(this.isClosingTag || this.isSelfClosingTag);
        this.getAttributes(match[0]);
        this.addNamespaces();
    }
    get successor() {
        return this.pSuccessor;
    }
    /**
     * Parent element. If no parent (which means equals root element) this property is empty
     *
     * @type {(IElement | undefined)}
     * @memberof IElement
     */
    get parent() {
        return this.pParent;
    }
    /**
     * Indicates if Element is a root element.
     *
     * @type {boolean}
     * @memberof IElement
     */
    get isRootElement() {
        return this.pParent === undefined;
    }
    /**
     * The elements corresponding closing tag. This propery is only defined on opening tags.
     *
     * @type {(IElement | undefined)}
     * @memberof IElement
     */
    get closingTag() {
        return this.pClosingTag;
    }
    /**
     * The corresponding opening tag. This property is only defined on closing tags.
     *
     * @type {(IElement | undefined)}
     * @memberof IElement
     */
    get openingTag() {
        return this.pOpeningTag;
    }
    get xpath() {
        return this.pXpath;
    }
    findElementAtIndex(index) {
        // Check if index is in this element
        if (index > this.start && index <= (this.closingTag ? this.closingTag.end : this.end)) {
            // Check if index is in any child
            for (const child of this.children) {
                const found = child.findElementAtIndex(index);
                if (found) {
                    return found;
                }
            }
            const foundAttribute = this.findAttribute(index);
            if (foundAttribute) {
                return { element: foundAttribute, isInAttribute: true, isInBody: false };
            }
            else {
                return { element: this, isInAttribute: false, isInBody: index > this.end };
            }
        }
        return undefined;
    }
    addNamespace(key, uri) {
        this.knownNamespaces[key] = uri;
    }
    setClosingTag(tag) {
        this.pClosingTag = tag;
    }
    setStartingTag(tag) {
        this.pOpeningTag = tag;
    }
    setNewParent(newParent) {
        this.pParent = newParent;
    }
    setSuccessor(element) {
        this.pSuccessor = element;
    }
    setXPath(parent) {
        const samechildren = parent.children.filter((value, index, array) => value.fullName === this.fullName);
        this.pXpath = `${parent.xpath}/${this.fullName}[${samechildren.length}]`;
    }
    findAttribute(index) {
        for (const attribute of this.attributes) {
            if (index > attribute.start && index < attribute.end) {
                return attribute;
            }
        }
        return undefined;
    }
    getAttributes(content) {
        let match;
        while (match = this.attributeRegex.exec(content)) {
            this.attributes.push(new Attribute_1.Attribute(match, this));
        }
    }
    addNamespaces() {
        for (const attribute of this.attributes) {
            if (attribute.fullName.startsWith("xmlns")) {
                // if namespace is xmlns then the namespace has a name
                if (attribute.namespace === "xmlns") {
                    this.knownNamespaces[attribute.name] = attribute.value;
                }
                else {
                    this.knownNamespaces[""] = attribute.value;
                }
            }
        }
    }
}
exports.Element = Element;
//# sourceMappingURL=Element.js.map