import { SdStargateError } from "@shapediver/sdk.stargate-sdk-core"
import { ISdCommandPayload } from "../dto/commands/commandPayload"
import {
    ISdStargateDummyAckReplyExampleCommandDto,
    ISdStargateDummyAckReplyExampleReplyDto,
    ISdStargateDummyBatchReplyExampleCommandDto,
    ISdStargateDummyBatchReplyExampleReplyDto,
    ISdStargateDummyNoReplyExampleCommandDto,
    ISdStargateDummyNoReplyExampleReplyDto,
} from "../dto/commands/dummyCommand"
import { ISdStargateClientModel } from "../models/ISdStargateClientModel"
import { SdStargateSdk } from "../sdk/SdStargateSdk"
import { SdDummyCommandValidator } from "../validators/commands/SdDummyCommandValidator"
import { ISdStargateDummyCommand } from "./ISdStargateDummyCommand"
import { SdBaseCommand } from "./SdBaseCommand"
import { SdCommandRegister } from "./SdCommandRegister"

export enum DummyPayloadCommand {
    DUMMY_NO_REPLY_EXAMPLE = "DUMMY_NO_REPLY_EXAMPLE",
    DUMMY_ACK_REPLY_EXAMPLE = "DUMMY_ACK_REPLY_EXAMPLE",
    DUMMY_BATCH_REPLY_EXAMPLE = "DUMMY_BATCH_REPLY_EXAMPLE",
}

export class SdStargateDummyCommand extends SdBaseCommand implements ISdStargateDummyCommand {

    private userNoReplyExampleHandler: undefined | ((msg: ISdStargateDummyAckReplyExampleCommandDto) => Promise<ISdStargateDummyNoReplyExampleReplyDto>)
    private userAckReplyExampleHandler: undefined | ((msg: ISdStargateDummyAckReplyExampleCommandDto) => Promise<ISdStargateDummyAckReplyExampleReplyDto>)
    private userBatchReplyExampleHandler: undefined | ((msg: ISdStargateDummyBatchReplyExampleCommandDto) => Promise<ISdStargateDummyBatchReplyExampleReplyDto>)

    constructor (
        sdk: SdStargateSdk,
        register: SdCommandRegister,
    ) {
        super(sdk, register)
    }

    async processCommandMessage (payload: ISdCommandPayload) {
        let data = payload.data

        switch (payload.command) {
            case DummyPayloadCommand.DUMMY_NO_REPLY_EXAMPLE:
                SdDummyCommandValidator.isNoReplyExampleCommandDto(data)
                const noReplyHandler = (this.userNoReplyExampleHandler) ? this.userNoReplyExampleHandler.bind(this) : undefined
                await this.invokeHandler(payload, data, noReplyHandler)
                break
            case DummyPayloadCommand.DUMMY_ACK_REPLY_EXAMPLE:
                SdDummyCommandValidator.isAckReplyExampleCommandDto(data)
                const ackReplyHandler = (this.userAckReplyExampleHandler) ? this.userAckReplyExampleHandler?.bind(this) : undefined
                await this.invokeHandler(payload, data, ackReplyHandler)
                break
            case DummyPayloadCommand.DUMMY_BATCH_REPLY_EXAMPLE:
                SdDummyCommandValidator.isBatchReplyExampleCommandDto(data)
                const batchReplyHandler = (this.userBatchReplyExampleHandler) ? this.userBatchReplyExampleHandler?.bind(this) : undefined
                await this.invokeHandler(payload, data, batchReplyHandler)
                break
            default:
                throw new SdStargateError(`Invalid dummy client command '${ payload.command }'`)
        }
    }

    processReplyMessage (payload: ISdCommandPayload) {
        // This should be checked before calling this function
        if (!payload.response) throw new SdStargateError("Cannot process reply-message without response-payload")

        // Validate reply-message
        switch (payload.command) {
            case DummyPayloadCommand.DUMMY_NO_REPLY_EXAMPLE:
                SdDummyCommandValidator.isNoReplyExampleReplyDto(payload.data)
                break
            case DummyPayloadCommand.DUMMY_ACK_REPLY_EXAMPLE:
                SdDummyCommandValidator.isAckReplyExampleReplyDto(payload.data)
                break
            case DummyPayloadCommand.DUMMY_BATCH_REPLY_EXAMPLE:
                SdDummyCommandValidator.isBatchReplyExampleReplyDto(payload.data)
                break
            default:
                throw new SdStargateError(`Invalid dummy client command '${ payload.command }'`)
        }

        // Update the open command with the clients reply-message
        this.register.updateCommand(payload.response.topic, payload.sender, payload.data)
    }

    async sendNoReplyExampleCommand (
        data: ISdStargateDummyNoReplyExampleCommandDto,
        clients: ISdStargateClientModel[],
    ): Promise<void> {
        await this.sendCommand(data, clients, DummyPayloadCommand.DUMMY_NO_REPLY_EXAMPLE, undefined)
    }

    registerNoReplyExampleHandler (
        handler: (msg: ISdStargateDummyNoReplyExampleCommandDto) => Promise<ISdStargateDummyNoReplyExampleReplyDto>,
    ): void {
        this.userNoReplyExampleHandler = handler
    }

    async sendAckReplyExampleCommand (
        data: ISdStargateDummyAckReplyExampleCommandDto,
        clients: ISdStargateClientModel[],
    ): Promise<void> {
        await this.sendCommand(data, clients, DummyPayloadCommand.DUMMY_ACK_REPLY_EXAMPLE, "ACK")
    }

    registerAckReplyExampleHandler (
        handler: (msg: ISdStargateDummyAckReplyExampleCommandDto) => Promise<ISdStargateDummyAckReplyExampleReplyDto>,
    ): void {
        this.userAckReplyExampleHandler = handler
    }

    async sendBatchReplyExampleCommand (
        clients: ISdStargateClientModel[],
    ): Promise<ISdStargateDummyBatchReplyExampleReplyDto[]> {
        const data: ISdStargateDummyBatchReplyExampleCommandDto = {}
        return await this.sendCommand(data, clients, DummyPayloadCommand.DUMMY_BATCH_REPLY_EXAMPLE, "BATCH")
    }

    registerBatchReplyExampleHandler (
        handler: (msg: ISdStargateDummyBatchReplyExampleCommandDto) => Promise<ISdStargateDummyBatchReplyExampleReplyDto>,
    ): void {
        this.userBatchReplyExampleHandler = handler
    }

}
