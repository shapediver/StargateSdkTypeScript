import { SdStargateError } from "@shapediver/sdk.stargate-sdk-core"
import { ISdStargateSdkBuilder } from "./ISdStargateSdkBuilder"
import { SdStargateSdk } from "./SdStargateSdk"

export class SdStargateSdkBuilder implements ISdStargateSdkBuilder {

    baseUrl: string
    msgHandler: (payload: unknown) => void
    errHandler: (msg: string) => void

    constructor () {
        this.baseUrl = ""
        this.msgHandler = (payload: unknown) => console.log("Received command from Stargate:", payload)
        this.errHandler = (msg: string) => console.error(msg)
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

    async build (): Promise<SdStargateSdk> {
        // Validate build parameters
        if (!this.baseUrl) throw new SdStargateError("Cannot build Stargate SDK: Base URL is not set")

        // Create and initialize sdk
        const sdk = new SdStargateSdk(this.baseUrl, this.msgHandler, this.errHandler)
        await sdk.init()

        return sdk
    }

}
