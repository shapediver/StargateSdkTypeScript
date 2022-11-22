import { ISdStargateClientModel, ISdStargateSdk } from "@shapediver/sdk.stargate-sdk-v1"
import chalk from "chalk"
import inquirer from "inquirer"

function askQuestions (clients: ISdStargateClientModel[]) {
    const questions = [
        {
            type: "checkbox",
            name: "clientIds",
            message: "Select currently registered clients:",
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

export async function disconnectClients (sdk: ISdStargateSdk): Promise<void> {
    try {
        // Fetch all registered clients for own user
        const clients = [
            ...await sdk.listFrontendClients(),
            ...await sdk.listBackendClients(),
        ]

        // Ask user which clients should get disconnected
        const { clientIds } = await askQuestions(clients)
        const selectedClients = clients.filter(c => (<string[]>clientIds).includes(c.id))

        // Send command and print results
        await sdk.disconnectClients(selectedClients)
        printResults(selectedClients.length)
    } catch (e) {
        console.error(chalk.red(`${ chalk.bold("Could not disconnect all clients from Stargate.") }\n${ e.type }: ${ e.message }`))
    }
}

function printResults (nClients: number): void {
    console.log(chalk.green(`Successfully deregistered and disconnected ${ nClients } clients from Stargate!`))
}
