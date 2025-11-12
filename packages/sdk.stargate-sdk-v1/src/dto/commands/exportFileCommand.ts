/**
 * Command DTO for "export file" command.
 * This command is used by the platform frontend to notify the client application to export a
 * specific file export from a model.
 * Corresponding reply DTO: ISdStargateExportFileReplyDto.
 */
export interface ISdStargateExportFileCommandDto {
    /** The model to export a file from. */
    model: ISdStargateExportFileModelCommandDto;
    /** Parameter values. */
    parameters: Record<string, string>;
    /** The export to use. */
    export: ISdStargateExportFileExportCommandDto;
}

/** Model specification for ISdStargateExportFileCommandDto. */
export interface ISdStargateExportFileModelCommandDto {
    /** The platform id of the model. */
    id: string;
}

/** Export specification for ISdStargateExportFileCommandDto. */
export interface ISdStargateExportFileExportCommandDto {
    /** The export id of the model. */
    id: string;
    /** The index of the exported file in the content array. */
    index: number;
}

/**
 * Reply DTO for "export file" command.
 * Corresponding command DTO: ISdStargateExportFileCommandDto
 */
export interface ISdStargateExportFileReplyDto {
    /** General information about the result. */
    info: ISdStargateExportFileInfoReplyDto;
}

/** Enum describing possible outcomes of exporting a file. */
export enum ISdStargateExportFileResultEnum {
    /** The file export was successful. */
    SUCCESS = 'success',
    /**
     * The user cancelled the file export. This applies to clients which require user interaction for
     * file export.
     */
    CANCEL = 'cancel',
    /**
     * The user did nothing. This applies to clients which require user interaction for file export.
     */
    NOTHING = 'nothing',
    /** The file export failed. */
    FAILURE = 'failure',
}

/** Info specification for ISdStargateExportFileReplyDto. */
export interface ISdStargateExportFileInfoReplyDto {
    /** Result of the file export. */
    result: ISdStargateExportFileResultEnum;
    /**
     * Optional message that can be used by client to send additional information to the platform
     * frontend.
     */
    message?: string;
}
