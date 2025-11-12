import {
    ISdStargateListClientsResponseDto,
    ISdStargateSdk,
} from '@shapediver/sdk.stargate-sdk-v1';
import chalk from 'chalk';
import { table, TableUserConfig } from 'table';

export async function listBackendClients(sdk: ISdStargateSdk): Promise<void> {
    try {
        const clients = await sdk.listBackendClients();
        printResults(clients);
    } catch (e) {
        console.error(
            chalk.red(`${chalk.bold('Could not list backend clients.')}\n${e.type}: ${e.message}`)
        );
    }
}

export async function listFrontendClients(sdk: ISdStargateSdk): Promise<void> {
    try {
        const clients = await sdk.listFrontendClients();
        printResults(clients);
    } catch (e) {
        console.error(
            chalk.red(`${chalk.bold('Could not list frontend clients.')}\n${e.type}: ${e.message}`)
        );
    }
}

function printResults(clients: ISdStargateListClientsResponseDto): void {
    const data: any[][] = [['ID', 'Type', 'Name', 'Version', 'Host']];

    clients.forEach((c) => {
        data.push([
            c.id,
            c.clientType,
            c.clientName,
            c.clientVersion,
            `${c.hostUser}@${c.hostName} ${c.hostOs}`,
        ]);
    });

    const config: TableUserConfig = {
        columns: [
            { alignment: 'center' },
            { alignment: 'center' },
            { alignment: 'center' },
            { alignment: 'center' },
        ],
    };

    console.log(table(data, config));
}
