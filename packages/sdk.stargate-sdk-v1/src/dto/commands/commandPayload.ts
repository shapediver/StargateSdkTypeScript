// Helper type that contains all possible command payloads
export type ISdCommandPayload =
    | ISdCommandRequestPayload
    | ISdCommandOkReplyPayload
    | ISdCommandErrorReplyPayload

/** Describes the payload of a received client command. */
export interface ISdCommandRequestPayload {
    /** The client ID that sent the command request. */
    sender: string

    /**
     * Information about the expected response. When not defined, then the sender expects no
     * kind of response.
     */
    response?: {
        /**
         * The type of the response:
         *  * `ACK`:
         *    An acknowledgment message contains no data and is sent immediately after the
         *    client has validated the received command.
         *  * `BATCH`:
         *    Batch messages contain data and are triggered by the user after the respective
         *    command has been processed.
         */
        type: "ACK" | "BATCH"

        /**
         * The topic that is linked to this command-message. Must be used when sending the
         * response.
         */
        topic: string
    }

    /** The command that should be executed. */
    command: string

    /** Any data that is associated with the respective command. */
    data: Record<string, any>
}

/** Describes the payload of a received client command */
interface ISdCommandReplyPayload {
    /**
     * The client ID that sent the command reply.
     *
     * __NOTE__:
     * This property is automatically set by the Stargate backend system. Should the client
     * still declare a `sender` property, the backend will override it.
     */
    sender: string

    /** Information about the response. */
    response: {
        /**  */
        type: "REPLY"

        /**
         * The topic that is linked to this command-message. Must be used when sending the
         * response.
         */
        topic: string
    }

    /** The command that has been executed. */
    command: string
}

export interface ISdCommandOkReplyPayload extends ISdCommandReplyPayload {
    /** The reply data of a successfully executed command. */
    data: Record<string, any>
}

export interface ISdCommandErrorReplyPayload extends ISdCommandReplyPayload {
    /** The reply of a command that could not be executed successfully. */
    error: {
        message: string
    }
}
