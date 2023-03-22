import { SdUtils } from "@shapediver/sdk.stargate-sdk-core"
import { ISdStargateCommander } from "../commander/ISdStargateCommander"
import { SdWebSocketCommander } from "../commander/SdWebSocketCommander"
import { ISdBaseCommand } from "../commands/ISdBaseCommand"
import { ISdCommandRegister } from "../commands/ISdCommandRegister"
import { SdCommandRegister } from "../commands/SdCommandRegister"
import { ISdStargateDisconnectClientsRequestDto } from "../dto/disconnectClients"
import { ISdStargateForwardMessageRequestDto } from "../dto/forwardMessage"
import { ISdStargateListClientsRequestDto, ISdStargateListClientsResponseDto } from "../dto/listClients"
import { ISdStargateRegisterRequestDto, ISdStargateRegisterResponseDto } from "../dto/register"
import { ISdStargateClientModel } from "../models/ISdStargateClientModel"
import { SdStargateError, SdStargateErrorTypes } from "../SdStargateError"
import { SdCommandPayloadValidator } from "../validators/commands/SdCommandPayloadValidator"
import { ISdStargateSdk } from "./ISdStargateSdk"

export class SdStargateSdk implements ISdStargateSdk {

    /** The major version of the Stargate Backend service that is supported by this SDK. */
    static STARGATE_VERSION = "1"

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
        // Initialize commander and connect to Stargate
        this.commander = new SdWebSocketCommander(
            this.msgHandler.bind(this),
            this.errHandler.bind(this),
            this.dcnHandler.bind(this),
        )
        await this.commander.connect(this.baseUrl)
    }

    /** Wrapper around the user message handler. */
    msgHandler (payload: unknown): void {
        // Check if the message is a client command and try to process it
        this.tryProcessClientCommand(payload)
            .then(res => {
                // Invoke the general user message handler when the message is not a client command
                if (!res) this.userMsgHandler(payload)
            })
            .catch(e => {
                let msg
                if (e instanceof SdStargateError) msg = `${ e.type }: ${ e.message }`
                else if (e instanceof Error) msg = e.message
                else msg = String(e)
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

    addCommand (command: ISdBaseCommand): void {
        if (this.commands.find(c => c.constructor.name === command.constructor.name)) {
            throw new SdStargateError(
                SdStargateErrorTypes.GenericClientError,
                `Command implementation of type ${ command.constructor.name } has already been added.`,
            )
        }
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

        const res = await this.commander!.send(req) as ISdStargateRegisterResponseDto

        // Make sure that the SDK version and the backend version are compatible
        const version = SdUtils.extractVersion(res.version ?? "", "major")
        if (!version || version !== SdStargateSdk.STARGATE_VERSION) {
            await this.commander!.disconnect()
            throw new SdStargateError(
                SdStargateErrorTypes.GenericClientError,
                "Incompatible versions: " +
                `This SDK requires a ShapeDiver Stargate v${ SdStargateSdk.STARGATE_VERSION } backend system. ` +
                `However, the URL '${ this.baseUrl }' points to a Stargate ${ (!version) ? "system of unknown version." : `v${ version } system.` }`,
            )
        }

        return res
    }

    async listBackendClients (): Promise<ISdStargateListClientsResponseDto> {
        const req: ISdStargateListClientsRequestDto = {
            header: { command: "LIST_BACKEND_CLIENTS" },
            payload: undefined,
        }

        const res = await this.commander!.send(req)
        return res as ISdStargateListClientsResponseDto
    }

    async listFrontendClients (): Promise<ISdStargateListClientsResponseDto> {
        const req: ISdStargateListClientsRequestDto = {
            header: { command: "LIST_FRONTEND_CLIENTS" },
            payload: undefined,
        }

        const res = await this.commander!.send(req)
        return res as ISdStargateListClientsResponseDto
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

        await this.commander!.send(req)
    }

    async disconnectClients (clients: ISdStargateClientModel[]): Promise<void> {
        const req: ISdStargateDisconnectClientsRequestDto = {
            header: {
                command: "DISCONNECT_CLIENTS",
                targets: clients.map(c => c.id),
            },
            payload: undefined,
        }

        await this.commander!.send(req)
    }

    private async tryProcessClientCommand (payload: unknown): Promise<boolean> {
        // Stop if the payload object is not in a basic command format
        if (!SdCommandPayloadValidator.isCommandPayload(payload)) return false

        // Try to find a registered command implementation that supports this payload
        const commandImpl = this.commands.find((c) => c.isSupported(payload))
        if (!commandImpl) return false

        // Is this a reply for a command initiated by us?
        if (SdCommandPayloadValidator.isCommandRequestPayload(payload)) await commandImpl.processCommandMessage(payload)
        else if (SdCommandPayloadValidator.isCommandOkReplyPayload(payload)) commandImpl.processOkReplyMessage(payload)
        else commandImpl.processErrorReplyMessage(payload)

        return true
    }

}
