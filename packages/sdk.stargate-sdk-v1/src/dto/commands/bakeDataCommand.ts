
/**
 * Command DTO for "bake data" command. 
 * This command is used by the platform frontend to request the output 
 * (baking) of data for a given model and parameter values. 
 * The request includes 
 *   * an identifier for the model, 
 *   * the parameter values for which results should be baked,
 *   * the id of the output to bake data for, and 
 *   * a specification of the sdTF asset's chunk to use.  

 * Corresponding reply DTO: ISdStargateBakeDataReplyDto
 */
export interface ISdStargateBakeDataCommandDto {
    /** The model to bake data for. */
    model: ISdStargateBakeDataModelCommandDto
    /** Parameter values. */
    parameters: { [key: string]: string }
    /** The output to bake data for. */
    output: ISdStargateBakeDataOutputCommandDto
}

/** Model specification for ISdStargateBakeDataCommandDto. */
export interface ISdStargateBakeDataModelCommandDto {
    /** The platform id of the model. */
    id: string
}

/** Output specification for ISdStargateBakeDataCommandDto. */
export interface ISdStargateBakeDataOutputCommandDto {
    /** The output id of the model. */
    id: string
    /** The chunk specification. 
     * In case this is not defined, bake all chunks 
     * contained in the sdTF asset of the output. 
     */
    chunk?: ISdStargateBakeDataOutputChunkCommandDto
}

/**
 * Chunk specification for ISdStargateBakeDataOutputCommandDto.
 * Corresponds to advanced case described here: 
 * https://help.shapediver.com/doc/sdtf-structured-data-transfer-format#sdTF-Structureddatatransferformat-Advancedcase
 */
export interface ISdStargateBakeDataOutputChunkCommandDto {
    /** Id of the chunk which should be used. */
    id?: string
    /** Name of the chunk which should be used. */
    name?: string
}

/**
 * Reply DTO for "bake data" command. 
 * Corresponding command DTO: ISdStargateBakeDataCommandDto
 */
export interface ISdStargateBakeDataReplyDto {
    /** General information about the result. */
    info: ISdStargateBakeDataInfoReplyDto
}

/** Enum describing possible outcomes of baking. */
export enum ISdStargateBakeDataResultEnum
{
    /** The data output was successful. */
    SUCCESS = 'success',
    /** The user cancelled the data output. This applies to clients which require user interaction for data output. */
    CANCEL = 'cancel',
    /** The user did nothing. This applies to clients which require user interaction for data output. */
    NOTHING = 'nothing',
    /** The data output failed. */
    FAILURE = 'failure',
}

/**
 * Info specification for ISdStargateBakeDataReplyDto
 */
export interface ISdStargateBakeDataInfoReplyDto {
    /**
     * Total number of objects returned as part of the asset.
     */
    count: number

    /** 
     * Result of the data input by the user. 
     */
    result: ISdStargateBakeDataResultEnum 
}
