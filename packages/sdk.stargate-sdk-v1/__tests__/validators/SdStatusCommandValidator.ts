import {
    ISdStargateStatusCommandDto,
    ISdStargateStatusReplyDto,
    SdStargateError,
} from '../../src';
import { SdStatusCommandValidator } from '../../src/validators/commands/SdStatusCommandValidator';

describe('validate status command', function () {
    describe('command dto', function () {
        test('full', () => {
            const data: Required<ISdStargateStatusCommandDto> = {};
            SdStatusCommandValidator.assertCommandDto(data);
        });
    });

    describe('reply dto', function () {
        test('full', () => {
            const data: Required<ISdStargateStatusReplyDto> = {
                firstActivity: 1,
                latestActivity: 2,
            };
            SdStatusCommandValidator.assertReplyDto(data);
        });

        test('missing firstActivity', () => {
            try {
                const data = {
                    latestActivity: 2,
                };
                SdStatusCommandValidator.assertReplyDto(data);
                expect(true).toBeFalsy();
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy();
            }
        });

        test('missing latestActivity', () => {
            try {
                const data = {
                    firstActivity: 2,
                };
                SdStatusCommandValidator.assertReplyDto(data);
                expect(true).toBeFalsy();
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy();
            }
        });
    });
});
