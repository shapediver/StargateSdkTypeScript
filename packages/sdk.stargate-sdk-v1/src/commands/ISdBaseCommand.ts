import {
    ISdCommandErrorReplyPayload,
    ISdCommandOkReplyPayload,
    ISdCommandPayload,
    ISdCommandRequestPayload,
} from "../dto/commands/commandPayload"

export interface ISdBaseCommand {

    /**
     * Test whether the given command payload is supported (can be handled) by this instance.
     * This checks {@link payload.command} but does NOT validate {@link payload.data}.
     */
    isSupported (payload: ISdCommandPayload): boolean

    /**
     * Process a new command message from a client.
     * Validates {@link payload.data} according to {@link payload.command} and invokes the
     * respective user command handler function.
     * @throws {@link SdStargateError} when {@link payload.command} is unknown.
     */
    processCommandMessage (payload: ISdCommandRequestPayload): Promise<void>

    /**
     * Process a reply from a client of a command that was processed successfully.
     * Validates the reply in {@link payload.data} according to {@link payload.command} and
     * updates the respective registered open request.
     * @throws {@link SdStargateError} when {@link payload.command} is not supported by this
     * command, or when the validation fails for {@link payload.data}.
     */
    processOkReplyMessage (payload: ISdCommandOkReplyPayload): void

    /** Process a reply from a client of a command that resulted in an error. */
    processErrorReplyMessage (payload: ISdCommandErrorReplyPayload): void

}
