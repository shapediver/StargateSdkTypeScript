
/**
 * Command DTO for "prepare model" command. 
 * This command is used by the platform frontend to prepare/open session 
 * for a given model. 
 * Corresponding reply DTO: ISdStargatePrepareModelReplyDto
 */
export interface ISdStargatePrepareModelCommandDto {
    /** The model to get data for. */
    model: ISdStargatePrepareModelModelCommandDto
}

/** Model specification for ISdStargatePrepareModelCommandDto. */
export interface ISdStargatePrepareModelModelCommandDto {
    /** The platform id of the model. */
    id: string
}

/**
 * Reply DTO for "prepare model" command. 
 * Corresponding command DTO: ISdStargatePrepareModelCommandDto
 */
export interface ISdStargatePrepareModelReplyDto {
    /** General information about the result. */
    info: ISdStargatePrepareModelInfoReplyDto
}

/** Enum describing possible outcomes of the data input by the user. */
export enum ISdStargatePrepareModelResultEnum
{
    /** The user input was successful. */
    SUCCESS = 'success',
    /** The data input failed. */
    FAILURE = 'failure',
}

/**
 * Info specification for ISdStargatePrepareModelReplyDto
 */
export interface ISdStargatePrepareModelInfoReplyDto {
    /**
     * Optional message to display on the frontend
     */
    message?: string

    /** 
     * Result of the data input by the user. 
     */
    result: ISdStargatePrepareModelResultEnum 
}
