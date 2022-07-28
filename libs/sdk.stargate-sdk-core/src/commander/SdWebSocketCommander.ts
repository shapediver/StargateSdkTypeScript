import { ISdStargateClient } from "../client/ISdStargateClient"
import { SdWebSocketClient } from "../client/SdWebSocketClient"
import { ISdStargateCommandDto } from "../dto/SdBaseDto"
import { SdStargateError } from "../SdStargateError"
import { ISdStargateCommander } from "./ISdStargateCommander"

export class SdWebSocketCommander implements ISdStargateCommander {

    readonly client: ISdStargateClient

    constructor (
        msgHandler: (payload: unknown) => void,
        errHandler: (msg: string) => void,
    ) {
        this.client = new SdWebSocketClient(msgHandler, errHandler)
    }

    async connect (url: string): Promise<void> {
        try {
            return await this.client.connect(url)
        } catch (e) {
            throw new SdStargateError(`Could not establish a connection to server: ${ e.message }`)
        }
    }

    async disconnect (): Promise<void> {
        try {
            return await this.client.disconnect()
        } catch (e) {
            throw new SdStargateError(`Error when disconnecting client: ${ e.message }`)
        }
    }

    async sendCommand (req: ISdStargateCommandDto): Promise<unknown> {
        return this.client.send(req)
    }

}
