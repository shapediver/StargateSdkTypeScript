import {
    ISdStargateBakeDataCommandDto,
    ISdStargateBakeDataReplyDto,
} from '../dto/commands/bakeDataCommand';
import {
    ISdCommandOkReplyPayload,
    ISdCommandPayload,
    ISdCommandRequestPayload,
} from '../dto/commands/commandPayload';
import { ISdStargateClientModel } from '../models/ISdStargateClientModel';
import { SdBakeDataCommandValidator } from '../validators/commands/SdBakeDataCommandValidator';
import { ISdStargateBakeDataCommand } from './ISdStargateBakeDataCommand';
import { SdBaseCommand } from './SdBaseCommand';

export class SdStargateBakeDataCommand
    extends SdBaseCommand
    implements ISdStargateBakeDataCommand
{
    private handler:
        undefined | ((msg: ISdStargateBakeDataCommandDto) => Promise<ISdStargateBakeDataReplyDto>);

    protected identifier: string = 'BAKE_DATA';

    isSupported(payload: ISdCommandPayload): boolean {
        return payload.command === this.identifier;
    }

    async processCommandMessage(payload: ISdCommandRequestPayload): Promise<void> {
        const data = payload.data;

        SdBakeDataCommandValidator.assertCommandDto(data);
        const userHandler = this.handler;
        await this.invokeHandler(
            payload,
            data,
            userHandler ? (msg: ISdStargateBakeDataCommandDto) => userHandler(msg) : undefined
        );
    }

    processOkReplyMessage(payload: ISdCommandOkReplyPayload) {
        // Validate reply-message
        SdBakeDataCommandValidator.assertReplyDto(payload.data);

        // Update the open command with the clients reply-message
        this.register.updateCommand(payload.response.topic, payload.sender, payload.data);
    }

    async send(
        data: ISdStargateBakeDataCommandDto,
        clients: ISdStargateClientModel[],
        timeout: number = 60000
    ): Promise<ISdStargateBakeDataReplyDto[]> {
        return (await this.sendCommand(
            data,
            clients,
            this.identifier,
            'BATCH',
            timeout
        )) as ISdStargateBakeDataReplyDto[];
    }

    registerHandler(
        handler: (msg: ISdStargateBakeDataCommandDto) => Promise<ISdStargateBakeDataReplyDto>
    ): void {
        this.handler = handler;
    }
}
