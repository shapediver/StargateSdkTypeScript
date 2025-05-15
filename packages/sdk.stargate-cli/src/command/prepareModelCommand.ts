import {
  ISdStargateClientModel,
  ISdStargatePrepareModelCommand,
  ISdStargatePrepareModelCommandDto,
  ISdStargatePrepareModelReplyDto,
  ISdStargatePrepareModelResultEnum,
  ISdStargateSdk,
  SdStargatePrepareModelCommand,
} from "@shapediver/sdk.stargate-sdk-v1";
import chalk from "chalk";
import inquirer from "inquirer";
import { nowTime, prettifyMsg, waitToSimulate } from "../utils";

// Global command instance
let command: ISdStargatePrepareModelCommand | undefined;

const identifier = "PREPARE_MODEL";

// User-handler for 'batch-reply' command
const handler = async (
  msg: ISdStargatePrepareModelCommandDto
): Promise<ISdStargatePrepareModelReplyDto> => {
  console.info(
    "\n",
    chalk.magenta(
      chalk.bold(`Received command message '${identifier}' from Stargate:\n`)
    ),
    chalk.magenta(prettifyMsg(msg)),
    "\n"
  );

  await waitToSimulate(3, 6, "requesting a session, etc.");
  console.info(
    chalk.magenta(`\n[${nowTime()}] Finished handling command '${identifier}'!`)
  );

  // send dummy reply
  return {
    info: {
      message: undefined,
      result: ISdStargatePrepareModelResultEnum.SUCCESS,
    },
  };
};

/** Instantiate a new command object and register all handlers. */
export function setupPrepareModelCommandHandlers(sdk: ISdStargateSdk): void {
  command = new SdStargatePrepareModelCommand(sdk);

  command.registerHandler(handler);
}

function askCommand(clients: ISdStargateClientModel[]) {
  const questions = [
    {
      type: "input",
      name: "modelId",
      message: "Platform id of the model to get data for?",
    },
    {
      type: "checkbox",
      name: "clientIds",
      message: "Select target clients:",
      choices: clients.map((client) => {
        return {
          name: `${client.clientName} ${client.clientVersion} (${client.clientType})`,
          value: client.id,
        };
      }),
    },
  ];
  return inquirer.prompt?.(questions);
}

export async function prepareModelCommand(sdk: ISdStargateSdk): Promise<void> {
  if (!command) throw new Error("Commands have not been registered.");

  try {
    // Fetch all registered clients for own user
    const clients = [
      ...(await sdk.listFrontendClients()),
      ...(await sdk.listBackendClients()),
    ];

    const { modelId, clientIds } = await askCommand(clients);

    const dto: ISdStargatePrepareModelCommandDto = {
      model: { id: modelId },
    };

    const selectedClients = clients.filter((c) =>
      (<string[]>clientIds).includes(c.id)
    );
    const res = await command.send(dto, selectedClients);
    printResults(identifier, selectedClients.length, res);
  } catch (e) {
    console.error(
      chalk.red(
        `${chalk.bold(`Could not send command ${identifier}.`)}\n${e.type}: ${
          e.message
        }`
      )
    );
  }
}

function printResults(cmd: string, nClients: number, res?: any): void {
  console.log(
    chalk.green(
      `[${nowTime()}] Successfully sent command '${cmd}' to ${nClients} clients!`
    )
  );
  if (res) console.log(chalk.green("Result:\n", prettifyMsg(res)));
}
