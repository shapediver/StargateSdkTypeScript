import { createSdk, ISdStargateSdk } from "@shapediver/sdk.stargate-sdk-v1"
import chalk from "chalk"
import inquirer from "inquirer"
import * as jwt from "jwt-promisify"
import { assertUnreachable } from "../utils"

const os = require("os")

/** All ShapeDiver client applications that are supported by Stargate. */
enum ClientType {
    GRASSHOPPER_CLIENT = "Grasshopper Client",
    ILLUSTRATOR_CLIENT = "Illustrator Client",
    PLATFORM_FRONTEND = "Platform Frontend",
    REVIT_CLIENT = "Revit Client",
    RHINO_CLIENT = "Rhino Client",
    STANDALONE_CLIENT = "Standalone Client",
}

function askQuestions () {
    const questions = [
        {
            type: "editor",
            name: "prvKey",
            message: "Enter the private key for JWT authentication",
        },
        {
            type: "input",
            name: "user",
            message: "Whats the ID of the user?",
            default () {
                return "Test-User"
            },
        },
        {
            type: "list",
            name: "clientType",
            message: "Whats the type of this client?",
            choices: [
                ClientType.PLATFORM_FRONTEND,
                ClientType.GRASSHOPPER_CLIENT,
                ClientType.ILLUSTRATOR_CLIENT,
                ClientType.REVIT_CLIENT,
                ClientType.RHINO_CLIENT,
                ClientType.STANDALONE_CLIENT,
            ],
        },
        {
            type: "input",
            name: "url",
            message: "Whats the URL of the Stargate service?",
            default () {
                return ""  // TODO specify this after deployment
            },
        },
    ]
    return inquirer.prompt?.(questions)
}

/** Generates a new JWT authentication token, instantiates the Stargate SDK and registers the selected client app. */
export async function register (
    msgHandler: (payload: unknown) => void,
    errHandler: (msg: string) => void,
    dcnHandler: (msg: string) => void,
): Promise<ISdStargateSdk> {
    const { prvKey, user, clientType, url } = await askQuestions()

    // Extract client info and generate new JWT
    const { appId, name } = getAppIdFromClientType(clientType)
    const authToken = await generateAuthToken(prvKey, user, appId)

    // Instantiate Stargate SDK
    let sdk: ISdStargateSdk
    try {
        sdk = await createSdk()
            .setBaseUrl(url)
            .setServerCommandHandler(msgHandler)
            .setConnectionErrorHandler(errHandler)
            .setDisconnectHandler(dcnHandler)
            .build()
    } catch (e) {
        console.error(chalk.red(`${ chalk.bold("Could not instantiate Stargate client - stopping CLI!") }\n${ e.type }: ${ e.message }`))
        process.exit(1)
    }

    // Register client
    try {
        await sdk.register(
            authToken,
            name,
            "local",
            `${ os.type() } ${ os.release() }`,
            os.hostname(),
            os.userInfo().username,
        )
    } catch (e) {
        console.error(chalk.red(`${ chalk.bold("Could not register client - stopping CLI!") }\n${ e.type }: ${ e.message }`))
        process.exit(1)
    }

    printResults(clientType)

    return sdk
}

/** Returns the application identifier and some dummy client information for the given type. */
function getAppIdFromClientType (type: ClientType): { appId: string, name: string } {
    switch (type) {
        case ClientType.GRASSHOPPER_CLIENT:
            return {
                appId: "E3F8FF7E-AA8B-4968-A0F7-DF8E1DACDC79",
                name: "Grasshopper",
            }
        case ClientType.ILLUSTRATOR_CLIENT:
            return {
                appId: "D3A8F42B-3F0D-4749-AB6C-A7E8FDBA4086",
                name: "Illustrator",
            }
        case ClientType.PLATFORM_FRONTEND:
            return {
                appId: "920794fa-245a-487d-8abe-af569a97da42",
                name: "Platform Frontend",
            }
        case ClientType.REVIT_CLIENT:
            return {
                appId: "A085FCC5-6EEB-46A6-A381-ADCEDB6E59D6",
                name: "Revit",
            }
        case ClientType.RHINO_CLIENT:
            return {
                appId: "DFDCE6AA-339B-4FBC-A5B6-F57F69BB40B7",
                name: "Rhino",
            }
        case ClientType.STANDALONE_CLIENT:
            return {
                appId: "B396F50E-51F0-49CC-9D47-1A1E3E811972",
                name: "Standalone",
            }
        default:
            assertUnreachable(type)
    }
}

/** Generates and returns a new JWT authentication token. */
async function generateAuthToken (privateKey: string, sub: string, aud: string): Promise<string> {
    try {
        return await jwt.sign({ sub, aud }, privateKey.trim(), {
            algorithm: "RS256",
            expiresIn: "1h",
        })
    } catch (e) {
        throw new Error("Something went wrong when creating the JWT. Something is probably wrong with the key string.\n" + e.message)
    }
}

function printResults (type: ClientType): void {
    console.log(chalk.green(`Successfully registered ${ type } and ready to go!`))
}
