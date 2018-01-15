"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SchemaError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.SchemaError = SchemaError;
class ElementError extends SchemaError {
    constructor(source, message) {
        super(message);
        this.source = source;
    }
}
exports.ElementError = ElementError;
//# sourceMappingURL=SchemaError.js.map