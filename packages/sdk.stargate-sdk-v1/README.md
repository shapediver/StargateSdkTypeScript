# `@shapediver/sdk.stargate-sdk-v1`

TypeScript SDK for the ShapeDiver Stargate v1 service.

Use this package to:

- connect to a Stargate backend over WebSocket
- register a client for an authenticated user
- list frontend and backend clients
- forward custom messages between clients
- send and handle built-in Stargate commands such as `STATUS`, `PREPARE_MODEL`, `GET_SUPPORTED_DATA`, `GET_DATA`, `BAKE_DATA`, and `EXPORT_FILE`

## Install

```bash
npm install @shapediver/sdk.stargate-sdk-v1
```

## Runtime

This package is intended for Node.js-based clients.

It uses the Node WebSocket stack from `@shapediver/sdk.stargate-sdk-core`, which depends on [`ws`](https://www.npmjs.com/package/ws). If you need a browser-facing integration, verify that your environment can provide a compatible WebSocket implementation before adopting this package.

## Before you start

You need:

- a Stargate hostname, for example `prod-sg.eu-central-1.shapediver.com`
- a JWT auth token for the user/client you want to register
- client metadata for registration: `clientName`, `clientVersion`, `hostOs`, `hostName`, and `hostUser`

This SDK does **not** create JWTs for you. In a typical setup, the JWT is issued by the ShapeDiver Platform Backend.

`setBaseUrl(...)` expects the hostname only. Do not include `https://` or `wss://`.

## Quick start

```ts
import { createSdk } from '@shapediver/sdk.stargate-sdk-v1';

const sdk = await createSdk()
  .setBaseUrl('prod-sg.eu-central-1.shapediver.com')
  .setServerCommandHandler((payload) => {
    console.log('server message', payload);
  })
  .setConnectionErrorHandler((message) => {
    console.error('connection error', message);
  })
  .setDisconnectHandler((message) => {
    console.warn('disconnected', message);
  })
  .build();

const registration = await sdk.register(
  process.env.STARGATE_JWT!,
  'My App',
  '1.0.0',
  'macOS 15',
  'my-machine',
  'my-user'
);

console.log('backend version', registration.version);
```

Important behavior:

- `build()` opens the WebSocket connection immediately.
- `register()` authenticates the client in Stargate.
- `register()` also checks backend compatibility and rejects incompatible Stargate major versions.
- Most SDK operations assume the client has already been registered successfully.

## Registration parameters

`register(authToken, clientName, clientVersion, hostOs, hostName, hostUser)`

- `authToken`: JWT used to authenticate this client with Stargate
- `clientName`: name of your client application
- `clientVersion`: version string of your client application
- `hostOs`: host platform identifier and version
- `hostName`: machine name
- `hostUser`: username associated with the host machine

## Connection handlers

All handler methods on the builder are optional.

- `setServerCommandHandler(...)` receives non-command messages and command payloads that are not handled by a registered command class.
- `setConnectionErrorHandler(...)` receives connection and protocol-level errors.
- `setDisconnectHandler(...)` is called when the connection is closed externally. It is not called when you close the SDK yourself via `sdk.close()`.

If you do not set handlers, the builder falls back to console logging.

## Working with clients

Call `register()` before listing, messaging, or disconnecting clients.

### List registered clients

```ts
const frontendClients = await sdk.listFrontendClients();
const backendClients = await sdk.listBackendClients();

console.log(frontendClients, backendClients);
```

Each listed client includes:

- `id`
- `clientType`
- `clientName`
- `clientVersion`
- `hostOs`
- `hostName`
- `hostUser`

### Forward a custom message

```ts
const frontendClients = await sdk.listFrontendClients();

await sdk.forwardMessage(
  { type: 'CUSTOM_EVENT', payload: { hello: 'world' } },
  frontendClients
);
```

You can also pass client IDs instead of full client objects:

```ts
await sdk.forwardMessage(
  { type: 'CUSTOM_EVENT', payload: { hello: 'world' } },
  frontendClients.map((client) => client.id)
);
```

### Disconnect clients

```ts
const backendClients = await sdk.listBackendClients();
await sdk.disconnectClients(backendClients);
```

`disconnectClients(...)` expects full client objects, not client IDs.

## Built-in commands

The SDK ships with command classes for common Stargate workflows:

- `SdStargateStatusCommand`
- `SdStargatePrepareModelCommand`
- `SdStargateGetSupportedDataCommand`
- `SdStargateGetDataCommand`
- `SdStargateBakeDataCommand`
- `SdStargateExportFileCommand`

### Command lifecycle

- Create one instance per command type per SDK.
- Register a handler on that instance if your client should respond to incoming commands of that type.
- Reuse the same instance for outgoing `send(...)` calls.
- Do not call `sdk.addCommand()` manually for built-in command classes. Their constructors already register them with the SDK.

Registered Stargate command payloads are intercepted and routed to matching command handlers. `setServerCommandHandler(...)` only sees non-command or otherwise unhandled messages.

### Sending and handling a command

```ts
import {
  SdStargateStatusCommand,
  ISdStargateStatusCommandDto,
  ISdStargateStatusReplyDto,
} from '@shapediver/sdk.stargate-sdk-v1';

const statusCommand = new SdStargateStatusCommand(sdk);

statusCommand.registerHandler(
  async (_msg: ISdStargateStatusCommandDto): Promise<ISdStargateStatusReplyDto> => {
    return {
      firstActivity: Math.floor(Date.now() / 1000),
      latestActivity: Math.floor(Date.now() / 1000),
    };
  }
);

const frontendClients = await sdk.listFrontendClients();
const dto: ISdStargateStatusCommandDto = {};
const replies = await statusCommand.send(dto, frontendClients);

console.log(replies);
```

### Command replies and timeouts

For the built-in `send(...)` methods:

- the returned promise resolves with one reply per target client
- all target clients must reply for the promise to resolve
- if any target client replies with an error, the promise rejects
- if at least one target client does not reply before the timeout, the promise rejects
- you can override the timeout by passing a third `timeout` argument in milliseconds

Default timeouts:

- `SdStargateStatusCommand.send(...)`: `10000`
- `SdStargateGetSupportedDataCommand.send(...)`: `10000`
- `SdStargatePrepareModelCommand.send(...)`: `60000`
- `SdStargateGetDataCommand.send(...)`: `60000`
- `SdStargateBakeDataCommand.send(...)`: `60000`
- `SdStargateExportFileCommand.send(...)`: `60000`

Example with an explicit timeout:

```ts
const replies = await statusCommand.send({}, frontendClients, 5_000);
```

## DTO examples

### `PREPARE_MODEL`

```ts
const dto = {
  model: { id: 'MODEL_ID' },
};
```

### `GET_SUPPORTED_DATA`

```ts
const dto = {};
```

### `GET_DATA`

```ts
const dto = {
  model: { id: 'MODEL_ID' },
  parameter: { id: 'PARAMETER_ID' },
};
```

### `BAKE_DATA`

```ts
const dto = {
  model: { id: 'MODEL_ID' },
  parameters: {
    PARAM_ID: 'PARAM_VALUE',
  },
  output: {
    id: 'OUTPUT_ID',
    chunk: { id: 'CHUNK_ID' },
  },
};
```

### `EXPORT_FILE`

```ts
const dto = {
  model: { id: 'MODEL_ID' },
  parameters: {
    PARAM_ID: 'PARAM_VALUE',
  },
  export: {
    id: 'EXPORT_ID',
    index: 0,
  },
};
```

## Error handling

SDK errors are exposed as `SdStargateError` instances.

```ts
import { isSgError } from '@shapediver/sdk.stargate-sdk-v1';

try {
  await sdk.listFrontendClients();
} catch (e) {
  if (isSgError(e)) {
    console.error(e.type, e.message);
  } else {
    console.error(e);
  }
}
```

Useful exported error helpers:

- `SdStargateError`
- `SdStargateErrorTypes`
- `isSgError`

Common cases include:

- authentication failures during `register()`
- invalid target clients for `forwardMessage(...)` or command sends
- command client errors when a target client replies with an error
- command timeout errors when not all target clients reply in time

## Cleanup

```ts
await sdk.close();
```

## More examples

End-to-end examples in this repository:

- [register.ts](https://github.com/shapediver/StargateSdkTypeScript/blob/development/packages/sdk.stargate-cli/src/command/register.ts)
- [listClients.ts](https://github.com/shapediver/StargateSdkTypeScript/blob/development/packages/sdk.stargate-cli/src/command/listClients.ts)
- [statusCommand.ts](https://github.com/shapediver/StargateSdkTypeScript/blob/development/packages/sdk.stargate-cli/src/command/statusCommand.ts)
- [prepareModelCommand.ts](https://github.com/shapediver/StargateSdkTypeScript/blob/development/packages/sdk.stargate-cli/src/command/prepareModelCommand.ts)
- [getSupportedDataCommand.ts](https://github.com/shapediver/StargateSdkTypeScript/blob/development/packages/sdk.stargate-cli/src/command/getSupportedDataCommand.ts)
- [getDataCommand.ts](https://github.com/shapediver/StargateSdkTypeScript/blob/development/packages/sdk.stargate-cli/src/command/getDataCommand.ts)
- [bakeDataCommand.ts](https://github.com/shapediver/StargateSdkTypeScript/blob/development/packages/sdk.stargate-cli/src/command/bakeDataCommand.ts)
- [exportFileCommand.ts](https://github.com/shapediver/StargateSdkTypeScript/blob/development/packages/sdk.stargate-cli/src/command/exportFileCommand.ts)
