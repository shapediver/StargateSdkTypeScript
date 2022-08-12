import { ISdClientModel, ISdStargateSdk } from "@shapediver/sdk.stargate-sdk-v1"
import chalk from "chalk"
import inquirer from "inquirer"

function askQuestions (clients: ISdClientModel[]) {
    const questions = [
        {
            type: "editor",
            name: "message",
            message: "Enter the message in a valid JSON format",
        },
        {
            type: "checkbox",
            name: "clientIds",
            message: "Select currently registered clients:",
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

export async function forwardMessage (sdk: ISdStargateSdk): Promise<void> {
    try {
        // Fetch all registered clients for own user
        const clients = [
            ...await sdk.listFrontendClients(),
            ...await sdk.listBackendClients(),
        ]

        // Ask user what message which clients should receive
        const { message, clientIds } = await askQuestions(clients)
        let json
        try {
            json = JSON.parse(message)
        } catch (e) {
            throw new Error("Invalid input message: " + e.message)
        }
        const selectedClients = clients.filter(c => (<string[]>clientIds).includes(c.id))

        // Send command and print results
        await sdk.forwardMessage(json, selectedClients)
        printResults(selectedClients.length)
    } catch (e) {
        console.error(chalk.red(`${ chalk.bold("Could not send message to clients via Stargate.") }\n${ e.message }`))
    }
}

function printResults (nClients: number): void {
    console.log(chalk.green(`Successfully sent message to ${ nClients } clients!`))
}
