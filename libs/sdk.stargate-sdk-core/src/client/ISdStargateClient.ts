import { ISdStargateCommandDto } from "../dto/SdBaseDto"

export interface ISdStargateClient {

    /** Tries to establish a connection to the given URL. */
    connect (url: string): Promise<void>

    /** Closes the open connection. */
    disconnect (): Promise<void>

    /** Sends the given message to the server and waits for a response. */
    send (msg: ISdStargateCommandDto): Promise<any>
}
