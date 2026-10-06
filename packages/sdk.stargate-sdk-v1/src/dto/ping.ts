import { ISdStargateCommandDto } from '@shapediver/sdk.stargate-sdk-core';

export interface ISdStargatePingRequestDto extends ISdStargateCommandDto {
    header: {
        command: 'PING';
    };
}
