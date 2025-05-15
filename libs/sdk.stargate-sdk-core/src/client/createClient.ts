import {
  ISdStargateClient,
  ISdStargateClientOptionKeepAlive,
} from "./ISdStargateClient";
import { SdWebSocketClient } from "./SdWebSocketClient";

export function createStargateClient(
  msgHandler: (payload: unknown) => void,
  errHandler: (msg: string) => void,
  dcnHandler: (msg: string) => void,
  keepAlive?: ISdStargateClientOptionKeepAlive
): ISdStargateClient {
  return new SdWebSocketClient(msgHandler, errHandler, dcnHandler, keepAlive);
}
