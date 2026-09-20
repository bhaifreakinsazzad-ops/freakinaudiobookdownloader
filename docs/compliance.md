# Compliance and Rights

## Capture gate

Every capture attempt evaluates three prerequisites: the user has explicitly confirmed rights, the source is not blocked by protected-media signals, and the browser provides display-audio capture. The decision is fail-closed. Rights confirmation is recorded as an audit event before the capture request is started.

## Protected-source handling

The current decision helper checks source metadata and URL/title signals for DRM, encrypted media, EME, Widevine, FairPlay, PlayReady, license-control, and protected-source indicators. A source explicitly marked blocked is denied. Unknown license status is denied until an authorized source is supplied. The application never attempts to bypass DRM, license gates, encrypted media, or platform access controls.

This is a local client-side decision layer, not an authoritative DRM detector. A production adapter should provide verified source and license signals from a trusted policy service.

## Audit trail

Audit events are persisted in IndexedDB and include rights confirmation, source analysis, capture started, capture blocked, archive creation, downloads, deletion, sync enabled, sync disabled, sync failure, and local-only sync skip actions. The audit record is a local accountability aid and is not cryptographically signed or server-authenticated in this release.

## No hidden recording

The app calls `getDisplayMedia` only after a user gesture and the rights gate. It requires an audio track from the visible browser share dialog, stops shared video tracks after setup, and stops processing when the shared audio track ends. The extension companion rejects capture requests outside the web app gate.

## Release conditions for a production backend

Before representing the system as authoritative compliance infrastructure, add authenticated audit storage, server-side policy evaluation, legal review, key management, content security policy, upload malware scanning, and documented retention/deletion controls.
