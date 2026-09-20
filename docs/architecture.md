# Architecture

## Runtime layers

The React application starts at `client/src/main.tsx`, mounts `App`, and renders the primary studio/library/settings experience from `client/src/pages/Home.tsx`. Reusable domain boundaries live under `client/src/lib`.

| Layer | Responsibility |
|---|---|
| Capture | Visible `getDisplayMedia` permission flow, Web Audio PCM collection, stream lifecycle, and fail-closed capture gating |
| Compliance | Rights confirmation, protected-source decision, unknown-license blocking, and compliance reason codes |
| Processing | Normal capture, bounded Turbo time compression, waveform peak generation, encoder worker integration, and quality checks |
| Persistence | IndexedDB v2 recordings, ordered audio chunks, waveforms, chapters, playback settings, source records, settings, and audit events |
| Library | Playback, metadata, favorites, archive state, tags, chapters, search/filter/sort, export, download, deletion, and retry |
| PWA | Manifest, icons, service worker, cache versioning, offline navigation fallback, and install/offline status UI |
| Sync | Provider interface for auth, devices, metadata, optional files, encryption hooks, conflicts, and status; mock provider is the current implementation |
| Extension | Optional MV3 companion popup, status messaging, and explicit web-app handoff; intentionally not a background recorder |
| Server | Express static server serving `dist/public` with SPA fallback; it does not provide cloud identity or authoritative compliance enforcement |

## Data flow

Capture only proceeds after compliance prerequisites pass. The browser supplies a visible display-audio stream. PCM chunks remain in memory during capture, then pass through optional Turbo processing, waveform generation, and the existing WAV/MP3 encoder worker. The resulting audio is chunked into IndexedDB and paired with metadata, waveform peaks, and audit events.

The Library reads metadata and waveform peaks from IndexedDB and retrieves audio chunks only when playback or download is requested. Playback state and chapters are written back to IndexedDB. PWA offline behavior does not replace IndexedDB; it caches the application shell so the local library can still open without a network.

## Sync adapter boundary

`SyncProvider` is deliberately vendor-neutral. A production adapter can combine Clerk or another identity provider, Supabase or a custom metadata API, and S3/R2 or another object store. The adapter must implement authentication, device registration, metadata revisions, conflict handling, encryption hooks, and explicit upload consent. The local repository remains the source of truth until a user opts into sync.

## Security boundaries

No client-only decision should be described as authoritative legal compliance. Production deployments should add authenticated audit records, server-side policy decisions, encryption key management, upload scanning, rate limiting, CSP, and threat-model review before enabling a real backend.
