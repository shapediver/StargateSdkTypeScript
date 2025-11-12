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

    isSupported(payload: ISdCommandPayload): boolean {
        return false;
    }

    processCommandMessage(payload: ISdCommandRequestPayload): Promise<void> {
        return Promise.resolve(undefined);
    }

    processOkReplyMessage(payload: ISdCommandOkReplyPayload): void {}

    testableSendCommand(responseType?: 'ACK' | 'BATCH') {
        return this.sendCommand({}, [], 'foobar', responseType, undefined);
    }
}

const command = new TestableSdBaseCommand();

describe('sendCommand', function () {
    let origRegisterCommand: any, origRejectCommand: any, origForwardMessage: any;

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
        SdCommandRegister.prototype.registerCommand = jest.fn(async () => {
            throw new Error('SdCommandRegister.registerCommand should not be called!');
        });
        SdCommandRegister.prototype.rejectCommand = jest.fn(async () => {
            throw new Error('SdCommandRegister.rejectCommand should not be called!');
        });
        SdStargateSdk.prototype.forwardMessage = jest.fn(async () => {
            throw new Error('SdStargateSdk.forwardMessage should not be called!');
        });
    });

    test('no response expected, forwardMessage succeeds; should not register command and resolve', async () => {
        // Re-mock
        SdStargateSdk.prototype.forwardMessage = jest.fn(async () => Promise.resolve());

        await command.testableSendCommand();
    });

    test('response expected, forwardMessage succeeds; should register command and resolve', async () => {
        let spyRegisterCommand = false;

        // Mock sub-calls
        SdCommandRegister.prototype.registerCommand = jest.fn(async () => {
            spyRegisterCommand = true;
            return Promise.resolve([]);
        });
        SdStargateSdk.prototype.forwardMessage = jest.fn(async () => Promise.resolve());

        await command.testableSendCommand('ACK');

        expect(spyRegisterCommand).toBeTruthy();
    });

    test('no response expected, forwardMessage throws; should not register or unregister command and reject', async () => {
        // Mock sub-calls
        SdStargateSdk.prototype.forwardMessage = jest.fn(async () => {
            throw new Error('Intended error');
        });

        await expect(command.testableSendCommand()).rejects.toThrow();
    });

    test('response expected, forwardMessage throws; should register command, unregister command and resolve', async () => {
        let spyRegisterCommand = false,
            spyRejectCommand = false;

        // Mock sub-calls
        SdCommandRegister.prototype.registerCommand = jest.fn(async () => {
            spyRegisterCommand = true;
            return Promise.resolve([]);
        });
        SdCommandRegister.prototype.rejectCommand = jest.fn(async () => {
            spyRejectCommand = true;
        });
        SdStargateSdk.prototype.forwardMessage = jest.fn(async () => {
            throw new Error('Intended error');
        });

        await expect(command.testableSendCommand('ACK')).rejects.toThrow();

        expect(spyRegisterCommand).toBeTruthy();
        expect(spyRejectCommand).toBeTruthy();
    });
});
