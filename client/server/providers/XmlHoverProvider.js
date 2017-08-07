"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const xmltypes_1 = require("../xmltypes");
class XmlHoverProvider extends xmltypes_1.XmlBaseHandler {
    constructor(schemastorage, documents, connection, schemastorePath, loglevel) {
        super(schemastorage, connection, loglevel);
        this.documents = documents;
        this.schemastorePath = schemastorePath;
        this.schemastorage = schemastorage.schemas;
    }
    getHoverInformation(handler) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = this.documents.get(handler.textDocument.uri);
            const txt = doc.getText();
            const pos = doc.offsetAt(handler.position);
            this.getUsedNamespaces(txt);
            const foundCursor = this.textGetElementAtCursorPos(txt, pos);
            // todo: Maybe bind to this necessary
            this.logDebug((() => {
                let ret = "Used Namespaces: ";
                for (const ns in this.usedNamespaces) {
                    if (ns) {
                        ret += ns + " = " + this.usedNamespaces[ns] + " | ";
                    }
                }
                return ret.substring(0, ret.length - 3);
            }));
            if (foundCursor) {
                // if (foundCursor.attribute) {
                //     this.logDebug("Found cursor location to be on attribute");
                //     return new Promise<Hover>((resolve, reject) => {
                //         resolve(this.getHoverItemForAttribute(foundCursor.attribute, doc));
                //     });
                // } else {
                //     this.logDebug("Found cursor location to be in element");
                //     return new Promise<Hover>((resolve, reject) => {
                //         resolve(this.getElementDescription(foundCursor.element, doc));
                //     });
                // }
            }
            return undefined;
        });
    }
    getElementDescription(element, doc) {
        this.logDebug("Processing Tagstring: " + element.name);
        const namespace = this.usedNamespaces[element.namespace];
        this.logDebug("Using Namespace: " + namespace);
        const schema = this.schemastorage[namespace];
        this.logDebug("Using Schema: " + schema.targetNamespace);
        const elementtype = this.getElementType(element, schema);
        // Check if this simple type has an enumeration on it
        const header = { language: "xml", value: element.fullText };
        return {
            contents: [header,
                elementtype ? (vscode_languageserver_1.MarkedString.fromPlainText(elementtype.annotation ? elementtype.annotation[0].documentation[0] : "")) : undefined],
            range: {
                end: doc.positionAt(element.isOpeningTag ? element.closingTag.end : element.end),
                start: doc.positionAt(element.isClosingTag ? element.openingTag.start : element.start),
            },
        };
    }
    getHoverItemForAttribute(attribute, doc) {
        this.logDebug("Processing Tagstring: " + attribute.owner.name);
        const namespace = this.usedNamespaces[attribute.owner.namespace];
        this.logDebug("Using Namespace: " + namespace);
        const schema = this.schemastorage[namespace];
        this.logDebug("Using Schema: " + schema.targetNamespace);
        const element = this.getElementType(attribute.owner.name, schema);
        this.logDebug(() => "Found element: " + element.$.name);
        const elementType = this.getTypeOf(element);
        this.logDebug(() => "Found Element type: " + elementType.$.name);
        const types = this.getBaseTypes(elementType, []);
        if (types && types.length > 0)
            elementType.basetype = types[0];
        const matchingAttribute = elementType.attribute.find((value, index, obj) => value.$.name === attribute.name);
        // Check if this simple type has an enumeration on it
        const header = { language: "xml", value: "<" + attribute.owner.fullName + " ... " + attribute.name + '="' + attribute.value + '"' + (attribute.owner.isSelfClosingTag ? " ... />" : " ... >") };
        return {
            contents: [header,
                matchingAttribute ? vscode_languageserver_1.MarkedString.fromPlainText(matchingAttribute.annotation ? matchingAttribute.annotation[0].documentation[0] : "") : undefined],
            range: {
                end: doc.positionAt(attribute.end),
                start: doc.positionAt(attribute.start),
            },
        };
    }
}
exports.XmlHoverProvider = XmlHoverProvider;
//# sourceMappingURL=XmlHoverProvider.js.map