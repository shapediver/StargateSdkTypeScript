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
import { SdGetDataCommandValidator } from '../validators/commands/SdGetDataCommandValidator';
import { ISdStargateGetDataCommand } from './ISdStargateGetDataCommand';
import { SdBaseCommand } from './SdBaseCommand';

export class SdStargateGetDataCommand extends SdBaseCommand implements ISdStargateGetDataCommand {
    private handler:
        | undefined
        | ((msg: ISdStargateGetDataCommandDto) => Promise<ISdStargateGetDataReplyDto>);

    protected identifier: string = 'GET_DATA';

    isSupported(payload: ISdCommandPayload): boolean {
        return payload.command === this.identifier;
    }

    async processCommandMessage(payload: ISdCommandRequestPayload): Promise<void> {
        const data = payload.data;

        SdGetDataCommandValidator.assertCommandDto(data);
        const userHandler = this.handler;
        await this.invokeHandler(
            payload,
            data,
            userHandler ? (msg: ISdStargateGetDataCommandDto) => userHandler(msg) : undefined
        );
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
        return (await this.sendCommand(
            data,
            clients,
            this.identifier,
            'BATCH',
            timeout
        )) as ISdStargateGetDataReplyDto[];
    }

    registerHandler(
        handler: (msg: ISdStargateGetDataCommandDto) => Promise<ISdStargateGetDataReplyDto>
    ): void {
        this.handler = handler;
    }
}
