import { ISdCommandPayload } from "../../src/dto/commands/commandPayload"
import { SdCommandPayloadValidator } from "../../src/validators/commands/SdCommandPayloadValidator"

describe("validate command payload", function () {

    test("minimal", () => {
        let data: ISdCommandPayload = {
            sender: "123",
            command: "cmd",
            data: { foo: "bar" },
        }
        SdCommandPayloadValidator.isCommandPayload(data)
    })

    test("full", () => {
        let data: Required<ISdCommandPayload> = {
            sender: "123",
            response: {
                type: "ACK",
                topic: "abc",
            },
            command: "cmd",
            data: { foo: "bar" },
        }
        SdCommandPayloadValidator.isCommandPayload(data)
    })

})
