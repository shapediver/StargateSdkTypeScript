# `@shapediver/sdk.stargate-sdk-core`

Low-level Stargate transport utilities for TypeScript. This package provides the WebSocket client used by the higher-level `@shapediver/sdk.stargate-sdk-v1` package.

Most users should start with `@shapediver/sdk.stargate-sdk-v1` instead of using this package directly.

## Install

```bash
npm install @shapediver/sdk.stargate-sdk-core
```

## Exports

- `createStargateClient`
- `ISdStargateClient`
- `ISdStargateClientOptionKeepAlive`
- `ISdStargateCommandDto`
- `SdStargateCoreErrorTypes`
- `SdUtils`

## Basic usage

```ts
import { createStargateClient, ISdStargateCommandDto } from '@shapediver/sdk.stargate-sdk-core';

const client = createStargateClient(
    (payload) => console.log('message', payload),
    (message) => console.error('error', message),
    (message) => console.warn('disconnected', message)
);

await client.connect('prod-sg.eu-central-1.shapediver.com');

const request: ISdStargateCommandDto = {
    header: { command: 'PING' },
    payload: undefined,
};

const response = await client.send(request);
console.log(response);

// unsolicited backend or forwarded client messages are delivered to msgHandler

await client.disconnect();
```

## Keep-alive

You can configure automatic keep-alive messages via `ISdStargateClientOptionKeepAlive`:

```ts
const client = createStargateClient(msgHandler, errHandler, dcnHandler, {
    interval: 60_000,
    reqCreator: () => ({
        header: { command: 'PING' },
        payload: undefined,
    }),
});
```

## Notes

- Pass the Stargate hostname only, for example `prod-sg.eu-central-1.shapediver.com`.
- Do not include `wss://`; the client adds it internally.
- Errors are surfaced via rejected promises and the configured error handler.
