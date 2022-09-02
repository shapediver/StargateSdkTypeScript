import {
    ISdStargateDummyAckReplyExampleCommandDto,
    ISdStargateDummyAckReplyExampleReplyDto,
    ISdStargateDummyBatchReplyExampleCommandDto, ISdStargateDummyBatchReplyExampleReplyDto,
    ISdStargateDummyNoReplyExampleCommandDto,
    ISdStargateDummyNoReplyExampleReplyDto,
} from "../../src"
import { SdDummyCommandValidator } from "../../src/validators/commands/SdDummyCommandValidator"

describe("validate no-reply example", function () {

    describe("command dto", function () {

        test("full", () => {
            let data: Required<ISdStargateDummyNoReplyExampleCommandDto> = {
                text: "foobar"
            }
            SdDummyCommandValidator.isNoReplyExampleCommandDto(data)
        })

    })

    describe("reply dto", function () {

        test("full", () => {
            let data: Required<ISdStargateDummyNoReplyExampleReplyDto> = {}
            SdDummyCommandValidator.isNoReplyExampleReplyDto(data)
        })

    })

})

describe("validate ack-reply example", function () {

    describe("command dto", function () {

        test("full", () => {
            let data: Required<ISdStargateDummyAckReplyExampleCommandDto> = {
                text: "foobar"
            }
            SdDummyCommandValidator.isAckReplyExampleCommandDto(data)
        })

    })

    describe("reply dto", function () {

        test("full", () => {
            let data: Required<ISdStargateDummyAckReplyExampleReplyDto> = {}
            SdDummyCommandValidator.isAckReplyExampleReplyDto(data)
        })

    })

})

describe("validate batch-reply example", function () {

    describe("command dto", function () {

        test("full", () => {
            let data: Required<ISdStargateDummyBatchReplyExampleCommandDto> = {}
            SdDummyCommandValidator.isBatchReplyExampleCommandDto(data)
        })

    })

    describe("reply dto", function () {

        test("full", () => {
            let data: Required<ISdStargateDummyBatchReplyExampleReplyDto> = {
                mesh: "foobar",
                visible: false,
            }
            SdDummyCommandValidator.isBatchReplyExampleReplyDto(data)
        })

    })

})
