# SFYTA3.H-V.A

SFYTA3.H-V.A is a compliance-first, local-first audio capture studio built with React, Vite, TypeScript, Web Audio, IndexedDB, and an Express production wrapper.

## What is implemented

The browser application supports visible browser-tab audio capture through `getDisplayMedia`, PCM collection, WAV/MP3 encoding, bounded 2×–8× Turbo processing, waveform peak generation, IndexedDB v2 persistence, local playback with seek/volume/speed controls, resume state, chapters, tags, favorites, archive/restore, search/filter/sort, download, JSON metadata export, deletion, and retry recovery where local chunks remain.

The app is installable as a PWA. Its service worker caches the application shell and same-origin assets and serves the cached shell for offline navigation. The local library remains available offline. Capture still depends on browser display-audio APIs and user permission.

Cloud sync is optional. The provider abstraction supports authentication, device registration, metadata sync, consent-gated file upload, encryption hooks, and deterministic conflict strategies. The current provider is a mock development provider; local-only mode remains the default and no real cloud service is required.

Rights confirmation is mandatory before capture. Protected/DRM/encrypted-media/license-control signals and unknown authorization states fail closed. Audit events are persisted locally for rights confirmation, source decisions, capture starts/blocks, archive actions, and sync enable/disable/failure. The settings UI contains English and Bangla privacy boundaries.

An optional MV3 companion is packaged with a deployment URL popup, local URL storage, status surface, and future integration boundary. It is intentionally not a background recorder and rejects capture requests outside the application rights gate.

## Requirements

- Node.js 22 or a compatible modern Node.js release
- pnpm 10.x
- A browser with `getDisplayMedia`, Web Audio, IndexedDB, and HTTPS support for PWA installation

## Development

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open the URL printed by Vite. Capture requires a user gesture and a browser tab selected through the visible share dialog.

## Validation and release

```bash
pnpm typecheck       # TypeScript validation
pnpm lint            # Prettier lint check for release-owned files
pnpm test            # Unit, integration, audio, stress, quota, PWA, sync, and compliance tests
pnpm build           # Production web bundle and Express server bundle
pnpm extension:check
pnpm extension:test
pnpm extension:package
pnpm e2e:smoke       # Production-artifact E2E-capability smoke check
pnpm release:check   # Complete release matrix
```

The web build writes `dist/public/` and `dist/index.js`. The extension companion is emitted to `dist/extension/` and packaged as `dist/sfyta3-h-v-a-extension.zip`.

## Production start

```bash
NODE_ENV=production PORT=3000 pnpm start
```

The server serves `dist/public` and provides the SPA fallback for client-side routes. Deploy behind HTTPS to enable service-worker registration and PWA installation.

## Privacy and compliance boundaries

The app does not record hidden background audio. Capture begins only after the browser’s visible permission flow succeeds, requires a shared audio track, and stops when that track ends. Audio remains in IndexedDB by default. No file upload occurs without explicit consent. The app does not bypass DRM or access controls.

See [Getting Started](docs/getting-started.md), [Architecture](docs/architecture.md), [Compliance](docs/compliance.md), [Privacy Policy](docs/privacy-policy.md), [Extension Store Listing](docs/extension-store-listing.md), [Testing](docs/testing.md), [Changelog](docs/changelog.md), and [Publish Readiness](docs/publish-readiness.md).
