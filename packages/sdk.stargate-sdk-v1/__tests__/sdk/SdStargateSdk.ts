import { ISdBaseCommand } from '../../src/commands/ISdBaseCommand';
import {
    ISdCommandErrorReplyPayload,
    ISdCommandOkReplyPayload,
    ISdCommandPayload,
    ISdCommandRequestPayload,
} from '../../src/dto/commands/commandPayload';
import { SdStargateSdk } from '../../src/sdk/SdStargateSdk';

let sdk: SdStargateSdk;

beforeEach(() => {
    // @formatter:off
    sdk = new SdStargateSdk(
        '',
        () => {},
        () => {},
        () => {}
    );
    // @formatter:on
});

class DummyCommand implements ISdBaseCommand {
    isSupported(_payload: ISdCommandPayload): boolean {
        return false;
    }

    processCommandMessage(_payload: ISdCommandRequestPayload): Promise<void> {
        return Promise.resolve(undefined);
    }

    processOkReplyMessage(_payload: ISdCommandOkReplyPayload): void {}

    processErrorReplyMessage(_payload: ISdCommandErrorReplyPayload): void {}

    getIdentifier(): string {
        return 'DUMMY';
    }
}

describe('addCommand', function () {
    test('adding a new command; should extend command-list', () => {
        sdk.addCommand(new DummyCommand());
        expect(sdk.commands.length).toBe(1);
    });

    test('adding an instance of a command multiple times; should add only once', () => {
        const cmd = new DummyCommand();
        sdk.addCommand(cmd);
        expect(() => {
            sdk.addCommand(cmd);
        }).toThrow();
    });

    test('adding command instances of the same type multiple times; should add only once', () => {
        sdk.addCommand(new DummyCommand());
        expect(() => {
            sdk.addCommand(new DummyCommand());
        }).toThrow();
    });
});
