import { ISdCommandOkReplyPayload, ISdCommandPayload, ISdCommandRequestPayload } from "../dto/commands/commandPayload"
import { ISdStargateStatusCommandDto, ISdStargateStatusReplyDto } from "../dto/commands/statusCommand"
import { ISdStargateClientModel } from "../models/ISdStargateClientModel"
import { ISdStargateSdk } from "../sdk/ISdStargateSdk"
import { SdStatusCommandValidator } from "../validators/commands/SdStatusCommandValidator"
import { ISdStargateStatusCommand } from "./ISdStargateStatusCommand"
import { SdBaseCommand } from "./SdBaseCommand"

export class SdStargateStatusCommand extends SdBaseCommand implements ISdStargateStatusCommand {

    private handler: undefined | ((msg: ISdStargateStatusCommandDto) => Promise<ISdStargateStatusReplyDto>)

    private identifier: string = 'STATUS'
   
    constructor (sdk: ISdStargateSdk) {
        super(sdk)
    }

    isSupported (payload: ISdCommandPayload): boolean {
        return payload.command == this.identifier
    }

    async processCommandMessage (payload: ISdCommandRequestPayload) {
        let data = payload.data
      
        SdStatusCommandValidator.assertCommandDto(data)
        const handler = (this.handler) ? this.handler?.bind(this) : undefined
        await this.invokeHandler(payload, data, handler)
    }

    processOkReplyMessage (payload: ISdCommandOkReplyPayload) {
        // Validate reply-message
        SdStatusCommandValidator.assertReplyDto(payload.data)
       
        // Update the open command with the clients reply-message
        this.register.updateCommand(payload.response.topic, payload.sender, payload.data)
    }

    async send (
        data: ISdStargateStatusCommandDto,
        clients: ISdStargateClientModel[],
        timeout?: number,
    ): Promise<ISdStargateStatusReplyDto[]> {
        return await this.sendCommand(data, clients, this.identifier, "BATCH", timeout ?? 10000)
    }

    registerHandler (
        handler: (msg: ISdStargateStatusCommandDto) => Promise<ISdStargateStatusReplyDto>,
    ): void {
        this.handler = handler
    }

}
