import {
    createStargateClient,
    ISdStargateClient,
    ISdStargateClientOptionKeepAlive,
    ISdStargateCommandDto,
    SdUtils,
} from "@shapediver/sdk.stargate-sdk-core"
import { ISdStargatePingRequestDto } from "../dto/ping"
import { SdStargateError, SdStargateErrorTypes } from "../SdStargateError"
import { ISdStargateCommander } from "./ISdStargateCommander"

export class SdWebSocketCommander implements ISdStargateCommander {

    readonly client: ISdStargateClient

    constructor (
        msgHandler: (payload: unknown) => void,
        errHandler: (msg: string) => void,
        dcnHandler: (msg: string) => void,
    ) {
        const keepAlive: ISdStargateClientOptionKeepAlive = {
            interval: 585000,   // in ms (9 min and 45 sec)
            reqCreator: this.keepAliveReqBuilder.bind(this),
        }

        this.client = createStargateClient(msgHandler, errHandler, dcnHandler, keepAlive)
    }

    async connect (url: string): Promise<void> {
        try {
            return await this.client.connect(url)
        } catch (e) {
            throw SdWebSocketCommander.mapRejectToError(e, "Could not establish a connection to server:")
        }
    }

    async disconnect (): Promise<void> {
        try {
            return await this.client.disconnect()
        } catch (e) {
            throw SdWebSocketCommander.mapRejectToError(e, "Error when disconnecting client:")
        }
    }

    async send (req: ISdStargateCommandDto): Promise<unknown> {
        try {
            return await this.client.send(req)
        } catch (e) {
            throw SdWebSocketCommander.mapRejectToError(e)
        }
    }

    /**
     * Creates the request body for the ping-command.
     * @private
     */
    keepAliveReqBuilder (): ISdStargateCommandDto {
        const req: ISdStargatePingRequestDto = {
            header: { command: "PING" },
            payload: undefined,
        }

        return req
    }

    /**
     * Maps the reject error object that is used by the `@shapediver/sdk.stargate-sdk-core` package
     * into an instance of {@link SdStargateError}.
     *
     * Every rejected promise should contain an error object in the format `[type, message]`. This
     * information will be used to instantiate a new error object.
     * However, the content of promise-reject can unfortunately not be typed in TypeScript. Thus, we
     * need a backup logic to catch errors of other types as well. In those cases, we will use a
     * default error type and message.
     * @private
     */
    static mapRejectToError (e: any, prefix?: string): SdStargateError {
        // Try to extract error type
        let errType = (Array.isArray(e) && SdUtils.enumValues(SdStargateErrorTypes).includes(e[0]))
            ? e[0]
            : SdStargateErrorTypes.GenericClientError

        // Try to extract error message
        let errMsg
        if (Array.isArray(e) && typeof e[1] === "string") errMsg = e[1]
        else if (typeof e === "string") errMsg = e
        else errMsg = "Unknown error message of promise-reject."

        // Add prefix if specified
        if (prefix) errMsg = `${ prefix } ${ errMsg }`

        return new SdStargateError(errType, errMsg)
    }

}
