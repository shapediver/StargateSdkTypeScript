import { ISdStargateClient, ISdStargateClientOptionKeepAlive } from "../client/ISdStargateClient"
import { SdWebSocketClient } from "../client/SdWebSocketClient"
import { ISdStargateCommandDto } from "../dto/baseDto"
import { SdStargateError } from "../SdStargateError"
import { ISdStargateCommander } from "./ISdStargateCommander"

export class SdWebSocketCommander implements ISdStargateCommander {

    readonly client: ISdStargateClient

    constructor (
        msgHandler: (payload: unknown) => void,
        errHandler: (msg: string) => void,
        dcnHandler: (msg: string) => void,
        keepAlive?: ISdStargateClientOptionKeepAlive,
    ) {
        this.client = new SdWebSocketClient(msgHandler, errHandler, dcnHandler, keepAlive)
    }

    async connect (url: string): Promise<void> {
        try {
            return await this.client.connect(url)
        } catch (e) {
            const msg = (e.message) ? `: ${ e.message }` : ""
            throw new SdStargateError("Could not establish a connection to server" + msg)
        }
    }

    async disconnect (): Promise<void> {
        try {
            return await this.client.disconnect()
        } catch (e) {
            const msg = (e.message) ? `: ${ e.message }` : ""
            throw new SdStargateError("Error when disconnecting client" + msg)
        }
    }

    async send (req: ISdStargateCommandDto): Promise<unknown> {
        return this.client.send(req)
    }

}
