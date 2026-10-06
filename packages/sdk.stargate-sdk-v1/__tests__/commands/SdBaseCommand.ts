import { SdBaseCommand } from '../../src/commands/SdBaseCommand';
import { SdCommandRegister } from '../../src/commands/SdCommandRegister';
import {
    ISdCommandOkReplyPayload,
    ISdCommandPayload,
    ISdCommandRequestPayload,
} from '../../src/dto/commands/commandPayload';
import { SdStargateSdk } from '../../src/sdk/SdStargateSdk';

/** A dummy class that enables us to test the abstract class {@link SdBaseCommand}. */
class TestableSdBaseCommand extends SdBaseCommand {
    protected identifier: string = 'TESTABLE';

    constructor() {
        // @formatter:off
        const sdk = new SdStargateSdk(
            'foobar',
            () => {},
            () => {},
            () => {}
        );
        // @formatter:on

        super(sdk); // We mock every call anyway
    }

    isSupported(_payload: ISdCommandPayload): boolean {
        return false;
    }

    processCommandMessage(_payload: ISdCommandRequestPayload): Promise<void> {
        return Promise.resolve(undefined);
    }

    processOkReplyMessage(_payload: ISdCommandOkReplyPayload): void {}

    testableSendCommand(responseType?: 'ACK' | 'BATCH') {
        return this.sendCommand({}, [], 'foobar', responseType, undefined);
    }
}

const command = new TestableSdBaseCommand();

describe('sendCommand', function () {
    let origRegisterCommand: SdCommandRegister['registerCommand'];
    let origRejectCommand: SdCommandRegister['rejectCommand'];
    let origForwardMessage: SdStargateSdk['forwardMessage'];

    beforeAll(() => {
        origRegisterCommand = SdCommandRegister.prototype.registerCommand;
        origRejectCommand = SdCommandRegister.prototype.rejectCommand;
        origForwardMessage = SdStargateSdk.prototype.forwardMessage;
    });

    afterAll(() => {
        SdCommandRegister.prototype.registerCommand = origRegisterCommand;
        SdCommandRegister.prototype.rejectCommand = origRejectCommand;
        SdStargateSdk.prototype.forwardMessage = origForwardMessage;
    });

    beforeEach(() => {
        SdCommandRegister.prototype.registerCommand = jest.fn(() => {
            return Promise.reject(new Error('SdCommandRegister.registerCommand should not be called!'));
        });
        SdCommandRegister.prototype.rejectCommand = jest.fn(() => {});
        SdStargateSdk.prototype.forwardMessage = jest.fn(() => {
            return Promise.reject(new Error('SdStargateSdk.forwardMessage should not be called!'));
        });
    });

    test('no response expected, forwardMessage succeeds; should not register command and resolve', async () => {
        SdStargateSdk.prototype.forwardMessage = jest.fn(() => Promise.resolve());

        await command.testableSendCommand();
    });

    test('response expected, forwardMessage succeeds; should register command and resolve', async () => {
        let spyRegisterCommand = false;

        SdCommandRegister.prototype.registerCommand = jest.fn(() => {
            spyRegisterCommand = true;
            return Promise.resolve([]);
        });
        SdStargateSdk.prototype.forwardMessage = jest.fn(() => Promise.resolve());

        await command.testableSendCommand('ACK');

        expect(spyRegisterCommand).toBeTruthy();
    });

    test('no response expected, forwardMessage throws; should not register or unregister command and reject', async () => {
        SdStargateSdk.prototype.forwardMessage = jest.fn(() => {
            return Promise.reject(new Error('Intended error'));
        });

        await expect(command.testableSendCommand()).rejects.toThrow();
    });

    test('response expected, forwardMessage throws; should register command, unregister command and resolve', async () => {
        let spyRegisterCommand = false;
        let spyRejectCommand = false;

        SdCommandRegister.prototype.registerCommand = jest.fn(() => {
            spyRegisterCommand = true;
            return Promise.resolve([]);
        });
        SdCommandRegister.prototype.rejectCommand = jest.fn(() => {
            spyRejectCommand = true;
        });
        SdStargateSdk.prototype.forwardMessage = jest.fn(() => {
            return Promise.reject(new Error('Intended error'));
        });

        await expect(command.testableSendCommand('ACK')).rejects.toThrow();

        expect(spyRegisterCommand).toBeTruthy();
        expect(spyRejectCommand).toBeTruthy();
    });
});
