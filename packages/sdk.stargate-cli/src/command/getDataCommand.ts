import {
    ISdStargateClientModel,
    ISdStargateGetDataCommand,
    ISdStargateGetDataCommandDto,
    ISdStargateGetDataReplyDto,
    ISdStargateGetDataResultEnum,
    ISdStargateSdk,
    SdStargateGetDataCommand,
    isSgError,
} from '@shapediver/sdk.stargate-sdk-v1';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { nowTime, prettifyMsg, waitToSimulate } from '../utils';

// Global command instance
let command: ISdStargateGetDataCommand | undefined;

const identifier = 'GET_DATA';

// User-handler for 'batch-reply' command
const handler = async (msg: ISdStargateGetDataCommandDto): Promise<ISdStargateGetDataReplyDto> => {
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
        asset: {
            id: msg.model.id,
            chunk: {
                id: msg.parameter.id,
            },
        },
        info: {
            count: 1,
            result: ISdStargateGetDataResultEnum.SUCCESS,
        },
    };
};

/** Instantiate a new command object and register all handlers. */
export function setupGetDataCommandHandlers(sdk: ISdStargateSdk): void {
    command = new SdStargateGetDataCommand(sdk);

    command.registerHandler(handler);
}

function askCommand(clients: ISdStargateClientModel[]) {
    const questions = [
        {
            type: 'input',
            name: 'modelId',
            message: 'Platform id of the model to get data for?',
        },
        {
            type: 'input',
            name: 'parameterId',
            message: 'Parameter id to get data for?',
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
    return inquirer.prompt(questions);
}

export async function getDataCommand(sdk: ISdStargateSdk): Promise<void> {
    if (!command) throw new Error('Commands have not been registered.');

    try {
        // Fetch all registered clients for own user
        const clients = [
            ...(await sdk.listFrontendClients()),
            ...(await sdk.listBackendClients()),
        ];

        const { modelId, parameterId, clientIds } = await askCommand(clients);

        const dto: ISdStargateGetDataCommandDto = {
            model: { id: modelId },
            parameter: { id: parameterId },
        };

        const selectedClients = clients.filter((c) => (<string[]>clientIds).includes(c.id));
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

function printResults(cmd: string, nClients: number, res?: any): void {
    console.log(
        chalk.green(`[${nowTime()}] Successfully sent command '${cmd}' to ${nClients} clients!`)
    );
    if (res) console.log(chalk.green('Result:\n', prettifyMsg(res)));
}
