import { SdStargateSdk } from "./SdStargateSdk"

export interface ISdStargateSdkBuilder {

    /** Sets the base URL of the Stargate server. */
    setBaseUrl (baseUrl: string): this

    /**
     * Sets the function handler that should be called when a command has been received from the Stargate server.
     *
     * ### Default
     * When not set, the payload of the received command is printed to console with `log`-level.
     */
    setServerCommandHandler (msgHandler: (payload: unknown) => void): this

    /**
     * Sets the function handler that should be called when an error message has been received from the Stargate server.
     *
     * ### Default
     * When not set, the payload of the received command is printed to console with `error`-level.
     */
    setConnectionErrorHandler (errHandler: (msg: string) => void): this

    /** Creates and initializes a new Stargate SDK instance. */
    build (): Promise<SdStargateSdk>

}
