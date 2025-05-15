import { SdStargateError, SdStargateErrorTypes } from "./SdStargateError";

/** Type guard for all error types of the Stargate SDK package. */
export function isSgError(e: any): e is SdStargateError {
  return (
    e instanceof Error &&
    "type" in e &&
    Object.values(SdStargateErrorTypes).includes(e.type as any)
  );
}
