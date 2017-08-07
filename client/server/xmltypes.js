"use strict";
const fs = require("fs");
const path = require("path");
const xml = require("xml2js");
const Log_1 = require("./Log");
const xmlparser_1 = require("./xmlparser");
class XmlStorage extends Log_1.Log {
    constructor(schemastorePath, connection, loglevel) {
        super(connection, loglevel);
        this.schemastorePath = schemastorePath;
        this.schemas = {};
        this.connection.console.info("Creating Schema storage.");
        for (const file of fs.readdirSync(this.schemastorePath)) {
            try {
                const xmltext = fs.readFileSync(path.join(this.schemastorePath, file)).toString();
                xml.parseString(xmltext, { normalize: true }, (err, res) => {
                    if (err)
                        throw err;
                    const tns = xmltext.match(/targetNamespace\s*?=\s*?["'](.*?)["']/);
                    if (tns) {
                        const nsregex = /xmlns:(.*?)\s*?=\s*?["'](.*?)["']/g;
                        let ns;
                        let schemanamespace;
                        const namespaces = {};
                        while (ns = nsregex.exec(xmltext)) {
                            if (ns[2] === "http://www.w3.org/2001/XMLSchema")
                                schemanamespace = ns[1];
                            else
                                namespaces[ns[1]] = ns[2];
                        }
                        this.connection.console.info("Found a valid schema. Renaming namespace abbrevation '" + schemanamespace + " to empty abbrevation to make it more readable for programmers.");
                        if (namespaces[""]) {
                            this.connection.console.error("There is an empty namespace. It will be missinterpreted, as for lazynessreasons of the author the xsd namespace will be removed from all elements.");
                        }
                        const start = schemanamespace + ":";
                        res = substitute(res, (key, value) => {
                            if (key.startsWith(start)) {
                                return key.split(":")[1];
                            }
                            return key;
                        });
                        this.connection.console.info("Converted schema " + schemanamespace);
                        if (schemanamespace)
                            this.schemas[tns[1]] = { schemanamespace, schema: res.schema, referencedNamespaces: namespaces, targetNamespace: tns[1] };
                        else
                            throw new Error("No Schema namespace defined, make sure your schema is compared against 'http://www.w3.org/2001/XMLSchema'");
                        return;
                    }
                    else {
                        throw new Error("No Target Namespace found in schema '" + file + "'");
                    }
                });
            }
            catch (error) {
                this.connection.console.warn("Could not open Schema '" + file + "': " + JSON.stringify(error));
            }
        }
    }
}
exports.XmlStorage = XmlStorage;
function getNamespaces(xmlobject) {
    const retns = [];
    traverse(xmlobject, (key, value) => {
        try {
            if (key.startsWith("xmlns:"))
                retns.push({
                    address: value,
                    name: key.split(":")[1],
                });
        }
        catch (error) {
        }
    });
    return retns;
}
exports.getNamespaces = getNamespaces;
class XmlBaseHandler extends Log_1.Log {
    constructor(schemastorage, connection, loglevel) {
        super(connection, loglevel);
        this.namespaceRegex = /^(\w*?):?(\w+)?$/;
        this.schemastorage = schemastorage.schemas;
    }
    /**
     * Gets the schema from an element, which can come in form of '<namespace:name ... ' or '<name ...   '
     *
     * @param {string} fullElementName
     * @returns
     *
     * @memberOf XmlBase
     */
    getSchema(fullElementName) {
        const schema = this.schemastorage[this.usedNamespaces[fullElementName.match(this.namespaceRegex)[1]]];
        if (!schema) {
            this.logDebug("Schema for element '" + fullElementName + "' not found.");
        }
        return schema;
    }
    /**
     * gets the used namespaces in the input string. The used namespaces are stored in the usedNamespaces property.
     *
     * @param {string} input Input xml string to get the namespaces from
     *
     * @memberOf XmlBase
     */
    getUsedNamespaces(input) {
        const xmlnsregex = /xmlns:?(.*?)=['"](.*?)['"]/g;
        let match;
        this.usedNamespaces = {};
        while (match = xmlnsregex.exec(input))
            this.usedNamespaces[match[1]] = match[2];
    }
    /**
     * Searches all Elements and puts them in a structure.
     *
     * @param {string} txt
     * @param {(curIndex: number) => boolean} [cancel]
     * @returns {FoundElementHeader}
     *
     * @memberOf XmlBaseHandler
     */
    textGetElements(txt) {
        return new xmlparser_1.XmlParser(txt).parse();
    }
    textGetElementAtCursorPos(txt, start) {
        const element = new xmlparser_1.XmlParser(txt).parse();
        return element.findElementAtIndex(start).element;
    }
    getAttributes(type) {
        if (type.basetype) {
            for (const att of type.complexContent[0].extension[0].attribute) {
                att.owner = type;
                att.schema = type.schema;
            }
            return this.getAttributes(type.basetype).concat(type.complexContent[0].extension[0].attribute);
        }
        else {
            let attributes = type.complexContent ? type.complexContent[0].attribute : type.attribute;
            if (!attributes)
                attributes = [];
            for (const attribute of attributes) {
                attribute.owner = type;
                attribute.schema = type.schema;
            }
            return attributes;
        }
    }
    getElementType(element, schema) {
        // If a string is given try to find the type in the xsd schema
        if (typeof element === "string") {
            for (const eltype of schema.schema.element) {
                if (!eltype.$)
                    continue;
                if (!eltype.$.name) {
                    continue;
                }
                if (eltype.$.name !== element) {
                    continue;
                }
                eltype.schema = schema;
                return eltype;
            }
        }
        else {
            const path = [];
            while (element) {
                for (const eltype of schema.schema.element) {
                    if (!eltype.$)
                        continue;
                    if (!eltype.$.name) {
                        continue;
                    }
                    if (eltype.$.name !== element.name) {
                        continue;
                    }
                    eltype.schema = schema;
                    return eltype;
                }
                element = element.parent;
            }
            return undefined;
        }
    }
    /**
     * Gets the name of an xml element (removes the namespace part)
     *
     * @param {string} element element name to get name from
     * @memberof XmlBaseHandler
     */
    getElementName(element) {
        return element.split(":").pop();
    }
    getRightSubElements(element, downpath) {
        const type = this.getTypeOf(element);
        // Distinguish between sequences and choices, etc. to display only elements that can be placed here.
        const elements = this.getAllElementsInComplexType(type);
        if (downpath.length > 0) {
            let part;
            if (part = this.getElementName(downpath.pop())) {
                const child = elements.find(x => {
                    try {
                        return x.$.name === part;
                    }
                    catch (error) {
                    }
                });
                if (child) {
                    return this.getRightSubElements(child, downpath);
                }
            }
        }
        return elements;
    }
    /**
     * Gets the **(complex)** type of a given element (`with schema`)
     *
     * @private
     * @param {ElementEx} element Element to get the type from
     * @returns {ComplexTypeEx} The Complex type of the elment
     *
     * @memberOf XmlCompletionHandler
     */
    getTypeOf(element) {
        try {
            // Check if complex Type is directly on element
            if (element.complexType) {
                const t = element.complexType[0];
                t.schema = element.schema;
                t.attribute = this.getAttributes(t);
                return t;
            }
            else if (element.$ && element.$.type) {
                return this.findTypeByName(element.$.type, element.schema);
            }
            else {
                // Check for simple type?
                return null;
            }
        }
        catch (error) {
            return undefined;
        }
    }
    getAllElementsInComplexType(type) {
        let alltypes = [type];
        alltypes = alltypes.concat(this.getBaseTypes(type));
        let elements = [];
        for (const t of alltypes) {
            // Check if type is inheriting other type
            if (t.complexContent && t.complexContent[0].extension) {
                const st = t.complexContent[0].extension[0];
                elements = elements.concat(this.getElementsOfComplexType(st));
            }
            else {
                try {
                    elements = elements.concat(this.getElementsOfComplexType(t));
                }
                catch (error) {
                    this.logDebug(() => "Could not get elements of type " + t.$.name);
                }
            }
        }
        return elements;
    }
    getElementsOfComplexType(type) {
        let elements = [];
        if (type.element)
            elements = elements.concat(type.element);
        if (type.sequence) {
            if (type.sequence[0].element)
                elements = elements.concat(type.sequence[0].element);
            if (type.sequence[0].choice && type.sequence[0].choice[0].element)
                elements = elements.concat(type.sequence[0].choice[0].element);
        }
        return elements;
    }
    getDerivedElements(element, schema) {
        const type = this.findTypeByName(element.$.type, schema);
        schema = type.schema;
        // Find all schemas using the owningSchema (and so maybe the element)
        const schemasUsingNamespace = [];
        for (const targetns in this.schemastorage) {
            if (targetns === schema.targetNamespace)
                continue;
            const curschema = this.schemastorage[targetns];
            for (const namespace in curschema.referencedNamespaces)
                // check if xsd file is referenced in current schema.
                if (curschema.referencedNamespaces[namespace] === type.schema.targetNamespace) {
                    for (const nsa in this.usedNamespaces)
                        // check if namespace is also used in current xml file
                        if (this.usedNamespaces[nsa] === curschema.targetNamespace) {
                            schemasUsingNamespace.push({ nsabbrevation: nsa, schema: curschema });
                            break;
                        }
                }
        }
        const foundElements = [];
        for (const nsschema of schemasUsingNamespace) {
            try {
                const newentry = { namespace: nsschema.nsabbrevation, elements: [] };
                for (const e of nsschema.schema.schema.element) {
                    if (!e.$ || !e.$.type)
                        continue;
                    try {
                        const basetypes = this.getBaseTypes(this.findTypeByName(e.$.type, nsschema.schema));
                        const i = basetypes.findIndex(x => { try {
                            return x.$.name === type.$.name;
                        }
                        catch (error) {
                            return false;
                        } });
                        if (i > -1)
                            newentry.elements.push(e);
                    }
                    catch (error) {
                        console.warn("Inner Error when finding basetype: " + error.toString());
                    }
                }
                foundElements.push(newentry);
            }
            catch (error) {
                console.warn("Outer Error when finding basetype: " + error.toString());
            }
        }
        return foundElements;
    }
    getBaseTypes(type, path) {
        if (!path)
            path = [];
        try {
            const newtypename = type.complexContent[0].extension[0].$.base;
            const newtype = this.findTypeByName(newtypename, type.schema);
            path.push(newtype);
            this.getBaseTypes(newtype, path);
        }
        catch (error) {
        }
        return path;
    }
    getElementFromReference(elementref, schema) {
        if (!schema)
            return undefined;
        // Split namespace and
        const nsregex = elementref.match(this.namespaceRegex);
        if (schema.referencedNamespaces[nsregex[1]] !== schema.targetNamespace)
            schema = this.schemastorage[schema.referencedNamespaces[nsregex[1]]];
        return this.getElementType(nsregex[2], schema);
    }
    getElements(type, path, schema) {
        // Get the sequence from the type
        let curElement;
        // is derived type
        if (type.complexContent) {
            curElement = type.complexContent[0].extension[0];
            // Resolve path -> Crawl down the sequences (which contain the xml elements)
            let curPath;
            while (curPath = path.pop())
                curElement = curElement.sequence[0].element.find(x => x.$.name === curPath);
        }
        const elements = this.getElementsFromSequenceAndChoice(curElement, schema);
        // Get choice // TODO: Maybe this is not the only way
        return elements;
    }
    getElementsFromSequenceAndChoice(element, schema) {
        let res = [];
        // If element contains a complexType
        if (element.complexType)
            element = element.complexType[0];
        if (element.sequence) {
            const sequence = element.sequence[0];
            if (sequence.choice) {
                const choice = sequence.choice[0];
                if (choice.element)
                    res = res.concat(choice.element);
            }
            if (sequence.element)
                res = res.concat(sequence.element);
        }
        return res;
    }
    markdownText(input) {
        input = input.replace(/<code>([\s\S]*?)<\/code>/gm, "`$1`");
        input = input.replace(/<b>([\s\S]*?)<\/b>/gm, "**$1**");
        input = input.replace(/<i>([\s\S]*?)<\/i>/gm, "*$1*");
        return input;
    }
    findTypeByName(typename, schema) {
        const aType = typename.split(":");
        let tn;
        let namespace;
        if (aType.length > 1) {
            namespace = aType[0];
            tn = aType[1];
        }
        else {
            tn = typename;
        }
        const complexTypes = schema.schema.complexType;
        if (namespace) {
            if (schema.referencedNamespaces[namespace] !== schema.targetNamespace) {
                const newschema = this.schemastorage[schema.referencedNamespaces[namespace]];
                if (!newschema) {
                    throw new Error("No schema found for namespace abbrevation '" + namespace + "' in schema '" + schema.targetNamespace + "'.");
                }
                return this.findTypeByName(typename, newschema);
            }
        }
        for (const complextype of complexTypes) {
            if (!complextype.$)
                continue;
            if (!complextype.$.name)
                continue;
            if (complextype.$.name === tn) {
                // If complextype has complex content it is derived.
                if (complextype.complexContent) {
                    const basetypename = complextype.complexContent[0].extension[0].$.base;
                    const basetype = this.findTypeByName(basetypename, schema);
                    complextype.basetype = basetype;
                }
                complextype.schema = schema;
                complextype.attribute = this.getAttributes(complextype);
                return complextype;
            }
        }
        for (const simpletype of schema.schema.simpleType) {
            if (!simpletype.$) {
                continue;
            }
            if (!simpletype.$.name) {
                continue;
            }
            if (simpletype.$.name === tn) {
                return simpletype;
            }
        }
        return undefined;
    }
}
exports.XmlBaseHandler = XmlBaseHandler;
/**
 * Replaces the key. Return old key if key should not be renamed.
 *
 * @param {*} o
 * @param {(key: string, value: any, parent: {}) => string} func
 */
function substitute(o, func) {
    const build = {};
    for (const i in o) {
        if (i) {
            const newkey = func.apply(this, [i, o[i], o]);
            let newobject = o[i];
            if (o[i] !== null && typeof (o[i]) === "object") {
                if (o[i] instanceof Array) {
                    newobject = [];
                    for (const entry of o[i])
                        newobject.push(substitute({ [i]: entry }, func)[newkey]);
                }
                else
                    newobject = substitute(o[i], func);
            }
            build[newkey] = newobject;
        }
    }
    return build;
}
exports.substitute = substitute;
function traverse(o, func) {
    for (const i in o) {
        if (func.apply(this, [i, o[i], o]))
            continue;
        if (o[i] !== null && typeof (o[i]) === "object") {
            if (o[i] instanceof Array)
                for (const entry of o[i])
                    traverse({ [i]: entry }, func);
            // going on step down in the object tree!!
            traverse(o[i], func);
        }
    }
}
exports.traverse = traverse;
//# sourceMappingURL=xmltypes.js.map