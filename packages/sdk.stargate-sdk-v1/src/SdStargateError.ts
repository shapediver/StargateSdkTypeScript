import { SdStargateCoreErrorTypes } from "@shapediver/sdk.stargate-sdk-core";

export class SdStargateError extends Error {
  constructor(public type: SdStargateErrorTypes, message: string) {
    super(message);
  }
}

/** Contains all exposed error types of the Stargate V1 backend system. */
const SdStargateBackendErrorTypes = {
  /** JSON Web Token (JWT) verification failed. */
  AuthenticationFailed: "AuthenticationFailed",

  /** Generic error on the backend system. */
  GenericServerError: "GenericInternal",

  /** The payload of your request could not be parsed. */
  InvalidRequestData: "InvalidRequestData",

  /** One or more target clients that should receive the given message are not found. */
  InvalidTargetError: "TargetClientNotFound",

  /** Your client ID was not found. Please run the `register` command first. */
  NotAuthenticated: "NotAuthenticated",

  /** This client is not authorized to execute the action. */
  NotAuthorized: "NotAuthorized",
};

export const SdStargateErrorTypes = {
  ...SdStargateCoreErrorTypes,
  ...SdStargateBackendErrorTypes,

  /** The target client that received your command replied with an error. */
  CommandClientError: "CommandClientError",

  /** Not all target clients sent a reply within the time limit. */
  CommandTimeoutError: "CommandTimeoutError",

  /** The command payload did not pass validation. */
  InvalidCommandPayload: "InvalidCommandPayload",
};
export type SdStargateErrorTypes =
  (typeof SdStargateErrorTypes)[keyof typeof SdStargateErrorTypes];
