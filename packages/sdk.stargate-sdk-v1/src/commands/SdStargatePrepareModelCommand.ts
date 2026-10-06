import {
    ISdCommandOkReplyPayload,
    ISdCommandPayload,
    ISdCommandRequestPayload,
} from '../dto/commands/commandPayload';
import {
    ISdStargatePrepareModelCommandDto,
    ISdStargatePrepareModelReplyDto,
} from '../dto/commands/prepareModelCommand';
import { ISdStargateClientModel } from '../models/ISdStargateClientModel';
import { SdPrepareModelCommandValidator } from '../validators/commands/SdPrepareModelCommandValidator';
import { ISdStargatePrepareModelCommand } from './ISdStargatePrepareModelCommand';
import { SdBaseCommand } from './SdBaseCommand';

export class SdStargatePrepareModelCommand
    extends SdBaseCommand
    implements ISdStargatePrepareModelCommand
{
    private handler:
        | undefined
        | ((msg: ISdStargatePrepareModelCommandDto) => Promise<ISdStargatePrepareModelReplyDto>);

    protected identifier: string = 'PREPARE_MODEL';

    isSupported(payload: ISdCommandPayload): boolean {
        return payload.command === this.identifier;
    }

    async processCommandMessage(payload: ISdCommandRequestPayload): Promise<void> {
        const data = payload.data;

        SdPrepareModelCommandValidator.assertCommandDto(data);
        const userHandler = this.handler;
        await this.invokeHandler(
            payload,
            data,
            userHandler ? (msg: ISdStargatePrepareModelCommandDto) => userHandler(msg) : undefined
        );
    }

    processOkReplyMessage(payload: ISdCommandOkReplyPayload) {
        // Validate reply-message
        SdPrepareModelCommandValidator.assertReplyDto(payload.data);

        // Update the open command with the clients reply-message
        this.register.updateCommand(payload.response.topic, payload.sender, payload.data);
    }

    async send(
        data: ISdStargatePrepareModelCommandDto,
        clients: ISdStargateClientModel[],
        timeout: number = 60000
    ): Promise<ISdStargatePrepareModelReplyDto[]> {
        return (await this.sendCommand(
            data,
            clients,
            this.identifier,
            'BATCH',
            timeout
        )) as ISdStargatePrepareModelReplyDto[];
    }

    registerHandler(
        handler: (
            msg: ISdStargatePrepareModelCommandDto
        ) => Promise<ISdStargatePrepareModelReplyDto>
    ): void {
        this.handler = handler;
    }
}
