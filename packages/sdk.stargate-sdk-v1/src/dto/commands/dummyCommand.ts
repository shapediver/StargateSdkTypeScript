export interface ISdStargateDummyNoReplyExampleCommandDto {
    text: string;
}

export type ISdStargateDummyNoReplyExampleReplyDto = Record<string, never>;

export interface ISdStargateDummyAckReplyExampleCommandDto {
    text: string;
}

export type ISdStargateDummyAckReplyExampleReplyDto = Record<string, never>;

export type ISdStargateDummyBatchReplyExampleCommandDto = Record<string, never>;

export interface ISdStargateDummyBatchReplyExampleReplyDto {
    mesh: string;

    visible: boolean;
}
