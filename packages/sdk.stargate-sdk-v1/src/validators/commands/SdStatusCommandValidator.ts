import {
  ISdStargateStatusCommandDto,
  ISdStargateStatusReplyDto,
} from "../../dto/commands/statusCommand";
import { SdBaseValidator } from "../SdBaseValidator";

/** Schema for {@link ISdStargateGetSupportedDataCommandDto} */
const schemaCommandDto = {
  type: "object",
  properties: {},
  additionalProperties: true,
};
/** Schema for {@link ISdStargateGetSupportedDataReplyDto} */
const schemaReplyDto = {
  type: "object",
  properties: {
    firstActivity: { type: "number" },
    latestActivity: { type: "number" },
  },
  required: ["firstActivity", "latestActivity"],
  additionalProperties: true,
};

export abstract class SdStatusCommandValidator extends SdBaseValidator {
  static assertCommandDto(
    data: unknown
  ): asserts data is ISdStargateStatusCommandDto {
    return this.assertValid(data, schemaCommandDto);
  }

  static assertReplyDto(
    data: unknown
  ): asserts data is ISdStargateStatusReplyDto {
    return this.assertValid(data, schemaReplyDto);
  }
}
