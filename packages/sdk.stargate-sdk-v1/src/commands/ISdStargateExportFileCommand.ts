import {
  ISdStargateExportFileCommandDto,
  ISdStargateExportFileReplyDto,
} from "../dto/commands/exportFileCommand";
import { ISdStargateClientModel } from "../models/ISdStargateClientModel";

export interface ISdStargateExportFileCommand {
  /**
   * Request a client application to send an export request for a given model and parameter values.
   * The request includes
   *   * an identifier for the model,
   *   * the parameter values to use for the export,
   *   * the id of the export to use, and
   *   * an index of the export that holds the file.
   * The client application requests the export for the given parameter values. Typically the
   * export will already have been cached, and therefore the results will be available instantly.
   */
  send(
    data: ISdStargateExportFileCommandDto,
    clients: ISdStargateClientModel[],
    timeout?: number
  ): Promise<ISdStargateExportFileReplyDto[]>;

  /**
   * Sets the function handler.
   */
  registerHandler(
    handler: (
      msg: ISdStargateExportFileCommandDto
    ) => Promise<ISdStargateExportFileReplyDto>
  ): void;
}
