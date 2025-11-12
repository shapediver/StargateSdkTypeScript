import { ISdStargateCommandDto } from '../dto/baseDto';

export interface ISdStargateClientOptionKeepAlive {
    /**
     * Defines the interval in which a WebSocket message must be sent. When the user does not
     * send a command during this time period, the client will send a keep-alive message.
     */
    interval: number;

    /** A function that creates the request data for the keep-alive call. */
    reqCreator: () => ISdStargateCommandDto;
}

export interface ISdStargateClient {
    /** Tries to establish a connection to the given URL. */
    connect(url: string): Promise<void>;

    /** Closes the open connection. */
    disconnect(): Promise<void>;

    /** Sends the given message to the server and waits for a response. */
    send(msg: ISdStargateCommandDto): Promise<any>;
}
