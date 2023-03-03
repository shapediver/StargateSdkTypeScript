import {
    ISdStargateGetDataCommandDto,
    ISdStargateGetDataReplyDto,
    SdStargateError,
} from "../../src"
import { SdGetDataCommandValidator } from "../../src/validators/commands/SdGetDataCommandValidator"

describe("validate get data command", function () {

    describe("command dto", function () {

        test("full", () => {
            let data: Required<ISdStargateGetDataCommandDto> = {
                model: { id: "123"},
                parameter: { id: "xyz"}
            }
            SdGetDataCommandValidator.assertGetDataCommandDto(data)
        })

        test("model id missing", () => {
            try {
                let data = {
                    model: { foo: "123"},
                    parameter: { id: "xyz"}
                }
                SdGetDataCommandValidator.assertGetDataCommandDto(data)
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
                SdGetDataCommandValidator.assertGetDataCommandDto(data)
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
                SdGetDataCommandValidator.assertGetDataCommandDto(data)
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
                SdGetDataCommandValidator.assertGetDataCommandDto(data)
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
                    count: 1
                }
            }
            SdGetDataCommandValidator.assertGetDataReplyDto(data)
        })

        test("required", () => {
            let data: Required<ISdStargateGetDataReplyDto> = {
                asset: {
                    id: "1"  
                },
                info: {
                    count: 1
                }
            }
            SdGetDataCommandValidator.assertGetDataReplyDto(data)
        })

        test("asset id missing", () => {
            try {
                let data = {
                    asset: {
                        foo: "1"  
                    },
                    info: {
                        count: 1
                    }
                }
                SdGetDataCommandValidator.assertGetDataReplyDto(data)
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
                        count: 1
                    }
                }
                SdGetDataCommandValidator.assertGetDataReplyDto(data)
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
                SdGetDataCommandValidator.assertGetDataReplyDto(data)
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
                        count: 'x'
                    }
                }
                SdGetDataCommandValidator.assertGetDataReplyDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })

    })

})

