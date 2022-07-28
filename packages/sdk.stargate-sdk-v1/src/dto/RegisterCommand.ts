import { ISdStargateCommandDto } from "@shapediver/sdk.stargate-sdk-core"
import { ISdClientModel } from "../model/ISdClientModel"

export interface ISdRegisterRequestDto extends ISdStargateCommandDto {
    header: {
        command: "REGISTER",
    }

    payload: {
        authToken: string,

        name: string,

        version: string,
    }
}

export type ISdRegisterResponseDto = Pick<ISdClientModel, "id">[]
