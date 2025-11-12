import { ISdStargateCommandDto } from '@shapediver/sdk.stargate-sdk-core';

export interface ISdStargateForwardMessageRequestDto extends ISdStargateCommandDto {
    header: {
        command: 'FORWARD_MESSAGE';
        targets: string[];
    };

    payload: Record<string, any>;
}
