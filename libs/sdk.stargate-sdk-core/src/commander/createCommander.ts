import { ISdStargateCommander } from "./ISdStargateCommander"
import { SdWebSocketCommander } from "./SdWebSocketCommander"

export function createStargateCommander (
    msgHandler: (payload: unknown) => void,
    errHandler: (msg: string) => void,
    dcnHandler: (msg: string) => void,
): ISdStargateCommander {
    return new SdWebSocketCommander(msgHandler, errHandler, dcnHandler)
}
