import Ajv from "ajv"
import {
    ISdCommandErrorReplyPayload,
    ISdCommandOkReplyPayload,
    ISdCommandRequestPayload,
} from "../../dto/commands/commandPayload"
import { SdBaseValidator } from "../SdBaseValidator"

const ajv = new Ajv()

/** Schema for {@link ISdCommandRequestPayload} */
const schemaCommandRequestPayload = {
    type: "object",
    properties: {
        /** This property is added by the Stargate backend service when a command is forwarded. */
        sender: { type: "string" },
        response: {
            type: "object",
            properties: {
                type: { enum: [ "ACK", "BATCH" ] },
                topic: { type: "string" },
            },
            required: [ "type", "topic" ],
            additionalProperties: true,
        },
        command: { type: "string" },
        data: { type: "object", additionalProperties: true },
    },
    required: [ "sender", "command", "data" ],
    additionalProperties: true,
}

/** Schema for {@link ISdCommandOkReplyPayload} */
const schemaCommandOkReplyPayload = {
    type: "object",
    properties: {
        /** This property is added by the Stargate backend service when a command is forwarded. */
        sender: { type: "string" },
        response: {
            type: "object",
            properties: {
                type: { enum: [ "REPLY" ] },
                topic: { type: "string" },
            },
            required: [ "type", "topic" ],
            additionalProperties: true,
        },
        command: { type: "string" },
        data: { type: "object", additionalProperties: true },
    },
    required: [ "sender", "response", "command", "data" ],
    additionalProperties: true,
}

/** Schema for {@link ISdCommandErrorReplyPayload} */
const schemaCommandErrorReplyPayload = {
    type: "object",
    properties: {
        /** This property is added by the Stargate backend service when a command is forwarded. */
        sender: { type: "string" },
        response: {
            type: "object",
            properties: {
                type: { enum: [ "REPLY" ] },
                topic: { type: "string" },
            },
            required: [ "type", "topic" ],
            additionalProperties: true,
        },
        command: { type: "string" },
        error: {
            type: "object",
            properties: {
                message: { type: "string" },
            },
            required: [ "message" ],
            additionalProperties: true,
        },
    },
    required: [ "sender", "response", "command", "error" ],
    additionalProperties: true,
}

export abstract class SdCommandPayloadValidator extends SdBaseValidator {

    private static validateCommandRequestPayload = ajv.compile(schemaCommandRequestPayload)
    private static validateCommandOkReplyPayload = ajv.compile(schemaCommandOkReplyPayload)
    private static validateCommandErrorReplyPayload = ajv.compile(schemaCommandErrorReplyPayload)

    static isCommandPayload (data: unknown): data is (ISdCommandRequestPayload | ISdCommandOkReplyPayload | ISdCommandErrorReplyPayload) {
        return this.isCommandRequestPayload(data) || this.isCommandOkReplyPayload(data) || this.isCommandErrorReplyPayload(data)
    }

    static isCommandRequestPayload (data: unknown): data is ISdCommandRequestPayload {
        return this.validateCommandRequestPayload(data)
    }

    static isCommandOkReplyPayload (data: unknown): data is ISdCommandOkReplyPayload {
        return this.validateCommandOkReplyPayload(data)
    }

    static isCommandErrorReplyPayload (data: unknown): data is ISdCommandErrorReplyPayload {
        return this.validateCommandErrorReplyPayload(data)
    }

}
