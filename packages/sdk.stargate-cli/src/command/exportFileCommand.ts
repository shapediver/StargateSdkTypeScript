import {
    ISdStargateExportFileCommand,
    ISdStargateExportFileCommandDto,
    ISdStargateExportFileReplyDto,
    ISdStargateExportFileResultEnum,
    ISdStargateClientModel,
    ISdStargateSdk,
    SdStargateExportFileCommand,
    isSgError,
} from '@shapediver/sdk.stargate-sdk-v1';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { nowTime, prettifyMsg, waitToSimulate } from '../utils';

// Global command instance
let command: ISdStargateExportFileCommand | undefined;

const identifier = 'EXPORT_FILE';

// User-handler for 'batch-reply' command
const handler = async (
    msg: ISdStargateExportFileCommandDto
): Promise<ISdStargateExportFileReplyDto> => {
    console.info(
        '\n',
        chalk.magenta(chalk.bold(`Received command message '${identifier}' from Stargate:\n`)),
        chalk.magenta(prettifyMsg(msg)),
        '\n'
    );

    await waitToSimulate(2, 5, 'export request');
    console.info(chalk.magenta(`\n[${nowTime()}] Finished handling command '${identifier}'!`));

    // send dummy reply using some of the request data
    return {
        info: {
            result: ISdStargateExportFileResultEnum.SUCCESS,
        },
    };
};

/** Instantiate a new command object and register all handlers. */
export function setupExportFileCommandHandlers(sdk: ISdStargateSdk): void {
    command = new SdStargateExportFileCommand(sdk);

    command.registerHandler(handler);
}

type ExportFileCommandAnswers = {
    modelId: string;
    exportId: string;
    exportIndex: string;
    clientIds: string[];
};

function askCommand(clients: ISdStargateClientModel[]) {
    const questions = [
        {
            type: 'input',
            name: 'modelId',
            message: 'Platform id of the model to export file for?',
        },
        {
            type: 'input',
            name: 'exportId',
            message: 'Export id to export file for?',
        },
        {
            type: 'input',
            name: 'exportIndex',
            message: 'Export index of the file?',
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
    return inquirer.prompt<ExportFileCommandAnswers>(questions);
}

export async function exportFileCommand(sdk: ISdStargateSdk): Promise<void> {
    if (!command) throw new Error('Commands have not been registered.');

    try {
        // Fetch all registered clients for own user
        const clients = [
            ...(await sdk.listFrontendClients()),
            ...(await sdk.listBackendClients()),
        ];

        const { modelId, exportId, exportIndex, clientIds } = await askCommand(clients);

        const dto: ISdStargateExportFileCommandDto = {
            model: { id: modelId },
            parameters: { PARAM_ID: 'PARAM_VALUE' },
            export: { id: exportId, index: Number.parseInt(exportIndex, 10) },
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
        chalk.green(
            `[${nowTime()}] Successfully sent command '${cmd}' to ${String(nClients)} clients!`
        )
    );
    if (res) console.log(chalk.green('Result:\n', prettifyMsg(res)));
}
