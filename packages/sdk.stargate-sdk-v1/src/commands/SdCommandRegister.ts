import { SdStargateError, SdStargateErrorTypes } from '../SdStargateError';
import { ISdCommandRegister } from './ISdCommandRegister';

/** Holds reply data and the promise functions of a single open command's client */
type OpenClientCommand = {
    clientId: string;
    resolve: (value: unknown) => void;
    reject: (reason: SdStargateError) => void;
};

/** Stores all commands sent by this client which are still waiting for a reply. */
export class SdCommandRegister implements ISdCommandRegister {
    /** Stores information about open commands by topic. */
    readonly openCommands: { [topic: string]: OpenClientCommand[] } = {};

    registerCommand(topic: string, clientIds: string[], timeout: number): Promise<unknown[]> {
        if (this.openCommands[topic] !== undefined) {
            throw new SdStargateError(
                SdStargateErrorTypes.GenericClientError,
                `Cannot register command: Topic '${topic}' already exists.`
            );
        }

        const commands: OpenClientCommand[] = [];
        const promises = clientIds.map((clientId) => {
            return new Promise<unknown>((resolve, reject) => {
                setTimeout(
                    () => {
                        reject(
                            new SdStargateError(
                                SdStargateErrorTypes.CommandTimeoutError,
                                'Command timed out.'
                            )
                        );
                    },
                    timeout
                );

                commands.push({
                    clientId,
                    resolve,
                    reject,
                });
            });
        });

        this.openCommands[topic] = commands;

        return Promise.all(promises).finally(() => {
            Reflect.deleteProperty(this.openCommands, topic);
        });
    }

    updateCommand(topic: string, clientId: string, result: unknown): void {
        const openCommand = this.openCommands[topic];
        if (openCommand === undefined) {
            return;
        }

        const client = openCommand.find((c) => c.clientId === clientId);
        if (client === undefined) {
            throw new SdStargateError(
                SdStargateErrorTypes.GenericClientError,
                `Cannot update registered command: Client '${clientId}' was not found.`
            );
        }

        if (typeof result === 'object' && result !== null) client.resolve(result);
        else if (typeof result === 'string') {
            client.reject(new SdStargateError(SdStargateErrorTypes.CommandClientError, result));
        } else {
            client.reject(
                new SdStargateError(
                    SdStargateErrorTypes.CommandClientError,
                    'Invalid command reply from client.'
                )
            );
        }
    }

    rejectCommand(topic: string, error: SdStargateError): void {
        const openCommand = this.openCommands[topic];

        if (openCommand === undefined) return;

        openCommand.forEach((client) => {
            client.reject(error);
        });
    }
}
