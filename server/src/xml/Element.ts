import { Attribute, IAttribute } from "./Attribute";
import { IFoundResult, IXmlBase, URI } from "./base";
import { IXsdType } from "./Xsd/Xsd";
/**
 * Represents an XML Element
 *
 * @export
 * @interface IElement
 * @extends {IXmlBase}
 */
export interface IElement extends IXmlBase {
    readonly type?: IXsdType;
    /**
     * Dictionary with known namespaces. key is the name used in this xml file which leads to the uri.
     *
     * @type {{
     *         [x: string]: URI;
     *     }}
     * @memberof IElement
     */
    readonly knownNamespaces: {
        [x: string]: URI;
    };
    /**
     * The element before this element in the xml text. Is undefined if it is the first element in the xml file.
     * For example:
     * <p>
     * <br>
     *
     * p is the predecessor of br
     *
     * @type {IElement}
     * @memberof IElement
     */
    readonly predecessor: IElement | undefined;
    /**
     * The element before this element in the xml text. Is undefined if it is the last element in the xml file.
     * For example:
     * <p>
     * <br>
     *
     * br is the successor of p
     *
     * @type {IElement}
     * @memberof IElement
     */
    readonly successor: IElement | undefined;
    /**
     * The xpath to the element
     *
     * @type {string}
     * @memberof IElement
     */
    readonly xpath: string;
    /**
     * Attributes on this Element. This property is never undefined. Attributes are like id="element" or myAttribute="5"
     *
     * @type {Array<IAttribute>}
     * @memberof IElement
     */
    readonly attributes: Array<IAttribute>;
    /**
     * Namespace of the Element. For Example: <myNamespace:MyTag ... > will be myNamespace name only. If element does not have any namespace it will be an empty string, not undefined!
     *
     * @type {string}
     * @memberof IElement
     */
    readonly namespace: string;
    /**
     * Full name with element name and namespace
     *
     * @type {string}
     * @memberof IElement
     */
    readonly fullName: string;
    /**
     * Parent element. If no parent (which means equals root element) this property is empty
     *
     * @type {(IElement | undefined)}
     * @memberof IElement
     */
    readonly parent: IElement | undefined;
    /**
     * This array is never undefined. Contains all direct children of an XML Element
     *
     * @type {Array<IElement>}
     * @memberof IElement
     */
    readonly children: Array<IElement>;
    /**
     * Indicates if element is an opening tag, like <HTML attribute1="a" ... atributeN="infinite">. An opening element can also contain attributes.
     *
     * @type {boolean}
     * @memberof IElement
     */
    readonly isOpeningTag: boolean;
    /**
     * Indicates if Element is a closing tag like </HTML>. A closing tag does not contain any attributes and is never a closing tag or self closing tag.
     *
     * @type {boolean}
     * @memberof IElement
     */
    readonly isClosingTag: boolean;
    /**
     * Indicates if Element is a self-closing tag like <br/>
     *
     * @type {boolean}
     * @memberof IElement
     */
    readonly isSelfClosingTag: boolean;
    /**
     * Indicates if Element is a root element.
     *
     * @type {boolean}
     * @memberof IElement
     */
    readonly isRootElement: boolean;
    /**
     * The elements corresponding closing tag. This propery is only defined on opening tags.
     *
     * @type {(IElement | undefined)}
     * @memberof IElement
     */
    readonly closingTag: IElement | undefined;
    /**
     * The corresponding opening tag. This property is only defined on closing tags.
     *
     * @type {(IElement | undefined)}
     * @memberof IElement
     */
    readonly openingTag: IElement | undefined;
    /**
     * The name of the element
     *
     * @type {string}
     * @memberof IElement
     */
    readonly name: string;
    /**
     * The body text of the element. If it is a self-closing element or a
     * closing element the body is an empty string
     * 
     * @type {string}
     * @memberof IElement
     */
    readonly body: string;
    /**
     * Finds the element at the index. If the index is in an attribute it will be returned as well.
     * If the index is in the body of this element (not in any child) isInBody will be true.
     *
     * @param {number} index to find element at
     * @returns {{element: IElement, attribute?: IAttribute, isInBody?: boolean}}
     * @memberof IElement
     */
    findElementAtIndex(index: number): IFoundResult<IAttribute | IElement>;

    /**
     * Gets the used defintion for the given uri. Returns undefined if nothing found.
     * 
     * @param {URI} uri 
     * @returns {(string | undefined)} 
     * @memberof IElement
     */
    getNamespaceDefinition(uri: URI): string | undefined;
}

export class Element implements IElement {
    public readonly knownNamespaces: {
        [x: string]: URI;
    };
    public predecessor: IElement;
    public get body(): string {
        return this.pBody;
    }
    public get successor(): IElement {
        return this.pSuccessor;
    }
    /**
     * The start index of the XML Element or Attribute
     *
     * @type {number}
     * @memberof IXmlBase
     */
    public readonly start: number;
    /**
     * The end index of the XML Element or Attribute
     *
     * @type {number}
     * @memberof IXmlBase
     */
    public readonly end: number;
    /**
     * The full text content of the Element or attribute (with all whitespaces)
     *
     * @type {string}
     * @memberof IXmlBase
     */
    public readonly fullText: string;
    /**
     * Attributes on this Element. This property is never undefined. Attributes are like id="element" or myAttribute="5"
     *
     * @type {Array<IAttribute>}
     * @memberof IElement
     */
    public readonly attributes: Array<IAttribute>;
    /**
     * Namespace of the Element. For Example: <myNamespace:MyTag ... > will be myNamespace name only. If element does not have any namespace it will be an empty string, not undefined!
     *
     * @type {string}
     * @memberof IElement
     */
    public readonly namespace: string;
    /**
     * Full name with element name and namespace
     *
     * @type {string}
     * @memberof IElement
     */
    public readonly fullName: string;
    /**
     * Parent element. If no parent (which means equals root element) this property is empty
     *
     * @type {(IElement | undefined)}
     * @memberof IElement
     */
    public get parent(): IElement | undefined {
        return this.pParent;
    }
    /**
     * This array is never undefined. Contains all direct children of an XML Element
     *
     * @type {Array<IElement>}
     * @memberof IElement
     */
    public readonly children: Array<IElement>;
    /**
     * Indicates if element is an opening tag, like <HTML attribute1="a" ... atributeN="infinite">. An opening element can also contain attributes.
     *
     * @type {boolean}
     * @memberof IElement
     */
    public readonly isOpeningTag: boolean;
    /**
     * Indicates if Element is a closing tag like </HTML>. A closing tag does not contain any attributes and is never a closing tag or self closing tag.
     *
     * @type {boolean}
     * @memberof IElement
     */
    public readonly isClosingTag: boolean;
    /**
     * Indicates if Element is a self-closing tag like <br/>
     *
     * @type {boolean}
     * @memberof IElement
     */
    public readonly isSelfClosingTag: boolean;
    /**
     * Indicates if Element is a root element.
     *
     * @type {boolean}
     * @memberof IElement
     */
    public get isRootElement(): boolean {
        return this.pParent === undefined;
    }
    /**
     * The elements corresponding closing tag. This propery is only defined on opening tags.
     *
     * @type {(IElement | undefined)}
     * @memberof IElement
     */
    public get closingTag(): IElement | undefined {
        return this.pClosingTag;
    }
    /**
     * The corresponding opening tag. This property is only defined on closing tags.
     *
     * @type {(IElement | undefined)}
     * @memberof IElement
     */
    public get openingTag(): IElement | undefined {
        return this.pOpeningTag;
    }
    /**
     * The name of the element
     *
     * @type {string}
     * @memberof IElement
     */
    public readonly name: string;

    public get xpath(): string {
        return this.pXpath;
    }
    private pClosingTag: IElement | undefined;
    private pIsClosingTag: boolean = false;
    private pParent: IElement | undefined;
    private pOpeningTag: IElement | undefined;
    private pXpath: string;
    private pSuccessor: IElement;
    private pBody: string;
    private readonly attributeRegex: RegExp = /((\s+)((?:([\w-]*?):)?([\w-]+))=(["']))([\s\S]*?)\6/gm;
    /**
     * Creates an instance of Element.
     * @param {RegExpMatchArray} match Match that resulted in this element. See XMLParser class for corresponding match array.
     * 1: Closing tag starting /
     * 2: Full Tag name (For example "myNamespace:MyTag")
     * 3: Namespace only
     * 4: TagName only
     * 5: Full content of the element
     * 6: Attribute quote (will always show the opening quote of the last attribute)
     * 7: Closing / on self-closing element
     * @param {IElement} [parent] Parent of the element
     * @memberof Element
     */
    constructor(match: RegExpMatchArray, parent?: IElement) {
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
        this.fullName = match[2];
        this.pBody = "";

        // Check stuff on parent
        this.pParent = parent;
        this.isClosingTag = match[1] === "/";
        if (parent) {
            if (this.isClosingTag) {
                // If is closing tag set parent's parent as parent (go one up)
                // set this parent as the closing tag parent and set starting and ending tags
                this.setNewParent(parent.parent);
                this.setStartingTag(parent);
                (parent as Element).setClosingTag(this);
                (parent as Element).setBody(match.input.substring(parent.end, this.start));
            } else {
                parent.children.push(this);
            }

            this.setXPath(parent);
            this.predecessor = parent.children[parent.children.length - 1];
            if (this.predecessor)
                (this.predecessor as Element).setSuccessor(this);
            for (const ns in parent.knownNamespaces) {
                if (ns) {
                    this.knownNamespaces[ns] = parent.knownNamespaces[ns];
                }
            }

        } else {
            this.pXpath = this.fullName;
        }

        this.isOpeningTag = !(this.isClosingTag || this.isSelfClosingTag);
        this.getAttributes(match[0]);
        this.addNamespaces();
    }

    public getNamespaceDefinition(uri: URI): string | undefined {
        for (const ns in this.knownNamespaces) {
            if (ns) {
                if (this.knownNamespaces[ns] === uri)
                    return ns;
            }
        }
        return undefined;
    }

    public findElementAtIndex(index: number): IFoundResult<IAttribute | IElement> {
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
            } else {
                return { element: this, isInAttribute: false, isInBody: index > this.end };
            }
        }
        return undefined;
    }

    public addNamespace(key: string, uri: URI): void {
        this.knownNamespaces[key] = uri;
    }

    private setClosingTag(tag: IElement): void {
        this.pClosingTag = tag;
    }

    private setStartingTag(tag: IElement): void {
        this.pOpeningTag = tag;
    }
    private setNewParent(newParent: IElement): void {
        this.pParent = newParent;
    }

    private setSuccessor(element: IElement) {
        this.pSuccessor = element;
    }

    private setBody(body: string) {
        this.pBody = body;
    }

    private setXPath(parent: IElement): void {
        const samechildren = parent.children.filter((value, index, array) => value.fullName === this.fullName);
        this.pXpath = `${parent.xpath}/${this.fullName}[${samechildren.length}]`;
    }

    private findAttribute(index: number): IAttribute | undefined {
        for (const attribute of this.attributes) {
            if (index > attribute.start && index < attribute.end) {
                return attribute;
            }
        }
        return undefined;
    }
    private getAttributes(content: string): any {
        let match: RegExpMatchArray;
        while (match = this.attributeRegex.exec(content)) {
            this.attributes.push(new Attribute(match, this));
        }
    }
    private addNamespaces(): void {
        for (const attribute of this.attributes) {
            if (attribute.fullName.startsWith("xmlns")) {
                // if namespace is xmlns then the namespace has a name
                if (attribute.namespace === "xmlns") {
                    this.knownNamespaces[attribute.name] = attribute.value;
                } else {
                    this.knownNamespaces[""] = attribute.value;
                }
            }
        }
    }
}