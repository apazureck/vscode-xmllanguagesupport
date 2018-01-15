import { IElement } from "../Element";
export interface IXsdDiagnostic {
    errorCode: XsdDiagnosticCode;
    message: string;
    element: IElement;
    type: IXsdType;
}

export enum XsdDiagnosticCode {
    Unknown,
    SequenceWrongElement,
    SequenceUnknownType,
    UnallowedCharacter,
    DateIsNotValid,
    SimpleTypeUnknown,
    DecimalNotValid,
    BooleanNotValid,
    TimeInvalid,
}

export interface IXsdBase {
    raw: IElement;
}

export interface IXsdType extends IXsdBase, IXsdCheckable {
    name: string;
}

export interface IXsdCheckable {
    checkElement(element: IElement): IXsdDiagnostic[];
}

export const noElementMessage = "Element is not a valid XSD element";
export const simpleDeclaredDefaultAndFixMessage = "Source element must not declare default and fixed attribute";
export const simpleNoSimpleElement = "Source element is not a simple element. It is missing its 'type' attribute";
export const noComplexTypeMessage = "Element is not a complex XSD element";