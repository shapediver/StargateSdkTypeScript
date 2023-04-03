#!/usr/bin/env node

import chalk from "chalk"
import inquirer from "inquirer"
import { bakeDataCommand, setupBakeDataCommandHandlers } from "./command/bakeDataCommand"
import { disconnectClients } from "./command/disconnectClients"
import { dummyCommands, setupDummyCommandHandlers } from "./command/dummyCommands"
import { forwardMessage } from "./command/forward"
import { getDataCommand, setupGetDataCommandHandlers } from "./command/getDataCommand"
import { getSupportedDataCommand, setupGetSupportedDataCommandHandlers } from "./command/getSupportedDataCommand"
import { listBackendClients, listFrontendClients } from "./command/listClients"
import { prepareModelCommand, setupPrepareModelCommandHandlers } from "./command/prepareModelCommand"
import { register } from "./command/register"
import { setupStatusCommandHandlers, statusCommand } from "./command/statusCommand"
import { assertUnreachable, prettifyMsg } from "./utils"

const figlet = require("figlet")

const init = () => {
    console.log(
        chalk.magenta(
            figlet.textSync("Stargate", {
                font: "Doom",
                horizontalLayout: "default",
                verticalLayout: "default",
            }),
        ),
    )
}

enum Command {
    DISCONNECT_CLIENTS = "Deregister and disconnect selected clients from Stargate (backend only!)",
    DUMMY_COMMANDS = "Send a dummy command",
    EXIT = "Disconnect from Stargate and close CLI",
    FORWARD_MESSAGE = "Forward a custom message to selected clients from Stargate",
    LIST_BACKEND_CLIENTS = "List all registered backend clients",
    LIST_FRONTEND_CLIENTS = "List all registered frontend clients",
    BAKE_DATA_COMMAND = "Bake data for model and output",
    GET_DATA_COMMAND = "Get data for model and parameter",
    GET_SUPPORTED_DATA_COMMAND = "Get supported parameter types",
    STATUS_COMMAND = "Get status of client",
    PREPARE_MODEL = "Prepare client for model",
}

function askCommand () {
    const command = [
        {
            type: "list",
            name: "command",
            message: "What do you wanna do next?",
            choices: [
                Command.DUMMY_COMMANDS,
                Command.LIST_BACKEND_CLIENTS,
                Command.LIST_FRONTEND_CLIENTS,
                Command.PREPARE_MODEL,
                Command.GET_SUPPORTED_DATA_COMMAND,
                Command.GET_DATA_COMMAND,
                Command.BAKE_DATA_COMMAND,
                Command.STATUS_COMMAND,
                Command.FORWARD_MESSAGE,
                Command.DISCONNECT_CLIENTS,
                Command.EXIT,
            ],
            loop: false,
        },
    ]
    return inquirer.prompt?.(command)
}

/* Custom handler for all server messages. */
function msgHandle (msg: unknown): void {
    console.log(
        "\n",
        chalk.blue(`${ chalk.bold("Received non-command message from Stargate:") }\n${ prettifyMsg(msg) }`),
        "\n",
    )
}

/* Custom handler for all server error messages. */
function errHandler (msg: string): void {
    console.error(
        "\n",
        chalk.red(`${ chalk.bold("Received new error message from Stargate:") }\n${ prettifyMsg(msg) }`),
        "\n",
    )
}

/* Custom handler when the connection has been closed. */
function dcnHandler (msg: string): void {
    console.warn("\n", chalk.yellow(chalk.bold(msg)), "\n")
    process.exit(0)
}

(async function (): Promise<void> {
    init()

    let sdk = await register(msgHandle, errHandler, dcnHandler)

    // Register user-handlers for all commands
    setupDummyCommandHandlers(sdk)
    setupBakeDataCommandHandlers(sdk)
    setupGetDataCommandHandlers(sdk)
    setupGetSupportedDataCommandHandlers(sdk)
    setupStatusCommandHandlers(sdk)
    setupPrepareModelCommandHandlers(sdk)

    while (true) {
        const { command } = await askCommand()
        const cmd: Command = command
        switch (cmd) {
            case Command.DISCONNECT_CLIENTS:
                await disconnectClients(sdk)
                break
            case Command.DUMMY_COMMANDS:
                await dummyCommands(sdk)
                break
            case Command.EXIT:
                await sdk.close()
                process.exit()
                return
            case Command.FORWARD_MESSAGE:
                await forwardMessage(sdk)
                break
            case Command.LIST_BACKEND_CLIENTS:
                await listBackendClients(sdk)
                break
            case Command.LIST_FRONTEND_CLIENTS:
                await listFrontendClients(sdk)
                break
            case Command.BAKE_DATA_COMMAND:
                await bakeDataCommand(sdk)
                break
            case Command.GET_DATA_COMMAND:
                await getDataCommand(sdk)
                break
            case Command.GET_SUPPORTED_DATA_COMMAND:
                await getSupportedDataCommand(sdk)
                break
            case Command.STATUS_COMMAND:
                await statusCommand(sdk)
                break
            case Command.PREPARE_MODEL:
                await prepareModelCommand(sdk)
                break
            default:
                assertUnreachable(cmd)
        }
    }
})()
