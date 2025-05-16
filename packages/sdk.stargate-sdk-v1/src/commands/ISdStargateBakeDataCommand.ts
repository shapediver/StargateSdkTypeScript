import {
  ISdStargateBakeDataCommandDto,
  ISdStargateBakeDataReplyDto,
} from "../dto/commands/bakeDataCommand";
import { ISdStargateClientModel } from "../models/ISdStargateClientModel";

export interface ISdStargateBakeDataCommand {
  /**
   * Request a client application to output (bake) data for a given model and parameter values.
   * The request includes
   *   * an identifier for the model,
   *   * the parameter values for which results should be baked,
   *   * the id of the output to bake data for, and
   *   * a specification of the sdTF asset's chunk to use.
   * The client application requests the outputs for the given parameter values. Typically the
   * computation will already have been cached, and therefore the results will be available
   * instantly. The client application then looks for an sdTF asset in the results for the given
   * output id. It downloads the sdTF asset, selects the specified chunk, and outputs the data
   * contained in it. This might or might not include user input.
   */
  send(
    data: ISdStargateBakeDataCommandDto,
    clients: ISdStargateClientModel[],
    timeout?: number
  ): Promise<ISdStargateBakeDataReplyDto[]>;

  /**
   * Sets the function handler.
   */
  registerHandler(
    handler: (
      msg: ISdStargateBakeDataCommandDto
    ) => Promise<ISdStargateBakeDataReplyDto>
  ): void;
}
