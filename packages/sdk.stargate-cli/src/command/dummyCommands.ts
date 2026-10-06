import {
    ISdStargateClientModel,
    ISdStargateDummyAckReplyExampleCommandDto,
    ISdStargateDummyAckReplyExampleReplyDto,
    ISdStargateDummyBatchReplyExampleCommandDto,
    ISdStargateDummyBatchReplyExampleReplyDto,
    ISdStargateDummyNoReplyExampleCommandDto,
    ISdStargateDummyCommand,
    ISdStargateDummyNoReplyExampleReplyDto,
    ISdStargateSdk,
    SdStargateDummyCommand,
    isSgError,
} from '@shapediver/sdk.stargate-sdk-v1';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { assertUnreachable, nowTime, prettifyMsg, waitToSimulate } from '../utils';

// Global dummy command instance
let dummyCommand: ISdStargateDummyCommand | undefined;

// User-handler for 'no-reply' command
const noReplyExampleHandler = (
    msg: ISdStargateDummyNoReplyExampleCommandDto
): Promise<ISdStargateDummyNoReplyExampleReplyDto> => {
    console.info(
        '\n',
        chalk.magenta(chalk.bold("Received dummy-command message 'No-Reply' from Stargate:\n")),
        chalk.magenta(prettifyMsg(msg)),
        '\n'
    );

    console.info(chalk.magenta(`[${nowTime()}] Finished handling command 'No-Reply'!`));

    return Promise.resolve({});
};

// User-handler for 'ack-reply' command
const ackReplyExampleHandler = (
    msg: ISdStargateDummyAckReplyExampleCommandDto
): Promise<ISdStargateDummyAckReplyExampleReplyDto> => {
    console.info(
        '\n',
        chalk.magenta(chalk.bold("Received dummy-command message 'ACK-Reply' from Stargate:\n")),
        chalk.magenta(prettifyMsg(msg)),
        '\n'
    );

    console.info(chalk.magenta(`[${nowTime()}] Finished handling command 'ACK-Reply'!`));

    return Promise.resolve({});
};

// User-handler for 'batch-reply' command
const batchReplyExampleHandler = async (
    msg: ISdStargateDummyBatchReplyExampleCommandDto
): Promise<ISdStargateDummyBatchReplyExampleReplyDto> => {
    console.info(
        '\n',
        chalk.magenta(chalk.bold("Received dummy-command message 'BATCH-Reply' from Stargate:\n")),
        chalk.magenta(prettifyMsg(msg)),
        '\n'
    );

    await waitToSimulate(5, 10, 'user input');
    console.info(chalk.magenta(`\n[${nowTime()}] Finished handling command 'BATCH-Reply'!`));

    return {
        mesh: 'Some mesh as string',
        visible: false,
    };
};

enum DummyCommand {
    NO_REPLY = 'Sends a dummy command that requests no reply',
    ACK_REPLY = 'Sends a dummy command that requests an ACK reply',
    BATCH_REPLY = 'Sends a dummy command that requests a BATCH reply',
}

/** Instantiate a new global dummy command object and register all handlers. */
export function setupDummyCommandHandlers(sdk: ISdStargateSdk): void {
    dummyCommand = new SdStargateDummyCommand(sdk);

    dummyCommand.registerNoReplyExampleHandler(noReplyExampleHandler);
    dummyCommand.registerAckReplyExampleHandler(ackReplyExampleHandler);
    dummyCommand.registerBatchReplyExampleHandler(batchReplyExampleHandler);
}

type DummyCommandAnswers = {
    command: DummyCommand;
    clientIds: string[];
};

function askCommand(clients: ISdStargateClientModel[]) {
    const questions = [
        {
            type: 'select',
            name: 'command',
            message: 'Which dummy command do you want to send?',
            choices: [DummyCommand.NO_REPLY, DummyCommand.ACK_REPLY, DummyCommand.BATCH_REPLY],
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
    return inquirer.prompt<DummyCommandAnswers>(questions);
}

export async function dummyCommands(sdk: ISdStargateSdk): Promise<void> {
    if (!dummyCommand) throw new Error('Dummy commands have not been registered.');

    try {
        // Fetch all registered clients for own user
        const clients = [
            ...(await sdk.listFrontendClients()),
            ...(await sdk.listBackendClients()),
        ];

        const { command: cmd, clientIds } = await askCommand(clients);

        const selectedClients = clients.filter((c) => clientIds.includes(c.id));

        switch (cmd) {
            case DummyCommand.NO_REPLY:
                await noReplyExampleCommand(dummyCommand, selectedClients);
                break;
            case DummyCommand.ACK_REPLY:
                await ackReplyExampleCommand(dummyCommand, selectedClients);
                break;
            case DummyCommand.BATCH_REPLY:
                await batchReplyExampleCommand(dummyCommand, selectedClients);
                break;
            default:
                assertUnreachable(cmd);
        }
    } catch (e) {
        const errType = isSgError(e) ? e.type : 'JS-Error';
        const errMsg = e instanceof Error ? e.message : String(e);
        console.error(
            chalk.red(`${chalk.bold('Could not send dummy-command.')}\n${errType}: ${errMsg}`)
        );
    }
}

async function noReplyExampleCommand(
    dummyCommand: ISdStargateDummyCommand,
    clients: ISdStargateClientModel[]
): Promise<void> {
    const data: ISdStargateDummyNoReplyExampleCommandDto = {
        text: 'Show this message!',
    };

    await dummyCommand.sendNoReplyExampleCommand(data, clients);
    printResults('No-Reply', clients.length);
}

async function ackReplyExampleCommand(
    dummyCommand: ISdStargateDummyCommand,
    clients: ISdStargateClientModel[]
): Promise<void> {
    const data: ISdStargateDummyAckReplyExampleCommandDto = {
        text: 'Show this message!',
    };

    await dummyCommand.sendAckReplyExampleCommand(data, clients);
    printResults('ACK-Reply', clients.length);
}

async function batchReplyExampleCommand(
    dummyCommand: ISdStargateDummyCommand,
    clients: ISdStargateClientModel[]
): Promise<void> {
    const res = await dummyCommand.sendBatchReplyExampleCommand(clients);
    printResults('BATCH-Reply', clients.length, res);
}

function printResults(cmd: string, nClients: number, res?: unknown): void {
    console.log(
        chalk.green(`[${nowTime()}] Successfully sent command '${cmd}' to ${String(nClients)} clients!`)
    );
    if (res) console.log(chalk.green('Result:\n', prettifyMsg(res)));
}
