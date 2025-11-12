import { SdStargateCoreErrorTypes } from '@shapediver/sdk.stargate-sdk-core';
import { SdStargateErrorTypes } from '../../src';
import { SdWebSocketCommander } from '../../src/commander/SdWebSocketCommander';

describe('mapRejectToError', function () {
    test('valid, core-reject object; should return error of respective type', () => {
        const res = SdWebSocketCommander.mapRejectToError([
            SdStargateCoreErrorTypes.ServiceUnavailable,
            'foobar',
        ]);
        expect(res.type).toBe(SdStargateErrorTypes.ServiceUnavailable);
        expect(res.message).toBe('foobar');
    });

    test('invalid, empty array; should return error of generic-client-error type', () => {
        const res = SdWebSocketCommander.mapRejectToError([]);
        expect(res.type).toBe(SdStargateErrorTypes.GenericClientError);
        expect(res.message).toBe('Unknown error message of promise-reject.');
    });

    test('invalid, string; should return error of generic-client-error type', () => {
        const res = SdWebSocketCommander.mapRejectToError('foobar');
        expect(res.type).toBe(SdStargateErrorTypes.GenericClientError);
        expect(res.message).toBe('foobar');
    });
});
