# Privacy Policy

**Effective date:** 2026-09-20  
**Version:** 1.0.0

## Quick Summary

SFYTA3.H-V.A is a **local-first** audio capture tool. Your recordings stay on your device unless you explicitly enable cloud sync. No hidden recording, no DRM circumvention, no upload without consent.

See full details below in English, followed by a Bengali summary.

---

## What the Application Stores

### Local Storage (Default)

By default, all data is stored locally in your browser's IndexedDB:

| Data Type | Description |
|-----------|-------------|
| Recordings | Audio metadata (title, source, duration, format) |
| Chunks | Ordered audio blob data (actual recording content) |
| Waveforms | Precomputed peak arrays for visualization |
| Chapters | Chapter markers and titles |
| Playback State | Resume position, volume, speed settings |
| Sources | Source URL, title, and analysis results |
| Settings | Language, local-only mode, notifications, reduced motion |
| Audit Events | Compliance trail (rights confirmations, captures, downloads, deletions) |

The web application does **not** require an account, login, or cloud service for its local-first features.

### Cloud Storage (Optional, Not Enabled by Default)

- Optional sync is **disabled by default**
- Enabling sync requires explicit user action in Settings
- Uploading audio files requires a **separate explicit consent toggle**
- Current implementation uses a **mock provider** (no production backend connected)
- Future deployments with real cloud services will publish separate privacy terms

---

## Capture and Permission

### Rights Confirmation Required

Before any capture session begins, you must:
1. Open the rights confirmation modal
2. Affirm you have legal right to archive the source audio
3. Acknowledge that DRM-protected content will be blocked
4. Click "Confirm & Start"

This confirmation is:
- **Required**: Cannot be bypassed programmatically
- **Recorded**: Added to local audit trail with timestamp
- **Session-specific**: Must be confirmed for each new capture

### Browser Permission Flow

Capture starts only after:
- User has confirmed rights (see above)
- User accepts the browser's visible `getDisplayMedia` permission dialog
- Browser provides an audio track from the shared tab

The application:
- Does **not** record hidden background audio
- Calls `getDisplayMedia` only after explicit user gesture
- Requires visible browser share dialog (user can see what's being captured)
- Blocks capture if browser supplies no audio track

---

## Protected Content and Rights

### No DRM Circumvention

The application does **not** and **will not**:
- Bypass DRM, encrypted media, license gates, or access controls
- Attempt to decrypt Widevine, FairPlay, PlayReady, or similar technologies
- Override platform terms of service or license requirements

### Protected Source Detection

The application evaluates source signals including:
- URL patterns indicating protected services
- Title/metadata containing DRM indicators (widevine, fairplay, encrypted, protected, license)
- EME (Encrypted Media Extensions) presence

When protected signals are detected:
- Capture is **automatically blocked** (fail-closed design)
- User receives clear explanation
- No workaround or override is available
- Event is logged to audit trail

### User Responsibility

Users are responsible for:
- Using the application lawfully
- Respecting source platform terms of service
- Ensuring they have authorization for captured content
- Complying with applicable copyright laws in their jurisdiction

See [Copyright and Authorized Use Policy](./copyright-and-authorized-use.md) for detailed guidance.

---

## Sharing and Cloud Sync

### Local-Only Mode (Default)

In default local-first mode:
- **No audio or metadata leaves your device**
- No servers store your recordings
- No accounts or authentication required
- No synchronization across devices

### Optional Cloud Sync (If Explicitly Enabled)

If user enables cloud sync:
- Requires explicit user action in Settings panel
- Separate explicit consent required for audio file uploads
- Sync adapter interfaces are provider-neutral
- Current implementation: **mock provider only** (no production backend)

### Future Cloud Deployments

Before any production cloud service is activated, the following must be published:
- Provider-specific retention policies
- Encryption strategy (in-transit and at-rest)
- Access control mechanisms
- Deletion procedures and timelines
- Breach response protocols
- Data processing agreements (if applicable)

---

## Deletion and Control

### User Controls

You have full control over your data:

| Action | How To | What Is Deleted |
|--------|--------|-----------------|
| Delete recording | Library view → trash icon | Metadata, chunks, waveform, chapters, playback state |
| Clear audit log | Audit view → "Clear view" button | All audit events |
| Clear all data | Browser settings → site data | Everything (IndexedDB, localStorage, cache) |

### Deletion Process

When you delete a recording:
1. Confirmation dialog appears
2. Upon confirmation, deletion occurs immediately
3. A `deleted` event is added to audit log
4. Data is removed from IndexedDB (not recoverable)

### Export Before Deletion

Before deleting, you can export recordings:
- Navigate to Library
- Click download/export on desired recording
- Choose WAV or MP3 format
- Save file to your device

Exported files are independent of the application and must be managed separately.

---

## Permissions Explained

### Web Application Permissions

The web app requires no special permissions beyond standard browser APIs:
- `getDisplayMedia`: For tab audio capture (user-initiated, visible dialog)
- IndexedDB: For local storage (sandboxed per origin)
- Service Worker: For PWA offline support

### Extension Permissions (If Installed)

The optional MV3 extension requests only:
- `storage`: To store user-configured web app URL

The extension does **not** request:
- Tab access
- Host permissions
- Content script injection
- Network interception

See [Extension Store Privacy Disclosure](./extension-store-privacy-disclosure.md) for full details.

---

## Telemetry and Analytics

### Current Implementation

**No telemetry is collected.** The application:
- Does not phone home
- Does not report usage statistics
- Does not track feature adoption
- Does not send crash reports
- Has no analytics SDK integrated

### Future Changes

If telemetry is ever added:
- It will be **opt-in only**
- Clearly disclosed in updated privacy policy
- Limited to anonymized usage counts
- Will **never** include audio content or PII
- Users can disable at any time

---

## Children's Privacy

The application is not directed at children under 13 (or applicable age in jurisdiction):
- Does not knowingly collect data from children
- Does not require age verification
- Should be used under adult supervision if used by minors

Parents/guardians should:
- Review this policy before allowing children to use the application
- Monitor recordings made by children
- Delete inappropriate or unauthorized captures
- Teach responsible archival practices

---

## Data Security

### Local Storage Security

Data stored in IndexedDB:
- Is sandboxed per origin (other sites cannot access)
- Is encrypted at rest if browser/device encryption is enabled
- Can be cleared by user at any time
- Is lost if browser profile is deleted or device fails

### Recommendations

For enhanced security:
- Enable full-disk encryption on your device
- Use browser profiles with strong passwords
- Regularly export important recordings to external backup
- Clear site data when no longer needed

---

## Third-Party Services

The application does **not** integrate with:
- Analytics services (Google Analytics, Mixpanel, etc.)
- Crash reporting services
- Advertising networks
- Social media platforms
- Any third-party APIs (in local-first mode)

All encoding, storage, and playback occurs locally within your browser.

---

## Changes to This Policy

We reserve the right to modify this Privacy Policy at any time.

### Notification of Changes

Material changes will be:
- Documented in the changelog
- Communicated through the application interface
- Reflected in the updated effective date

### Continued Use

Continued use after changes constitutes acceptance of modified terms. If you do not agree to changes, you should:
- Stop using the application
- Export any recordings you wish to retain
- Clear browser site data

---

## Contact Information

For questions about this Privacy Policy:
- Review project documentation in `/docs` folder
- Check application About/Help section
- Refer to project repository for support channels

---

## বাংলা সারাংশ (Bengali Summary)

### গোপনীয়তা নীতি সংক্ষেপে

SFYTA3.H-V.A একটি **স্থানীয়-প্রথম** অডিও ক্যাপচার টুল। আপনার রেকর্ডিং আপনার ডিভাইসে থাকে যতক্ষণ না আপনি স্পষ্টভাবে ক্লাউড সিঙ্ক সক্রিয় করেন। কোনো লুকানো রেকর্ডিং নেই, DRM বাইপাস নেই, সম্মতি ছাড়া আপলোড নেই।

### কী সংরক্ষিত হয়

আপনার অনুমতি ছাড়া কোনো রেকর্ডিং বা আপলোড করা হয় না। সমস্ত ডেটা—রেকর্ডিং, চাঙ্ক, ওয়েভফর্ম, চ্যাপ্টার, প্লেব্যাক অবস্থা, উৎস মেটাডেটা, সেটিংস, এবং অডিট ইভেন্ট—ব্রাউজারের স্থানীয় IndexedDB-তে সংরক্ষিত হয়।

### ক্যাপচার এবং অনুমতি

প্রতিটি ক্যাপচার সেশনের আগে আপনাকে:
1. অধিকার নিশ্চিতকরণ মোডাল খুলতে হবে
2. নিশ্চিত করতে হবে যে আপনার উৎস অডিও আর্কাইভ করার আইনি অধিকার আছে
3. স্বীকার করতে হবে যে DRM-সুরক্ষিত কন্টেন্ট ব্লক করা হবে
4. "Confirm & Start" এ ক্লিক করতে হবে

অ্যাপ্লিকেশনটি লুকানো ব্যাকগ্রাউন্ড অডিও রেকর্ড করে না। ক্যাপচার শুধুমাত্র তখনই শুরু হয় যখন ব্যবহারকারী অধিকার নিশ্চিত করেন এবং ব্রাউজারের দৃশ্যমান অনুমতি ডায়ালগ গ্রহণ করেন।

### সুরক্ষিত কন্টেন্ট

অ্যাপ্লিকেশনটি DRM, এনক্রিপ্টেড মিডিয়া, লাইসেন্স গেট, বা অ্যাক্সেস নিয়ন্ত্রণ বাইপাস করে না। সুরক্ষিত এবং অজানা-কর্তৃত্বের উৎস স্থানীয় কমপ্লায়েন্স সিদ্ধান্ত দ্বারা ব্লক করা হয়।

### ক্লাউড সিঙ্ক

স্থানীয়-শুধুমাত্র মোডে কোনো অডিও বা মেটাডেটা আপলোড করা হয় না। ঐচ্ছিক সিঙ্ক ডিফল্টভাবে নিষ্ক্রিয়। সিঙ্ক সক্রিয় করতে ব্যবহারকারীর কর্ম প্রয়োজন; অডিও ফাইল আপলোড করার জন্য পৃথক স্পষ্ট সম্মতি টগল প্রয়োজন। বর্তমান বাস্তবায়ন একটি মক প্রদানকারী ব্যবহার করে এবং কোনো প্রডাকশন ক্লাউড পরিষেবার সাথে সংযোগ করে না।

### মুছে ফেলা

ব্যবহারকারীরা লাইব্রেরি ভিউ থেকে রেকর্ডিং, চাঙ্ক, ওয়েভফর্ম, চ্যাপ্টার এবং মেটাডেটা মুছে ফেলতে পারেন এবং অডিট ভিউ থেকে স্থানীয় অডিট টাইমলাইন পরিষ্কার করতে পারেন। ব্রাউজার স্টোরেজ পরিষ্কার করলে সমস্ত স্থানীয় ডেটাও সরিয়ে ফেলা যেতে পারে।

### ভবিষ্যতের ডিপ্লয়মেন্ট

এই নীতি বর্তমান স্থানীয়-প্রথম রিলিজ বর্ণনা করে। পরিচিতি, ক্লাউড সিঙ্ক, বা ফাইল আপলোড সহ একটি ভবিষ্যতের ডিপ্লয়মেন্টকে সক্রিয় করার আগে প্রদানকারী-নির্দিষ্ট ধরে রাখা, এনক্রিপশন, অ্যাক্সেস, মুছে ফেলা, এবং লঙ্ঘন-প্রতিক্রিয়া শর্তাবলী প্রকাশ করতে হবে।

---

**Effective date:** 2026-09-20
