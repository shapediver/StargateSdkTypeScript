import {
  ISdStargateExportFileCommandDto,
  ISdStargateExportFileReplyDto,
} from "../../dto/commands/exportFileCommand";
import { SdBaseValidator } from "../SdBaseValidator";

/** Schema for {@link ISdStargateExportFileCommandDto} */
const schemaCommandDto = {
  type: "object",
  properties: {
    model: {
      type: "object",
      required: ["id"],
      additionalProperties: true,
    },
    parameters: {
      type: "object",
      patternProperties: {
        ".*": { type: "string" },
      },
    },
    export: {
      type: "object",
      properties: {
        id: { type: "string" },
        index: { type: "number" },
      },
      required: ["id", "index"],
      additionalProperties: true,
    },
  },
  required: ["model", "parameters", "export"],
  additionalProperties: true,
};
/** Schema for {@link ISdStargateExportFileReplyDto} */
const schemaReplyDto = {
  type: "object",
  properties: {
    info: {
      type: "object",
      properties: {
        result: { enum: ["success", "cancel", "nothing", "failure"] },
        message: { type: "string" },
      },
      required: ["result"],
      additionalProperties: true,
    },
  },
  required: ["info"],
  additionalProperties: true,
};

export abstract class SdExportFileCommandValidator extends SdBaseValidator {
  static assertCommandDto(
    data: unknown
  ): asserts data is ISdStargateExportFileCommandDto {
    return this.assertValid(data, schemaCommandDto);
  }

  static assertReplyDto(
    data: unknown
  ): asserts data is ISdStargateExportFileReplyDto {
    return this.assertValid(data, schemaReplyDto);
  }
}
