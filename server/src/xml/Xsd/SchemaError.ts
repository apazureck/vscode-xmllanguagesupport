import { IElement } from "../Element";
export class SchemaError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class ElementError extends SchemaError {
    constructor(public readonly source: IElement, message?: string) {
        super(message);
    }
}