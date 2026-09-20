# Privacy Policy

**Effective date:** 2026-09-20

## What the application stores

By default, recordings, ordered audio chunks, waveform peaks, chapters, playback state, source metadata, settings, and audit events are stored locally in the browser's IndexedDB. The web application does not require an account or cloud service for its local-first features.

## Capture and permission

Capture starts only after the user confirms that they have the right to archive the source and accepts the browser's visible display-audio permission flow. The application does not record hidden background audio. If the browser supplies no audio track, the capture is blocked and no audio is saved.

## Protected content and rights

The application does not bypass DRM, encrypted media, license gates, or access controls. Protected and unknown-authority sources are blocked by the local compliance decision. Users are responsible for using the application lawfully and within the source platform's terms.

## Sharing and cloud sync

No audio or metadata is uploaded in local-only mode. Optional sync is disabled by default. Enabling sync requires user action; uploading audio files requires a separate explicit consent toggle. The current implementation uses a mock provider and does not connect to a production cloud service.

## Deletion and control

Users can delete recordings, chunks, waveforms, chapters, and metadata from the Library view and clear the local audit timeline from the Audit view. Browser storage clearing may also remove all local data.

## Limitations and future deployments

This policy describes the current local-first release. A future deployment with identity, cloud sync, or file uploads must publish provider-specific retention, encryption, access, deletion, and breach-response terms before activation.

## বাংলা সারাংশ

আপনার অনুমতি ছাড়া কোনো রেকর্ডিং বা আপলোড করা হয় না। রেকর্ডিং ব্রাউজারের স্থানীয় স্টোরেজে থাকে। অধিকার নিশ্চিত না করলে বা DRM/সুরক্ষিত কনটেন্ট শনাক্ত হলে ক্যাপচার বন্ধ থাকে। ঐচ্ছিক ক্লাউড সিঙ্ক এবং অডিও আপলোড আলাদা সম্মতি ছাড়া সক্রিয় হয় না।
