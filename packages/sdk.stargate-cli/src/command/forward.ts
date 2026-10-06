import {
    ISdStargateClientModel,
    ISdStargateSdk,
    isSgError,
} from '@shapediver/sdk.stargate-sdk-v1';
import chalk from 'chalk';
import inquirer from 'inquirer';

type ForwardAnswers = {
    message: string;
    clientIds: string[];
};

function askQuestions(clients: ISdStargateClientModel[]) {
    const questions = [
        {
            type: 'editor',
            name: 'message',
            message: 'Enter the message in a valid JSON format',
        },
        {
            type: 'checkbox',
            name: 'clientIds',
            message: 'Select currently registered clients:',
            choices: clients.map((client) => {
                return {
                    name: `${client.clientName} ${client.clientVersion} (${client.clientType})`,
                    value: client.id,
                };
            }),
        },
    ];
    return inquirer.prompt<ForwardAnswers>(questions);
}

export async function forwardMessage(sdk: ISdStargateSdk): Promise<void> {
    try {
        // Fetch all registered clients for own user
        const clients = [
            ...(await sdk.listFrontendClients()),
            ...(await sdk.listBackendClients()),
        ];

        // Ask user what message which clients should receive
        const { message, clientIds } = await askQuestions(clients);
        let json: unknown;
        try {
            json = JSON.parse(message) as unknown;
        } catch (e) {
            const parseError = e instanceof Error ? e : new Error(String(e));
            throw new Error('Invalid input message: ' + parseError.message);
        }
        if (typeof json !== 'object' || json === null || Array.isArray(json)) {
            throw new Error('Invalid input message: JSON value must be an object.');
        }
        const selectedClients = clients.filter((c) => clientIds.includes(c.id));

        // Send command and print results
        await sdk.forwardMessage(json as Record<string, unknown>, selectedClients);
        printResults(selectedClients.length);
    } catch (e) {
        const errType = isSgError(e) ? e.type : 'JS-Error';
        const errMsg = e instanceof Error ? e.message : String(e);
        console.error(
            chalk.red(
                `${chalk.bold('Could not send message to clients via Stargate.')}\n${errType}: ${errMsg}`
            )
        );
    }
}

function printResults(nClients: number): void {
    console.log(chalk.green(`Successfully sent message to ${String(nClients)} clients!`));
}
