import Ajv from "ajv"
import {
    ISdStargateGetSupportedDataCommandDto,
    ISdStargateGetSupportedDataReplyDto,
} from "../../dto/commands/getSupportedDataCommand"
import { SdBaseValidator } from "../SdBaseValidator"

const ajv = new Ajv()

/** Schema for {@link ISdStargateGetSupportedDataCommandDto} */
const schemaGetSupportedDataCommandDto = {
    type: 'object',
    properties: {
    },
    additionalProperties: true,
}
/** Schema for {@link ISdStargateGetSupportedDataReplyDto} */
const schemaGetSupportedDataReplyDto = {
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

    private static validateGetSupportedDataCommandDto = ajv.compile(schemaGetSupportedDataCommandDto)
    private static validateGetSupportedDataReplyDto = ajv.compile(schemaGetSupportedDataReplyDto)

    static assertGetSupportedDataCommandDto (data: unknown): asserts data is ISdStargateGetSupportedDataCommandDto {
        return this.validate(this.validateGetSupportedDataCommandDto, data)
    }

    static assertGetSupportedDataReplyDto (data: unknown): asserts data is ISdStargateGetSupportedDataReplyDto {
        return this.validate(this.validateGetSupportedDataReplyDto, data)
    }

}
