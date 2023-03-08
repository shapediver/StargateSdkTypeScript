import Ajv from "ajv"
import {
    ISdStargateGetSupportedDataCommandDto,
    ISdStargateGetSupportedDataReplyDto,
} from "../../dto/commands/getSupportedDataCommand"
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
        parameterTypes: { 
            type: 'array', 
            items: {
                type: 'string'
            }
        }
    },
    required: ['parameterTypes'],
    additionalProperties: true,
}

export abstract class SdGetSupportedDataCommandValidator extends SdBaseValidator {

    private static validateCommandDto = ajv.compile(schemaCommandDto)
    private static validateReplyDto = ajv.compile(schemaReplyDto)

    static assertCommandDto (data: unknown): asserts data is ISdStargateGetSupportedDataCommandDto {
        return this.validate(this.validateCommandDto, data)
    }

    static assertReplyDto (data: unknown): asserts data is ISdStargateGetSupportedDataReplyDto {
        return this.validate(this.validateReplyDto, data)
    }

}
