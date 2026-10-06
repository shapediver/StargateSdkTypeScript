import {
    ISdCommandOkReplyPayload,
    ISdCommandPayload,
    ISdCommandRequestPayload,
} from '../dto/commands/commandPayload';
import {
    ISdStargateGetSupportedDataCommandDto,
    ISdStargateGetSupportedDataReplyDto,
} from '../dto/commands/getSupportedDataCommand';
import { ISdStargateClientModel } from '../models/ISdStargateClientModel';
import { SdGetSupportedDataCommandValidator } from '../validators/commands/SdGetSupportedDataCommandValidator';
import { ISdStargateGetSupportedDataCommand } from './ISdStargateGetSupportedDataCommand';
import { SdBaseCommand } from './SdBaseCommand';

export class SdStargateGetSupportedDataCommand
    extends SdBaseCommand
    implements ISdStargateGetSupportedDataCommand
{
    private handler:
        | undefined
        | ((
              msg: ISdStargateGetSupportedDataCommandDto
          ) => Promise<ISdStargateGetSupportedDataReplyDto>);

    protected identifier: string = 'GET_SUPPORTED_DATA';

    isSupported(payload: ISdCommandPayload): boolean {
        return payload.command === this.identifier;
    }

    async processCommandMessage(payload: ISdCommandRequestPayload): Promise<void> {
        const data = payload.data;

        SdGetSupportedDataCommandValidator.assertCommandDto(data);
        const userHandler = this.handler;
        await this.invokeHandler(
            payload,
            data,
            userHandler ? (msg: ISdStargateGetSupportedDataCommandDto) => userHandler(msg) : undefined
        );
    }

    processOkReplyMessage(payload: ISdCommandOkReplyPayload) {
        // Validate reply-message
        SdGetSupportedDataCommandValidator.assertReplyDto(payload.data);

        const data = payload.data as ISdStargateGetSupportedDataReplyDto & {
            contentTypes?: string[];
            fileExtensions?: string[];
        };
        if (data.contentTypes === undefined) {
            data.contentTypes = [];
        }
        if (data.fileExtensions === undefined) {
            data.fileExtensions = [];
        }

        this.register.updateCommand(payload.response.topic, payload.sender, data);
    }

    async send(
        data: ISdStargateGetSupportedDataCommandDto,
        clients: ISdStargateClientModel[],
        timeout: number = 10000
    ): Promise<ISdStargateGetSupportedDataReplyDto[]> {
        return (await this.sendCommand(
            data,
            clients,
            this.identifier,
            'BATCH',
            timeout
        )) as ISdStargateGetSupportedDataReplyDto[];
    }

    registerHandler(
        handler: (
            msg: ISdStargateGetSupportedDataCommandDto
        ) => Promise<ISdStargateGetSupportedDataReplyDto>
    ): void {
        this.handler = handler;
    }
}
