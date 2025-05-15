import {
  ISdStargateStatusCommandDto,
  ISdStargateStatusReplyDto,
} from "../dto/commands/statusCommand";
import { ISdStargateClientModel } from "../models/ISdStargateClientModel";
export interface ISdStargateStatusCommand {
  /**
   * The "status" command.
   * This command is used by the platform frontend to request status information from
   * the client. The overhead of this command is minimal, and it is used to check whether
   * the client is still responsive.
   */
  send(
    data: ISdStargateStatusCommandDto,
    clients: ISdStargateClientModel[],
    timeout?: number
  ): Promise<ISdStargateStatusReplyDto[]>;

  /**
   * Sets the function handler .
   */
  registerHandler(
    handler: (
      msg: ISdStargateStatusCommandDto
    ) => Promise<ISdStargateStatusReplyDto>
  ): void;
}
