import Ajv from "ajv"
import {
    ISdStargateDummyAckReplyExampleCommandDto,
    ISdStargateDummyAckReplyExampleReplyDto,
    ISdStargateDummyBatchReplyExampleCommandDto,
    ISdStargateDummyBatchReplyExampleReplyDto,
    ISdStargateDummyNoReplyExampleCommandDto,
    ISdStargateDummyNoReplyExampleReplyDto,
} from "../../dto/commands/dummyCommand"
import { SdBaseValidator } from "../SdBaseValidator"

const ajv = new Ajv()

/** Schema for {@link ISdStargateDummyNoReplyExampleCommandDto} */
const schemaNoReplyExampleCommandDto = {
    type: "object",
    properties: {
        text: { type: "string" },
    },
    required: [ "text" ],
    additionalProperties: true,
}
/** Schema for {@link ISdStargateDummyNoReplyExampleReplyDto} */
const schemaNoReplyExampleReplyDto = {
    type: "object",
    properties: {},
    required: [],
    additionalProperties: true,
}

/** Schema for {@link ISdStargateDummyAckReplyExampleCommandDto} */
const schemaAckReplyExampleCommandDto = {
    type: "object",
    properties: {},
    required: [],
    additionalProperties: true,
}
/** Schema for {@link ISdStargateDummyAckReplyExampleReplyDto} */
const schemaAckReplyExampleReplyDto = {
    type: "object",
    properties: {},
    required: [],
    additionalProperties: true,
}

/** Schema for {@link ISdStargateDummyBatchReplyExampleCommandDto} */
const schemaBatchReplyExampleCommandDto = {
    type: "object",
    properties: {},
    required: [],
    additionalProperties: true,
}
/** Schema for {@link ISdStargateDummyBatchReplyExampleReplyDto} */
const schemaBatchReplyExampleReplyDto = {
    type: "object",
    properties: {
        mesh: { type: "string" },
        visible: { type: "boolean" },
    },
    required: [ "mesh", "visible" ],
    additionalProperties: true,
}

export abstract class SdDummyCommandValidator extends SdBaseValidator {

    private static validateNoReplyExampleCommandDto = ajv.compile(schemaNoReplyExampleCommandDto)
    private static validateNoReplyExampleReplyDto = ajv.compile(schemaNoReplyExampleReplyDto)

    private static validateAckReplyExampleCommandDto = ajv.compile(schemaAckReplyExampleCommandDto)
    private static validateAckReplyExampleReplyDto = ajv.compile(schemaAckReplyExampleReplyDto)

    private static validateBatchReplyExampleCommandDto = ajv.compile(schemaBatchReplyExampleCommandDto)
    private static validateBatchReplyExampleReplyDto = ajv.compile(schemaBatchReplyExampleReplyDto)

    static assertNoReplyExampleCommandDto (data: unknown): asserts data is ISdStargateDummyNoReplyExampleCommandDto {
        return this.validate(this.validateNoReplyExampleCommandDto, data)
    }

    static assertNoReplyExampleReplyDto (data: unknown): asserts data is ISdStargateDummyNoReplyExampleReplyDto {
        return this.validate(this.validateNoReplyExampleReplyDto, data)
    }

    static assertAckReplyExampleCommandDto (data: unknown): asserts data is ISdStargateDummyAckReplyExampleCommandDto {
        return this.validate(this.validateAckReplyExampleCommandDto, data)
    }

    static assertAckReplyExampleReplyDto (data: unknown): asserts data is ISdStargateDummyAckReplyExampleReplyDto {
        return this.validate(this.validateAckReplyExampleReplyDto, data)
    }

    static assertBatchReplyExampleCommandDto (data: unknown): asserts data is ISdStargateDummyBatchReplyExampleCommandDto {
        return this.validate(this.validateBatchReplyExampleCommandDto, data)
    }

    static assertBatchReplyExampleReplyDto (data: unknown): asserts data is ISdStargateDummyBatchReplyExampleReplyDto {
        return this.validate(this.validateBatchReplyExampleReplyDto, data)
    }

}
