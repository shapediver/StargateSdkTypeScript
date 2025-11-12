import {
    ISdCommandErrorReplyPayload,
    ISdCommandOkReplyPayload,
    ISdCommandRequestPayload,
} from '../../src/dto/commands/commandPayload';
import { SdCommandPayloadValidator } from '../../src/validators/commands/SdCommandPayloadValidator';

describe('command request payload', function () {
    test('minimal', () => {
        let data: ISdCommandRequestPayload = {
            sender: '123',
            command: 'cmd',
            data: { foo: 'bar' },
        };
        expect(SdCommandPayloadValidator.isCommandRequestPayload(data)).toBeTruthy();
        expect(SdCommandPayloadValidator.isCommandOkReplyPayload(data)).toBeFalsy();
        expect(SdCommandPayloadValidator.isCommandErrorReplyPayload(data)).toBeFalsy();
    });

    test('full - acknowledge type', () => {
        let data: Required<ISdCommandRequestPayload> = {
            sender: '123',
            response: {
                type: 'ACK',
                topic: 'abc',
            },
            command: 'cmd',
            data: { foo: 'bar' },
        };
        expect(SdCommandPayloadValidator.isCommandRequestPayload(data)).toBeTruthy();
        expect(SdCommandPayloadValidator.isCommandOkReplyPayload(data)).toBeFalsy();
        expect(SdCommandPayloadValidator.isCommandErrorReplyPayload(data)).toBeFalsy();
    });

    test('full - batch type', () => {
        let data: Required<ISdCommandRequestPayload> = {
            sender: '123',
            response: {
                type: 'BATCH',
                topic: 'abc',
            },
            command: 'cmd',
            data: { foo: 'bar' },
        };
        expect(SdCommandPayloadValidator.isCommandRequestPayload(data)).toBeTruthy();
        expect(SdCommandPayloadValidator.isCommandOkReplyPayload(data)).toBeFalsy();
        expect(SdCommandPayloadValidator.isCommandErrorReplyPayload(data)).toBeFalsy();
    });
});

describe('command reply payload', function () {
    test('ok', () => {
        let data: Omit<Required<ISdCommandOkReplyPayload>, 'error'> = {
            sender: '123',
            response: {
                type: 'REPLY',
                topic: 'abc',
            },
            command: 'cmd',
            data: { foo: 'bar' },
        };
        expect(SdCommandPayloadValidator.isCommandRequestPayload(data)).toBeFalsy();
        expect(SdCommandPayloadValidator.isCommandOkReplyPayload(data)).toBeTruthy();
        expect(SdCommandPayloadValidator.isCommandErrorReplyPayload(data)).toBeFalsy();
    });

    test('error', () => {
        let data: Omit<Required<ISdCommandErrorReplyPayload>, 'data'> = {
            sender: '123',
            response: {
                type: 'REPLY',
                topic: 'abc',
            },
            command: 'cmd',
            error: { message: 'fail' },
        };
        expect(SdCommandPayloadValidator.isCommandRequestPayload(data)).toBeFalsy();
        expect(SdCommandPayloadValidator.isCommandOkReplyPayload(data)).toBeFalsy();
        expect(SdCommandPayloadValidator.isCommandErrorReplyPayload(data)).toBeTruthy();
    });
});
