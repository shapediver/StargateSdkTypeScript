import WebSocket from "ws";
import { SdWebSocketClient } from "../src/client/SdWebSocketClient";
import {
  ISdErrorResponseDto,
  ISdOkResponseDto,
  ISdStargateCommandDto,
} from "../src/dto/baseDto";
import DoneCallback = jest.DoneCallback;

class WebSocketMock {
  onclose: ((event: WebSocket.CloseEvent) => void) | null = null;
  onerror: ((event: WebSocket.ErrorEvent) => void) | null = null;
  onmessage: ((event: WebSocket.MessageEvent) => void) | null = null;
  onopen: ((event: WebSocket.Event) => void) | null = null;

  send(_data: any, _cb?: (err?: Error) => void): void {}
}

const emptyHandler = () => {};

const createWsClient = (
  done: DoneCallback,
  msgHandler: (payload: unknown) => void = emptyHandler,
  errHandler: (msg: string) => void = (msg: string) =>
    done(`called err-handler: '${msg}'`),
  dscHandler: (msg: string) => void = emptyHandler
): [SdWebSocketClient, WebSocketMock] => {
  const client = new SdWebSocketClient(
    msgHandler,
    errHandler,
    dscHandler,
    undefined
  );
  const ws = new WebSocketMock();
  client.init(ws as WebSocket);
  return [client, ws];
};

describe("ok message", function () {
  const req: ISdStargateCommandDto = { header: {}, payload: {} };

  test("with a request id and no respective open request should trigger err-handler", (done) => {
    const [client, ws] = createWsClient(done, undefined, () =>
      verify_n_open_connections(client.openRequests, 0, done)
    );

    ws.onmessage!({
      data: JSON.stringify({
        requestId: "1",
        payload: {},
      } as ISdOkResponseDto),
      type: "some type",
      target: ws as WebSocket,
    });
  });

  test("with a request id and respective open request should resolve request", (done) => {
    const [client, ws] = createWsClient(done);
    const promises: Promise<void>[] = [];

    promises.push(
      new Promise<void>(async (resolve, reject) => {
        client.generateRequestId = () => "1";
        client
          .send(req)
          .then(() => reject("resolved req 1"))
          .catch(() => reject("rejected req 1"));

        // After 1 seconds we assume that the promise is not gonna get resolved or rejected
        setTimeout(resolve, 1000);
      })
    );

    promises.push(
      new Promise<void>(async (resolve, reject) => {
        client.generateRequestId = () => "2";
        client
          .send(req)
          .then(resolve)
          .catch(() => reject("rejected req 2"));
      })
    );

    ws.onmessage!({
      data: JSON.stringify({
        requestId: "2",
        payload: {},
      } as ISdOkResponseDto),
      type: "some type",
      target: ws as WebSocket,
    });

    Promise.all(promises)
      .then(() => verify_n_open_connections(client.openRequests, 1, done))
      .catch((msg: string) => done(msg));
  });

  test("without a request id should trigger msg-handler", (done) => {
    const [client, ws] = createWsClient(done, () =>
      verify_n_open_connections(client.openRequests, 1, done)
    );

    client.generateRequestId = () => "1";
    client
      .send(req)
      .catch(() => done("rejected req"))
      .then(() => done("resolved req"));

    ws.onmessage!({
      data: JSON.stringify({
        requestId: undefined,
        payload: {},
      } as ISdOkResponseDto),
      type: "some type",
      target: ws as WebSocket,
    });
  });
});

describe("error message", function () {
  const req: ISdStargateCommandDto = { header: {}, payload: {} };

  test("with a request id and no respective open request should trigger err-handler", (done) => {
    const [client, ws] = createWsClient(done, undefined, () =>
      verify_n_open_connections(client.openRequests, 0, done)
    );

    ws.onmessage!({
      data: JSON.stringify({
        requestId: "1",
        errorType: "some type",
        errorMessage: "some message",
      } as ISdErrorResponseDto),
      type: "some type",
      target: ws as WebSocket,
    });
  });

  test("with a request id and respective open request should reject request", (done) => {
    const [client, ws] = createWsClient(done);
    const promises: Promise<void>[] = [];

    promises.push(
      new Promise<void>(async (resolve, reject) => {
        client.generateRequestId = () => "1";
        client
          .send(req)
          .then(() => reject("resolved req 1"))
          .catch(() => reject("rejected req 1"));

        // After 1 seconds we assume that the promise is not gonna get resolved or rejected
        setTimeout(resolve, 1000);
      })
    );

    promises.push(
      new Promise<void>(async (resolve, reject) => {
        client.generateRequestId = () => "2";
        client
          .send(req)
          .then(() => reject("resolved req 2"))
          .catch(resolve);
      })
    );

    ws.onmessage!({
      data: JSON.stringify({
        requestId: "2",
        errorType: "some type",
        errorMessage: "some message",
      } as ISdErrorResponseDto),
      type: "some type",
      target: ws as WebSocket,
    });

    Promise.all(promises)
      .then(() => verify_n_open_connections(client.openRequests, 1, done))
      .catch((msg: string) => done(msg));
  });

  test("without a request id should reject all open requests", (done) => {
    const [client, ws] = createWsClient(done);
    const promises: Promise<void>[] = [];

    promises.push(
      new Promise<void>(async (resolve, reject) => {
        client.generateRequestId = () => "1";
        client
          .send(req)
          .then(() => reject("resolved req 1"))
          .catch(resolve);
      })
    );

    promises.push(
      new Promise<void>(async (resolve, reject) => {
        client.generateRequestId = () => "2";
        client
          .send(req)
          .then(() => reject("resolved req 2"))
          .catch(resolve);
      })
    );

    ws.onmessage!({
      data: JSON.stringify({
        requestId: undefined,
        errorType: "some type",
        errorMessage: "some message",
      } as ISdErrorResponseDto),
      type: "some type",
      target: ws as WebSocket,
    });

    Promise.all(promises)
      .then(() => verify_n_open_connections(client.openRequests, 0, done))
      .catch((msg: string) => done(msg));
  });
});

/* Helper functions */

// Check number of open requests in client. Calls the done-callback either way!
function verify_n_open_connections(
  openRequests: Record<string, any>,
  expected: number,
  done: DoneCallback
): void {
  const n_openRequests = Object.keys(openRequests).length;
  if (n_openRequests == expected) done();
  else
    done(
      `Found ${n_openRequests} open client requests; should be ${expected}.`
    );
}
