/**
 * Command DTO for "get data" command.
 * This command is used by the platform frontend to request the input of data
 * for a given model and parameter from a client application.
 * Corresponding reply DTO: ISdStargateGetDataReplyDto
 */
export interface ISdStargateGetDataCommandDto {
  /** The model to get data for. */
  model: ISdStargateGetDataModelCommandDto;
  /** The parameter to get data for. */
  parameter: ISdStargateGetDataParameterCommandDto;
}

/** Model specification for ISdStargateGetDataCommandDto. */
export interface ISdStargateGetDataModelCommandDto {
  /** The platform id of the model. */
  id: string;
}

/** Parameter specification for ISdStargateGetDataCommandDto. */
export interface ISdStargateGetDataParameterCommandDto {
  /** The parameter id of the model. */
  id: string;
}

/**
 * Reply DTO for "get data" command.
 * Corresponding command DTO: ISdStargateGetDataCommandDto
 */
export interface ISdStargateGetDataReplyDto {
  /** Information about the asset which was created and uploaded to the geometry backend. */
  asset?: ISdStargateGetDataAssetReplyDto;
  /** General information about the result. */
  info: ISdStargateGetDataInfoReplyDto;
}

/**
 * Asset specification for ISdStargateGetDataReplyDto.
 * Corresponds to advanced case described here:
 * https://help.shapediver.com/doc/sdtf-structured-data-transfer-format#sdTF-Structureddatatransferformat-Advancedcase
 */
export interface ISdStargateGetDataAssetReplyDto {
  /**
   * Id of the sdTF asset, including namespace.
   * Example: NAMESPACE/ID
   */
  id: string;
  /** Optional specification of the chunk to be used. */
  chunk?: ISdStargateGetDataAssetChunkReplyDto;
}

/**
 * Chunk specification for ISdStargateGetDataAssetReplyDto.
 * Corresponds to advanced case described here:
 * https://help.shapediver.com/doc/sdtf-structured-data-transfer-format#sdTF-Structureddatatransferformat-Advancedcase.
 */
export interface ISdStargateGetDataAssetChunkReplyDto {
  /** Id of the chunk which should be used. */
  id?: string;
  /** Name of the chunk which should be used. */
  name?: string;
}

/** Enum describing possible outcomes of the data input by the user. */
export enum ISdStargateGetDataResultEnum {
  /** The user input was successful. */
  SUCCESS = "success",
  /** The user cancelled the data input. */
  CANCEL = "cancel",
  /** The user did nothing. */
  NOTHING = "nothing",
  /** The data input failed. */
  FAILURE = "failure",
}

/**
 * Info specification for ISdStargateGetDataReplyDto
 */
export interface ISdStargateGetDataInfoReplyDto {
  /**
   * Total number of objects returned as part of the asset.
   */
  count: number;

  /**
   * Result of the data input by the user.
   */
  result: ISdStargateGetDataResultEnum;

  /**
   * Optional message that can be used by client to send additional information to the platform frontend.
   */
  message?: string;
}
