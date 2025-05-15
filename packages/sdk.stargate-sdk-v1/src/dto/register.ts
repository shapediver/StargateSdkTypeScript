import { ISdStargateCommandDto } from "@shapediver/sdk.stargate-sdk-core";
import { ISdStargateClientModel } from "../models/ISdStargateClientModel";

export interface ISdStargateRegisterRequestDto extends ISdStargateCommandDto {
  header: {
    command: "REGISTER";
  };

  payload: {
    authToken: string;
  } & Pick<
    ISdStargateClientModel,
    "clientName" | "clientVersion" | "hostOs" | "hostName" | "hostUser"
  >;
}

export interface ISdStargateRegisterResponseDto {
  /** The ID of the registered user. */
  id: string;

  /** The version of the Stargate backend service. */
  version: string;
}
