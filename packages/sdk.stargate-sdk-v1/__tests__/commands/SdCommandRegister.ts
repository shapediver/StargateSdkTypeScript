import { SdUtils } from "@shapediver/sdk.stargate-sdk-core"
import { SdStargateError, SdStargateErrorTypes } from "../../src"
import { SdCommandRegister } from "../../src/commands/SdCommandRegister"

test("command with single client times out; should reject", async () => {
    const register = new SdCommandRegister()

    let promise = register.registerCommand("test", [ "foo" ], 100)

    // New open command should be registered
    expect(Object.keys(register.openCommands)).toStrictEqual([ "test" ])
    expect(register.openCommands["test"].length).toBe(1)
    expect(register.openCommands["test"][0].clientId).toStrictEqual("foo")

    try {
        await promise
        expect(true).toBeFalsy()
    } catch (e) {
        expect(e instanceof SdStargateError).toBeTruthy()
        expect((<SdStargateError>e).type).toBe(SdStargateErrorTypes.CommandTimeoutError)
        expect((<SdStargateError>e).message).toBe("Command timed out.")

        await SdUtils.sleep(0)  // Required to wait for `.finally` call
        expect(Object.keys(register.openCommands).length).toBe(0)
    }
})

test("command with two client, one replies, one times out; should reject", async () => {
    const register = new SdCommandRegister(),
        topic = "test"

    const promise = register.registerCommand(topic, [ "foo", "bar" ], 100)
    register.updateCommand(topic, "foo", { data: "some data" })

    try {
        await promise
        expect(true).toBeFalsy()
    } catch (e) {
        expect(e instanceof SdStargateError).toBeTruthy()
        expect((<SdStargateError>e).type).toBe(SdStargateErrorTypes.CommandTimeoutError)
        expect((<SdStargateError>e).message).toBe("Command timed out.")

        await SdUtils.sleep(0)  // Required to wait for `.finally` call
        expect(Object.keys(register.openCommands).length).toBe(0)
    }
})

test("command with two client, both reply; should resolve and return data", async () => {
    const register = new SdCommandRegister(),
        topic = "test",
        clientData1 = { client: "foo" },
        clientData2 = { client: "bar" }

    const promise = register.registerCommand(topic, [ "foo", "bar" ], 60000)

    // Update replies
    register.updateCommand(topic, "foo", clientData1)
    register.updateCommand(topic, "bar", clientData2)

    await expect(promise).resolves.toStrictEqual([ clientData1, clientData2 ])

    await SdUtils.sleep(0)  // Required to wait for `.finally` call
    expect(Object.keys(register.openCommands).length).toBe(0)
})

test("command with two client, one sends error reply; should reject and return message", async () => {
    const register = new SdCommandRegister(),
        topic = "test",
        errMsg = "something went wrong"

    const promise = register.registerCommand(topic, [ "foo", "bar" ], 60000)

    // Update reply - first error triggers reject!
    register.updateCommand(topic, "bar", errMsg)

    // await SdUtils.sleep(0)  // Required to wait for `.finally` call

    try {
        await promise
        expect(true).toBeFalsy()
    } catch (e) {
        expect(e instanceof SdStargateError).toBeTruthy()
        expect((<SdStargateError>e).type).toBe(SdStargateErrorTypes.CommandClientError)
        expect((<SdStargateError>e).message).toBe(errMsg)

        await SdUtils.sleep(0)  // Required to wait for `.finally` call
        expect(Object.keys(register.openCommands).length).toBe(0)
    }
})

test("command that already has been rejected receives success response; should ignore response", async () => {
    const register = new SdCommandRegister(),
        topic = "test"

    const promise = register.registerCommand(topic, [ "foo", "bar" ], 60000)

    // First client sends error reply - triggers reject!
    register.updateCommand(topic, "foo", "something went wrong")
    await expect(promise).rejects.toBeDefined()

    // Second client sends reply
    register.updateCommand(topic, "bar", { client: "bar" })

    // Nothing should happen
})

test("command that already has been rejected receives error response; should ignore response", async () => {
    const register = new SdCommandRegister(),
        topic = "test"

    const promise = register.registerCommand(topic, [ "foo", "bar" ], 60000)

    // First client sends error reply - triggers reject!
    register.updateCommand(topic, "foo", "something went wrong")
    await expect(promise).rejects.toBeDefined()

    // Second client sends reply
    register.updateCommand(topic, "bar", "something else wrong")

    // Nothing should happen
})
