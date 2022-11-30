import { v4 as uuidv4 } from "uuid"
import {
    ISdCommandErrorReplyPayload,
    ISdCommandOkReplyPayload,
    ISdCommandPayload,
    ISdCommandRequestPayload,
} from "../dto/commands/commandPayload"
import { ISdStargateClientModel } from "../models/ISdStargateClientModel"
import { ISdStargateSdk } from "../sdk/ISdStargateSdk"
import { ISdBaseCommand } from "./ISdBaseCommand"
import { ISdCommandRegister } from "./ISdCommandRegister"

export abstract class SdBaseCommand implements ISdBaseCommand {

    static DEFAULT_COMMAND_TIMEOUT = 60000 // in ms (1 min)

    protected register: ISdCommandRegister

    protected constructor (protected sdk: ISdStargateSdk) {
        sdk.addCommand(this)
        this.register = sdk.commandRegister
    }

    abstract isSupported (payload: ISdCommandPayload): boolean

    abstract processCommandMessage (payload: ISdCommandRequestPayload): Promise<void>

    abstract processOkReplyMessage (payload: ISdCommandOkReplyPayload): void

    processErrorReplyMessage (payload: ISdCommandErrorReplyPayload): void {
        // Enrich the error message by the ID of the client that sent the reply
        const errMsg = `${ payload.error.message } [sent by client ${ payload.sender }]`

        // NOTE:
        //  The first error reply rejects the open command by the registry and thus forwards the
        //  received error message to the user. However, all error replies that are received at a
        //  later point in time are ignored and their error messages are currently NOT reported to
        //  the user!
        this.register.updateCommand(payload.response.topic, payload.sender, errMsg)
    }

    /**
     * Builds the command payload and sends the client command via `FORWARD_MESSAGE` to the
     * Stargate backend. When a {@link responseType} has been specified, a new command request
     * is registered.
     * @protected
     */
    protected async sendCommand (
        data: Record<string, any>,
        clients: ISdStargateClientModel[],
        command: string,
        responseType?: "ACK" | "BATCH",
        timeout?: number,
    ): Promise<any[]> {
        // We are omitting the `sender` property, because it is set by the Stargate backend service before the message
        // is forwarded to the target clients.
        const payload: Omit<ISdCommandRequestPayload, "sender"> = { command, data }

        // Add response object if specified
        let res
        if (responseType) {
            payload.response = {
                type: responseType,
                topic: `${ command }-${ uuidv4() }`,
            }

            // Register the open command when a response is required
            res = this.register.registerCommand(
                payload.response.topic,
                clients.map(c => c.id),
                timeout ?? SdBaseCommand.DEFAULT_COMMAND_TIMEOUT,
            )
        }

        // Send message to Stargate backend
        await this.sdk.forwardMessage(payload, clients)

        return res || Promise.resolve([])
    }

    /**
     * Wrapper function around a user command handler that handles the command reply according
     * to the received {@link payload.response.type} value.
     * @protected
     */
    protected async invokeHandler<T> (
        payload: ISdCommandRequestPayload,
        data: T,
        handler?: ((msg: T) => Promise<Record<string, any>>),
    ): Promise<void> {
        // Stop when no user handler has been registered for the command
        if (!handler) {
            // Notify the callee when a response is expected
            if (payload.response) {
                await this.sendReply(payload, "No handler has been registered for this command.")
            }

            return
        }

        // Send ACK-reply if requested
        if (payload.response?.type === "ACK") {
            await this.sendReply(payload, {})
        }

        // Call the user handler.
        // This way, the user handler can just throw to propagate error messages.
        let res
        try {
            res = await handler(data)
        } catch (e) {
            res = `Error in handler-function: ${ e.message }`
        }

        // Send BATCH-reply if requested
        if (payload.response?.type === "BATCH") {
            await this.sendReply(payload, res)
        }
    }

    /**
     * Helper function to create a reply object for the given command {@link payload} and sends
     * it via Stargate to the {@link payload.sender} client.
     * @private
     */
    private async sendReply (
        request: ISdCommandRequestPayload,
        result: Record<string, any> | string,
    ): Promise<void> {
        const template: Omit<ISdCommandOkReplyPayload | ISdCommandErrorReplyPayload, "sender" | "data" | "error"> = {
            command: request.command,
            response: {
                topic: request.response!.topic,
                type: "REPLY",
            },
        }

        // Set result
        let ackPayload: Omit<ISdCommandOkReplyPayload, "sender"> | Omit<ISdCommandErrorReplyPayload, "sender">
        if (typeof result === "object") ackPayload = { ...template, data: result }
        else ackPayload = { ...template, error: { message: result } }

        // Send message to Stargate backend
        await this.sdk.forwardMessage(ackPayload, [ request.sender ])
    }

}
