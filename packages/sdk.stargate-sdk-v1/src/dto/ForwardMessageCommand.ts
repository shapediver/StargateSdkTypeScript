import { ISdStargateCommandDto } from "@shapediver/sdk.stargate-sdk-core"

export interface ISdForwardMessageRequestDto extends ISdStargateCommandDto {
    header: {
        command: "FORWARD_MESSAGE",
        targets: string[],
    }

    payload: {
        data: Record<string, any>,
    },
}
