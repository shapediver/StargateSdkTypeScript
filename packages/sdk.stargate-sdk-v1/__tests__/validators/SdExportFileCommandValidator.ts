import {
    ISdStargateExportFileCommandDto,
    ISdStargateExportFileReplyDto,
    SdStargateError,
    ISdStargateExportFileResultEnum,
} from '../../src';
import { SdExportFileCommandValidator } from '../../src/validators/commands/SdExportFileCommandValidator';

describe('validate export file command', function () {
    describe('command dto', function () {
        test('full', () => {
            const data: Required<ISdStargateExportFileCommandDto> = {
                model: { id: '123' },
                parameters: { id: 'xyz' },
                export: { id: 'abc', index: 3 },
            };
            SdExportFileCommandValidator.assertCommandDto(data);
        });

        test('minimum', () => {
            const data: ISdStargateExportFileCommandDto = {
                model: { id: '123' },
                parameters: {},
                export: { id: 'abc', index: 3 },
            };
            SdExportFileCommandValidator.assertCommandDto(data);
        });

        test('parameters missing', () => {
            try {
                const data = {
                    model: { id: '123' },
                    export: { id: 'abc', index: 3 },
                };
                SdExportFileCommandValidator.assertCommandDto(data);
                expect(true).toBeFalsy();
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy();
            }
        });

        test('model id missing', () => {
            try {
                const data = {
                    model: {},
                    parameters: {},
                    export: { id: 'abc', index: 3 },
                };
                SdExportFileCommandValidator.assertCommandDto(data);
                expect(true).toBeFalsy();
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy();
            }
        });

        test('model missing', () => {
            try {
                const data = {
                    parameters: {},
                    export: { id: 'abc', index: 3 },
                };
                SdExportFileCommandValidator.assertCommandDto(data);
                expect(true).toBeFalsy();
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy();
            }
        });

        test('export id missing', () => {
            try {
                const data = {
                    model: { id: 'abc' },
                    parameters: {},
                    export: { index: 3 },
                };
                SdExportFileCommandValidator.assertCommandDto(data);
                expect(true).toBeFalsy();
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy();
            }
        });

        test('export index missing', () => {
            try {
                const data = {
                    model: { id: 'abc' },
                    parameters: {},
                    export: { id: 'abc' },
                };
                SdExportFileCommandValidator.assertCommandDto(data);
                expect(true).toBeFalsy();
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy();
            }
        });

        test('export missing', () => {
            try {
                const data = {
                    model: { id: 'abc' },
                    parameters: {},
                };
                SdExportFileCommandValidator.assertCommandDto(data);
                expect(true).toBeFalsy();
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy();
            }
        });

        test('param value no string', () => {
            try {
                const data = {
                    model: { id: 'abc' },
                    parameters: { paramId: 1 },
                    export: { id: 'abc' },
                };
                SdExportFileCommandValidator.assertCommandDto(data);
                expect(true).toBeFalsy();
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy();
            }
        });
    });

    describe('reply dto', function () {
        test('full', () => {
            const data: Required<ISdStargateExportFileReplyDto> = {
                info: {
                    result: ISdStargateExportFileResultEnum.SUCCESS,
                    message: 'foo',
                },
            };
            SdExportFileCommandValidator.assertReplyDto(data);
        });

        test('info without message', () => {
            const data: Required<ISdStargateExportFileReplyDto> = {
                info: {
                    result: ISdStargateExportFileResultEnum.SUCCESS,
                },
            };
            SdExportFileCommandValidator.assertReplyDto(data);
        });

        test('info missing', () => {
            try {
                const data = {};
                SdExportFileCommandValidator.assertReplyDto(data);
                expect(true).toBeFalsy();
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy();
            }
        });

        test('result missing', () => {
            try {
                const data = {
                    info: {
                        message: 'foo',
                    },
                };
                SdExportFileCommandValidator.assertReplyDto(data);
                expect(true).toBeFalsy();
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy();
            }
        });

        test('result wrong type', () => {
            try {
                const data = {
                    info: {
                        result: 'foo',
                    },
                };
                SdExportFileCommandValidator.assertReplyDto(data);
                expect(true).toBeFalsy();
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy();
            }
        });
    });
});
