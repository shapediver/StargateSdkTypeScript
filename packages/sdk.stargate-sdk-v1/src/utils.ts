import { SdStargateError, SdStargateErrorTypes } from './SdStargateError';

const stargateErrorTypeValues = new Set<string>(Object.values(SdStargateErrorTypes));

/** Type guard for all error types of the Stargate SDK package. */
export function isSgError(e: unknown): e is SdStargateError {
    return e instanceof SdStargateError && stargateErrorTypeValues.has(e.type);
}
