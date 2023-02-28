import { createSdk, ISdStargateSdk } from "@shapediver/sdk.stargate-sdk-v1"
import { createWithAwsProfile } from "@shapediver/sdk.token-generator-sdk-v1"
import chalk from "chalk"
import inquirer from "inquirer"
import { v4 as uuidv4 } from "uuid"
import { readCliMemory, updateCliMemory } from "../memory"
import { assertUnreachable, sleep } from "../utils"

const os = require("os")

const REQUEST_CUSTOM_INPUT = "Enter name manually."

/** All ShapeDiver client applications that are supported by Stargate. */
enum ClientType {
    GRASSHOPPER_CLIENT = "Grasshopper Client",
    ILLUSTRATOR_CLIENT = "Illustrator Client",
    PLATFORM_FRONTEND = "Platform Frontend",
    REVIT_CLIENT = "Revit Client",
    RHINO_CLIENT = "Rhino Client",
    STANDALONE_CLIENT = "Standalone Client",
}

function askQuestions (defaultUserId: string = uuidv4(), defaultUrl: string = "") {
    const questions = [
        {
            type: "input",
            name: "userId",
            message: "Whats the ID of the user (UUIDv4)?",
            default () {
                return defaultUserId
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
                return defaultUrl
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
    // The AWS-SDK sometimes produces some messages, so we want to log them first before we start
    // with the user interactions to prevent our console from being broken.
    await sleep(0)

    // Load CLI memory of previous user inputs.
    const memory = await readCliMemory()

    // Usually, the user would get the JWT from the ShapeDiver Platform Backend. For these kind of
    // requests, the Platform always uses the ShapeDiver user ID as the JWT subject claim (and not
    // the optional `sd_user_name` property!).
    const { userId, clientType, url } = await askQuestions(memory.userId, memory.stargateUrl)

    // Update CLI memory with user inputs.
    memory.userId = userId
    memory.stargateUrl = url
    await updateCliMemory(memory)

    // Ask user for client info
    const { appId, name } = getAppIdFromClientType(clientType)

    // Create new JWT
    let authToken
    try {
        authToken = await fetchAuthToken(appId, userId)
    } catch (e) {
        console.error(chalk.red(`${ chalk.bold("Could not create a JWT - stopping CLI!") }\n${ e.message }`))
        process.exit(1)
    }

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

    printResults(clientType, userId)

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

/** Calls the ShapeDiver Token Generator service to create a new JWT authentication token. */
async function fetchAuthToken (aud: string, sub: string): Promise<string> {
    // Ask user which AWS credentials and region to use for the JWT creation.
    let { awsProfile, awsRegion } = await inquirer.prompt?.([
        {
            type: "input",
            name: "awsProfile",
            message: "What is the name of your AWS profile that is used to create a JWT?",
            default () {
                return "default"
            },
        },
        {
            type: "list",
            name: "awsRegion",
            message: "Which AWS region should be used to create the JWT?",
            choices: [
                "us-east-1",
                "eu-central-1",
                REQUEST_CUSTOM_INPUT,
            ],
        },
    ])
    if (awsRegion === REQUEST_CUSTOM_INPUT) {
        const { custom } = await inquirer.prompt?.([ {
            type: "input",
            name: "custom",
            message: "AWS region:",
        } ])
        awsRegion = custom
    }

    const tokenGenerator = createWithAwsProfile(awsRegion, awsProfile)

    let fn, fnNames: string[] | undefined
    try {
        // Try to fetch all token generator lambda function names of the region if possible.
        // However, this fails when the AWS account does ot have sufficient permissions.
        const lambdas = await tokenGenerator.client.listFunctions().promise()
        fnNames = (lambdas.Functions ?? [])
            .map(l => l.FunctionName ?? "")
            .filter(name => name && name.toLowerCase().includes("platformtokengenerator"))

        if (fnNames.length > 0) {
            // Ask user to select lambda function
            const { fnName } = await inquirer.prompt?.([ {
                type: "list",
                name: "fnName",
                message: "What is the Lambda function name of the Token Generator service?",
                choices: fnNames.concat([ REQUEST_CUSTOM_INPUT ]),
            } ])

            if (fnName !== REQUEST_CUSTOM_INPUT) {
                fn = fnName
            } else {
                const { custom } = await inquirer.prompt?.([ {
                    type: "input",
                    name: "custom",
                    message: "Lambda function name:",
                } ])
                fn = custom
            }
        } else
            console.log(chalk.yellow(`Could not find any Platform Token Generator Lambda service in region '${ awsRegion }' by name.`))
    } catch
        (e) {
        // Account has not the necessary permissions to list lambda functions in this region.
        console.warn(chalk.yellow(`Could not list existing Lambda services in region '${ awsRegion }'.\n${ e.message }`))
    }

    // Fallback - Ask the user to input the Token Generator function name.
    if (fn === undefined) {
        const { custom } = await inquirer.prompt?.([ {
            type: "input",
            name: "custom",
            message: "Fallback: What is the Lambda function name of the Token Generator service?",
        } ])
        fn = custom
    }

    try {
        // Stargate does not require any scopes, so we keep it empty.
        const res = await tokenGenerator.call(String(fn), { jwt: { aud, scope: "", sub } })
        return res.jwt
    } catch (e) {
        throw new Error("Error when calling ShapeDiver TokenGenerator to create a new JWT.\n" + e.message)
    }
}

function printResults (type: ClientType, uid: string): void {
    console.log("\n", chalk.green(`Successfully registered ${ chalk.bold(type) } for user ${ chalk.bold(uid) }!`), "\n")
}
