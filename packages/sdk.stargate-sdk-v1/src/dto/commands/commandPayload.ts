/** Describes the payload of a received client command */
export interface ISdCommandPayload {
    /** The client ID that sent the command */
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
        type: "ACK" | "BATCH" | "REPLY"

        /**
         * The topic that is linked to this command-message. Must be used when sending the
         * response.
         */
        topic: string
    }

    /** The command that should be executed. */
    command: string

    /** Any data that is associated with the respective command */
    data: Record<string, any>
}
