import { ISdStargateClientOptionKeepAlive } from "../client/ISdStargateClient"
import { ISdStargateCommander } from "./ISdStargateCommander"
import { SdWebSocketCommander } from "./SdWebSocketCommander"

export function createStargateCommander (
    msgHandler: (payload: unknown) => void,
    errHandler: (msg: string) => void,
    dcnHandler: (msg: string) => void,
    keepAlive?: ISdStargateClientOptionKeepAlive,
): ISdStargateCommander {
    return new SdWebSocketCommander(msgHandler, errHandler, dcnHandler, keepAlive)
}
