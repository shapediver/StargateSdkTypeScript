import Ajv from "ajv"
import {
    ISdStargateBakeDataCommandDto,
    ISdStargateBakeDataReplyDto,
} from "../../dto/commands/bakeDataCommand"
import { SdBaseValidator } from "../SdBaseValidator"

const ajv = new Ajv()

/** Schema for {@link ISdStargateBakeDataCommandDto} */
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
        output: {
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
        parameters: {
            type: 'object', 
            patternProperties: {
                '.*': { type: 'string' },
            },
       }
    },
    required: ['model', 'output', 'parameters'],
    additionalProperties: true,
}
/** Schema for {@link ISdStargateBakeDataReplyDto} */
const schemaReplyDto = {
    type: 'object',
    properties: {
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

export abstract class SdBakeDataCommandValidator extends SdBaseValidator {

    private static validateCommandDto = ajv.compile(schemaCommandDto)
    private static validateReplyDto = ajv.compile(schemaReplyDto)

    static assertCommandDto (data: unknown): asserts data is ISdStargateBakeDataCommandDto {
        return this.validate(this.validateCommandDto, data)
    }

    static assertReplyDto (data: unknown): asserts data is ISdStargateBakeDataReplyDto {
        return this.validate(this.validateReplyDto, data)
    }

}
