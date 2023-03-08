import {
    ISdStargateBakeDataCommandDto,
    ISdStargateBakeDataReplyDto,
    SdStargateError,
} from "../../src"
import { ISdStargateBakeDataResultEnum } from "../../src/dto/commands/bakeDataCommand"
import { SdBakeDataCommandValidator } from "../../src/validators/commands/SdBakeDataCommandValidator"

describe("validate bake data command", function () {

    describe("command dto", function () {

        test("full", () => {
            let data: Required<ISdStargateBakeDataCommandDto> = {
                model: { id: "123"},
                parameters: { id: "xyz"},
                output: { id: "abc", chunk: {id: "foo", name: "bar"}}
            }
            SdBakeDataCommandValidator.assertCommandDto(data)
        })

        test("minimum", () => {
            let data: ISdStargateBakeDataCommandDto = {
                model: { id: "123"},
                parameters: { },
                output: { id: "abc" }
            }
            SdBakeDataCommandValidator.assertCommandDto(data)
        })

        test("parameters missing", () => {
            try {
                let data = {
                    model: { id: "123"},
                    output: { id: "abc" }
                }
                SdBakeDataCommandValidator.assertCommandDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })

        test("model id missing", () => {
            try {
                let data = {
                    model: { },
                    parameters: { },
                    output: { id: "abc" }
                }
                SdBakeDataCommandValidator.assertCommandDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })

        test("model missing", () => {
            try {
                let data = {
                    parameters: { },
                    output: { id: "abc" }
                }
                SdBakeDataCommandValidator.assertCommandDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })

        test("output id missing", () => {
            try {
                let data = {
                    model: { id: "abc" },
                    parameters: { },
                    output: { }
                }
                SdBakeDataCommandValidator.assertCommandDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })

        test("output missing", () => {
            try {
                let data = {
                    model: { id: "abc" },
                    parameters: { },
                }
                SdBakeDataCommandValidator.assertCommandDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })

        test("param value no string", () => {
            try {
                let data = {
                    model: { id: "abc" },
                    parameters: { paramId: 1 },
                    output: { id: "abc" }
                }
                SdBakeDataCommandValidator.assertCommandDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })

    })

    describe("reply dto", function () {

        test("full", () => {
            let data: Required<ISdStargateBakeDataReplyDto> = {
                info: {
                    count: 1,
                    result: ISdStargateBakeDataResultEnum.SUCCESS
                }
            }
            SdBakeDataCommandValidator.assertReplyDto(data)
        })

        test("info missing", () => {
            try {
                let data = {
                    
                }
                SdBakeDataCommandValidator.assertReplyDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })

        test("count missing", () => {
            try {
                let data = {
                    info: {
                        result: ISdStargateBakeDataResultEnum.SUCCESS
                    }
                }
                SdBakeDataCommandValidator.assertReplyDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })

        test("result missing", () => {
            try {
                let data = {
                    info: {
                        count: 1,
                    }
                }
                SdBakeDataCommandValidator.assertReplyDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })

        test("result wrong type", () => {
            try {
                let data = {
                    info: {
                        count: 1,
                        result: 'foo'
                    }
                }
                SdBakeDataCommandValidator.assertReplyDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })

        test("count wrong type", () => {
            try {
                let data = {
                    info: {
                        count: false,
                        result: ISdStargateBakeDataResultEnum.SUCCESS
                    }
                }
                SdBakeDataCommandValidator.assertReplyDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })

    })

})

