import {
    ISdStargateClientModel,
    ISdStargateGetSupportedDataCommand,
    ISdStargateGetSupportedDataCommandDto,
    ISdStargateGetSupportedDataReplyDto,
    ISdStargateSdk,
    SdStargateGetSupportedDataCommand,
} from "@shapediver/sdk.stargate-sdk-v1"
import chalk from "chalk"
import inquirer from "inquirer"
import { nowTime, prettifyMsg, randomIntFromInterval, sleep } from "../utils"

// Global command instance
let command: ISdStargateGetSupportedDataCommand | undefined

const identifier = "GET_SUPPORTED_DATA"

// User-handler for 'batch-reply' command
const handler = async (msg: ISdStargateGetSupportedDataCommandDto): Promise<ISdStargateGetSupportedDataReplyDto> => {
    console.info(
        "\n",
        chalk.magenta(chalk.bold(`Received command message '${ identifier }' from Stargate:\n`)),
        chalk.magenta(prettifyMsg(msg)),
        "\n",
    )

    const seconds = randomIntFromInterval(0.5, 1)
    console.info(chalk.magenta(`Waiting ${ seconds } seconds to simulate variability in network speed...`))
    await sleep(seconds * 1000)

    console.info(chalk.magenta(`[${ nowTime() }] Finished handling command '${ identifier }'!`))

    // send dummy reply using parts of the request data
    return {
        parameterTypes: [ "sBrep", "sMesh" ],
        typeHints: [ "rhino.brep", "rhino.mesh" ],
    }
}

/** Instantiate a new command object and register all handlers. */
export function setupGetSupportedDataCommandHandlers (sdk: ISdStargateSdk): void {
    command = new SdStargateGetSupportedDataCommand(sdk)

    command.registerHandler(handler)
}

function askCommand (clients: ISdStargateClientModel[]) {
    const questions = [
        {
            type: "checkbox",
            name: "clientIds",
            message: "Select target clients:",
            choices: clients.map(client => {
                return {
                    name: `${ client.clientName } ${ client.clientVersion } (${ client.clientType })`,
                    value: client.id,
                }
            }),
        },
    ]
    return inquirer.prompt?.(questions)
}

export async function getSupportedDataCommand (sdk: ISdStargateSdk): Promise<void> {
    if (!command) throw new Error("Commands have not been registered.")

    try {
        // Fetch all registered clients for own user
        const clients = [
            ...await sdk.listFrontendClients(),
            ...await sdk.listBackendClients(),
        ]

        const { clientIds } = await askCommand(clients)

        const dto: ISdStargateGetSupportedDataCommandDto = {}

        const selectedClients = clients.filter(c => (<string[]>clientIds).includes(c.id))
        const res = await command.send(dto, selectedClients)
        printResults(identifier, selectedClients.length, res)

    } catch (e) {
        console.error(chalk.red(`${ chalk.bold(`Could not send command ${ identifier }.`) }\n${ e.type }: ${ e.message }`))
    }
}

function printResults (cmd: string, nClients: number, res?: any): void {
    console.log(chalk.green(`[${ nowTime() }] Successfully sent command '${ cmd }' to ${ nClients } clients!`))
    if (res) console.log(chalk.green("Result:\n", prettifyMsg(res)))
}
