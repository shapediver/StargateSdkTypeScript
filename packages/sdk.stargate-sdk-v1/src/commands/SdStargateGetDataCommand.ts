import {
    ISdCommandOkReplyPayload,
    ISdCommandPayload,
    ISdCommandRequestPayload,
} from '../dto/commands/commandPayload';
import {
    ISdStargateGetDataCommandDto,
    ISdStargateGetDataReplyDto,
} from '../dto/commands/getDataCommand';
import { ISdStargateClientModel } from '../models/ISdStargateClientModel';
import { ISdStargateSdk } from '../sdk/ISdStargateSdk';
import { SdGetDataCommandValidator } from '../validators/commands/SdGetDataCommandValidator';
import { ISdStargateGetDataCommand } from './ISdStargateGetDataCommand';
import { SdBaseCommand } from './SdBaseCommand';

export class SdStargateGetDataCommand extends SdBaseCommand implements ISdStargateGetDataCommand {
    private handler:
        | undefined
        | ((msg: ISdStargateGetDataCommandDto) => Promise<ISdStargateGetDataReplyDto>);

    protected identifier: string = 'GET_DATA';

    constructor(sdk: ISdStargateSdk) {
        super(sdk);
    }

    isSupported(payload: ISdCommandPayload): boolean {
        return payload.command == this.identifier;
    }

    async processCommandMessage(payload: ISdCommandRequestPayload) {
        let data = payload.data;

        SdGetDataCommandValidator.assertCommandDto(data);
        const handler = this.handler ? this.handler?.bind(this) : undefined;
        await this.invokeHandler(payload, data, handler);
    }

    processOkReplyMessage(payload: ISdCommandOkReplyPayload) {
        // Validate reply-message
        SdGetDataCommandValidator.assertReplyDto(payload.data);

        // Update the open command with the clients reply-message
        this.register.updateCommand(payload.response.topic, payload.sender, payload.data);
    }

    async send(
        data: ISdStargateGetDataCommandDto,
        clients: ISdStargateClientModel[],
        timeout: number = 60000
    ): Promise<ISdStargateGetDataReplyDto[]> {
        return await this.sendCommand(data, clients, this.identifier, 'BATCH', timeout);
    }

    registerHandler(
        handler: (msg: ISdStargateGetDataCommandDto) => Promise<ISdStargateGetDataReplyDto>
    ): void {
        this.handler = handler;
    }
}
