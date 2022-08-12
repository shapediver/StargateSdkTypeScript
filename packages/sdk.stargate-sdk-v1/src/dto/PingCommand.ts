import { ISdStargateCommandDto } from "@shapediver/sdk.stargate-sdk-core"

export interface ISdPingRequestDto extends ISdStargateCommandDto {
    header: {
        command: "PING",
    }

    payload: undefined,
}
