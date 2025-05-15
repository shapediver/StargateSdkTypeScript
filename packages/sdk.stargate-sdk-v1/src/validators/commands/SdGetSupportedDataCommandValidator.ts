import {
  ISdStargateGetSupportedDataCommandDto,
  ISdStargateGetSupportedDataReplyDto,
} from "../../dto/commands/getSupportedDataCommand";
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
    parameterTypes: {
      type: "array",
      items: {
        type: "string",
      },
    },
    typeHints: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
  required: ["parameterTypes", "typeHints"],
  additionalProperties: true,
};

export abstract class SdGetSupportedDataCommandValidator extends SdBaseValidator {
  static assertCommandDto(
    data: unknown
  ): asserts data is ISdStargateGetSupportedDataCommandDto {
    return this.assertValid(data, schemaCommandDto);
  }

  static assertReplyDto(
    data: unknown
  ): asserts data is ISdStargateGetSupportedDataReplyDto {
    return this.assertValid(data, schemaReplyDto);
  }
}
