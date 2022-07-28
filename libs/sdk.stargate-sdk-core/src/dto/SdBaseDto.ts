/** The structure of a client request. */
export interface ISdStargateCommandDto {
    requestId?: string,

    header: Record<string, unknown>,

    payload?: Record<string, unknown>,
}

/** The structure of a successfully processed client request. */
export interface ISdOkResponseDto {
    requestId?: string,

    payload: unknown,
}

export function isOkResponseDto (res: unknown): res is ISdOkResponseDto {
    return typeof res === "object" &&
        res !== null &&
        "payload" in res
}

/** The structure of a backend error message. */
export interface ISdErrorResponseDto {
    requestId?: string,

    errorType: string,

    errorMessage: string,
}

export function isErrorResponseDto (res: unknown): res is ISdErrorResponseDto {
    return typeof res === "object" &&
        res !== null &&
        "errorType" in res &&
        "errorMessage" in res
}
