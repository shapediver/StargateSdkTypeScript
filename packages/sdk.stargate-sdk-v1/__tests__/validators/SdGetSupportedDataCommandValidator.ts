import {
    ISdStargateGetSupportedDataCommandDto,
    ISdStargateGetSupportedDataReplyDto,
    SdStargateError,
} from "../../src"
import { SdGetSupportedDataCommandValidator } from "../../src/validators/commands/SdGetSupportedDataCommandValidator"

describe("validate get supported data command", function () {

    describe("command dto", function () {

        test("full", () => {
            let data: Required<ISdStargateGetSupportedDataCommandDto> = {
                
            }
            SdGetSupportedDataCommandValidator.assertGetSupportedDataCommandDto(data)
        })
     
    })

    describe("reply dto", function () {

        test("full", () => {
            let data: Required<ISdStargateGetSupportedDataReplyDto> = {
                parameterTypes: ['foo', 'bar']
            }
            SdGetSupportedDataCommandValidator.assertGetSupportedDataReplyDto(data)
        })

        test("invalid parameter type", () => {
            try {
                let data = {
                    parameterTypes: [ 1 ]
                }
                SdGetSupportedDataCommandValidator.assertGetSupportedDataReplyDto(data)
                expect(true).toBeFalsy()
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy()
            }
        })

    })

})

