import { IXmlBase } from "./base";
import { IElement } from "./Element";
export interface IAttribute extends IXmlBase {
    readonly owner: IElement;
    readonly value: string;
    readonly valueStart: number;
    readonly quoteType: '"' | "'";
    readonly name: string;
    readonly namespace: string;
    readonly fullName: string;
}

export class Attribute implements IAttribute {
    public readonly owner: IElement;
    public readonly value: string;
    public readonly quoteType: "\"" | "'";
    public readonly start: number;
    public readonly end: number;
    public readonly fullText: string;
    public readonly valueStart: number;
    public readonly name: string;
    public readonly fullName: string;
    public namespace: string;
    /**
     * Creates an instance of Attribute.
     * @param {RegExpMatchArray} match Regexpmatch to parse.
     * Matching groups:
     * 1: Match until value begins
     * 2: Whitespaces before tag (to determine absoulte start)
     * 3: full name (with :)
     * 4: namespace
     * 5: name without namespace
     * 6: quote type (" or ')
     * 7: value
     * @param {IElement} owner Owning element of this attribute
     * @memberof Attribute
     */
    constructor(match: RegExpMatchArray, owner: IElement) {
        this.owner = owner;
        // Absolute starting point
        this.start = owner.start + match.index + match[2].length;
        this.end = owner.start + match.index + match[0].length;
        this.valueStart = owner.start + match.index + match[1].length;
        this.name = match[5];
        this.namespace = match[4] || "";
        this.fullName = match[3];
        this.value = match[7];
        this.quoteType = match[4] as "'" | '"';
    }
}
