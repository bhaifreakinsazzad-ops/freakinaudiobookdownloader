# Changelog

## 2026-09-20 — Phase 11 release candidate

Added the complete documentation set, final testing matrix, release checklist, extension store listing draft, privacy policy, architecture guide, and final project report. Added release scripts for typecheck, lint, web tests/build, extension checks/tests/package, and production artifact smoke validation.

## Phase 10 — Testing and release readiness

Added release-focused audio quality, stress, integration, quota, PWA, sync, compliance, and extension messaging tests. Added an optional MV3 extension messaging starter and ZIP packaging pipeline. Added E2E-capability smoke checks for the production shell and offline artifacts.

## Phase 9 — Compliance and privacy hardening

Hardened mandatory rights confirmation, protected-source and unknown-license blocking, persisted compliance audit actions, bilingual privacy copy, no-hidden-recording behavior, and upload-consent boundaries.

## Phase 8 — Optional sync abstraction

Added provider-neutral auth/device/metadata/file-sync interfaces, mock provider, encryption hooks, deterministic conflict handling, sync status UI, explicit file-upload consent, and sync audit events. Local-only remains the default.

## Phase 7 — PWA offline support

Added installable manifest, icons, service worker, cached app shell, offline navigation fallback, install prompt, and offline status UI.

## Phase 6 — Library and playback

Added persisted waveforms, playback state, seek/volume/speed controls, chapters, metadata editing, tags, favorites, archive/restore, search/filter/sort, export, download, delete, and retry recovery.

## Phase 5 — Real Turbo mode

Added bounded faster-than-realtime PCM processing, progress estimates, memory/duration limits, quality validation, and Turbo tests.

## 2026-09-20 — Merged publish package

Consolidated the web release and MV3 companion into one publishable tree. Upgraded the extension from a messaging-only starter to a least-privilege popup companion with deployment URL configuration, local URL storage, status messaging, icons, and a final `sfyta3-h-v-a-extension.zip` artifact. Updated artifact smoke checks, package naming, release documentation, and combined release validation.
