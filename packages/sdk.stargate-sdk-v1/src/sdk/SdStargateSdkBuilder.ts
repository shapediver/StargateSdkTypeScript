import { SdStargateError, SdStargateErrorTypes } from "../SdStargateError"
import { ISdStargateSdkBuilder } from "./ISdStargateSdkBuilder"
import { SdStargateSdk } from "./SdStargateSdk"

export class SdStargateSdkBuilder implements ISdStargateSdkBuilder {

    baseUrl: string
    msgHandler: (payload: unknown) => void
    errHandler: (msg: string) => void
    dcnHandler: (msg: string) => void

    constructor () {
        this.baseUrl = ""
        this.msgHandler = (payload: unknown) => console.log("Received command from Stargate:", payload)
        this.errHandler = (msg: string) => console.error(msg)
        this.dcnHandler = (msg: string) => console.warn(msg)
    }

    setBaseUrl (baseUrl: string): this {
        this.baseUrl = baseUrl
        return this
    }

    setServerCommandHandler (msgHandler: (payload: unknown) => void): this {
        this.msgHandler = msgHandler
        return this
    }

    setConnectionErrorHandler (errHandler: (msg: string) => void): this {
        this.errHandler = errHandler
        return this
    }

    setDisconnectHandler (dcnHandler: (msg: string) => void): this {
        this.dcnHandler = dcnHandler
        return this
    }

    async build (): Promise<SdStargateSdk> {
        // Validate build parameters
        if (!this.baseUrl) {
            throw new SdStargateError(
                SdStargateErrorTypes.GenericClientError,
                "Cannot build Stargate SDK: Base URL is not set",
            )
        }

        // Create and initialize sdk
        const sdk = new SdStargateSdk(this.baseUrl, this.msgHandler, this.errHandler, this.dcnHandler)
        await sdk.init()

        return sdk
    }

}
