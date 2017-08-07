import * as path from "path";
import * as ts from "typescript";
import {
    commands,
    DiagnosticCollection,
    DocumentFilter,
    ExtensionContext,
    languages,
    QuickPickItem,
    TextDocument,
    TextDocumentChangeEvent,
    Uri,
    window,
    workspace,
    WorkspaceConfiguration,
} from "vscode";
import { LanguageClient, LanguageClientOptions, ServerOptions, SettingMonitor, TransportKind } from "vscode-languageclient";

export let channel = window.createOutputChannel("XML Lanugage Service");
let context: ExtensionContext;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(c: ExtensionContext) {
    context = c;
    console.log("Activating XML extension.");

    startXmlLanguageServer(context);
}

// this method is called when your extension is deactivated
// export function deactivate() {
// }

function startXmlLanguageServer(c: ExtensionContext): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        // The server is implemented in node
        channel.appendLine("Staring XML View language server");
        const serverModule = c.asAbsolutePath(path.join("server", "server.js"));
        // The debug options for the server
        const debugOptions = { storagepath: c.asAbsolutePath("schemastore"), execArgv: ["--nolazy", "--debug=6009"] };

        // If the extension is launched in debug mode then the debug server options are used
        // Otherwise the run options are used
        const serverOptions: ServerOptions = {
            debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions },
            run: { module: serverModule, transport: TransportKind.ipc },
        };

        // Options to control the language client
        const clientOptions: LanguageClientOptions = {
            // Register the server for xml decuments documents
            diagnosticCollectionName: "xmlDiagnostics",
            documentSelector: ["xml", "xsd"],
            initializationOptions: { storagepath: c.asAbsolutePath("schemastore") },
            synchronize: {
                // Synchronize the setting section "languageServerExample" to the server
                configurationSection: "xml",
                // Notify the server about file changes to '.clientrc files contain in the workspace
                fileEvents: workspace.createFileSystemWatcher("**/*.{xml,xsd}", false, false, false),
            },
        };

        // Create the language client and start the client.
        const languageClient = new LanguageClient("XmlLangServer", serverOptions, clientOptions);
        // Push the disposable to the context's subscriptions so that the
        // client can be deactivated on extension deactivation
        c.subscriptions.push(languageClient.start());
    });
}
