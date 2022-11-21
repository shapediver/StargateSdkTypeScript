import {
    createStargateCommander,
    ISdStargateClientOptionKeepAlive,
    ISdStargateCommandDto,
    ISdStargateCommander,
    SdStargateError,
} from "@shapediver/sdk.stargate-sdk-core"
import { ISdBaseCommand } from "../commands/ISdBaseCommand"
import { ISdCommandRegister } from "../commands/ISdCommandRegister"
import { SdCommandRegister } from "../commands/SdCommandRegister"
import { ISdStargateDisconnectClientsRequestDto } from "../dto/disconnectClients"
import { ISdStargateForwardMessageRequestDto } from "../dto/forwardMessage"
import {
    ISdStargateListClientsRequestDto,
    ISdStargateListClientsResponseDto,
} from "../dto/listClients"
import { ISdStargatePingRequestDto } from "../dto/ping"
import { ISdStargateRegisterRequestDto, ISdStargateRegisterResponseDto } from "../dto/register"
import { ISdStargateClientModel } from "../models/ISdStargateClientModel"
import { SdCommandPayloadValidator } from "../validators/commands/SdCommandPayloadValidator"
import { ISdStargateSdk } from "./ISdStargateSdk"

export class SdStargateSdk implements ISdStargateSdk {

    readonly baseUrl: string
    readonly userMsgHandler: (payload: unknown) => void
    readonly userErrHandler: (msg: string) => void
    readonly userDcnHandler: (msg: string) => void

    commander?: ISdStargateCommander

    readonly commandRegister: ISdCommandRegister

    // Holds all commands that have been registered by the user.
    readonly commands: ISdBaseCommand[]

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

        this.commandRegister = new SdCommandRegister()
        this.commands = []
    }

    /** Instantiates a new Stargate commander and establishes a connection to the Stargate service. */
    async init (): Promise<void> {
        const url = `${ this.baseUrl }/v1`

        const keepAlive: ISdStargateClientOptionKeepAlive = {
            interval: 585000,   // in ms (9 min and 45 sec)
            reqCreator: this.keepAliveReqBuilder.bind(this),
        }

        // Initialize commander and connect to Stargate
        this.commander = createStargateCommander(
            this.msgHandler.bind(this),
            this.errHandler.bind(this),
            this.dcnHandler.bind(this),
            keepAlive,
        )
        await this.commander.connect(url)
    }

    /** Wrapper around the user message handler. */
    msgHandler (payload: unknown): void {
        // Check if the message is a client command and try to process it
        this.tryProcessClientCommand(payload)
            .then(res => {
                // Invoke the general user message handler when the message is not a client command
                if (!res) this.userMsgHandler(payload)
            })
            .catch(v => {
                const msg = (v instanceof Error) ? v.message : v
                this.errHandler(msg)
            })
    }

    /** Wrapper around the user message handler. */
    errHandler (msg: string): void {
        this.userErrHandler(msg)
    }

    /** Wrapper around the user disconnect handler. */
    dcnHandler (msg: string): void {
        this.userDcnHandler(msg)
    }

    /** Creates the request body for the ping-command. */
    keepAliveReqBuilder (): ISdStargateCommandDto {
        const req: ISdStargatePingRequestDto = {
            header: { command: "PING" },
            payload: undefined,
        }

        return req
    }

    addCommand (command: ISdBaseCommand): void {
        if (this.commands.indexOf(command) >= 0) return
        this.commands.push(command)
    }

    async close (): Promise<void> {
        // We can just close the connection. The Stargate service will clean up the data by itself.
        return this.commander!.disconnect()
    }

    async register (
        authToken: string,
        clientName: string,
        clientVersion: string,
        hostOs: string,
        hostName: string,
        hostUser: string,
    ): Promise<ISdStargateRegisterResponseDto> {
        const req: ISdStargateRegisterRequestDto = {
            header: { command: "REGISTER" },
            payload: {
                authToken,
                clientName,
                clientVersion,
                hostOs,
                hostName,
                hostUser,
            },
        }

        try {
            const res = await this.commander!.send(req)
            return res as ISdStargateRegisterResponseDto
        } catch (e) {
            throw new SdStargateError(e)
        }
    }

    async listBackendClients (): Promise<ISdStargateListClientsResponseDto> {
        const req: ISdStargateListClientsRequestDto = {
            header: { command: "LIST_BACKEND_CLIENTS" },
            payload: undefined,
        }

        try {
            const res = await this.commander!.send(req)
            return res as ISdStargateListClientsResponseDto
        } catch (e) {
            throw new SdStargateError(e)
        }
    }

    async listFrontendClients (): Promise<ISdStargateListClientsResponseDto> {
        const req: ISdStargateListClientsRequestDto = {
            header: { command: "LIST_FRONTEND_CLIENTS" },
            payload: undefined,
        }

        try {
            const res = await this.commander!.send(req)
            return res as ISdStargateListClientsResponseDto
        } catch (e) {
            throw new SdStargateError(e)
        }
    }

    async forwardMessage (payload: Record<string, any>, clients: ISdStargateClientModel[]): Promise<void>
    async forwardMessage (payload: Record<string, any>, clients: string[]): Promise<void>
    async forwardMessage (payload: Record<string, any>, clients: ISdStargateClientModel[] | string[]): Promise<void> {
        const clientIds = (clients.length > 0 && typeof clients[0] !== "string")
            ? (clients as ISdStargateClientModel[]).map(c => c.id)
            : clients as string[]

        const req: ISdStargateForwardMessageRequestDto = {
            header: {
                command: "FORWARD_MESSAGE",
                targets: clientIds,
            },
            payload,
        }

        try {
            await this.commander!.send(req)
        } catch (e) {
            throw new SdStargateError(e)
        }
    }

    async disconnectClients (clients: ISdStargateClientModel[]): Promise<void> {
        const req: ISdStargateDisconnectClientsRequestDto = {
            header: {
                command: "DISCONNECT_CLIENTS",
                targets: clients.map(c => c.id),
            },
            payload: undefined,
        }

        try {
            await this.commander!.send(req)
        } catch (e) {
            throw new SdStargateError(e)
        }
    }

    private async tryProcessClientCommand (payload: unknown): Promise<boolean> {
        try {
            // Try parsing the basic structure of a command message
            SdCommandPayloadValidator.isCommandPayload(payload)
        } catch (e) {
            // Stop if the payload object is not in a basic command format
            return false
        }

        // Try to find a registered command implementation that supports this payload
        const commandImpl = this.commands.find((c) => c.isSupported(payload))
        if (!commandImpl) return false

        // Is this a reply for a command initiated by us?
        if (payload.response?.type === "REPLY") commandImpl.processReplyMessage(payload)
        else await commandImpl.processCommandMessage(payload)

        return true
    }

}
