import {
    ISdStargateClientModel,
    ISdStargateListClientsResponseDto,
    ISdStargateSdk,
    isSgError,
} from '@shapediver/sdk.stargate-sdk-v1';
import chalk from 'chalk';
import { table, TableUserConfig } from 'table';

export async function listBackendClients(sdk: ISdStargateSdk): Promise<void> {
    try {
        const clients = await sdk.listBackendClients();
        printResults(clients);
    } catch (e) {
        const errType = isSgError(e) ? e.type : 'JS-Error';
        const errMsg = e instanceof Error ? e.message : String(e);
        console.error(
            chalk.red(`${chalk.bold('Could not list backend clients.')}\n${errType}: ${errMsg}`)
        );
    }
}

export async function listFrontendClients(sdk: ISdStargateSdk): Promise<void> {
    try {
        const clients = await sdk.listFrontendClients();
        printResults(clients);
    } catch (e) {
        const errType = isSgError(e) ? e.type : 'JS-Error';
        const errMsg = e instanceof Error ? e.message : String(e);
        console.error(
            chalk.red(`${chalk.bold('Could not list frontend clients.')}\n${errType}: ${errMsg}`)
        );
    }
}

function printResults(clients: ISdStargateListClientsResponseDto): void {
    const data: any[][] = [['ID', 'Type', 'Name', 'Version', 'Host']];

    clients.forEach((c: ISdStargateClientModel) => {
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
