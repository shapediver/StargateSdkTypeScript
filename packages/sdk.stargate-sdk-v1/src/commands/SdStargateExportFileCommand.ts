import {
  ISdStargateExportFileCommandDto,
  ISdStargateExportFileReplyDto,
} from "../dto/commands/exportFileCommand";
import {
  ISdCommandOkReplyPayload,
  ISdCommandPayload,
  ISdCommandRequestPayload,
} from "../dto/commands/commandPayload";
import { ISdStargateClientModel } from "../models/ISdStargateClientModel";
import { ISdStargateSdk } from "../sdk/ISdStargateSdk";
import { SdExportFileCommandValidator } from "../validators/commands/SdExportFileCommandValidator";
import { ISdStargateExportFileCommand } from "./ISdStargateExportFileCommand";
import { SdBaseCommand } from "./SdBaseCommand";

export class SdStargateExportFileCommand
  extends SdBaseCommand
  implements ISdStargateExportFileCommand
{
  private handler:
    | undefined
    | ((
        msg: ISdStargateExportFileCommandDto
      ) => Promise<ISdStargateExportFileReplyDto>);

  protected identifier: string = "EXPORT_FILE";

  constructor(sdk: ISdStargateSdk) {
    super(sdk);
  }

  isSupported(payload: ISdCommandPayload): boolean {
    return payload.command == this.identifier;
  }

  async processCommandMessage(payload: ISdCommandRequestPayload) {
    let data = payload.data;

    SdExportFileCommandValidator.assertCommandDto(data);
    const handler = this.handler ? this.handler?.bind(this) : undefined;
    await this.invokeHandler(payload, data, handler);
  }

  processOkReplyMessage(payload: ISdCommandOkReplyPayload) {
    // Validate reply-message
    SdExportFileCommandValidator.assertReplyDto(payload.data);

    // Update the open command with the clients reply-message
    this.register.updateCommand(
      payload.response.topic,
      payload.sender,
      payload.data
    );
  }

  async send(
    data: ISdStargateExportFileCommandDto,
    clients: ISdStargateClientModel[],
    timeout: number = 60000
  ): Promise<ISdStargateExportFileReplyDto[]> {
    return await this.sendCommand(
      data,
      clients,
      this.identifier,
      "BATCH",
      timeout
    );
  }

  registerHandler(
    handler: (
      msg: ISdStargateExportFileCommandDto
    ) => Promise<ISdStargateExportFileReplyDto>
  ): void {
    this.handler = handler;
  }
}
