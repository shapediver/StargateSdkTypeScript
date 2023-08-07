import { ISdStargateGetDataCommandDto, ISdStargateGetDataReplyDto } from "../../dto/commands/getDataCommand"
import { SdBaseValidator } from "../SdBaseValidator"

/** Schema for {@link ISdStargateGetDataCommandDto} */
const schemaCommandDto = {
    type: "object",
    properties: {
        model: {
            type: "object",
            properties: {
                id: { type: "string" },
            },
            required: [ "id" ],
            additionalProperties: true,
        },
        parameter: {
            type: "object",
            properties: {
                id: { type: "string" },
            },
            required: [ "id" ],
            additionalProperties: true,
        },
    },
    required: [ "model", "parameter" ],
    additionalProperties: true,
}
/** Schema for {@link ISdStargateGetDataReplyDto} */
const schemaReplyDto = {
    type: "object",
    properties: {
        asset: {
            type: "object",
            properties: {
                id: { type: "string" },
                chunk: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                    },
                    additionalProperties: true,
                },
            },
            required: [ "id" ],
            additionalProperties: true,
        },
        info: {
            type: "object",
            properties: {
                count: { type: "number" },
                result: { enum: [ "success", "cancel", "nothing", "failure" ] },
                message: { type: "string" , nullable: true },
            },
            required: [ "count", "result" ],
            additionalProperties: true,
        },
    },
    required: [ "info" ],
    additionalProperties: true,
}

export abstract class SdGetDataCommandValidator extends SdBaseValidator {

    static assertCommandDto (data: unknown): asserts data is ISdStargateGetDataCommandDto {
        return this.assertValid(data, schemaCommandDto)
    }

    static assertReplyDto (data: unknown): asserts data is ISdStargateGetDataReplyDto {
        return this.assertValid(data, schemaReplyDto)
    }

}
