import { Data, ErrorEvent, WebSocket } from "isomorphic-ws"
import { v4 as uuidv4 } from "uuid"
import {
    ISdErrorResponseDto,
    ISdOkResponseDto,
    ISdStargateCommandDto,
    isErrorResponseDto,
    isOkResponseDto,
} from "../dto/SdBaseDto"
import { ISdStargateClient } from "./ISdStargateClient"

/** Holds the promise functions of a single open request */
type OpenRequest = {
    resolve: (value: (any)) => void,
    reject: (reason?: any) => void,
}

export class SdWebSocketClient implements ISdStargateClient {

    _ws: WebSocket | undefined

    /**
     * This handler is called whenever a server message is received that is not a direct response to a previously sent
     * request.
     */
    readonly msgHandler: (payload: unknown) => void

    /**
     * This handler is called for every WebSocket related errors. It covers the following situations:
     *  * Unexpected WebSocket errors.
     *  * Invalid server messages.
     *  * Server response messages referencing unknown requests (no open request for requestId found).
     */
    readonly errHandler: (msg: string) => void

    /** Holds all open requests that are waiting for a response. */
    readonly openRequests: Record<string, OpenRequest> = {}

    constructor (
        msgHandler: (payload: unknown) => void,
        errHandler: (msg: string) => void,
    ) {
        this.msgHandler = msgHandler
        this.errHandler = errHandler
    }

    /**
     * Getter for WebSocket that throws when not connected.
     * @private
     */
    ws (): WebSocket {
        if (!this._ws) throw new Error("Client is not connected")
        return this._ws
    }

    init (ws: WebSocket): void {
        ws.onopen = () => {
            // Reset to empty function
        }
        ws.onclose = () => {
            this._ws = undefined
            this.errHandler("Connection was closed by the server.")
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
            const ws = new WebSocket(`wss://${ url }`)  // NOTE no support for the constructor options argument in browsers!!!
            ws.onopen = () => {
                this.init(ws)
                resolve()
            }
            ws.onerror = (event: ErrorEvent) => reject(event.message)
        })
    }

    async disconnect (): Promise<void> {
        const ws = this._ws

        // Return if connection was never established
        if (!ws) return

        return new Promise((resolve, reject) => {
            this._ws = undefined
            ws.onclose = () => resolve()
            ws.onerror = (event: ErrorEvent) => reject(event.message)
            ws.close()   // close connection
        })
    }

    async send (msg: ISdStargateCommandDto): Promise<any> {
        const reqId = this.generateRequestId()
        return new Promise<any>((resolve, reject) => {
            msg.requestId = reqId
            this.openRequests[reqId] = { resolve, reject }
            this.ws().send(JSON.stringify(msg))
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
            this.processErrorMessage({ errorMessage: "Received data in invalid format: Unknown DTO." })
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
        // An error without any type comes directly from API Gateway.
        // Thus, we categorize it as a critical error.
        const msg = `${ res.errorType ?? "CriticalError" }: ${ res.errorMessage }`

        // An error response without a requestId property is seen as a general system error.
        // In this case, we want to reject all open requests.
        if (!res.requestId) {
            for (const id in this.openRequests) {
                this.openRequests[id].reject(msg)
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
        req.reject(msg)
    }

}
