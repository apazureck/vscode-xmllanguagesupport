import { IElement } from './Element';
import { IAttribute } from './Attribute';
/**
 * An xml comment <!-- ... -->
 *
 * @export
 * @interface IComment
 * @extends {IXmlBase}
 */
// tslint:disable-next-line:no-empty-interface
export interface IComment extends IXmlBase {

}

/**
 * A base class with common properties of XML Elements and Attributes
 *
 * @export
 * @interface IXmlBase
 */
export interface IXmlBase {
    /**
     * The start index of the XML Element or Attribute
     *
     * @type {number}
     * @memberof IXmlBase
     */
    readonly start: number;
    /**
     * The end index of the XML Element or Attribute
     *
     * @type {number}
     * @memberof IXmlBase
     */
    readonly end: number;
    /**
     * The full text content of the Element or attribute (with all whitespaces)
     *
     * @type {string}
     * @memberof IXmlBase
     */
    readonly fullText: string;
}

/**
 * A found element
 *
 * @export
 * @interface IFoundResult
 */
export interface IFoundResult<T extends IAttribute | IElement> {
    /**
     * The found element
     *
     * @type {(IElement | undefined)}
     * @memberof IFoundResult
     */
    element: T;
    /**
     * Indicates if the found location is in the elements body
     *
     * @type {IAttribute}
     * @memberof IFoundResult
     */
    isInBody: boolean;
    isInAttribute: boolean;
}

export type URI = string;