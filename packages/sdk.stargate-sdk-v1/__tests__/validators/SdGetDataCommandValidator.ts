import {
    ISdStargateGetDataCommandDto,
    ISdStargateGetDataReplyDto,
    SdStargateError,
} from "../../src"
import { ISdStargateGetDataResultEnum } from "../../src/dto/commands/getDataCommand"
import { SdGetDataCommandValidator } from "../../src/validators/commands/SdGetDataCommandValidator"

describe("validate get data command", function () {

    describe("command dto", function () {

        test("full", () => {
            let data: Required<ISdStargateGetDataCommandDto> = {
                model: { id: "123"},
                parameter: { id: "xyz"}
            }
            SdGetDataCommandValidator.assertCommandDto(data)
        })

        test("model id missing", () => {
            try {
                let data = {
                    model: { foo: "123"},
                    parameter: { id: "xyz"}
                }
                SdGetDataCommandValidator.assertCommandDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })

        test("parameter id missing", () => {
            try {
                let data = {
                    model: { id: "123"},
                    parameter: { foo: "xyz"}
                }
                SdGetDataCommandValidator.assertCommandDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })

        test("model missing", () => {
            try {
                let data = {
                    parameter: { id: "xyz"}
                }
                SdGetDataCommandValidator.assertCommandDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })

        test("parameter missing", () => {
            try {
                let data = {
                    model: { id: "123"}
                }
                SdGetDataCommandValidator.assertCommandDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })
    })

    describe("reply dto", function () {

        test("full", () => {
            let data: Required<ISdStargateGetDataReplyDto> = {
                asset: {
                    id: "1",
                    chunk: {
                        id: "123",
                        name: "abc"
                    }
                },
                info: {
                    count: 1,
                    result: ISdStargateGetDataResultEnum.SUCCESS,
                    message: "foo"
                }
            }
            SdGetDataCommandValidator.assertReplyDto(data)
        })

        test("min asset", () => {
            let data: Required<ISdStargateGetDataReplyDto> = {
                asset: {
                    id: "1"  
                },
                info: {
                    count: 1,
                    result: ISdStargateGetDataResultEnum.SUCCESS
                }
            }
            SdGetDataCommandValidator.assertReplyDto(data)
        })

        test("required", () => {
            let data: ISdStargateGetDataReplyDto = {
                info: {
                    count: 1,
                    result: ISdStargateGetDataResultEnum.SUCCESS
                }
            }
            SdGetDataCommandValidator.assertReplyDto(data)
        })

        test("asset id missing", () => {
            try {
                let data = {
                    asset: {
                        foo: "1"  
                    },
                    info: {
                        count: 1,
                        result: ISdStargateGetDataResultEnum.SUCCESS
                    }
                }
                SdGetDataCommandValidator.assertReplyDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })

        test("chunk id wrong", () => {
            try {
                let data = {
                    asset: {
                        id: "1",
                        chunk: { "id": false }
                    },
                    info: {
                        count: 1,
                        result: ISdStargateGetDataResultEnum.SUCCESS
                    }
                }
                SdGetDataCommandValidator.assertReplyDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })

        test("info missing", () => {
            try {
                let data = {
                    asset: {
                        id: "1",
                    }
                }
                SdGetDataCommandValidator.assertReplyDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })

        test("info count wrong", () => {
            try {
                let data = {
                    asset: {
                        id: "1",
                    },
                    info: {
                        count: 'x',
                        result: ISdStargateGetDataResultEnum.SUCCESS
                    }
                }
                SdGetDataCommandValidator.assertReplyDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })

        test("info result wrong", () => {
            try {
                let data = {
                    asset: {
                        id: "1",
                    },
                    info: {
                        count: 1,
                        result: 'x'
                    }
                }
                SdGetDataCommandValidator.assertReplyDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })

        test("info with message", () => {
            let data: ISdStargateGetDataReplyDto = {
                info: {
                    count: 1,
                    result: ISdStargateGetDataResultEnum.SUCCESS,
                    message: "foo"
                }
            }
            SdGetDataCommandValidator.assertReplyDto(data)
        })

    })

})

