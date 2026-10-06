import {
    ISdStargateGetDataCommandDto,
    ISdStargateGetDataReplyDto,
    SdStargateError,
} from '../../src';
import { ISdStargateGetDataResultEnum } from '../../src/dto/commands/getDataCommand';
import { SdGetDataCommandValidator } from '../../src/validators/commands/SdGetDataCommandValidator';

describe('validate get data command', function () {
    describe('command dto', function () {
        test('full', () => {
            const data: Required<ISdStargateGetDataCommandDto> = {
                model: { id: '123' },
                parameter: { id: 'xyz' },
            };
            SdGetDataCommandValidator.assertCommandDto(data);
        });

        test('model id missing', () => {
            try {
                const data = {
                    model: { foo: '123' },
                    parameter: { id: 'xyz' },
                };
                SdGetDataCommandValidator.assertCommandDto(data);
                expect(true).toBeFalsy();
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy();
            }
        });

        test('parameter id missing', () => {
            try {
                const data = {
                    model: { id: '123' },
                    parameter: { foo: 'xyz' },
                };
                SdGetDataCommandValidator.assertCommandDto(data);
                expect(true).toBeFalsy();
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy();
            }
        });

        test('model missing', () => {
            try {
                const data = {
                    parameter: { id: 'xyz' },
                };
                SdGetDataCommandValidator.assertCommandDto(data);
                expect(true).toBeFalsy();
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy();
            }
        });

        test('parameter missing', () => {
            try {
                const data = {
                    model: { id: '123' },
                };
                SdGetDataCommandValidator.assertCommandDto(data);
                expect(true).toBeFalsy();
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy();
            }
        });
    });

    describe('reply dto', function () {
        test('full', () => {
            const data: Required<ISdStargateGetDataReplyDto> = {
                asset: {
                    id: '1',
                    chunk: {
                        id: '123',
                        name: 'abc',
                    },
                },
                info: {
                    count: 1,
                    result: ISdStargateGetDataResultEnum.SUCCESS,
                    message: 'foo',
                },
            };
            SdGetDataCommandValidator.assertReplyDto(data);
        });

        test('min asset', () => {
            const data: Required<ISdStargateGetDataReplyDto> = {
                asset: {
                    id: '1',
                },
                info: {
                    count: 1,
                    result: ISdStargateGetDataResultEnum.SUCCESS,
                },
            };
            SdGetDataCommandValidator.assertReplyDto(data);
        });

        test('required', () => {
            const data: ISdStargateGetDataReplyDto = {
                info: {
                    count: 1,
                    result: ISdStargateGetDataResultEnum.SUCCESS,
                },
            };
            SdGetDataCommandValidator.assertReplyDto(data);
        });

        test('asset id missing', () => {
            try {
                const data = {
                    asset: {
                        foo: '1',
                    },
                    info: {
                        count: 1,
                        result: ISdStargateGetDataResultEnum.SUCCESS,
                    },
                };
                SdGetDataCommandValidator.assertReplyDto(data);
                expect(true).toBeFalsy();
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy();
            }
        });

        test('chunk id wrong', () => {
            try {
                const data = {
                    asset: {
                        id: '1',
                        chunk: { id: false },
                    },
                    info: {
                        count: 1,
                        result: ISdStargateGetDataResultEnum.SUCCESS,
                    },
                };
                SdGetDataCommandValidator.assertReplyDto(data);
                expect(true).toBeFalsy();
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy();
            }
        });

        test('info missing', () => {
            try {
                const data = {
                    asset: {
                        id: '1',
                    },
                };
                SdGetDataCommandValidator.assertReplyDto(data);
                expect(true).toBeFalsy();
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy();
            }
        });

        test('info count wrong', () => {
            try {
                const data = {
                    asset: {
                        id: '1',
                    },
                    info: {
                        count: 'x',
                        result: ISdStargateGetDataResultEnum.SUCCESS,
                    },
                };
                SdGetDataCommandValidator.assertReplyDto(data);
                expect(true).toBeFalsy();
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy();
            }
        });

        test('info result wrong', () => {
            try {
                const data = {
                    asset: {
                        id: '1',
                    },
                    info: {
                        count: 1,
                        result: 'x',
                    },
                };
                SdGetDataCommandValidator.assertReplyDto(data);
                expect(true).toBeFalsy();
            } catch (e) {
                expect(e instanceof SdStargateError).toBeTruthy();
            }
        });

        test('info with message', () => {
            const data: ISdStargateGetDataReplyDto = {
                info: {
                    count: 1,
                    result: ISdStargateGetDataResultEnum.SUCCESS,
                    message: 'foo',
                },
            };
            SdGetDataCommandValidator.assertReplyDto(data);
        });
    });
});
