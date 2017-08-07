import * as fs from "fs";
import * as p from "path";
import {
	CompletionItem, CompletionItemKind,
	CompletionList, createConnection, Diagnostic,
	DiagnosticSeverity, DidChangeTextDocumentParams, IConnection, InitializeParams,
	InitializeResult, IPCMessageReader, IPCMessageWriter,
	Location, Position, PublishDiagnosticsParams, Range, TextDocument, TextDocumentPositionParams, TextDocuments, TextDocumentSyncKind,
} from "vscode-languageserver";
import * as vscodels from "vscode-languageserver";
import * as xml from "xml2js";

import { LogLevel } from "./Log";

const controllerFileEx = "\\.controller\\.(js|ts)$";

if (!("toJSON" in Error.prototype))
	Object.defineProperty(Error.prototype, "toJSON", {
		configurable: true,
		value: () => {
			const alt = {};
			Object.getOwnPropertyNames(this).forEach((key) => {
				alt[key] = this[key];
			}, this);

			return alt;
		},
		writable: true,
	});

/**
 * Initialization options for the xml language server
 *
 * @interface XmlInitOptions
 */
interface IXmlInitOptions {
    /**
     * asolute path to the folder of the xsd files
     *
     * @type {string}
     * @memberOf XmlInitOptions
     */
	storagepath: string;
}

export namespace Global {
	/**
	 * settings coming from the language client (the extension). Can be changed by the user.
	 */
	export let settings: IClientSettings;
	/**
	 * Static settings for the server
	 */
	export let serverSettings: IXmlInitOptions;
	/**
	 * Instance of the schemastore, which handles the xml schemas
	 */
	// export let schemastore: XmlStorage;
	/**
	 * Root folder of the current workspace
	 */
	export let workspaceRoot: string;
}

// Create a connection for the server. The connection uses Node's IPC as a transport
const connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

// Create a simple text document manager. The text document manager
// supports full document sync only
const documents: TextDocuments = new TextDocuments();

connection.onInitialize((params): InitializeResult => {
	connection.console.info("Initializing XML language server");
	// connection.console.log("params: " + JSON.stringify(params));

	Global.serverSettings = params.initializationOptions;
	Global.workspaceRoot = params.rootPath;
	// Global.schemastore = new XmlStorage(Global.serverSettings.storagepath, connection, LogLevel.None);

	connection.console.info("Starting Listener");
	// Make the text document manager listen on the connection
	// for open, change and close text document events
	documents.listen(connection);

	return {
		capabilities: {
			codeActionProvider: false,
			completionProvider: {
				resolveProvider: false,
				triggerCharacters: ["<", ">", '"', "'", ".", "/"],
			},
			// Tell the client that the server support code complete
			definitionProvider: false,
			hoverProvider: true,
			// Tell the client that the server works in FULL text document sync mode
			textDocumentSync: documents.syncKind,
		},
	};
});

connection.onCompletion(async (params, token): Promise<CompletionList> => {
	connection.console.info("Completion providing request received");
	// Use completion list, as the return will be called before
	const cl: CompletionList = {
		isIncomplete: true,
		items: [],
	};

	const doc = documents.get(params.textDocument.uri);
	const line = getLine(doc.getText(), params.position.line);

	try {
		// const ch = new XmlCompletionHandler(Global.schemastore, doc, connection, "./schemastore", Global.settings.ui5ts.lang.xml.LogLevel);
		// cl.items = cl.items.concat(await ch.getCompletionSuggestions(params));
		cl.isIncomplete = false;
	} catch (error) {
		connection.console.error("Error when getting XML completion entries: " + JSON.stringify(error));
	}
	return cl;
});

connection.onHover(async (params: TextDocumentPositionParams, token: any) => {
	connection.console.info("Hover request received");

	const doc = documents.get(params.textDocument.uri);
	const line = getLine(doc.getText(), params.position.line);

	try {
		// const ch = new XmlHoverProvider(Global.schemastore, documents, connection, "./schemastore", Global.settings.ui5ts.lang.xml.LogLevel);
		// return await ch.getHoverInformation(params);
		return undefined;
	} catch (error) {
		connection.console.error("Error when getting XML completion entries: " + JSON.stringify(error));
	}
	return undefined;
});

documents.onDidChangeContent(async (params) => {
	const doc = documents.get(params.document.uri);
	if (!doc)
		return;

	const diagnostics: PublishDiagnosticsParams = { uri: doc.uri, diagnostics: [] };

	try {
		// const wfd = new XmlWellFormedDiagnosticProvider(connection, Global.settings.ui5ts.lang.xml.LogLevel);
		// diagnostics.diagnostics = diagnostics.diagnostics.concat(await wfd.diagnose(doc));
	} catch (error) {
		// do nothing
	}
	try {
		// const ad = new XmlAttributeDiagnosticProvider(Global.schemastore, connection, Global.settings.ui5ts.lang.xml.LogLevel);
		// diagnostics.diagnostics = diagnostics.diagnostics.concat(await ad.diagnose(doc));
	} catch (error) {
		// do nothing
	}
	connection.sendDiagnostics(diagnostics);
});

connection.onDidChangeConfiguration((change) => {
	connection.console.info("Changed settings: " + JSON.stringify(change));
	Global.settings = change.settings as IClientSettings;
	if (!change.settings.xml || !change.settings.xml.languageserver) {
		Global.settings = {
			xml: {
				LogLevel: 4,
			},
		};
	}
});

export function getLine(text: string, linenumber: number): string {
	const lines = text.split(/\n/);
	if (linenumber > lines.length - 1)
		linenumber = lines.length - 1;
	return lines[linenumber];
}

export function getRange(docText: string, searchPattern: RegExp): Range[] {
	const lineRegex = /.*(?:\n|\r\n)/gm;
	let l;
	const ret: Range[] = [];
	let linectr = 0;
	while ((l = lineRegex.exec(docText)) !== null) {
		linectr = linectr + 1;
		if (l.index === lineRegex.lastIndex)
			lineRegex.lastIndex++;

		const match = searchPattern.exec(l);

		if (!match)
			continue;

		ret.push({ start: { line: linectr, character: match.index }, end: { line: linectr, character: match.index + match[0].length } });
	}
	return ret;
}

export function getPositionFromIndex(input: string, index: number): Position {
	const lines = input.split("\n");
	let curindex = 0;
	let lineindex = 0;
	for (const line of lines) {
		if (index <= curindex + line.length) {
			return {
				character: index - curindex,
				line: lineindex,
			};
		}
		curindex += line.length + 1;
		lineindex++;
	}
}

export function getLineCount(input: string) {
	return input.split("\n").length;
}

interface IClientSettings {
	xml: {
		LogLevel: LogLevel,
	};
}

connection.listen();
