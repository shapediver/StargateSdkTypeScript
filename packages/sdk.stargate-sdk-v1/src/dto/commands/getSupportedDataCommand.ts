
/**
 * Command DTO for "get supported data" command.
 * This command is used by the platform frontend to request which types of
 * parameters are supported by the client's implementation of the "get data" command. 
 * Corresponding reply DTO: ISdStargateGetSupportedDataReplyDto
 */
export interface ISdStargateGetSupportedDataCommandDto {
   
}

/**
 * Reply DTO for "get supported data" command. 
 * Corresponding command DTO: ISdStargateGetSupportedDataCommandDto
 */
export interface ISdStargateGetSupportedDataReplyDto {
    /** The parameter types supported. */
    parameterTypes: Array<string>
}
