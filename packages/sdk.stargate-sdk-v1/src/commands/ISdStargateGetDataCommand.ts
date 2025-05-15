import {
  ISdStargateGetDataCommandDto,
  ISdStargateGetDataReplyDto,
} from "../dto/commands/getDataCommand";
import { ISdStargateClientModel } from "../models/ISdStargateClientModel";

export interface ISdStargateGetDataCommand {
  /**
   * Request the input of data for a given model and parameter from a client application.
   * The request includes an identifier for the model and parameter to get data for.
   * The client application prompts the user for data selection, packages the selected
   * data into an sdTF asset, uploads the asset for the model, and sends back an
   * identifier for the uploaded asset to the frontend.
   */
  send(
    data: ISdStargateGetDataCommandDto,
    clients: ISdStargateClientModel[],
    timeout?: number
  ): Promise<ISdStargateGetDataReplyDto[]>;

  /**
   * Sets the function handler.
   */
  registerHandler(
    handler: (
      msg: ISdStargateGetDataCommandDto
    ) => Promise<ISdStargateGetDataReplyDto>
  ): void;
}
