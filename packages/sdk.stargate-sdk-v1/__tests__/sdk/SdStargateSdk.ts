import { ISdBaseCommand } from "../../src/commands/ISdBaseCommand"
import {
    ISdCommandErrorReplyPayload,
    ISdCommandOkReplyPayload,
    ISdCommandPayload,
    ISdCommandRequestPayload,
} from "../../src/dto/commands/commandPayload"
import { SdStargateSdk } from "../../src/sdk/SdStargateSdk"

let sdk: SdStargateSdk

beforeEach(() => {
    // @formatter:off
    sdk = new SdStargateSdk(
        "",
        () => {},
        () => {},
        () => {},
    )
    // @formatter:on
})

class DummyCommand implements ISdBaseCommand {
    isSupported (payload: ISdCommandPayload): boolean {
        return false
    }

    processCommandMessage (payload: ISdCommandRequestPayload): Promise<void> {
        return Promise.resolve(undefined)
    }

    processOkReplyMessage (payload: ISdCommandOkReplyPayload): void {
    }

    processErrorReplyMessage (payload: ISdCommandErrorReplyPayload): void {
    }
}

describe("addCommand", function () {

    test("adding a new command; should extend command-list", () => {
        sdk.addCommand(new DummyCommand())
        expect(sdk.commands.length).toBe(1)
    })

    test("adding an instance of a command multiple times; should not extend command-list", () => {
        const cmd = new DummyCommand()
        sdk.addCommand(cmd)
        sdk.addCommand(cmd)
        expect(sdk.commands.length).toBe(1)
    })

})
