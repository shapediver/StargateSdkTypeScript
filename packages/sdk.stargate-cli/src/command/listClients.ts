import { ISdListClientsResponseDto, ISdStargateSdk } from "@shapediver/sdk.stargate-sdk-v1"
import { table, TableUserConfig } from "table"

export async function listBackendClients (sdk: ISdStargateSdk): Promise<void> {
    const clients = await sdk.listBackendClients()
    printResults(clients)
}

export async function listFrontendClients (sdk: ISdStargateSdk): Promise<void> {
    const clients = await sdk.listFrontendClients()
    printResults(clients)
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
