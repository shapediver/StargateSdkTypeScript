#!/usr/bin/env node

import chalk from "chalk"
import inquirer from "inquirer"
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
            ],
        },
    ]
    return inquirer.prompt?.(command)
}

(async function (): Promise<void> {
    init()

    let sdk = await register()

    while (true) {
        const { command } = await askCommand()
        const cmd: Command = command
        switch (cmd) {
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
