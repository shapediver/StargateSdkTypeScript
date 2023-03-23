import {
    ISdStargateDummyAckReplyExampleCommandDto,
    ISdStargateDummyAckReplyExampleReplyDto,
    ISdStargateDummyBatchReplyExampleCommandDto,
    ISdStargateDummyBatchReplyExampleReplyDto,
    ISdStargateDummyNoReplyExampleCommandDto,
    ISdStargateDummyNoReplyExampleReplyDto,
} from "../../dto/commands/dummyCommand"
import { SdBaseValidator } from "../SdBaseValidator"

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

    static assertNoReplyExampleCommandDto (data: unknown): asserts data is ISdStargateDummyNoReplyExampleCommandDto {
        return this.assertValid(data, schemaNoReplyExampleCommandDto)
    }

    static assertNoReplyExampleReplyDto (data: unknown): asserts data is ISdStargateDummyNoReplyExampleReplyDto {
        return this.assertValid(data, schemaNoReplyExampleReplyDto)
    }

    static assertAckReplyExampleCommandDto (data: unknown): asserts data is ISdStargateDummyAckReplyExampleCommandDto {
        return this.assertValid(data, schemaAckReplyExampleCommandDto)
    }

    static assertAckReplyExampleReplyDto (data: unknown): asserts data is ISdStargateDummyAckReplyExampleReplyDto {
        return this.assertValid(data, schemaAckReplyExampleReplyDto)
    }

    static assertBatchReplyExampleCommandDto (data: unknown): asserts data is ISdStargateDummyBatchReplyExampleCommandDto {
        return this.assertValid(data, schemaBatchReplyExampleCommandDto)
    }

    static assertBatchReplyExampleReplyDto (data: unknown): asserts data is ISdStargateDummyBatchReplyExampleReplyDto {
        return this.assertValid(data, schemaBatchReplyExampleReplyDto)
    }

}
