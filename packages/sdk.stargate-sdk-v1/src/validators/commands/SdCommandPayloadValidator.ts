import Ajv from "ajv"
import { ISdCommandPayload } from "../../dto/commands/commandPayload"
import { SdBaseValidator } from "../SdBaseValidator"

const ajv = new Ajv()

/** Schema for {@link ISdCommandPayload} */
const schemaCommandPayload = {
    type: "object",
    properties: {
        /** This property is added by the Stargate backend service when a command is forwarded. */
        sender: { type: "string" },
        response: {
            type: "object",
            properties: {
                type: { enum: [ "ACK", "BATCH", "REPLY" ] },
                topic: { type: "string" },
            },
            required: [ "type", "topic" ],
            additionalProperties: false,
        },
        command: { type: "string" },
        data: { type: "object", additionalProperties: true },
    },
    required: [ "sender", "command", "data" ],
    additionalProperties: true,
}

export abstract class SdCommandPayloadValidator extends SdBaseValidator {

    private static validateCommandPayload = ajv.compile(schemaCommandPayload)

    static isCommandPayload (data: unknown): asserts data is ISdCommandPayload {
        return this.validate(this.validateCommandPayload, data)
    }

}
