import { ISdBaseCommand } from '../commands/ISdBaseCommand';
import { ISdCommandRegister } from '../commands/ISdCommandRegister';
import { ISdStargateListClientsResponseDto } from '../dto/listClients';
import { ISdStargateRegisterResponseDto } from '../dto/register';
import { ISdStargateClientModel } from '../models/ISdStargateClientModel';

export interface ISdStargateSdk {
    readonly commandRegister: ISdCommandRegister;

    /**
     * Add a command implementation to the client.
     * @throws {@link SdStargateError} when a command of the same type has already been added.
     */
    addCommand(command: ISdBaseCommand): void;

    /** Closes the open connection to the Stargate service. */
    close(): Promise<void>;

    /**
     * Registers this client for the authenticated user in Stargate.
     * @param authToken JWT authentication token.
     * @param clientName The name of the client software.
     * @param clientVersion The version of the client software.
     * @param hostOs The platform identifier and version number of the host system.
     * @param hostName The name of the host system.
     * @param hostUser Gets the username of the person who is associated with the host system.
     * @throws {@link SdStargateError}
     */
    register(
        authToken: string,
        clientName: string,
        clientVersion: string,
        hostOs: string,
        hostName: string,
        hostUser: string
    ): Promise<ISdStargateRegisterResponseDto>;

    /**
     * Lists all backend clients of this user (specified via {@link register}`-command) that are currently registered
     * in Starlink.
     * @throws {@link SdStargateError}
     */
    listBackendClients(): Promise<ISdStargateListClientsResponseDto>;

    /**
     * Lists all frontend clients of this user (specified via {@link register}`-command) that are currently registered
     * in Starlink.
     * @throws {@link SdStargateError}
     */
    listFrontendClients(): Promise<ISdStargateListClientsResponseDto>;

    /**
     * Sends the given message to the specified clients of this user (specified via {@link register}`-command).
     * @param payload The message object that should be forwarded.
     * @param clients The clients that should be disconnected.
     * @throws {@link SdStargateError}
     */
    forwardMessage(
        payload: Record<string, unknown>,
        clients: ISdStargateClientModel[] | string[]
    ): Promise<void>;

    /**
     * De-registers the specified clients and disconnects them from the Stargate service.
     * @param clients The clients that should be disconnected.
     * @throws {@link SdStargateError}
     */
    disconnectClients(clients: ISdStargateClientModel[]): Promise<void>;
}
