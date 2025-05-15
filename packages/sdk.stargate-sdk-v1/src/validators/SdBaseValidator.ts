import { SdStargateError, SdStargateErrorTypes } from "../SdStargateError";

const ValidatorConstructor = require("jsonschema").Validator;
const validator = new ValidatorConstructor();

export abstract class SdBaseValidator {
  /**
   * Type guard of custom command payload DTOs.
   * @protected
   */
  protected static isValid<T>(
    data: unknown,
    schema: Record<string, any>
  ): data is T {
    return validator.validate(data, schema).errors.length === 0;
  }

  /**
   * Type guard of custom command payload DTOs.
   * @protected
   * @throws {@link SdStargateError} when the validation fails.
   */
  protected static assertValid<T>(
    data: unknown,
    schema: Record<string, any>
  ): asserts data is T {
    const res = validator.validate(data, schema);

    // Collect and format validation errors and throw
    if (res.errors.length > 0) {
      // We only show the first error
      const error = res.errors[0];

      throw new SdStargateError(
        SdStargateErrorTypes.InvalidCommandPayload,
        `'${error.property}' ${error.message}` // `property` contains the stringified path
      );
    }
  }
}
