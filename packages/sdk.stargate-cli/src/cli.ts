#!/usr/bin/env node

import chalk from "chalk"
import inquirer from "inquirer"
import { disconnectClients } from "./command/disconnectClients"
import { forwardMessage } from "./command/forward"
import { listBackendClients, listFrontendClients } from "./command/listClients"
import { register } from "./command/register"
import { assertUnreachable } from "./utils"

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
    EXIT = "Disconnect from Stargate and close CLI",
    FORWARD_MESSAGE = "Forward a custom message to selected clients from Stargate",
    LIST_BACKEND_CLIENTS = "List all registered backend clients",
    LIST_FRONTEND_CLIENTS = "List all registered frontend clients",
}

function askCommand () {
    const command = [
        {
            type: "list",
            name: "command",
            message: "What do you wanna do next?",
            choices: [
                Command.LIST_BACKEND_CLIENTS,
                Command.LIST_FRONTEND_CLIENTS,
                Command.FORWARD_MESSAGE,
                Command.DISCONNECT_CLIENTS,
                Command.EXIT,
            ],
        },
    ]
    return inquirer.prompt?.(command)
}

/* Custom handler for all server messages. */
function msgHandle (payload: unknown): void {
    let pretty = payload
    if (typeof payload === "object" && payload !== null)
        pretty = require("util").inspect(pretty, false, null)
    console.log(
        "\n",
        chalk.magenta(`${ chalk.bold("Received new message from Stargate:\n") }\n${ pretty }`),
        "\n",
    )
}

/* Custom handler for all server error messages. */
function errHandler (msg: string): void {
    console.error(
        "\n",
        chalk.red(`${ chalk.bold("Received new message from Stargate:\n") }\n${ msg }`),
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

    while (true) {
        const { command } = await askCommand()
        const cmd: Command = command
        switch (cmd) {
            case Command.DISCONNECT_CLIENTS:
                await disconnectClients(sdk)
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
            default:
                assertUnreachable(cmd)
        }
    }
})()
