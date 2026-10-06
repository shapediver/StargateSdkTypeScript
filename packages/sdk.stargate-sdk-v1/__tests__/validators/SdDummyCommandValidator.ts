import {
    ISdStargateDummyAckReplyExampleCommandDto,
    ISdStargateDummyAckReplyExampleReplyDto,
    ISdStargateDummyBatchReplyExampleCommandDto,
    ISdStargateDummyBatchReplyExampleReplyDto,
    ISdStargateDummyNoReplyExampleCommandDto,
    ISdStargateDummyNoReplyExampleReplyDto,
} from '../../src';
import { SdDummyCommandValidator } from '../../src/validators/commands/SdDummyCommandValidator';

describe('validate no-reply example', function () {
    describe('command dto', function () {
        test('full', () => {
            const data: Required<ISdStargateDummyNoReplyExampleCommandDto> = {
                text: 'foobar',
            };
            SdDummyCommandValidator.assertNoReplyExampleCommandDto(data);
        });
    });

    describe('reply dto', function () {
        test('full', () => {
            const data: Required<ISdStargateDummyNoReplyExampleReplyDto> = {};
            SdDummyCommandValidator.assertNoReplyExampleReplyDto(data);
        });
    });
});

describe('validate ack-reply example', function () {
    describe('command dto', function () {
        test('full', () => {
            const data: Required<ISdStargateDummyAckReplyExampleCommandDto> = {
                text: 'foobar',
            };
            SdDummyCommandValidator.assertAckReplyExampleCommandDto(data);
        });
    });

    describe('reply dto', function () {
        test('full', () => {
            const data: Required<ISdStargateDummyAckReplyExampleReplyDto> = {};
            SdDummyCommandValidator.assertAckReplyExampleReplyDto(data);
        });
    });
});

describe('validate batch-reply example', function () {
    describe('command dto', function () {
        test('full', () => {
            const data: Required<ISdStargateDummyBatchReplyExampleCommandDto> = {};
            SdDummyCommandValidator.assertBatchReplyExampleCommandDto(data);
        });
    });

    describe('reply dto', function () {
        test('full', () => {
            const data: Required<ISdStargateDummyBatchReplyExampleReplyDto> = {
                mesh: 'foobar',
                visible: false,
            };
            SdDummyCommandValidator.assertBatchReplyExampleReplyDto(data);
        });
    });
});
