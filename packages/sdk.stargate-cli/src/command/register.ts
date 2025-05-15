import {
  createSdk,
  ISdStargateRegisterResponseDto,
  ISdStargateSdk,
} from "@shapediver/sdk.stargate-sdk-v1";
import { createWithAwsProfile } from "@shapediver/sdk.token-generator-sdk-v1";
import chalk from "chalk";
import inquirer from "inquirer";
import { createSpinner } from "nanospinner";
import { v4 as uuidv4 } from "uuid";
import { readCliMemory, updateCliMemory } from "../memory";
import { assertUnreachable, sleep } from "../utils";

const os = require("os");

interface Environment {
  stargate: {
    type: string;
    region: string;
    lambda: string;
  };

  tokenGenerator: {
    region: string;
    lambda: string;
  };
}

/**
 * A map of our ShapeDiver Stargate systems and their respective Token Generator services.
 *
 * TODO: Add new systems to this list whenever needed!
 */
const ENVIRONMENTS: Record<string, Environment> = {
  "eu-central-1_dev": {
    stargate: {
      type: "dev",
      region: "eu-central-1",
      lambda: "dev-sg.eu-central-1.shapediver.com",
    },
    tokenGenerator: {
      region: "us-east-1",
      lambda: "devsduse1-platformTokenGenerator",
    },
  },
  "eu-central-1_test": {
    stargate: {
      type: "test",
      region: "eu-central-1",
      lambda: "staging-sg.eu-central-1.shapediver.com",
    },
    tokenGenerator: {
      region: "us-east-1",
      lambda: "testsduse1-platformTokenGenerator",
    },
  },
  "eu-central-1_prod": {
    stargate: {
      type: "prod",
      region: "eu-central-1",
      lambda: "prod-sg.eu-central-1.shapediver.com",
    },
    tokenGenerator: {
      region: "us-east-1",
      lambda: "sduse1-platformTokenGenerator",
    },
  },
  "us-east-1_dev": {
    stargate: {
      type: "dev",
      region: "us-east-1",
      lambda: "dev-sg.us-east-1.shapediver.com",
    },
    tokenGenerator: {
      region: "us-east-1",
      lambda: "devsduse1-platformTokenGenerator",
    },
  },
  "us-east-1_test": {
    stargate: {
      type: "test",
      region: "us-east-1",
      lambda: "staging-sg.us-east-1.shapediver.com",
    },
    tokenGenerator: {
      region: "us-east-1",
      lambda: "testsduse1-platformTokenGenerator",
    },
  },
  "us-east-1_prod": {
    stargate: {
      type: "prod",
      region: "us-east-1",
      lambda: "prod-sg.us-east-1.shapediver.com",
    },
    tokenGenerator: {
      region: "us-east-1",
      lambda: "sduse1-platformTokenGenerator",
    },
  },
};

/** All ShapeDiver client applications that are supported by Stargate. */
enum ClientType {
  GRASSHOPPER_CLIENT = "Grasshopper Client",
  ILLUSTRATOR_CLIENT = "Illustrator Client",
  PLATFORM_FRONTEND = "Platform Frontend",
  REVIT_CLIENT = "Revit Client",
  RHINO_CLIENT = "Rhino Client",
  STANDALONE_CLIENT = "Standalone Client",
}

function askQuestions(
  defaultUserId: string = uuidv4(),
  defaultAwsProfile: string = "default"
) {
  const questions = [
    {
      type: "list",
      name: "envName",
      message: "To which Stargate system do you want to connect?",
      choices: Object.keys(ENVIRONMENTS).map(
        (key) => `${ENVIRONMENTS[key].stargate.region}: \
${ENVIRONMENTS[key].stargate.type}`
      ),
      filter: (selection: string) => {
        // We have to remove the region again from the selection
        const parts = selection.split(": ");
        return `${parts[0]}_${parts[1]}`;
      },
      loop: false,
    },
    {
      type: "input",
      name: "userId",
      message: "Whats the ID of the user (UUIDv4)?",
      default() {
        return defaultUserId;
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
      loop: false,
    },
    {
      type: "input",
      name: "awsProfile",
      message:
        "What is the name of your AWS profile that is used to create a JWT and connect to Stargate?",
      default() {
        return defaultAwsProfile;
      },
    },
  ];
  return inquirer.prompt?.(questions);
}

/** Generates a new JWT authentication token, instantiates the Stargate SDK and registers the selected client app. */
export async function register(
  msgHandler: (payload: unknown) => void,
  errHandler: (msg: string) => void,
  dcnHandler: (msg: string) => void
): Promise<ISdStargateSdk> {
  // The AWS-SDK sometimes produces some messages, so we want to log them first before we start
  // with the user interactions to prevent our console from being broken.
  await sleep(0);

  // Load CLI memory of previous user inputs.
  const memory = await readCliMemory();

  // Usually, the user would get the JWT from the ShapeDiver Platform Backend. For these kind of
  // requests, the Platform always uses the ShapeDiver user ID as the JWT subject claim (and not
  // the optional `sd_user_name` property!).
  const { envName, userId, clientType, awsProfile } = await askQuestions(
    memory.userId,
    memory.awsProfile
  );

  // Update CLI memory with user inputs.
  memory.userId = userId;
  memory.awsProfile = awsProfile;
  await updateCliMemory(memory);

  // Get environment for envName
  const env = ENVIRONMENTS[envName];

  // Ask user for client info
  const { appId, name } = getAppIdFromClientType(clientType);

  console.log(); // Empty line
  const jwtSpinner = createSpinner("Generating JWT").start();

  // Create new JWT
  let authToken;
  try {
    authToken = await fetchAuthToken(env, awsProfile, appId, userId);
    jwtSpinner.success();
  } catch (e) {
    jwtSpinner.error();
    console.error(
      chalk.red(
        `${chalk.bold("Could not create a JWT - stopping CLI!")}\n${e.message}`
      )
    );
    process.exit(1);
  }

  const sgSpinner = createSpinner("Connecting to Stargate").start();

  // Instantiate Stargate SDK
  let sdk: ISdStargateSdk;
  try {
    sdk = await createSdk()
      .setBaseUrl(env.stargate.lambda)
      .setServerCommandHandler(msgHandler)
      .setConnectionErrorHandler(errHandler)
      .setDisconnectHandler(dcnHandler)
      .build();
    sgSpinner.success();
  } catch (e) {
    sgSpinner.error();
    console.error(
      chalk.red(
        `${chalk.bold(
          "Could not instantiate Stargate client - stopping CLI!"
        )}\n${e.type}: ${e.message}`
      )
    );
    process.exit(1);
  }

  const registerSpinner = createSpinner("Register in Stargate").start();

  // Register client
  let info: ISdStargateRegisterResponseDto;
  try {
    info = await sdk.register(
      authToken,
      name,
      "local",
      `${os.type()} ${os.release()}`,
      os.hostname(),
      os.userInfo().username
    );
    registerSpinner.success();
  } catch (e) {
    registerSpinner.error();
    console.error(
      chalk.red(
        `${chalk.bold("Could not register client - stopping CLI!")}\n${
          e.type
        }: ${e.message}`
      )
    );
    process.exit(1);
  }

  printResults(clientType, userId, info.version);

  return sdk;
}

/** Returns the application identifier and some dummy client information for the given type. */
function getAppIdFromClientType(type: ClientType): {
  appId: string;
  name: string;
} {
  switch (type) {
    case ClientType.GRASSHOPPER_CLIENT:
      return {
        appId: "E3F8FF7E-AA8B-4968-A0F7-DF8E1DACDC79",
        name: "Grasshopper",
      };
    case ClientType.ILLUSTRATOR_CLIENT:
      return {
        appId: "D3A8F42B-3F0D-4749-AB6C-A7E8FDBA4086",
        name: "Illustrator",
      };
    case ClientType.PLATFORM_FRONTEND:
      return {
        appId: "920794fa-245a-487d-8abe-af569a97da42",
        name: "Platform Frontend",
      };
    case ClientType.REVIT_CLIENT:
      return {
        appId: "A085FCC5-6EEB-46A6-A381-ADCEDB6E59D6",
        name: "Revit",
      };
    case ClientType.RHINO_CLIENT:
      return {
        appId: "DFDCE6AA-339B-4FBC-A5B6-F57F69BB40B7",
        name: "Rhino",
      };
    case ClientType.STANDALONE_CLIENT:
      return {
        appId: "B396F50E-51F0-49CC-9D47-1A1E3E811972",
        name: "Standalone",
      };
    default:
      assertUnreachable(type);
  }
}

/** Calls the ShapeDiver Token Generator service to create a new JWT authentication token. */
async function fetchAuthToken(
  env: Environment,
  awsProfile: string,
  aud: string,
  sub: string
): Promise<string> {
  const tokenGenerator = createWithAwsProfile(
    env.tokenGenerator.region,
    awsProfile
  );

  const res = await tokenGenerator.call(
    env.tokenGenerator.lambda,
    // Stargate does not require any scopes, so we keep it empty.
    { jwt: { aud, scope: "", sub } }
  );

  return res.jwt;
}

function printResults(type: ClientType, uid: string, version: string): void {
  console.log(
    "\n",
    chalk.green(
      `Successfully registered ${chalk.bold(type)} for user ${chalk.bold(
        uid
      )} to Stargate v${version}!`
    ),
    "\n"
  );
}
