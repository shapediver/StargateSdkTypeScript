import { SdStargateError, SdStargateErrorTypes } from '../SdStargateError';
import { ISdCommandRegister } from './ISdCommandRegister';

/** Holds reply data and the promise functions of a single open command's client */
type OpenClientCommand = {
    /**
     * Format: `[ client-id, reply-data | undefined ][]`
     * When reply-data is `undefined`, no reply from the respective client was received for now.
     */
    clientId: string;
    resolve: (value: any) => void;
    reject: (reason: SdStargateError) => void;
};

/** Stores all commands sent by this client which are still waiting for a reply. */
export class SdCommandRegister implements ISdCommandRegister {
    /** Stores information about open commands by topic. */
    readonly openCommands: { [topic: string]: OpenClientCommand[] } = {};

    registerCommand(topic: string, clientIds: string[], timeout: number): Promise<any[]> {
        if (this.openCommands[topic] !== undefined) {
            throw new SdStargateError(
                SdStargateErrorTypes.GenericClientError,
                `Cannot register command: Topic '${topic}' already exists.`
            );
        }

        let commands: OpenClientCommand[] = [];
        let promises = clientIds.map((clientId) => {
            return new Promise<any>((resolve, reject) => {
                // Reject the promise when the client has not responded within the given timeframe
                setTimeout(
                    reject,
                    timeout,
                    new SdStargateError(
                        SdStargateErrorTypes.CommandTimeoutError,
                        'Command timed out.'
                    )
                );

                // Store new open command in register
                commands.push({
                    clientId,
                    resolve,
                    reject,
                });
            });
        });

        this.openCommands[topic] = commands;

        // Wait for all clients and clean up
        return new Promise<any[]>(async (resolve, reject) => {
            Promise.all(promises)
                .then((res) => resolve(res))
                .catch((e) =>
                    reject(
                        e instanceof SdStargateError
                            ? e
                            : new SdStargateError(
                                  SdStargateErrorTypes.GenericClientError,
                                  String(e)
                              )
                    )
                )
                .finally(() => delete this.openCommands[topic]);
        });
    }

    updateCommand(topic: string, clientId: string, result: Record<string, any> | string): void {
        const openCommand = this.openCommands[topic];
        if (openCommand === undefined) {
            // A registered command is rejected as soon as an error-reply is received. In this case, no open command
            // can be found for responses of all other clients that are received at a later time. Therefore, we just
            // ignore reply messages that have no open request.
            return;
        }

        // Find client and update the data property
        const client = openCommand.find((c) => c.clientId === clientId);
        if (client === undefined) {
            throw new SdStargateError(
                SdStargateErrorTypes.GenericClientError,
                `Cannot update registered command: Client '${clientId}' was not found.`
            );
        }

        // Resolve a successfully processed command or reject with the returned error message
        if (typeof result === 'object') client.resolve(result);
        else client.reject(new SdStargateError(SdStargateErrorTypes.CommandClientError, result));
    }

    rejectCommand(topic: string, error: SdStargateError): void {
        const openCommand = this.openCommands[topic];

        // Stop if no open command was found for this topic
        if (openCommand === undefined) return;

        // Rejecting all clients also rejects the "wrapping" promise of the open command.
        // Notes:
        //   Actually, we would only need to reject one client to also reject the open command.
        //   However, we only know that at least one client is still waiting for a response, but not
        //   which one. Therefore, we just reject all of them (JavaScript ignores resolve/reject
        //   calls of promises that are already settled).
        openCommand.forEach((client) => client.reject(error));
    }
}
