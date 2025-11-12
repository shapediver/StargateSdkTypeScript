import {
    ISdStargateBakeDataCommandDto,
    ISdStargateBakeDataReplyDto,
} from '../../dto/commands/bakeDataCommand';
import { SdBaseValidator } from '../SdBaseValidator';

/** Schema for {@link ISdStargateBakeDataCommandDto} */
const schemaCommandDto = {
    type: 'object',
    properties: {
        model: {
            type: 'object',
            properties: {
                id: { type: 'string' },
            },
            required: ['id'],
            additionalProperties: true,
        },
        output: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                chunk: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                    },
                    additionalProperties: true,
                },
            },
            required: ['id'],
            additionalProperties: true,
        },
        parameters: {
            type: 'object',
            patternProperties: {
                '.*': { type: 'string' },
            },
        },
    },
    required: ['model', 'output', 'parameters'],
    additionalProperties: true,
};
/** Schema for {@link ISdStargateBakeDataReplyDto} */
const schemaReplyDto = {
    type: 'object',
    properties: {
        info: {
            type: 'object',
            properties: {
                count: { type: 'number' },
                result: { enum: ['success', 'cancel', 'nothing', 'failure'] },
                message: { type: 'string' },
            },
            required: ['count', 'result'],
            additionalProperties: true,
        },
    },
    required: ['info'],
    additionalProperties: true,
};

export abstract class SdBakeDataCommandValidator extends SdBaseValidator {
    static assertCommandDto(data: unknown): asserts data is ISdStargateBakeDataCommandDto {
        return this.assertValid(data, schemaCommandDto);
    }

    static assertReplyDto(data: unknown): asserts data is ISdStargateBakeDataReplyDto {
        return this.assertValid(data, schemaReplyDto);
    }
}
