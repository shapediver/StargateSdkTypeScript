import { ISdStargateDummyCommand } from "../commands/ISdStargateDummyCommand"
import { ISdStargateListClientsResponseDto } from "../dto/listClients"
import { ISdStargateRegisterResponseDto } from "../dto/register"
import { ISdStargateClientModel } from "../models/ISdStargateClientModel"

export interface ISdStargateSdk {

    /**
     * Returns the API for dummy commands that allows to send new client commands or handle
     * incoming ones.
     */
    readonly cmdDummy: ISdStargateDummyCommand

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
    ): Promise<ISdStargateRegisterResponseDto>

    /**
     * Lists all backend clients of this user (specified via {@link register}`-command) that are currently registered
     * in Starlink.
     * @throws {@link SdStargateError}
     */
    listBackendClients (): Promise<ISdStargateListClientsResponseDto>

    /**
     * Lists all frontend clients of this user (specified via {@link register}`-command) that are currently registered
     * in Starlink.
     * @throws {@link SdStargateError}
     */
    listFrontendClients (): Promise<ISdStargateListClientsResponseDto>

    /**
     * Sends the given message to the specified clients of this user (specified via {@link register}`-command).
     * @param msg The message object that should be forwarded.
     * @param clients The clients that should be disconnected.
     * @throws {@link SdStargateError}
     */
    forwardMessage (msg: Record<string, any>, clients: ISdStargateClientModel[]): Promise<void>

    /**
     * De-registers the specified clients and disconnects them from the Stargate service.
     * @param clients The clients that should be disconnected.
     * @throws {@link SdStargateError}
     */
    disconnectClients (clients: ISdStargateClientModel[]): Promise<void>

}
