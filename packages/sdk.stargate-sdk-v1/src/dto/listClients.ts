import { ISdStargateCommandDto } from '@shapediver/sdk.stargate-sdk-core';
import { ISdStargateClientModel } from '../models/ISdStargateClientModel';

export interface ISdStargateListClientsRequestDto extends ISdStargateCommandDto {
    header: {
        command: 'LIST_BACKEND_CLIENTS' | 'LIST_FRONTEND_CLIENTS';
    };
}

export type ISdStargateListClientsResponseDto = ISdStargateClientModel[];
