/**
 * Command DTO for "get supported data" command.
 * This command is used by the platform frontend to request which types of
 * parameters are supported by the client's implementation of the "get data" command.
 * Corresponding reply DTO: ISdStargateGetSupportedDataReplyDto
 */
export type ISdStargateGetSupportedDataCommandDto = Record<string, never>;

/**
 * Reply DTO for "get supported data" command.
 * Corresponding command DTO: ISdStargateGetSupportedDataCommandDto
 */
export interface ISdStargateGetSupportedDataReplyDto {
    /** The parameter types supported. */
    parameterTypes: Array<string>;

    /** List of supported sdTF type hints. */
    typeHints: Array<string>;

    /** List of supported content types (MIME types). */
    contentTypes: Array<string>;

    /** List of supported file extensions. */
    fileExtensions: Array<string>;
}
