# Testing and Release Validation

## Commands

| Command | Coverage |
|---|---|
| `pnpm typecheck` | Application TypeScript validation |
| `pnpm lint` | Prettier formatting check for release-owned files |
| `pnpm test` | Unit, integration, PWA, sync, compliance, encoder, waveform, Turbo, audio-quality, stress, and quota tests |
| `pnpm extension:check` | Extension TypeScript validation |
| `pnpm extension:test` | Extension messaging tests |
| `pnpm build` | Production web and Express bundles |
| `pnpm extension:package` | MV3 extension companion build and ZIP package |
| `pnpm e2e:smoke` | Production artifact and route-capability smoke checks |
| `pnpm release:check` | Complete release matrix |

## Coverage implemented

Unit tests cover filename sanitization, WAV/MP3 encoding invariants, resampling, Turbo limits/progress/quality, waveform peak bounds, compliance decisions, PWA manifest/service-worker contracts, sync provider behavior, and extension message validation. Integration tests exercise IndexedDB chunk ordering, waveform/chapter/playback persistence, metadata updates, deletion cleanup, and audit action persistence. Release tests exercise audio quality invariants, bounded five-second Turbo processing, persistence integration, and quota diagnostics.

The environment does not include a browser automation binary, so full interactive E2E tests are not run here. `pnpm e2e:smoke` validates the production shell, manifest, service worker, and extension artifacts. A deployment pipeline with Chromium/Playwright should add permission-denial, visible share-dialog, offline navigation, install prompt, playback, and extension round-trip tests.

## Release acceptance

A release candidate is acceptable when typecheck, lint, all unit/integration tests, extension checks/tests, production web build, extension package build, and artifact smoke checks pass. The current release also retains the known Vite chunk-size warning because it is an optimization warning rather than a build failure.
