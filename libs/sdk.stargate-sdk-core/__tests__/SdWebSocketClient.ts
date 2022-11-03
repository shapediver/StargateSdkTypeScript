import WebSocket from "ws"
import { SdWebSocketClient } from "../src/client/SdWebSocketClient"
import { ISdErrorResponseDto, ISdOkResponseDto, ISdStargateCommandDto } from "../src/dto/baseDto"
import DoneCallback = jest.DoneCallback

class WebSocketMock {
    onclose: ((event: WebSocket.CloseEvent) => void) | null = null
    onerror: ((event: WebSocket.ErrorEvent) => void) | null = null
    onmessage: ((event: WebSocket.MessageEvent) => void) | null = null
    onopen: ((event: WebSocket.Event) => void) | null = null

    send (_data: any, _cb?: (err?: Error) => void): void {
    }
}

const unreachable = (msg: string): () => void => {
    return () => {
        throw Error(`This must not happen: ${ msg }`)
    }
}

const createWsClient = (
    msgHandler: (payload: unknown) => void = unreachable("called msg-handler"),
    errHandler: (msg: string) => void = unreachable("called err-handler"),
    dscHandler: (msg: string) => void = unreachable("called dsc-handler"),
): [ SdWebSocketClient, WebSocketMock ] => {
    const client = new SdWebSocketClient(msgHandler, errHandler, dscHandler, undefined)
    const ws = new WebSocketMock()
    client.init(ws as WebSocket)
    return [ client, ws ]
}

describe("ok message", function () {

    const req: ISdStargateCommandDto = { header: {}, payload: {} }

    test("with a request id and no respective open request should trigger err-handler", (done) => {
        const [ client, ws ] = createWsClient(
            undefined,
            () => verify_n_open_connections(client.openRequests, 0, done),
        )

        ws.onmessage!({
            data: JSON.stringify({
                requestId: "1",
                payload: {},
            } as ISdOkResponseDto),
            type: "some type",
            target: ws as WebSocket,
        })
    })

    test("with a request id and respective open request should resolve request", (done) => {
        const [ client, ws ] = createWsClient()

        client.generateRequestId = () => "1"
        client
            .send(req)
            .catch(unreachable("rejected req 1"))
            .then(unreachable("resolved req 1"))

        client.generateRequestId = () => "2"
        client
            .send(req)
            .catch(unreachable("rejected req 2"))
            .then(() => verify_n_open_connections(client.openRequests, 1, done))

        ws.onmessage!({
            data: JSON.stringify({
                requestId: "2",
                payload: {},
            } as ISdOkResponseDto),
            type: "some type",
            target: ws as WebSocket,
        })
    })

    test("without a request id should trigger msg-handler", (done) => {
        const [ client, ws ] = createWsClient(
            () => verify_n_open_connections(client.openRequests, 1, done),
        )

        client.generateRequestId = () => "1"
        client
            .send(req)
            .catch(unreachable("rejected req"))
            .then(unreachable("resolved req"))

        ws.onmessage!({
            data: JSON.stringify({
                requestId: undefined,
                payload: {},
            } as ISdOkResponseDto),
            type: "some type",
            target: ws as WebSocket,
        })
    })

})

describe("error message", function () {

    const req: ISdStargateCommandDto = { header: {}, payload: {} }

    test("with a request id and no respective open request should trigger err-handler", (done) => {
        const [ client, ws ] = createWsClient(
            undefined,
            () => verify_n_open_connections(client.openRequests, 0, done),
        )

        ws.onmessage!({
            data: JSON.stringify({
                requestId: "1",
                errorType: "some type",
                errorMessage: "some message",
            } as ISdErrorResponseDto),
            type: "some type",
            target: ws as WebSocket,
        })
    })

    test("with a request id and respective open request should reject request", (done) => {
        const [ client, ws ] = createWsClient()

        client.generateRequestId = () => "1"
        client
            .send(req)
            .catch(unreachable("rejected req 1"))
            .then(unreachable("resolved req 1"))

        client.generateRequestId = () => "2"
        client
            .send(req)
            .catch(() => verify_n_open_connections(client.openRequests, 1, done))
            .then(unreachable("resolved req 2"))

        ws.onmessage!({
            data: JSON.stringify({
                requestId: "2",
                errorType: "some type",
                errorMessage: "some message",
            } as ISdErrorResponseDto),
            type: "some type",
            target: ws as WebSocket,
        })
    })

    test("without a request id should reject all open requests", (done) => {
        let rejectCounter = 0
        const reject = () => {
            if (++rejectCounter === 2) verify_n_open_connections(client.openRequests, 0, done)
        }

        const [ client, ws ] = createWsClient()

        client.generateRequestId = () => "1"
        client
            .send(req)
            .catch(() => reject())
            .then(unreachable("resolved req 1"))

        client.generateRequestId = () => "2"
        client
            .send(req)
            .catch(() => reject())
            .then(unreachable("resolved req 2"))

        ws.onmessage!({
            data: JSON.stringify({
                requestId: undefined,
                errorType: "some type",
                errorMessage: "some message",
            } as ISdErrorResponseDto),
            type: "some type",
            target: ws as WebSocket,
        })
    })

})

/* Helper functions */

// Check number of open requests in client. Calls the done-callback either way!
function verify_n_open_connections (openRequests: Record<string, any>, expected: number, done: DoneCallback): void {
    const n_openRequests = Object.keys(openRequests).length
    if (n_openRequests == expected) done()
    else done(`Found ${ n_openRequests } open client requests; should be ${ expected }.`)
}
