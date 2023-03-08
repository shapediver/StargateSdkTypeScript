import Ajv from "ajv"
import {
    ISdStargateStatusCommandDto,
    ISdStargateStatusReplyDto,
} from "../../dto/commands/statusCommand"
import { SdBaseValidator } from "../SdBaseValidator"

const ajv = new Ajv()

/** Schema for {@link ISdStargateGetSupportedDataCommandDto} */
const schemaCommandDto = {
    type: 'object',
    properties: {
    },
    additionalProperties: true,
}
/** Schema for {@link ISdStargateGetSupportedDataReplyDto} */
const schemaReplyDto = {
    type: 'object',
    properties: {
        firstActivity: { type: 'number' },
        latestActivity: { type: 'number' }
    },
    required: ['firstActivity', 'latestActivity'],
    additionalProperties: true,
}

export abstract class SdStatusCommandValidator extends SdBaseValidator {

    private static validateCommandDto = ajv.compile(schemaCommandDto)
    private static validateReplyDto = ajv.compile(schemaReplyDto)

    static assertCommandDto (data: unknown): asserts data is ISdStargateStatusCommandDto {
        return this.validate(this.validateCommandDto, data)
    }

    static assertReplyDto (data: unknown): asserts data is ISdStargateStatusReplyDto {
        return this.validate(this.validateReplyDto, data)
    }

}
