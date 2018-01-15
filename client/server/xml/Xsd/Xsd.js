"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var XsdDiagnosticCode;
(function (XsdDiagnosticCode) {
    XsdDiagnosticCode[XsdDiagnosticCode["Unknown"] = 0] = "Unknown";
    XsdDiagnosticCode[XsdDiagnosticCode["SequenceWrongElement"] = 1] = "SequenceWrongElement";
    XsdDiagnosticCode[XsdDiagnosticCode["SequenceUnknownType"] = 2] = "SequenceUnknownType";
    XsdDiagnosticCode[XsdDiagnosticCode["UnallowedCharacter"] = 3] = "UnallowedCharacter";
    XsdDiagnosticCode[XsdDiagnosticCode["DateIsNotValid"] = 4] = "DateIsNotValid";
    XsdDiagnosticCode[XsdDiagnosticCode["SimpleTypeUnknown"] = 5] = "SimpleTypeUnknown";
})(XsdDiagnosticCode = exports.XsdDiagnosticCode || (exports.XsdDiagnosticCode = {}));
exports.noElementMessage = "Element is not a valid XSD element";
exports.simpleDeclaredDefaultAndFixMessage = "Source element must not declare default and fixed attribute";
exports.simpleNoSimpleElement = "Source element is not a simple element. It is missing its 'type' attribute";
exports.noComplexTypeMessage = "Element is not a complex XSD element";
//# sourceMappingURL=Xsd.js.map