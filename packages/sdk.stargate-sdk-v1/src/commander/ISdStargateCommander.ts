import { ISdStargateClient, ISdStargateCommandDto } from '@shapediver/sdk.stargate-sdk-core';
import { SdStargateError } from '../SdStargateError';

/**
 * Wrapper around the {@link ISdStargateClient}.
 * Maps rejected errors from the core-package format into {@link SdStargateError}.
 */
export interface ISdStargateCommander {
    /**
     * Tries to establish a connection with the server.
     * @throws {@link SdStargateError} when connection could not be established.
     */
    connect(url: string): Promise<void>;

    /**
     * Disconnects from the server.
     * @throws {@link SdStargateError} when something went wrong.
     */
    disconnect(): Promise<void>;

    /** Builds the request from the given data and sends the command to the server. */
    send(cmd: ISdStargateCommandDto): Promise<unknown>;
}
