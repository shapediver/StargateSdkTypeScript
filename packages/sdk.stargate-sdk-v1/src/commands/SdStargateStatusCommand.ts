import {
    ISdCommandOkReplyPayload,
    ISdCommandPayload,
    ISdCommandRequestPayload,
} from '../dto/commands/commandPayload';
import {
    ISdStargateStatusCommandDto,
    ISdStargateStatusReplyDto,
} from '../dto/commands/statusCommand';
import { ISdStargateClientModel } from '../models/ISdStargateClientModel';
import { SdStatusCommandValidator } from '../validators/commands/SdStatusCommandValidator';
import { ISdStargateStatusCommand } from './ISdStargateStatusCommand';
import { SdBaseCommand } from './SdBaseCommand';

export class SdStargateStatusCommand extends SdBaseCommand implements ISdStargateStatusCommand {
    private handler:
        undefined | ((msg: ISdStargateStatusCommandDto) => Promise<ISdStargateStatusReplyDto>);

    protected identifier: string = 'STATUS';

    isSupported(payload: ISdCommandPayload): boolean {
        return payload.command === this.identifier;
    }

    async processCommandMessage(payload: ISdCommandRequestPayload): Promise<void> {
        const data = payload.data;

        SdStatusCommandValidator.assertCommandDto(data);
        const userHandler = this.handler;
        await this.invokeHandler(
            payload,
            data,
            userHandler ? (msg: ISdStargateStatusCommandDto) => userHandler(msg) : undefined
        );
    }

    processOkReplyMessage(payload: ISdCommandOkReplyPayload) {
        // Validate reply-message
        SdStatusCommandValidator.assertReplyDto(payload.data);

        // Update the open command with the clients reply-message
        this.register.updateCommand(payload.response.topic, payload.sender, payload.data);
    }

    async send(
        data: ISdStargateStatusCommandDto,
        clients: ISdStargateClientModel[],
        timeout: number = 10000
    ): Promise<ISdStargateStatusReplyDto[]> {
        return (await this.sendCommand(
            data,
            clients,
            this.identifier,
            'BATCH',
            timeout
        )) as ISdStargateStatusReplyDto[];
    }

    registerHandler(
        handler: (msg: ISdStargateStatusCommandDto) => Promise<ISdStargateStatusReplyDto>
    ): void {
        this.handler = handler;
    }
}
