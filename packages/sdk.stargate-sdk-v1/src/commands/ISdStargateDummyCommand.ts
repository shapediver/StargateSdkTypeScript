import {
    ISdStargateDummyAckReplyExampleCommandDto,
    ISdStargateDummyAckReplyExampleReplyDto,
    ISdStargateDummyBatchReplyExampleCommandDto,
    ISdStargateDummyBatchReplyExampleReplyDto,
    ISdStargateDummyNoReplyExampleCommandDto,
    ISdStargateDummyNoReplyExampleReplyDto,
} from "../dto/commands/dummyCommand"
import { ISdStargateClientModel } from "../models/ISdStargateClientModel"

export interface ISdStargateDummyCommand {

    /**
     * Sends a specific text to the client and waits until the Stargate backend has processed
     * the commands. No client response is expected.
     */
    sendNoReplyExampleCommand (
        data: ISdStargateDummyNoReplyExampleCommandDto,
        clients: ISdStargateClientModel[],
    ): Promise<void>

    /**
     * Sets the function handler that should be called when a "no-reply example" command has
     * been received.
     */
    registerNoReplyExampleHandler (
        handler: (msg: ISdStargateDummyNoReplyExampleCommandDto) => Promise<ISdStargateDummyNoReplyExampleReplyDto>,
    ): void

    /**
     * Similar to {@link sendAckReplyExampleCommand} but waits until an ACK-reply was received from
     * all clients. The ACK-reply does not contain any data and is sent by the client as soon as
     * the incoming request has been validated, but before any other client operations have been
     * executed.
     */
    sendAckReplyExampleCommand (
        data: ISdStargateDummyAckReplyExampleCommandDto,
        clients: ISdStargateClientModel[],
    ): Promise<void>

    /**
     * Sets the function handler that should be called when a "ack-reply example" command has
     * been received.
     */
    registerAckReplyExampleHandler (
        handler: (msg: ISdStargateDummyAckReplyExampleCommandDto) => Promise<ISdStargateDummyAckReplyExampleReplyDto>,
    ): void

    /**
     * Sends an empty command to the client and waits until a BATCH-reply was received.
     * The BATCH-reply contains data and is sent by the client (triggered by the user) after some
     * operations have been executed.
     */
    sendBatchReplyExampleCommand (
        clients: ISdStargateClientModel[],
    ): Promise<ISdStargateDummyBatchReplyExampleReplyDto[]>

    /**
     * Sets the function handler that should be called when a "batch-reply example" command has
     * been received.
     */
    registerBatchReplyExampleHandler (
        handler: (msg: ISdStargateDummyBatchReplyExampleCommandDto) => Promise<ISdStargateDummyBatchReplyExampleReplyDto>,
    ): void

}
