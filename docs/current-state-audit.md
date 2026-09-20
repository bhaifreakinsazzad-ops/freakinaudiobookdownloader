# SFYTA3.H-V.A Current-State Audit

**Audit phase:** Phase 0 — discovery and compliance design  
**Repository:** `sfyta3-h-v-a`  
**Scope:** Current codebase only. No major feature work was added during this audit.

## Executive summary

SFYTA3.H-V.A is a **single-package, static React prototype**. Its strongest working path is a user-initiated browser-tab capture flow that requests tab audio with `getDisplayMedia`, collects PCM frames in an `AudioContext`, creates a WAV file in the browser, and triggers a local download. The interface also demonstrates the intended product shape: a capture studio, local archive library, audit view, source analyzer, settings, and rights confirmation modal.

The current implementation is suitable for **visual validation and a short-session browser prototype**. It is not yet a production-ready capture platform. The largest gaps are real format encoding, actual Turbo processing, real source adapters, robust DRM/license checks, extension background capture, end-to-end/audio-quality test coverage, and a backend contract for identity, sync, metadata, and compliance records.

Phase 1 has now replaced the prototype’s weak storage path with a versioned IndexedDB repository. Recordings, ordered audio chunks, sources, audit events, settings, and waveform peaks are persisted locally. The remaining gaps listed below are still valid for encoding, Turbo, source adapters, compliance enforcement, extension capture, and cloud services.

TypeScript validation, storage tests, and the production build pass. Several product behaviors should still be corrected before expanding the prototype because the current UI exposes controls whose underlying implementation remains a placeholder.

## Phase 1 storage update

The repository now opens a versioned `sfyta3-h-v-a` IndexedDB database from `client/src/lib/storage.ts`. It uses separate object stores for recordings, recording chunks, sources, audit events, settings, and waveforms. Audio is sliced into ordered chunks with a default size of 1 MiB, and downloads reconstruct a `Blob` from those chunks. Deleting a recording removes its metadata, chunks, and waveform in one transaction.

The application hydrates the archive asynchronously on startup, migrates legacy `localStorage` metadata once, seeds the existing demo library into IndexedDB when no archive exists, and persists settings and audit events through the same repository. Storage failures are normalized into typed errors. Quota failures surface an actionable in-app banner and toast rather than silently losing the event.

Phase 1 adds `client/src/lib/storage.test.ts` with five Vitest cases covering chunk ordering and reconstruction, search and filters, recording deletion cleanup, source/audit/settings persistence, and quota error normalization. The remaining audio limitation is intentional: the prototype still writes WAV only, so storage persistence is now durable but encoding breadth is not yet implemented.

## Current folder structure

The repository contains a Vite + React + TypeScript frontend, a minimal Express static server, and shared constants. It does not yet contain the planned extension, processing packages, backend service, database schema, worker, or documentation tree.

```text
sfyta3-h-v-a/
├── client/
│   ├── index.html
│   ├── public/
│   │   ├── manifest.json
│   │   └── __manus__/                 # WebDev runtime assets
│   └── src/
│       ├── App.tsx                    # Error boundary, tooltip provider, toast root
│       ├── main.tsx                   # React entry point
│       ├── index.css                  # Full visual system and responsive CSS
│       ├── pages/
│       │   ├── Home.tsx               # Entire product experience and state machine
│       │   └── NotFound.tsx
│       ├── components/
│       │   ├── ErrorBoundary.tsx
│       │   ├── ManusDialog.tsx
│       │   ├── Map.tsx                # Template component; unused by the product
│       │   └── ui/                    # shadcn/Radix-style template primitives
│       ├── contexts/
│       │   └── ThemeContext.tsx       # Present in template; not used by App.tsx
│       ├── hooks/                     # Template hooks
│       ├── lib/utils.ts
│       └── const.ts
├── server/
│   └── index.ts                       # Static-file Express wrapper only
├── shared/
│   └── const.ts
├── dist/                              # Generated build output; not source
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── vite.config.ts
```

`Home.tsx` is currently the principal product module. It is approximately 500 lines and combines UI layout, state management, capture orchestration, audio processing, download behavior, local persistence, audit events, and demo source analysis. This concentration is acceptable for a prototype but is the main maintainability constraint for the next phase.

## Current capture implementation

The capture path is implemented in `client/src/pages/Home.tsx` [1]. When the user starts a capture, the app first checks the local rights-confirmation state and a manually controlled blocked-source state. It then calls `navigator.mediaDevices.getDisplayMedia` with browser-tab display hints and `audio: true` [1]. The video tracks are immediately stopped, while the audio tracks are retained.

The remaining audio stream is routed through an `AudioContext`, a `MediaStreamAudioSourceNode`, a `ScriptProcessorNode`, and a silent `GainNode`. The gain is set to zero so the monitor path does not create audible feedback. The processor copies channel-zero PCM frames into an in-memory `Float32Array[]` buffer while the session is marked as recording [1]. A timer updates the visible elapsed time and an estimated byte counter.

Stopping the session ends the tracks, disconnects the audio nodes, closes the context, merges all buffered PCM into one contiguous array, and creates a WAV file. The result is added to the in-memory library and offered through a browser download action [1]. A fallback demo WAV is generated when no PCM frames were collected. This fallback supports the visual prototype but should not be used as a production success path.

The implementation has the following boundaries:

- It depends on browser support for `getDisplayMedia`, Web Audio, and a user-selected shared tab.
- It does not use `MediaRecorder`; it records raw PCM through the deprecated `ScriptProcessorNode` path.
- It keeps the entire session in memory until stop, so long recordings can exhaust memory.
- It does not preserve a background session if the page or popup closes.
- It does not identify the actual active page, media element, chapter, author, or source URL from the browser tab.
- The displayed byte counter is an estimate and is not derived from encoded output.

## Current storage implementation

The library now uses a versioned IndexedDB repository in `client/src/lib/storage.ts`. Separate object stores hold recording metadata, ordered recording chunks, sources, audit events, settings, and waveform peaks. Audio is split into 1 MiB chunks by default. Downloads reconstruct a `Blob` from those chunks, so audio survives browser restarts rather than existing only in React state.

The startup path migrates legacy `localStorage` metadata once and seeds the existing demo library into IndexedDB when no archive exists. Storage errors are normalized into typed errors. Quota failures are surfaced through an actionable toast and an in-app alert. There is still no cloud storage, authentication, encryption, or synchronization layer.

Recording deletion removes metadata, chunks, and waveform data in one IndexedDB transaction. Search and source/format filtering are executed against hydrated recording metadata. Audit events and settings persist through IndexedDB, but the audit log is not tamper-resistant, user-bound, exportable, or server-backed and is therefore not yet suitable as an authoritative compliance record.

## Current encoding implementation

The only implemented encoder is a hand-written PCM-to-WAV writer. It writes a 44-byte RIFF/WAVE header and converts normalized floating-point samples into signed 16-bit mono PCM [1]. The output MIME type is `audio/wav`.

The interface exposes WAV, MP3, Opus, and AAC options, but the selected format is not passed to an encoder. The stop path always creates WAV, and the library download path always uses the `.wav` extension [1]. The quality selector is also informational; it does not change sample rate, bit rate, or output data. This is the most important current product/implementation mismatch.

There is no MP3 encoder, AAC encoder, Opus encoder, FLAC encoder, Web Worker, WebCodecs path, `ffmpeg.wasm`, server-side transcode job, metadata tag writer, checksum, or duration/integrity validation.

## Current Turbo mode implementation

Turbo mode now performs bounded post-capture time compression over the authorized PCM buffer. It uses chunked linear interpolation with a selectable 2×–8× speed limit, yields between chunks, and then passes the compressed buffer through the existing encoding worker. Normal mode leaves the captured PCM duration unchanged.

Turbo processing reports percentage and estimated remaining time, rejects captures over 256 MB or 30 minutes, validates finite samples, peak bounds, and expected duration ratio before saving, and preserves the existing rights confirmation and DRM block path. It is intentionally a local processing strategy rather than a DRM bypass or direct protected-URL fetch.

The strategy does not preserve pitch: this matches the requested safe playback-rate behavior and keeps the implementation deterministic for captured PCM. OfflineAudioContext and direct authorized URL decode remain future adapters for sources that expose safely obtainable audio buffers.

## Current rights and DRM workflow

The rights flow is explicit at the UI level. A new capture opens a modal that asks the user to confirm legal authorization, explains that protected content will be blocked, includes Bangla copy, and records a local audit event when the user confirms [1]. The app also provides a local-only privacy explanation.

The DRM path is not an automatic detector. A “Test DRM block” action manually sets the source to a blocked state and adds an audit event. The source analyzer is also a timed simulation that always returns the same ElevenLabs Reader result and clears the blocked state [1]. There is no inspection of `HTMLMediaElement`, Encrypted Media Extensions, protected URL patterns, license metadata, platform policy, HTTP status, or adapter-specific capabilities.

The current workflow is therefore a **compliance UX prototype**, not a compliance enforcement system. The rights confirmation is not authenticated or durable beyond local browser storage, and the audit event is not authoritative.

## Current library implementation

The archive library is a view inside `Home.tsx`, selected by local navigation state rather than a separate route. It provides a search field, summary metrics, recording rows, delete actions, download actions, local badges, and a play button [1]. Search is client-side over hydrated IndexedDB metadata and the storage repository also supports source and format filters.

The play action still shows a toast instead of opening an audio element or player. Seeded rows now have small WAV blobs stored in IndexedDB, and real captures are reconstructed from stored chunks for download. The library does not yet provide real playback, metadata editing, sorting controls, chapter display, file integrity validation, pagination, or multi-device access.

## Current tests

The repository now has `client/src/lib/storage.test.ts` with five Vitest unit/integration cases for chunking and reconstruction, search and filters, deletion cleanup, source/audit/settings persistence, and quota error normalization. There are still no end-to-end, audio-quality, compliance, or stress tests.

The baseline verification completed for this audit is:

```text
pnpm check   → passed
pnpm test    → 5 passed
pnpm build   → passed
```

The build produces the Vite client bundle and the minimal Express static server bundle. The only build warning is the normal Vite chunk-size warning for the current single-page bundle. No TypeScript errors were reported.

## Gaps versus a production-ready platform

The gaps below are ordered by the point at which they can invalidate the product’s core promise.

| Area | Current state | Production requirement |
|---|---|---|
| Capture lifetime | Page-bound `getDisplayMedia` session | Extension `tabCapture`, offscreen document, background service worker, reconnectable session state |
| Audio pipeline | Raw PCM through `ScriptProcessorNode` | `MediaRecorder` or AudioWorklet baseline, chunked processing, worker isolation, browser compatibility strategy |
| Storage | Versioned IndexedDB with ordered local audio chunks, sources, audits, settings, and waveforms | File System Access for very large archives, explicit retention/orphan cleanup, optional encrypted cloud storage |
| Encoding | WAV only, hand-written encoder | Verified MP3/Opus/AAC/FLAC/WAV pipeline with explicit format capability matrix |
| Turbo | Local chunked PCM time compression at 2×–8× with progress, limits, and quality validation | Optional pitch-preserving/offline adapters, cancellation/recovery, broader long-session streaming |
| Source analysis | Hard-coded Reader demo | Modular adapters, generic media discovery, metadata extraction, source capability report |
| DRM/compliance | Manual demo block plus local confirmation modal | Real protected-media detection, platform policy checks, license metadata, durable audit events, legal review |
| Library | Single React view, metadata-only persistence | Domain model, durable blobs, playback, editing, chapters, checksums, filters, sorting, deletion semantics |
| Identity and sync | No authentication or backend | User/device identity, encrypted optional sync, conflict resolution, data export and deletion |
| Extension | Not present | Manifest V3 popup, content script, service worker, offscreen recorder, minimal permissions, store policy documentation |
| Mobile/PWA | Manifest only; no service worker | Installable PWA, offline library, responsive playback, mobile capability constraints |
| Tests | No tests | Unit, browser integration, extension E2E, audio fixtures, compliance scenarios, stress and memory tests |
| Observability | Toasts and local arrays | Structured diagnostics without raw audio, error taxonomy, crash and performance telemetry |
| Security | Client-only prototype | CSP, dependency policy, upload scanning if uploads are introduced, key management, privacy policy, threat model |

The current `manifest.json` also has an empty `icons` array [2]. That is sufficient as lightweight metadata but not sufficient for a reliable install experience across browsers.

## Proposed monorepo refactor plan

The refactor should preserve the current static frontend as the first consumer while extracting domain boundaries before adding cloud or extension complexity. The recommended target is a pnpm workspace with independently testable packages.

```text
sfyta3-h-v-a/
├── apps/
│   ├── web/                 # Current React app, route shell, PWA UI
│   ├── extension/           # Manifest V3 popup, content script, service worker
│   ├── desktop/             # Optional Tauri/Electron wrapper later
│   └── mobile/              # Optional native companion later
├── packages/
│   ├── domain/              # Recording, source, device, compliance types
│   ├── capture-core/         # Media source abstraction and session state machine
│   ├── audio-buffer/         # Chunking, backpressure, memory limits
│   ├── encoders/             # WAV, MP3, Opus, AAC, FLAC capability adapters
│   ├── processing/           # Turbo, normalization, silence, chapter operations
│   ├── adapters/             # Generic web media and platform-specific adapters
│   ├── compliance/           # Rights gate, DRM signals, policy decisions, audit events
│   ├── library/              # IndexedDB repository and file lifecycle
│   ├── ui/                   # Shared design system and accessible primitives
│   └── config/               # Shared TypeScript, lint, test, and build configuration
├── services/
│   ├── api/                  # Auth, metadata, device, compliance, sync APIs
│   ├── worker/               # Transcode, waveform, checksum, cleanup jobs
│   └── storage/              # Encrypted object storage abstraction
├── docs/
│   ├── current-state-audit.md
│   ├── prd.md
│   ├── architecture.md
│   ├── compliance.md
│   ├── api.md
│   └── testing.md
└── tooling/
    ├── scripts/
    └── fixtures/
```

A safe migration sequence is as follows:

1. **Freeze the current UI contract.** Add a minimal test harness and document which controls are functional, simulated, or planned. Correct misleading labels before extracting modules.
2. **Extract domain types and state machines.** Move `Recording`, `AuditEvent`, capture status, mode, format, and source capability types into `packages/domain`. Define explicit transitions for ready, requesting permission, recording, paused, processing, ready-to-download, failed, and blocked.
3. **Extract capture-core.** Define a `CaptureSource` interface for `getDisplayMedia`, extension `tabCapture`, and future media-element capture. Keep browser-specific permission code in adapters, not in the UI.
4. **Replace the raw buffer path.** Introduce chunked audio buffers with a memory budget and a worker boundary. Use `MediaRecorder` for the simplest supported output and reserve AudioWorklet for frame-level processing.
5. **Add durable local storage.** Implement an IndexedDB repository for recording metadata, audio chunks, audit events, and schema versioning. Make download and playback read from the repository rather than from React state.
6. **Make encoding capability-driven.** The UI should render only formats supported by the active encoder. Each encoder should declare MIME type, extension, sample-rate constraints, and whether metadata tagging is supported.
7. **Implement compliance as a decision service.** A source analysis result should contain `supported`, `drmDetected`, `licenseStatus`, `reason`, and adapter metadata. The UI should render the decision without inventing it locally.
8. **Build the extension as a separate app.** Use a Manifest V3 service worker and offscreen document for persistent recording. Share capture-core, compliance, domain types, and UI primitives with the web app.
9. **Add backend capabilities only after local durability works.** Introduce auth, device registration, metadata APIs, optional encrypted file sync, audit storage, and background jobs as separate services.
10. **Add fixture-based testing.** Use an authorized mock media page, synthetic WAV fixtures, a protected-source fixture, and long-session memory tests. Require the compliance cases to pass before adding new adapters.

## Immediate stabilization actions before Phase 1

These actions are small enough to remain within Phase 0 and should be completed before using the prototype as an implementation baseline:

1. **Remove or disable non-WAV output choices until encoders exist.** The current MP3, Opus, and AAC controls still produce WAV files. Leaving them selectable creates an incorrect user expectation.
2. **Extend Turbo coverage to cancellation and long-session streaming.** The current bounded path is real and tested, but still operates on an in-memory capture buffer and should be moved behind a worker/streaming boundary for larger archives.
3. **Separate demo recordings from real recordings.** Seeded rows and synthetic fallback downloads should carry an explicit demo flag so a user cannot mistake generated audio for an archived source.
4. **Add retention and orphan-cleanup policy.** IndexedDB persistence now survives restarts, but production storage still needs explicit retention limits, storage-usage reporting, schema migrations, and recovery for interrupted chunk writes.
5. **Add a small baseline test suite.** The first tests should cover WAV header generation, duration formatting, capture-state transitions, rights denial, DRM block behavior, and the filename policy.
6. **Add an explicit failure state for unsupported browsers.** The current code handles a missing `getDisplayMedia` function, but browser support, no-audio-share, stream-ended, context failure, and storage failure should map to typed user-facing errors.

Phase 5 added the real Turbo processing path and tests. The codebase is currently buildable and type-safe; the remaining actions above should be treated as stabilization work before extension or backend implementation.

## References

[1]: ../client/src/pages/Home.tsx "SFYTA3.H-V.A capture studio, storage, compliance, library, and settings implementation"

[2]: ../client/public/manifest.json "SFYTA3.H-V.A browser install manifest"


## Phase 6 library update

Phase 6 upgrades the local archive to IndexedDB schema version 2. Recordings now support durable tags, favorite state, archived state, failure/retry metadata, waveform peaks, chapter markers, and per-recording playback position, volume, and speed. Deleting a recording removes its audio chunks, waveform, chapters, and metadata together.

The library view now provides responsive search, favorite/archive filters, newest/oldest/title sorting, JSON metadata export, rename/tag editing, favorite toggling, archive/restore, download, delete, and retry recovery when local chunks remain. Playback uses a real local `HTMLAudioElement` with seek, volume, speed, and persisted resume state. Chapter markers are created at the current playback position, sorted by time, persisted locally, and seekable from the player.

Waveform peaks are generated through `client/src/lib/waveform.ts`, stored with each recording, loaded during archive hydration, and rendered as compact library-row previews. Captures continue to generate peaks before persistence, and the waveform generator is independently tested. The implementation remains local-first and does not upload audio or alter DRM/compliance behavior.

Phase 6 validation completed with 16 passing tests across encoder, storage, Turbo, and waveform suites; TypeScript validation and the production build also pass.


## Phase 7 PWA update

The web application now includes an installable PWA shell. `client/public/manifest.json` defines standalone display mode, scope, theme/background colors, categories, and 192px/512px icons. `client/public/sw.js` installs a versioned cache, precaches the app shell, applies cache-first behavior for same-origin static assets, refreshes cached assets from the network, and serves the cached root shell for offline navigations.

The React entrypoint registers the service worker when served in a secure context. `PwaStatus` exposes an install prompt when the browser provides `beforeinstallprompt`, hides after installation, and displays an offline status that explains the local IndexedDB library remains available. Capture is not artificially disabled offline; it still checks the browser's media-capture permission/API support and reports normal browser permission errors. No audio or library data is uploaded by the PWA layer.

PWA checks cover manifest install metadata, service-worker cache/navigation behavior, manifest and service-worker asset presence, and preservation of the IndexedDB local-first storage path. Phase 7 validation completed with 19 passing tests, TypeScript validation, a successful production build, and live HTTP verification of `/`, `/library`, `/manifest.json`, `/sw.js`, and both icon assets.


## Phase 8 optional cloud sync abstraction

The application now exposes a provider-agnostic local-first sync interface in `client/src/lib/sync.ts`. The `SyncProvider` contract includes authentication, sign-out, current-user lookup, device registration, metadata synchronization, optional file upload, encryption hooks, conflict resolution, and sync status. `MockSyncProvider` provides a deterministic development implementation and is intentionally not connected to a real cloud service. The interface is ready for adapters backed by Supabase/Clerk authentication, S3/R2 object storage, or a custom backend without coupling the local library to any vendor.

Cloud behavior is opt-in. Local-only mode remains the default and continues to function without authentication, network access, or cloud configuration. Metadata synchronization requires provider sign-in and device registration. Audio file upload is disabled by default and only occurs when the user explicitly enables upload consent. Metadata and file encryption hooks are available for a production adapter; the mock provider exercises those hooks without claiming production cryptography.

The sync panel exposes status, deterministic conflict handling (`newest-wins`, local-wins, or remote-wins), explicit file-upload consent, sync and disable actions, and provider readiness messaging. Sync enabled, disabled, and failed actions are persisted as explicit audit event types. Phase 8 validation completed with 22 passing tests, TypeScript validation, and a successful production build.


## Phase 9 compliance and privacy hardening

Capture now uses pure compliance decisions for every start attempt: explicit rights confirmation is mandatory, protected-source signals block capture, and unavailable browser display-audio APIs fail closed. Source evaluation recognizes DRM/encrypted-media/license-control indicators and unknown license status. The analyzer no longer clears a protected state blindly; it applies the evaluated decision and records either a source-analysis or capture-blocked audit event.

The visible rights confirmation explains legal authorization, DRM blocking, and local-only behavior in English and Bangla. A dedicated settings privacy policy states that there is no hidden recording and no upload without consent. The capture path only begins after the browser’s visible `getDisplayMedia` permission flow succeeds, requires an audio track, stops shared video tracks, and stops when the shared audio track ends.

Audit writes are attempted for all compliance and sync actions whenever IndexedDB is available, including rights confirmation, capture start, capture blocked, source analysis, archive actions, sync enabled, sync disabled, and sync failure. Compliance tests cover rights gating, protected-source detection, unknown licenses, browser capability failure, and persisted audit action types.
