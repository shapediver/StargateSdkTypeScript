import Ajv from "ajv"
import {
    ISdStargateGetDataCommandDto,
    ISdStargateGetDataReplyDto,
} from "../../dto/commands/getDataCommand"
import { SdBaseValidator } from "../SdBaseValidator"

const ajv = new Ajv()

/** Schema for {@link ISdStargateGetDataCommandDto} */
const schemaCommandDto = {
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
const schemaReplyDto = {
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
            required: ['count', 'result'],
            properties: {
                count: { type: 'number' },
                result: { enum: ['success', 'cancel', 'nothing', 'failure'] },
            },
            additionalProperties: true,
        }
    },
    required: ['info'],
    additionalProperties: true,
}

export abstract class SdGetDataCommandValidator extends SdBaseValidator {

    private static validateCommandDto = ajv.compile(schemaCommandDto)
    private static validateReplyDto = ajv.compile(schemaReplyDto)

    static assertCommandDto (data: unknown): asserts data is ISdStargateGetDataCommandDto {
        return this.validate(this.validateCommandDto, data)
    }

    static assertReplyDto (data: unknown): asserts data is ISdStargateGetDataReplyDto {
        return this.validate(this.validateReplyDto, data)
    }

}
