import {
    ISdStargatePrepareModelCommandDto,
    ISdStargatePrepareModelReplyDto,
    SdStargateError,
} from "../../src"
import { ISdStargatePrepareModelResultEnum } from "../../src/dto/commands/prepareModelCommand"
import { SdPrepareModelCommandValidator } from "../../src/validators/commands/SdPrepareModelCommandValidator"

describe("validate get data command", function () {

    describe("command dto", function () {

        /**
         * Has model in command dto, which holds property id. Must be true, since those are schema requirments.
         */
        test("full", () => {
            let data: Required<ISdStargatePrepareModelCommandDto> = {
                model: { id: "123"},
            }
            SdPrepareModelCommandValidator.assertCommandDto(data)
        })

        /**
         * Model id is missing in model of command dto, must be false, model id is required by schema.
         */
        test("model id missing", () => {
            try {
                let data = {
                    model: { foo: "123"},
                 }
                SdPrepareModelCommandValidator.assertCommandDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })

        /**
         * Model is missing in command, must be false, model is required.
         */
        test("model missing", () => {
            try {
                let data = {
                }
                SdPrepareModelCommandValidator.assertCommandDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })
    })

    describe("reply dto", function () {

        /**
         * Both result and optional message are present, must be true.
         */
        test("full", () => {
            let data: Required<ISdStargatePrepareModelReplyDto> = {
                info: {
                    message: "foo",
                    result: ISdStargatePrepareModelResultEnum.SUCCESS
                }
            }
            SdPrepareModelCommandValidator.assertReplyDto(data)
        })

        /**
         * Validate if it passes without message (message is optional)
         */
        test("message missing", () => {
            let data: Required<ISdStargatePrepareModelReplyDto> = {
                info: {
                    result: ISdStargatePrepareModelResultEnum.SUCCESS
                }
            }
            SdPrepareModelCommandValidator.assertReplyDto(data)
        })

        /**
         * Info missing in payload response, must result in exception.
         */
        test("info missing", () => {
            try {
                let data = {
                }
                SdPrepareModelCommandValidator.assertReplyDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })

        
        /**
         * Result missing in info of payload response, must result in exception.
         */
        test("info missing", () => {
            try {
                let data = {
                    info: {
                        message: "foo"
                    }
                }
                SdPrepareModelCommandValidator.assertReplyDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })
    })

})

