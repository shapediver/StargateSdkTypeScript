import { ISdListClientsResponseDto, ISdStargateSdk } from "@shapediver/sdk.stargate-sdk-v1"
import chalk from "chalk"
import { table, TableUserConfig } from "table"

export async function listBackendClients (sdk: ISdStargateSdk): Promise<void> {
    try {
        const clients = await sdk.listBackendClients()
        printResults(clients)
    } catch (e) {
        console.error(chalk.red(`${ chalk.bold("Could not list backend clients.") }\n${ e.message }`))
    }
}

export async function listFrontendClients (sdk: ISdStargateSdk): Promise<void> {
    try {
        const clients = await sdk.listFrontendClients()
        printResults(clients)
    } catch (e) {
        console.error(chalk.red(`${ chalk.bold("Could not list frontend clients.") }\n${ e.message }`))
    }
}

function printResults (clients: ISdListClientsResponseDto): void {
    const data: any[][] = [ [ "ID", "Type", "Name", "Version" ] ]

    clients.forEach(c => {
        data.push([ c.id, c.clientType, c.name, c.version ])
    })

    const config: TableUserConfig = {
        columns: [
            { alignment: "center" },
            { alignment: "center" },
            { alignment: "center" },
            { alignment: "center" },
        ],
    }

    console.log(table(data, config))
}
