import { IConnection } from "vscode-languageserver";

export enum LogLevel {
    Debug = 0, Information, Warning, Error, None,
}

export type LogMessage = string | (() => string);

/**
 * A base class to send log messages to the client
 *
 * @export
 * @class Log
 */
export class Log {
    /**
     * Creates an instance of Log.
     * @param {IConnection} connection The connection to the client
     * @param {LogLevel} loglevel The loglevel of this instance
     *
     * @memberOf Log
     */
    constructor(public readonly connection: IConnection, public readonly loglevel: LogLevel) {
    }

    /**
     * Sends a debug message to the client output.
     *
     * @param {LogMessage} message Message to log
     *
     * @memberOf Log
     */
    public logDebug(message: LogMessage) {
        try {
            if (this.loglevel <= LogLevel.Debug) {
                const d = new Date();
                if (typeof message === "string")
                    this.connection.console.log("[Debug - " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "] " + message);
                else
                    this.connection.console.log("[Debug - " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "] " + message());
            }
        } catch (error) {
            // Do nothing
        }
    }

    /**
     * Sends a log message without any prefix or date.
     *
     * @param {LogMessage} message message to send, either a string or a function returning a string.
     * @param {LogLevel} [level] default = 0
     *
     * @memberOf Log
     */
    public log(message?: LogMessage, level?: LogLevel) {
        try {
            if (!level)
                level = 0;
            if (!message)
                message = " ";
            if (this.loglevel <= level) {
                const d = new Date();
                if (typeof message === "string")
                    this.connection.console.log(message);
                else
                    this.connection.console.log(message());
            }
        } catch (error) {
            // do nothing
        }
    }

    /**
     * Sends an info message to the client output
     *
     * @param {LogMessage} message Message to log
     *
     * @memberOf Log
     */
    public logInfo(message: LogMessage) {
        try {
            if (this.loglevel <= LogLevel.Debug) {
                if (typeof message === "string")
                    this.connection.console.info(message);
                else
                    this.connection.console.info(message());
            }
        } catch (error) {
            // Do nothing
        }
    }

    /**
     * Sends a warning message to the client output
     *
     * @param {LogMessage} message Message to log
     *
     * @memberOf Log
     */
    public logWarn(message: LogMessage) {
        try {
            if (this.loglevel <= LogLevel.Warning) {
                if (typeof message === "string")
                    this.connection.console.warn(message);
                else
                    this.connection.console.warn(message());
            }
        } catch (error) {
            // Do nothing
        }
    }

    /**
     * Sends an error message to the client output
     *
     * @param {LogMessage} message Message to log
     *
     * @memberOf Log
     */
    public logError(message: LogMessage) {
        try {
            if (this.loglevel <= LogLevel.Error) {
                if (typeof message === "string")
                    this.connection.console.error(message);
                else
                    this.connection.console.error(message());
            }
        } catch (error) {
            // Do nothing
        }
    }

    /**
     * Sends a fatal error to the client output. Fatal errors are displayed regardless of the loglevel.
     *
     * @param {LogMessage} message message to log
     *
     * @memberOf Log
     */
    public logFatalError(message: LogMessage) {
        try {
            if (typeof message === "string")
                this.connection.console.error("FATAL ERROR: " + message);
            else
                this.connection.console.error("FATAL ERROR: " + message());
        } catch (error) {
            // Do nothing
        }
    }
}
