import {
    ISdStargatePrepareModelCommandDto,
    ISdStargatePrepareModelReplyDto,
} from '../../dto/commands/prepareModelCommand';
import { SdBaseValidator } from '../SdBaseValidator';

/** Schema for {@link ISdStargatePrepareModelCommandDto} */
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
    },
    required: ['model'],
    additionalProperties: true,
};
/** Schema for {@link ISdStargatePrepareModelReplyDto} */
const schemaReplyDto = {
    type: 'object',
    properties: {
        info: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                result: { enum: ['success', 'failure'] },
            },
            required: ['result'],
            additionalProperties: true,
        },
    },
    required: ['info'],
    additionalProperties: true,
};

export abstract class SdPrepareModelCommandValidator extends SdBaseValidator {
    static assertCommandDto(data: unknown): asserts data is ISdStargatePrepareModelCommandDto {
        this.assertValid(data, schemaCommandDto);
    }

    static assertReplyDto(data: unknown): asserts data is ISdStargatePrepareModelReplyDto {
        this.assertValid(data, schemaReplyDto);
    }
}
