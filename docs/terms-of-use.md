# Terms of Use

**Effective date:** 2026-09-20  
**Version:** 1.0.0

## 1. Acceptance of Terms

By using SFYTA3.H-V.A (the "Application"), you agree to be bound by these Terms of Use. If you do not agree to these terms, do not use the Application.

## 2. Authorized Use Only

### 2.1 Permitted Content
The Application is designed for capturing audio from sources where you have explicit authorization, including:
- Content you own or created
- Content licensed to you with archive rights
- Public domain materials
- Creator-authorized downloads or exports
- Platform-approved personal backups

### 2.2 Prohibited Uses
You may NOT use the Application to:
- Capture DRM-protected or encrypted media streams
- Download content in violation of source platform terms of service
- Archive copyrighted material without permission
- Circumvent access controls, license gates, or technological protection measures
- Distribute captured content in violation of applicable law or licenses
- Use captured audio for commercial purposes without appropriate licenses

## 3. Rights Confirmation Requirement

Before each capture session, you must:
- Confirm you have the legal right to archive the source audio
- Acknowledge that protected content will be blocked
- Agree to use archives within the source platform's terms

The Application enforces this confirmation through an interactive modal dialog. Bypassing this requirement is prohibited.

## 4. No DRM Circumvention

The Application does not and will not:
- Bypass Digital Rights Management (DRM) systems
- Decrypt encrypted media streams
- Circumvent Widevine, FairPlay, PlayReady, or similar technologies
- Override license requirements or access controls

If the Application detects protected content signals, capture is automatically blocked. This is a fail-closed safety feature that cannot be disabled.

## 5. Local-First Design

### 5.1 Storage
By default, all recordings, metadata, chapters, waveforms, and audit logs are stored locally in your browser's IndexedDB. The Application does not require cloud services for core functionality.

### 5.2 Optional Cloud Sync
Cloud synchronization features:
- Are disabled by default
- Require explicit user consent to enable
- Require separate explicit consent for audio file uploads
- Currently use a mock provider (no production backend connected)

Future deployments with real cloud services will publish separate terms covering data processing, retention, and security practices.

## 6. User Responsibilities

You are solely responsible for:
- Ensuring your use of the Application complies with applicable laws
- Respecting copyright, licensing, and terms of service of source platforms
- Securing your local device and browser storage
- Backing up important recordings (local data can be lost)
- Deleting recordings you no longer have rights to retain

## 7. Audit Trail

The Application maintains a local audit log recording:
- Rights confirmation events
- Source analysis decisions
- Capture start/stop actions
- Archive creation and downloads
- Deletion events
- Cloud sync enable/disable actions

This audit trail is stored locally and is not cryptographically secured or server-authenticated in this release. It serves as a personal accountability aid.

## 8. Data Deletion

You may delete your data at any time:
- Individual recordings can be deleted from the Library view
- Audit events can be cleared from the Audit view
- All browser storage can be cleared via browser settings

Deletion removes both metadata and audio blobs from IndexedDB. Exported files on your device must be deleted separately.

## 9. No Warranty

THE APPLICATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.

## 10. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE AUTHORS AND CONTRIBUTORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE APPLICATION.

## 11. Changes to Terms

We reserve the right to modify these Terms of Use at any time. Continued use after changes constitutes acceptance of modified terms. Material changes will be communicated through the Application interface.

## 12. Termination

Your right to use the Application terminates automatically if you breach these terms. Upon termination, you must delete all copies of the Application and captured content you do not have independent rights to retain.

## 13. Governing Law

These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the primary development occurs, without regard to conflict of law principles.

## 14. Contact

For questions about these Terms of Use, please refer to the project repository or support contact information provided in the Application's About section.

---

## বাংলা সারাংশ (Bengali Summary)

SFYTA3.H-V.A শুধুমাত্র অনুমোদিত উৎস থেকে অডিও ক্যাপচার করার জন্য ডিজাইন করা হয়েছে। DRM বা সুরক্ষিত কন্টেন্ট বাইপাস করা নিষিদ্ধ। প্রতিটি ক্যাপচারের আগে আপনাকে অধিকার নিশ্চিত করতে হবে। সমস্ত ডেটা স্থানীয়ভাবে সংরক্ষিত হয় যতক্ষণ না আপনি স্পষ্টভাবে ক্লাউড সিঙ্ক সক্রিয় করেন।
