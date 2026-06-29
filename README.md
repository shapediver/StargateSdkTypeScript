<p align="center">
  <a href="https://www.shapediver.com/">
    <img src="https://sduse1-assets.shapediver.com/production/assets/img/navbar_logo.png" alt="ShapeDiver" width="392" />
  </a>
</p>

# StargateSdkTypeScript

TypeScript SDKs and tooling for the ShapeDiver Stargate system.

[ShapeDiver](https://www.shapediver.com/) is a cloud platform for building online applications based
on parametric 3D files made with [Rhinoceros 3D](https://www.rhino3d.com/) and
[Grasshopper](https://www.grasshopper3d.com/).

The **ShapeDiver Stargate system** connects external clients to the ShapeDiver Platform backend.
Typical clients include Node.js applications, Rhino plugins, Illustrator plugins, and other native
or server-side integrations. Through Stargate, such clients can:

- register themselves for an authenticated user
- discover other connected frontend and backend clients
- exchange custom messages between clients
- respond to built-in Stargate workflows such as `PREPARE_MODEL`, `GET_DATA`, `BAKE_DATA`, and `EXPORT_FILE`

This is especially useful when operations should happen inside the client's native environment, for
example baking data in a CAD application or exporting files through a client-specific toolchain.

## Packages

This repository currently contains:

- [`@shapediver/sdk.stargate-sdk-v1`](./packages/sdk.stargate-sdk-v1/README.md): the main user-facing SDK for connecting to Stargate from TypeScript clients.
  NPM: [@shapediver/sdk.stargate-sdk-v1](https://www.npmjs.com/package/@shapediver/sdk.stargate-sdk-v1)
- [`@shapediver/sdk.stargate-sdk-core`](./libs/sdk.stargate-sdk-core/README.md): low-level Stargate transport utilities used by the v1 SDK.
  Most users should use the v1 package instead of this library directly.
- [`sdk.stargate-cli`](./packages/sdk.stargate-cli/README.md): a simple CLI utility for manual testing and development workflows.

## Getting Started

If you want to integrate with Stargate, start with the v1 package:

- Repository docs: [packages/sdk.stargate-sdk-v1/README.md](./packages/sdk.stargate-sdk-v1/README.md)
- NPM package: [@shapediver/sdk.stargate-sdk-v1](https://www.npmjs.com/package/@shapediver/sdk.stargate-sdk-v1)

Install it with:

```bash
npm install @shapediver/sdk.stargate-sdk-v1
```

The package README documents connection setup, registration, client discovery, custom messaging,
built-in commands, timeouts, and error handling.

## Repository Layout

- [`packages/`](./packages): publishable packages and tools
- [`libs/`](./libs): shared internal libraries
- [`scripts/`](./scripts): workspace bootstrap, build, test, publish, and maintenance scripts

## Making Changes & Contributing

This project is written in TypeScript and managed as a PNPM workspace with Lerna.

### Setup

The repository bootstrap scripts currently require:

- Node.js `v24`
- NPM `v11`
- PNPM `v11`
- Python `3.9.x`

Install all workspace dependencies and initialize the local Python environment:

```bash
npm run init
```

### Build

Common workspace commands:

- `npm run build`: build all packages
- `npm run build-dep`: build packages together with their internal dependencies
- `npm run test`: run tests across the workspace

You can also run `npm run build` or `npm run test` inside an individual package.

### Repository Notes

- Packages live under `packages/*` and shared libraries under `libs/*`.
- The repository uses independent package versioning for publishing.
- The workspace scope is configured in [`scope.json`](./scope.json).

## Release

Before releasing packages from this repository, ensure that your npm authentication is configured
correctly in `~/.npmrc`.

Afterwards, run:

```bash
npm run publish
```

The repository publishing CLI will guide you through package selection, version updates, registry
selection, publishing, and related Git steps.

## Support

If you have questions about ShapeDiver, please use the
[ShapeDiver Help Center](https://help.shapediver.com/).

You can find out more about ShapeDiver at [shapediver.com](https://www.shapediver.com/).

## Licensing

This project is released under the [ISC License](./LICENSE).
