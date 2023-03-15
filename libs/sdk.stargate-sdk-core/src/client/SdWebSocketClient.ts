import { v4 as uuidv4 } from "uuid"
import { Data, ErrorEvent, WebSocket } from "ws"
import {
    ISdErrorResponseDto,
    ISdOkResponseDto,
    ISdStargateCommandDto,
    isErrorResponseDto,
    isOkResponseDto,
} from "../dto/baseDto"
import { SdStargateCoreErrorTypes } from "../SdStargateCoreErrorTypes"
import { ISdStargateClient, ISdStargateClientOptionKeepAlive } from "./ISdStargateClient"

/** Holds the promise functions of a single open request */
type OpenRequest = {
    resolve: (value: (any)) => void,
    reject: (reason?: any) => void,
}

export class SdWebSocketClient implements ISdStargateClient {

    _ws: WebSocket | undefined

    /**
     * Custom message handler.
     * This handler is called whenever a server message is received that is not a direct response to a previously sent
     * request.
     */
    readonly msgHandler: (payload: unknown) => void

    /**
     * Custom error handler.
     * This handler is called for every WebSocket related errors. It covers the following situations:
     *  * Unexpected WebSocket errors.
     *  * Invalid server messages.
     *  * Server response messages referencing unknown requests (no open request for requestId found).
     */
    readonly errHandler: (msg: string) => void

    /**
     * Custom disconnect handler.
     * This handler is called when the WebSocket connection is closed by an external factor. However, it is not called
     * when the {@link disconnect} function is called.
     */
    readonly dcnHandler: (msg: string) => void

    /**
     * When this property is defined, the client sends data periodically to keep the Websocket
     * session active. This process is started when the {@link connect} method was called and
     * stopped when the established connection has been closed. The {@link send} method updates
     * the time when a keep alive message is sent.
     */
    readonly keepAlive?: ISdStargateClientOptionKeepAlive

    /** Holds all open requests that are waiting for a response. */
    readonly openRequests: Record<string, OpenRequest> = {}

    /** Holds the timeout-ID of the next keep alive send message call */
    keepAliveTimeout?: ReturnType<typeof setTimeout>

    constructor (
        msgHandler: (payload: unknown) => void,
        errHandler: (msg: string) => void,
        dcnHandler: (msg: string) => void,
        keepAlive?: ISdStargateClientOptionKeepAlive,
    ) {
        this.msgHandler = msgHandler
        this.errHandler = errHandler
        this.dcnHandler = dcnHandler

        this.keepAlive = keepAlive
    }

    /**
     * Getter for WebSocket that throws when not connected.
     * @private
     */
    ws (): WebSocket {
        if (!this._ws) throw new Error("Client is not connected")
        return this._ws
    }

    /**
     * Configures the handling of all WebSocket events that are required by this client.
     * @private
     */
    init (ws: WebSocket): void {
        ws.onopen = () => {
            // Reset to empty function
        }
        ws.onclose = (event) => {
            this._ws = undefined
            this.dcnHandler(event.reason)
        }
        ws.onerror = (event) => {
            this.errHandler(event.message)
        }
        ws.onmessage = (event) => {
            this.onMessage(event.data)
        }
        this._ws = ws
    }

    async connect (url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const ws = SdWebSocketClient.createWebSocket(`wss://${ url }`)
            ws.onopen = () => {
                this.init(ws)   // Configure WebSocket events
                this.updateKeepAlive()  // Start keep alive process
                resolve()
            }
            ws.onerror = (event: ErrorEvent) => reject([ SdStargateCoreErrorTypes.GenericClientError, event.message ])
        })
    }

    async disconnect (): Promise<void> {
        const ws = this._ws

        // Return if connection was never established
        if (!ws) return

        return new Promise((resolve, reject) => {
            this._ws = undefined
            ws.onclose = () => resolve()
            ws.onerror = (event: ErrorEvent) => reject([ SdStargateCoreErrorTypes.GenericClientError, event.message ])
            ws.close()   // close connection
        })
    }

    async send (msg: ISdStargateCommandDto): Promise<any> {
        const reqId = this.generateRequestId()
        return new Promise<any>((resolve, reject) => {
            msg.requestId = reqId
            this.openRequests[reqId] = {
                resolve: (value: any) => {
                    delete this.openRequests[reqId]
                    resolve(value)
                },
                reject: (value: any) => {
                    delete this.openRequests[reqId]
                    reject((Array.isArray(value))
                        ? value
                        : [ SdStargateCoreErrorTypes.GenericClientError, value ],
                    )
                },
            }
            this.ws().send(JSON.stringify(msg))
            this.updateKeepAlive()  // Update keep alive timeout
        })
    }

    /**
     * Creates and returns a new ID that can be used to trace individual requests.
     * @private
     */
    generateRequestId (): string {
        return uuidv4()
    }

    /**
     * WebSocket handler for incoming messages.
     * @private
     */
    onMessage (data: Data): void {
        // For now, we only support string data
        if (typeof data !== "string") {
            this.errHandler("Received data in invalid format: Not a string.")
            return
        }

        // All responses must be in valid JSON format
        let res
        try {
            res = JSON.parse(data)
        } catch (e) {
            this.errHandler("Received data in invalid format: Not a JSON object.")
            return
        }

        if (isOkResponseDto(res)) this.processOkMessage(res)
        else if (isErrorResponseDto(res)) this.processErrorMessage(res)
        else {
            // This should not happen, but we must make sure that open requests are closed!
            this.processErrorMessage({
                errorMessage: `Received data in invalid format: Unknown DTO.\n${ data }`,
            })
            return
        }
    }

    /**
     * Processes an incoming non-error message.
     * @private
     */
    processOkMessage (res: ISdOkResponseDto): void {
        // A response without a requestId property is seen as a command-message
        if (!res.requestId) {
            this.msgHandler(res.payload)
            return
        }

        // Get the respective open (and waiting) request
        const req = this.openRequests[res.requestId]
        if (!req) {
            this.errHandler(`Cannot resolve request: No open request found for id ${ res.requestId }.`)
            return
        }

        // Resolve the open request
        req.resolve(res.payload)
    }

    /**
     * Processes an incoming error message.
     * @private
     */
    processErrorMessage (res: ISdErrorResponseDto): void {
        // API Gateway errors are of type `Runtime.*` (e.g. `Runtime.ExitError`), which is wrapped
        // by our default type `SdStargateDefaultErrorType`.
        const mappedErrorType = (res.errorType && String(res.errorType).startsWith("Runtime."))
            ? SdStargateCoreErrorTypes.ServiceUnavailable
            : res.errorType
        const rejectReason = [ mappedErrorType, res.errorMessage ]

        // An error response without a requestId property is seen as a general system error.
        // In this case, we want to reject all open requests.
        if (!res.requestId) {
            for (const id in this.openRequests) {
                this.openRequests[id].reject(rejectReason)
            }
            return
        }

        // Get the respective open (and waiting) request
        const req = this.openRequests[res.requestId]
        if (!req) {
            this.errHandler(`Cannot reject request: No open request found for id ${ res.requestId }.`)
            return
        }

        // Reject the open request
        req.reject(rejectReason)
    }

    /**
     * Creates a new delayed keep-alive send message call and clears the previous one. This
     * makes sure that keep-alive messages are only sent when no user action was executed within
     * the specified keep-alive interval.
     * @private
     */
    updateKeepAlive (): void {
        // Stop when keep alive is not configured
        if (!this.keepAlive) return

        // Cancel the previous keep alive timeout
        if (this.keepAliveTimeout) clearTimeout(this.keepAliveTimeout)

        // Create new keep alive
        this.keepAliveTimeout = setTimeout(async () => {
            try {
                // `send` runs `updateKeepAlive` again
                await this.send(this.keepAlive!.reqCreator())
            } catch (e) {
                this.errHandler(`Failed to send keep alive message: ${ e.message }`)
            }
        }, this.keepAlive.interval)
    }

    /** Helper function to create a new WebSocket instance on Browser or Node.js. */
    static createWebSocket (url: string): WebSocket {
        const ws = (
            // @ts-ignore
            global?.WebSocket || global?.MozWebSocket ||
            // @ts-ignore
            global?.window?.WebSocket || global?.window?.MozWebSocket ||
            // Default is assumed to be a Node.js application, thus the 'ws' package is used.
            require("ws")
        ) as any

        return new ws(url) // NOTE no support for the constructor options argument in browsers!!!
    }

}
