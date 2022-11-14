import { v4 as uuidv4 } from "uuid"
import { ISdCommandPayload } from "../dto/commands/commandPayload"
import { ISdStargateClientModel } from "../models/ISdStargateClientModel"
import { SdStargateSdk } from "../sdk/SdStargateSdk"
import { SdCommandRegister } from "./SdCommandRegister"

const COMMAND_TIMEOUT = 60000 // in ms (1 min)

export abstract class SdBaseCommand {

    protected constructor (
        protected sdk: SdStargateSdk,
        protected register: SdCommandRegister,
    ) {
    }

    /**
     * Validates {@link payload.data} according to {@link payload.command} and invokes the
     * respective user command handler function.
     * @throws {@link SdStargateError} when {@link payload.command} is unknown.
     */
    abstract processCommandMessage (payload: ISdCommandPayload): Promise<void>

    /**
     * Validates the reply in {@link payload.data} according to {@link payload.command} and
     * updates the respective registered open request.
     * @throws {@link SdStargateError} when {@link payload.command} is unknown.
     */
    abstract processReplyMessage (payload: ISdCommandPayload): void

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
    ): Promise<any[]> {
        // We are omitting the `sender` property, because it is set by the Stargate backend service before the message
        // is forwarded to the target clients.
        const payload: Omit<ISdCommandPayload, "sender"> = { command, data }

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
                COMMAND_TIMEOUT,
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
        payload: ISdCommandPayload,
        data: T,
        handler?: ((msg: T) => Promise<Record<string, any>>),
    ): Promise<void> {
        // Stop when no user handler has been registered for the command
        if (!handler) return

        // Send ACK-reply if requested
        if (payload.response?.type === "ACK") {
            await this.sendReply(payload as Required<ISdCommandPayload>, {})
        }

        // Call the user handler
        const res = await handler(data)

        // Send BATCH-reply if requested
        if (payload.response?.type === "BATCH") {
            await this.sendReply(payload as Required<ISdCommandPayload>, res)
        }
    }

    /**
     * Helper function to create a reply object for the given command {@link payload} and sends
     * it via Stargate to the {@link payload.sender} client.
     * @private
     */
    private async sendReply (
        payload: Required<ISdCommandPayload>,
        data: Record<string, any>,
    ): Promise<void> {
        const ackPayload: Omit<ISdCommandPayload, "sender"> = {
            command: payload.command,
            response: {
                topic: payload.response!.topic,
                type: "REPLY",
            },
            data,
        }

        // Send message to Stargate backend
        await this.sdk.forwardMessageToClients(ackPayload, [ payload.sender ])
    }

}
