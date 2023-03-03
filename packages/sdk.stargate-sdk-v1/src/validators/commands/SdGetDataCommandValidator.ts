import Ajv from "ajv"
import {
    ISdStargateGetDataCommandDto,
    ISdStargateGetDataReplyDto,
} from "../../dto/commands/getDataCommand"
import { SdBaseValidator } from "../SdBaseValidator"

const ajv = new Ajv()

/** Schema for {@link ISdStargateGetDataCommandDto} */
const schemaGetDataCommandDto = {
    type: 'object',
    properties: {
        model: { 
            type: 'object', 
            required: ['id'],
            properties: {
                id: { type: 'string' },
            },
            additionalProperties: true,
        },
        parameter: {
            type: 'object', 
            required: ['id'],
            properties: {
                id: { type: 'string' },
            },
            additionalProperties: true,
        }
    },
    required: ['model', 'parameter'],
    additionalProperties: true,
}
/** Schema for {@link ISdStargateGetDataReplyDto} */
const schemaGetDataReplyDto = {
    type: 'object',
    properties: {
        asset: { 
            type: 'object', 
            required: ['id'],
            properties: {
                id: { type: 'string' },
                chunk: { 
                    type: 'object', 
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                    },
                    additionalProperties: true,
                }
            },
            additionalProperties: true,
        },
        info: {
            type: 'object', 
            required: ['count'],
            properties: {
                count: { type: 'number' },
            },
            additionalProperties: true,
        }
    },
    required: ['asset', 'info'],
    additionalProperties: true,
}

export abstract class SdGetDataCommandValidator extends SdBaseValidator {

    private static validateGetDataCommandDto = ajv.compile(schemaGetDataCommandDto)
    private static validateGetDataReplyDto = ajv.compile(schemaGetDataReplyDto)

    static assertGetDataCommandDto (data: unknown): asserts data is ISdStargateGetDataCommandDto {
        return this.validate(this.validateGetDataCommandDto, data)
    }

    static assertGetDataReplyDto (data: unknown): asserts data is ISdStargateGetDataReplyDto {
        return this.validate(this.validateGetDataReplyDto, data)
    }

}
