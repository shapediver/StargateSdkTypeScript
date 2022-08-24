import { ISdStargateCommandDto } from "@shapediver/sdk.stargate-sdk-core"
import { ISdStargateClientModel } from "../models/ISdStargateClientModel"

export interface ISdStargateRegisterRequestDto extends ISdStargateCommandDto {
    header: {
        command: "REGISTER",
    }

    payload: {
        authToken: string,

        name: string,

        version: string,
    }
}

export type ISdStargateRegisterResponseDto = Pick<ISdStargateClientModel, "id">[]
