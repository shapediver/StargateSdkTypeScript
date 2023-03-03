import { 
    ISdStargateGetSupportedDataCommandDto, 
    ISdStargateGetSupportedDataReplyDto 
} from "../dto/commands/getSupportedDataCommand"
import { ISdStargateClientModel } from "../models/ISdStargateClientModel"

export interface ISdStargateGetSupportedDataCommand {

    /**
     * Request information about the types of parameters supported by ISdStargateGetDataCommand.
     */
    send (
        data: ISdStargateGetSupportedDataCommandDto,
        clients: ISdStargateClientModel[],
        timeout?: number,
    ): Promise<ISdStargateGetSupportedDataReplyDto[]>

    /**
     * Sets the function handler that should be called when a "no-reply example" command has
     * been received.
     */
    registerHandler (
        handler: (msg: ISdStargateGetSupportedDataCommandDto) => Promise<ISdStargateGetSupportedDataReplyDto>,
    ): void

}
