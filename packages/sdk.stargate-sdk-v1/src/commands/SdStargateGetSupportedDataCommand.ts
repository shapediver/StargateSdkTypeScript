import { ISdCommandOkReplyPayload, ISdCommandPayload, ISdCommandRequestPayload } from "../dto/commands/commandPayload"
import {
    ISdStargateGetSupportedDataCommandDto,
    ISdStargateGetSupportedDataReplyDto
} from "../dto/commands/getSupportedDataCommand"
import { ISdStargateClientModel } from "../models/ISdStargateClientModel"
import { ISdStargateSdk } from "../sdk/ISdStargateSdk"
import { SdGetSupportedDataCommandValidator } from "../validators/commands/SdGetSupportedDataCommandValidator"
import { ISdStargateGetSupportedDataCommand } from "./ISdStargateGetSupportedDataCommand"
import { SdBaseCommand } from "./SdBaseCommand"

export class SdStargateGetSupportedDataCommand extends SdBaseCommand implements ISdStargateGetSupportedDataCommand {

    private handler: undefined | ((msg: ISdStargateGetSupportedDataCommandDto) => Promise<ISdStargateGetSupportedDataReplyDto>)

    private identifier: string = 'GET_SUPPORTED_DATA'
   
    constructor (sdk: ISdStargateSdk) {
        super(sdk)
    }

    isSupported (payload: ISdCommandPayload): boolean {
        return payload.command == this.identifier
    }

    async processCommandMessage (payload: ISdCommandRequestPayload) {
        let data = payload.data
      
        SdGetSupportedDataCommandValidator.assertCommandDto(data)
        const handler = (this.handler) ? this.handler?.bind(this) : undefined
        await this.invokeHandler(payload, data, handler)
    }

    processOkReplyMessage (payload: ISdCommandOkReplyPayload) {
        // Validate reply-message
        SdGetSupportedDataCommandValidator.assertReplyDto(payload.data)
       
        // Update the open command with the clients reply-message
        this.register.updateCommand(payload.response.topic, payload.sender, payload.data)
    }

    async send (
        data: ISdStargateGetSupportedDataCommandDto,
        clients: ISdStargateClientModel[],
        timeout: number = 10000,
    ): Promise<ISdStargateGetSupportedDataReplyDto[]> {
        return await this.sendCommand(data, clients, this.identifier, "BATCH", timeout)
    }

    registerHandler (
        handler: (msg: ISdStargateGetSupportedDataCommandDto) => Promise<ISdStargateGetSupportedDataReplyDto>,
    ): void {
        this.handler = handler
    }

}
