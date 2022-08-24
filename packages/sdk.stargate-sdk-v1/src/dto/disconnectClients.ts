import { ISdStargateCommandDto } from "@shapediver/sdk.stargate-sdk-core"

export interface ISdStargateDisconnectClientsRequestDto extends ISdStargateCommandDto {
    header: {
        command: "DISCONNECT_CLIENTS",
        targets: string[],
    }

    payload: undefined,
}
