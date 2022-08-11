import { ISdStargateCommandDto } from "@shapediver/sdk.stargate-sdk-core"

export interface ISdDisconnectClientsRequestDto extends ISdStargateCommandDto {
    header: {
        command: "DISCONNECT_CLIENTS",
        targets: string[],
    }

    payload: undefined
}
