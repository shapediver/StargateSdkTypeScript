import { SdUtils } from "@shapediver/sdk.stargate-sdk-core"
import { SdCommandRegister } from "../../src/commands/SdCommandRegister"

test("command with single client times out; should reject", async () => {
    const register = new SdCommandRegister()

    let promise = register.registerCommand("test", [ "foo" ], 100)

    // New open command should be registered
    expect(Object.keys(register.openCommands)).toStrictEqual([ "test" ])
    expect(register.openCommands["test"].length).toBe(1)
    expect(register.openCommands["test"][0].clientId).toStrictEqual("foo")

    await expect(promise).rejects.toBeDefined()
    expect(Object.keys(register.openCommands).length).toBe(0)
})

test("command with two client, one replies, one times out; should reject", async () => {
    const register = new SdCommandRegister(),
        topic = "test"

    const promise = register.registerCommand(topic, [ "foo", "bar" ], 100)
    register.updateCommand(topic, "foo", { data: "some data" })

    await expect(promise).rejects.toBeDefined()
    expect(Object.keys(register.openCommands).length).toBe(0)
})

test("command with two client, both reply; should resolve and return data", async () => {
    const register = new SdCommandRegister(),
        topic = "test",
        clientData1 = { client: "foo" },
        clientData2 = { client: "bar" }

    const promise = register.registerCommand(topic, [ "foo", "bar" ], Number.MAX_VALUE)

    // Update replies
    register.updateCommand(topic, "foo", clientData1)
    register.updateCommand(topic, "bar", clientData2)

    await expect(promise).resolves.toStrictEqual([ clientData1, clientData2 ])

    await SdUtils.sleep(0)  // Required to wait for `.finally` call
    expect(Object.keys(register.openCommands).length).toBe(0)
})
