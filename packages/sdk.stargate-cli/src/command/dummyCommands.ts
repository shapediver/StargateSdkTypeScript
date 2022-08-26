import {
    ISdStargateClientModel,
    ISdStargateDummyAckReplyExampleCommandDto,
    ISdStargateDummyBatchReplyExampleCommandDto,
    ISdStargateDummyBatchReplyExampleReplyDto,
    ISdStargateDummyNoReplyExampleCommandDto,
    ISdStargateSdk,
} from "@shapediver/sdk.stargate-sdk-v1"
import chalk from "chalk"
import inquirer from "inquirer"
import { assertUnreachable, nowTime, prettifyMsg, randomIntFromInterval, sleep } from "../utils"

// User-handler for 'no-reply' command
const noReplyExampleHandler = async (msg: ISdStargateDummyNoReplyExampleCommandDto): Promise<void> => {
    console.info(
        "\n",
        chalk.magenta(chalk.bold("Received dummy-command message 'No-Reply' from Stargate:\n")),
        chalk.magenta(prettifyMsg(msg)),
        "\n",
    )

    console.info(chalk.magenta(`[${ nowTime() }] Finished handling command 'No-Reply'!`))
}

// User-handler for 'ack-reply' command
const ackReplyExampleHandler = async (msg: ISdStargateDummyAckReplyExampleCommandDto): Promise<void> => {
    console.info(
        "\n",
        chalk.magenta(chalk.bold("Received dummy-command message 'ACK-Reply' from Stargate:\n")),
        chalk.magenta(prettifyMsg(msg)),
        "\n",
    )

    console.info(chalk.magenta(`[${ nowTime() }] Finished handling command 'ACK-Reply'!`))
}

// User-handler for 'batch-reply' command
const batchReplyExampleHandler = async (msg: ISdStargateDummyBatchReplyExampleCommandDto): Promise<ISdStargateDummyBatchReplyExampleReplyDto> => {
    console.info(
        "\n",
        chalk.magenta(chalk.bold("Received dummy-command message 'BATCH-Reply' from Stargate:\n")),
        chalk.magenta(prettifyMsg(msg)),
        "\n",
    )

    const seconds = randomIntFromInterval(5, 10)
    console.info(chalk.magenta(`Waiting ${ seconds } seconds to simulate user input...`))
    await sleep(seconds * 1000)

    console.info(chalk.magenta(`[${ nowTime() }] Finished handling command 'BATCH-Reply'!`))

    return {
        mesh: "Some mesh as string",
        visible: false,
    }
}

enum DummyCommand {
    NO_REPLY = "Sends a dummy command that requests no reply",
    ACK_REPLY = "Sends a dummy command that requests an ACK reply",
    BATCH_REPLY = "Sends a dummy command that requests a BATCH reply",
}

export function setupDummyCommandHandlers (sdk: ISdStargateSdk): void {
    sdk.cmdDummy.registerNoReplyExampleHandler(noReplyExampleHandler)
    sdk.cmdDummy.registerAckReplyExampleHandler(ackReplyExampleHandler)
    sdk.cmdDummy.registerBatchReplyExampleHandler(batchReplyExampleHandler)
}

function askCommand (clients: ISdStargateClientModel[]) {
    const questions = [
        {
            type: "list",
            name: "command",
            message: "Which dummy command do you want to send?",
            choices: [
                DummyCommand.NO_REPLY,
                DummyCommand.ACK_REPLY,
                DummyCommand.BATCH_REPLY,
            ],
        },
        {
            type: "checkbox",
            name: "clientIds",
            message: "Select target clients:",
            choices: clients.map(client => {
                return {
                    name: `${ client.name } ${ client.version } (${ client.clientType })`,
                    value: client.id,
                }
            }),
        },
    ]
    return inquirer.prompt?.(questions)
}

export async function dummyCommands (sdk: ISdStargateSdk): Promise<void> {
    try {
        // Fetch all registered clients for own user
        const clients = [
            ...await sdk.listFrontendClients(),
            ...await sdk.listBackendClients(),
        ]

        const { command, clientIds } = await askCommand(clients)
        const cmd: DummyCommand = command

        const selectedClients = clients.filter(c => (<string[]>clientIds).includes(c.id))

        switch (cmd) {
            case DummyCommand.NO_REPLY:
                await noReplyExampleCommand(sdk, selectedClients)
                break
            case DummyCommand.ACK_REPLY:
                await ackReplyExampleCommand(sdk, selectedClients)
                break
            case DummyCommand.BATCH_REPLY:
                await batchReplyExampleCommand(sdk, selectedClients)
                break
            default:
                assertUnreachable(cmd)
        }
    } catch (e) {
        console.error(chalk.red(`${ chalk.bold("Could not send dummy-command.") }\n${ e.message }`))
    }
}

async function noReplyExampleCommand (sdk: ISdStargateSdk, clients: ISdStargateClientModel[]): Promise<void> {
    const data: ISdStargateDummyNoReplyExampleCommandDto = {
        text: "Show this message!",
    }

    await sdk.cmdDummy.sendNoReplyExampleCommand(data, clients)
    printResults("No-Reply", clients.length)
}

async function ackReplyExampleCommand (sdk: ISdStargateSdk, clients: ISdStargateClientModel[]): Promise<void> {
    const data: ISdStargateDummyAckReplyExampleCommandDto = {
        text: "Show this message!",
    }

    await sdk.cmdDummy.sendAckReplyExampleCommand(data, clients)
    printResults("ACK-Reply", clients.length)
}

async function batchReplyExampleCommand (sdk: ISdStargateSdk, clients: ISdStargateClientModel[]): Promise<void> {
    const res = await sdk.cmdDummy.sendBatchReplyExampleCommand(clients)
    printResults("BATCH-Reply", clients.length, res)
}

function printResults (cmd: string, nClients: number, res?: any): void {
    console.log(chalk.green(`[${ nowTime() }] Successfully sent command '${ cmd }' to ${ nClients } clients!`))
    if (res) console.log(chalk.green("Result:\n", prettifyMsg(res)))
}
