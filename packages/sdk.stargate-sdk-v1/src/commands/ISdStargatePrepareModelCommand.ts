import {
  ISdStargatePrepareModelCommandDto,
  ISdStargatePrepareModelReplyDto,
} from "../dto/commands/prepareModelCommand";
import { ISdStargateClientModel } from "../models/ISdStargateClientModel";

export interface ISdStargatePrepareModelCommand {
  /**
   * Command which tells the client to prepare/open a session.
   */
  send(
    data: ISdStargatePrepareModelCommandDto,
    clients: ISdStargateClientModel[],
    timeout?: number
  ): Promise<ISdStargatePrepareModelReplyDto[]>;

  /**
   * Sets the function handler.
   */
  registerHandler(
    handler: (
      msg: ISdStargatePrepareModelCommandDto
    ) => Promise<ISdStargatePrepareModelReplyDto>
  ): void;
}
