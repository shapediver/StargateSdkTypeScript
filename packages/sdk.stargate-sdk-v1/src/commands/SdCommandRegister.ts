import { SdStargateError } from "@shapediver/sdk.stargate-sdk-core"

/** Holds reply data and the promise functions of a single open command's client */
type OpenClientCommand = {
    /**
     * Format: `[ client-id, reply-data | undefined ][]`
     * When reply-data is `undefined`, no reply from the respective client was received for now.
     */
    clientId: string,
    resolve: (value: (any)) => void,
    reject: (reason: string) => void,
}

/** Stores all commands sent by this client which are still waiting for a reply. */
export class SdCommandRegister {

    /** Stores information about open commands by topic. */
    readonly openCommands: { [topic: string]: OpenClientCommand[] } = {}

    /**
     * Registers a new command for bidirectional communication. The returned promise gets
     * resolved when reply messages from all target clients have been received. However, when at
     * least one client does not reply before {@link timeout} is reached, the promise is rejected.
     * @param topic The identifier of this command.
     * @param clientIds The IDs of the target clients for this command.
     * @param timeout Delay in milliseconds until all clients must have responded, otherwise reject.
     * @throws {@link SdStargateError} when an open request with the specified {@link topic} has
     * already been registered.
     */
    registerCommand (
        topic: string,
        clientIds: string[],
        timeout: number,
    ): Promise<any[]> {
        if (this.openCommands[topic] !== undefined) {
            throw new SdStargateError(`Cannot register command: Topic '${ topic }' already exists.`)
        }

        let commands: OpenClientCommand[] = []
        let promises = clientIds.map(clientId => {
            return new Promise<any>((resolve, reject) => {
                // Reject the promise when the client has not responded within the given timeframe
                setTimeout(reject, timeout, "Command timed out.")

                // Store new open command in register
                commands.push({
                    clientId,
                    resolve,
                    reject,
                })
            })
        })

        this.openCommands[topic] = commands

        // Wait for all clients and clean up
        return new Promise<any[]>(async (resolve, reject) => {
            Promise.all(promises)
                .then(res => resolve(res))
                .catch(e => reject(e))
                .finally(() => delete this.openCommands[topic])
        })
    }

    /**
     * Updates the previously registered command of this {@link topic} with the received client
     * reply. When this client reply is the last missing reply message, the promise that has
     * been returned by the previous {@link registerCommand} call is resolved.
     * @param topic The identifier of the command to update.
     * @param clientId The ID of the client to update.
     * @param data The reply data of the client.
     * @throws {@link SdStargateError} when no open request with the specified {@link topic}
     * exists or when {@link clientId} is not part of the open request.
     */
    updateCommand (topic: string, clientId: string, data: any): void {
        const openCommand = this.openCommands[topic]
        if (openCommand === undefined) {
            throw new SdStargateError(`Cannot update registered command: Topic '${ topic }' was not found.`)
        }

        // Find client and update the data property
        const client = openCommand.find(c => c.clientId === clientId)
        if (client === undefined) {
            throw new SdStargateError(`Cannot update registered command: Client '${ clientId }' was not found.`)
        }

        client.resolve(data)
    }

}
