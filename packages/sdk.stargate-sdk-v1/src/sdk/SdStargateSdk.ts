import {
    createStargateCommander,
    ISdStargateCommander,
    SdStargateError,
} from "@shapediver/sdk.stargate-sdk-core"
import { ISdDisconnectClientsRequestDto } from "../dto/DisconnectClientsCommand"
import { ISdListClientsRequestDto, ISdListClientsResponseDto } from "../dto/ListClientsCommand"
import { ISdRegisterRequestDto, ISdRegisterResponseDto } from "../dto/RegisterCommand"
import { ISdClientModel } from "../model/ISdClientModel"
import { ISdStargateSdk } from "./ISdStargateSdk"

export class SdStargateSdk implements ISdStargateSdk {

    readonly baseUrl: string
    readonly userMsgHandler: (payload: unknown) => void
    readonly userErrHandler: (msg: string) => void
    readonly userDcnHandler: (msg: string) => void

    commander?: ISdStargateCommander

    constructor (
        baseUrl: string,
        msgHandler: (payload: unknown) => void,
        errHandler: (msg: string) => void,
        dcnHandler: (msg: string) => void,
    ) {
        this.baseUrl = baseUrl
        this.userMsgHandler = msgHandler
        this.userErrHandler = errHandler
        this.userDcnHandler = dcnHandler
    }

    /** Instantiates a new Stargate commander and establishes a connection to the Stargate service. */
    async init (): Promise<void> {
        const url = `${ this.baseUrl }/v1`

        // Initialize commander and connect to Stargate
        this.commander = createStargateCommander(
            this.msgHandler.bind(this),
            this.errHandler.bind(this),
            this.dcnHandler.bind(this),
        )
        await this.commander.connect(url)
    }

    /** Wrapper around the user message handler. */
    msgHandler (payload: unknown): void {
        this.userMsgHandler(payload)
    }

    /** Wrapper around the user message handler. */
    errHandler (msg: string): void {
        this.userErrHandler(msg)
    }

    /** Wrapper around the user disconnect handler. */
    dcnHandler (msg: string): void {
        this.userDcnHandler(msg)
    }

    async close (): Promise<void> {
        // We can just close the connection. The Stargate service will clean up the data by itself.
        return this.commander!.disconnect()
    }

    async register (authToken: string, name: string, version: string): Promise<ISdRegisterResponseDto> {
        const req: ISdRegisterRequestDto = {
            header: { command: "REGISTER" },
            payload: { authToken, name, version },
        }

        try {
            const res = await this.commander!.sendCommand(req)
            return res as ISdRegisterResponseDto
        } catch (e) {
            throw new SdStargateError(e)
        }
    }

    async listBackendClients (): Promise<ISdListClientsResponseDto> {
        const req: ISdListClientsRequestDto = {
            header: { command: "LIST_BACKEND_CLIENTS" },
            payload: undefined,
        }

        try {
            const res = await this.commander!.sendCommand(req)
            return res as ISdListClientsResponseDto
        } catch (e) {
            throw new SdStargateError(e)
        }
    }

    async listFrontendClients (): Promise<ISdListClientsResponseDto> {
        const req: ISdListClientsRequestDto = {
            header: { command: "LIST_FRONTEND_CLIENTS" },
            payload: undefined,
        }

        try {
            const res = await this.commander!.sendCommand(req)
            return res as ISdListClientsResponseDto
        } catch (e) {
            throw new SdStargateError(e)
        }
    }

    async disconnectClients (clients: ISdClientModel[]): Promise<void> {
        const req: ISdDisconnectClientsRequestDto = {
            header: {
                command: "DISCONNECT_CLIENTS",
                targets: clients.map(c => c.id),
            },
            payload: undefined,
        }

        try {
            await this.commander!.sendCommand(req)
        } catch (e) {
            throw new SdStargateError(e)
        }
    }

}
