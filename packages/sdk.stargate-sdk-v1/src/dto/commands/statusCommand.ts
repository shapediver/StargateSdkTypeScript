
/**
 * Command DTO for "status" command.
 * This command is used by the platform frontend to request status information from 
 * the client. The overhead of this command is minimal, and it is used to check whether
 * the client is still responsive. 
 * Corresponding reply DTO: ISdStargateStatusReplyDto
 */
export interface ISdStargateStatusCommandDto {
   
}

/**
 * Reply DTO for "status" command. 
 * Corresponding command DTO: ISdStargateStatusCommandDto
 */
export interface ISdStargateStatusReplyDto {
   
    /** Unix timestamp of first user activity. */
    firstActivity: number

    /** Unix timestamp of most recent user activity. */
    latestActivity: number
}
