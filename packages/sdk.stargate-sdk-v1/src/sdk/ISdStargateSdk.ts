import { ISdListClientsResponseDto } from "../dto/ListClientsCommand"
import { ISdRegisterResponseDto } from "../dto/RegisterCommand"
import { ISdClientModel } from "../model/ISdClientModel"

export interface ISdStargateSdk {

    /** Closes the open connection to the Stargate service. */
    close (): Promise<void>

    /**
     * Registers this client for the authenticated user in Stargate.
     * @param auth_token JWT authentication token
     * @param name Name of the client software
     * @param version Version of the client software
     * @throws {@link SdStargateError}
     */
    register (
        auth_token: string,
        name: string,
        version: string,
    ): Promise<ISdRegisterResponseDto>

    /**
     * Lists all backend clients of this user (specified via {@link register}`-command) that are currently registered
     * in Starlink.
     * @throws {@link SdStargateError}
     */
    listBackendClients (): Promise<ISdListClientsResponseDto>

    /**
     * Lists all frontend clients of this user (specified via {@link register}`-command) that are currently registered
     * in Starlink.
     * @throws {@link SdStargateError}
     */
    listFrontendClients (): Promise<ISdListClientsResponseDto>

    /**
     * Sends the given message to the specified clients of this user (specified via {@link register}`-command).
     * @param msg The message object that should be forwarded.
     * @param clients The clients that should be disconnected.
     * @throws {@link SdStargateError}
     */
    forwardMessage (msg: Record<string, any>, clients: ISdClientModel[]): Promise<void>

    /**
     * De-registers the specified clients and disconnects them from the Stargate service.
     * @param clients The clients that should be disconnected.
     * @throws {@link SdStargateError}
     */
    disconnectClients (clients: ISdClientModel[]): Promise<void>

}
