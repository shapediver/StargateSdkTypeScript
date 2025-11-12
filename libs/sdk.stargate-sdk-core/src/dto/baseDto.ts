/** The structure of a client request. */
export interface ISdStargateCommandDto {
    requestId?: string;

    header: Record<string, unknown>;

    payload?: Record<string, unknown>;
}

/**
 * The OK-response is a wrapper around all non-error messages that are received from the
 * Stargate backend. It can either be received as:
 *  * a direct response to a previously sent client message ({@link requestId} exists).
 *  * a new message that has been triggered by the Stargate backend itself or forwarded from
 *    another client ({@link requestId} is `undefined`).
 */
export interface ISdOkResponseDto {
    requestId?: string;

    payload: unknown;
}

export function isOkResponseDto(res: unknown): res is ISdOkResponseDto {
    return typeof res === 'object' && res !== null && 'payload' in res;
}

/** The structure of a backend error message. */
export interface ISdErrorResponseDto {
    requestId?: string;

    errorType?: string;

    errorMessage: string;
}

export function isErrorResponseDto(res: unknown): res is ISdErrorResponseDto {
    return typeof res === 'object' && res !== null && 'errorMessage' in res;
}
