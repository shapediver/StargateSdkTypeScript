import {
    ISdStargateClientModel,
    ISdStargateSdk,
    ISdStargateStatusCommand,
    ISdStargateStatusCommandDto,
    ISdStargateStatusReplyDto,
    SdStargateStatusCommand,
    isSgError,
} from '@shapediver/sdk.stargate-sdk-v1';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { nowTime, prettifyMsg, waitToSimulate } from '../utils';

// Global command instance
let command: ISdStargateStatusCommand | undefined;

const identifier = 'STATUS';

const firstActivity = Math.floor(Date.now() / 1000);

// User-handler for 'batch-reply' command
const handler = async (msg: ISdStargateStatusCommandDto): Promise<ISdStargateStatusReplyDto> => {
    console.info(
        '\n',
        chalk.magenta(chalk.bold(`Received command message '${identifier}' from Stargate:\n`)),
        chalk.magenta(prettifyMsg(msg)),
        '\n'
    );

    await waitToSimulate(1, 2, 'variability in network speed');
    console.info(chalk.magenta(`\n[${nowTime()}] Finished handling command '${identifier}'!`));

    // send dummy reply (timestamps expected in seconds)
    return {
        firstActivity,
        latestActivity: Math.floor(Date.now() / 1000),
    };
};

/** Instantiate a new command object and register all handlers. */
export function setupStatusCommandHandlers(sdk: ISdStargateSdk): void {
    command = new SdStargateStatusCommand(sdk);

    command.registerHandler(handler);
}

type StatusCommandAnswers = {
    clientIds: string[];
};

function askCommand(clients: ISdStargateClientModel[]) {
    const questions = [
        {
            type: 'checkbox',
            name: 'clientIds',
            message: 'Select target clients:',
            choices: clients.map((client) => {
                return {
                    name: `${client.clientName} ${client.clientVersion} (${client.clientType})`,
                    value: client.id,
                };
            }),
        },
    ];
    return inquirer.prompt<StatusCommandAnswers>(questions);
}

export async function statusCommand(sdk: ISdStargateSdk): Promise<void> {
    if (!command) throw new Error('Commands have not been registered.');

    try {
        // Fetch all registered clients for own user
        const clients = [
            ...(await sdk.listFrontendClients()),
            ...(await sdk.listBackendClients()),
        ];

        const { clientIds } = await askCommand(clients);

        const dto: ISdStargateStatusCommandDto = {};

        const selectedClients = clients.filter((c) => clientIds.includes(c.id));
        const res = await command.send(dto, selectedClients);
        printResults(identifier, selectedClients.length, res);
    } catch (e) {
        const errType = isSgError(e) ? e.type : 'JS-Error';
        const errMsg = e instanceof Error ? e.message : String(e);
        console.error(
            chalk.red(
                `${chalk.bold(`Could not send command ${identifier}.`)}\n${errType}: ${errMsg}`
            )
        );
    }
}

function printResults(cmd: string, nClients: number, res?: unknown): void {
    console.log(
        chalk.green(`[${nowTime()}] Successfully sent command '${cmd}' to ${String(nClients)} clients!`)
    );
    if (res) console.log(chalk.green('Result:\n', prettifyMsg(res)));
}
