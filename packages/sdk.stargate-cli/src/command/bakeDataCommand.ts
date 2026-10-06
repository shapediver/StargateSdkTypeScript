import {
    ISdStargateBakeDataCommand,
    ISdStargateBakeDataCommandDto,
    ISdStargateBakeDataReplyDto,
    ISdStargateBakeDataResultEnum,
    ISdStargateClientModel,
    ISdStargateSdk,
    SdStargateBakeDataCommand,
    isSgError,
} from '@shapediver/sdk.stargate-sdk-v1';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { nowTime, prettifyMsg, waitToSimulate } from '../utils';

// Global command instance
let command: ISdStargateBakeDataCommand | undefined;

const identifier = 'BAKE_DATA';

// User-handler for 'batch-reply' command
const handler = async (
    msg: ISdStargateBakeDataCommandDto
): Promise<ISdStargateBakeDataReplyDto> => {
    console.info(
        '\n',
        chalk.magenta(chalk.bold(`Received command message '${identifier}' from Stargate:\n`)),
        chalk.magenta(prettifyMsg(msg)),
        '\n'
    );

    await waitToSimulate(5, 10, 'user input');
    console.info(chalk.magenta(`\n[${nowTime()}] Finished handling command '${identifier}'!`));

    // send dummy reply using some of the request data
    return {
        info: {
            count: 1,
            result: ISdStargateBakeDataResultEnum.SUCCESS,
        },
    };
};

/** Instantiate a new command object and register all handlers. */
export function setupBakeDataCommandHandlers(sdk: ISdStargateSdk): void {
    command = new SdStargateBakeDataCommand(sdk);

    command.registerHandler(handler);
}

type BakeCommandAnswers = {
    modelId: string;
    outputId: string;
    chunkId: string;
    clientIds: string[];
};

function askCommand(clients: ISdStargateClientModel[]) {
    const questions = [
        {
            type: 'input',
            name: 'modelId',
            message: 'Platform id of the model to bake data for?',
        },
        {
            type: 'input',
            name: 'outputId',
            message: 'Output id to bake data for?',
        },
        {
            type: 'input',
            name: 'chunkId',
            message: 'Chunk id to bake data for?',
        },
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
    return inquirer.prompt<BakeCommandAnswers>(questions);
}

export async function bakeDataCommand(sdk: ISdStargateSdk): Promise<void> {
    if (!command) throw new Error('Commands have not been registered.');

    try {
        // Fetch all registered clients for own user
        const clients = [
            ...(await sdk.listFrontendClients()),
            ...(await sdk.listBackendClients()),
        ];

        const { modelId, outputId, chunkId, clientIds } = await askCommand(clients);

        const dto: ISdStargateBakeDataCommandDto = {
            model: { id: modelId },
            parameters: { PARAM_ID: 'PARAM_VALUE' },
            output: { id: outputId, chunk: { id: chunkId } },
        };

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
