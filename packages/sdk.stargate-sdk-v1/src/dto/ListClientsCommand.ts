import { ISdStargateCommandDto } from "@shapediver/sdk.stargate-sdk-core"
import { ISdClientModel } from "../model/ISdClientModel"

export interface ISdListClientsRequestDto extends ISdStargateCommandDto {
    header: {
        command: "LIST_BACKEND_CLIENTS" | "LIST_FRONTEND_CLIENTS",
    }

    payload: undefined
}

export type ISdListClientsResponseDto = ISdClientModel[]
