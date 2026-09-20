# Copyright and Authorized Use Policy

**Effective date:** 2026-09-20  
**Version:** 1.0.0

## 1. Purpose

This document clarifies copyright and authorized use requirements for SFYTA3.H-V.A. The Application is a tool for lawful audio archival, not a means to circumvent intellectual property rights.

## 2. What You May Capture

### 2.1 Authorized Sources
You may use SFYTA3.H-V.A to capture audio from:

| Source Type | Authorization Required |
|-------------|----------------------|
| Your own recordings | You are the creator |
| Content you own | Proof of purchase/license |
| Licensed content | Archive rights in license |
| Public domain works | Verification of PD status |
| Creative Commons | CC license permits archiving |
| Creator exports | Explicit download permission |
| Platform backups | Platform-approved personal backup feature |

### 2.2 Examples of Authorized Use
- Recording your own voice narration for personal archive
- Backing up audiobooks you purchased with personal use rights
- Archiving public domain lectures from educational institutions
- Saving Creative Commons podcasts that permit redistribution
- Exporting your own content from creator platforms
- Making accessibility copies where permitted by law (e.g., format shifting for disability access)

## 3. What You May NOT Capture

### 3.1 Prohibited Sources
You may NOT use SFYTA3.H-V.A to capture:

| Source Type | Reason |
|-------------|--------|
| DRM-protected streams | Technological protection measure |
| Subscription-only content without archive rights | License violation |
| Paywalled content beyond personal fair use | Copyright infringement risk |
| Pirated or unauthorized uploads | Illegal source material |
| Content marked "no download" or "streaming only" | Terms of service violation |
| Encrypted media (Widevine, FairPlay, PlayReady) | DMCA anti-circumvention |
| Corporate training materials without permission | Proprietary content |
| Confidential or internal communications | Privacy/trade secret concerns |

### 3.2 Legal Framework
Capturing prohibited content may violate:
- **Copyright Act** (unauthorized reproduction)
- **DMCA §1201** (circumvention of technological protection measures)
- **Computer Fraud and Abuse Act** (unauthorized access)
- **Platform Terms of Service** (contractual breach)
- **EU Copyright Directive** (similar protections in EU jurisdictions)

## 4. How the Application Enforces Compliance

### 4.1 Rights Confirmation Modal
Before every capture session, users must:
1. Click "Confirm & Start" after reading rights acknowledgment
2. Affirm they own, licensed, or have permission for the audio
3. Acknowledge DRM-protected content will be blocked
4. Agree to use archives within source platform terms

This confirmation is:
- **Required**: Cannot be bypassed programmatically
- **Recorded**: Added to local audit trail with timestamp
- **Session-specific**: Must be confirmed for each new capture

### 4.2 Protected Content Detection
The Application evaluates source signals including:
- URL patterns indicating protected services
- Title/metadata containing DRM indicators
- EME (Encrypted Media Extensions) presence
- Keywords: "widevine", "fairplay", "playready", "encrypted", "protected", "license"

When protected signals are detected:
- Capture is **automatically blocked**
- User receives clear explanation
- No workaround or override is available
- Event is logged to audit trail

### 4.3 Fail-Closed Design
Unknown sources default to **blocked** until authorization is confirmed. This prevents accidental capture of unverified content.

## 5. Fair Use Considerations

### 5.1 Not Legal Advice
Fair use determinations are fact-specific and jurisdiction-dependent. This section provides general information, not legal advice.

### 5.2 Fair Use Factors (U.S.)
Courts consider four factors:
1. **Purpose**: Non-commercial, educational, transformative uses favor fair use
2. **Nature**: Factual works favor fair use more than creative works
3. **Amount**: Small portions favor fair use; entire works weigh against
4. **Effect**: No market harm favors fair use

### 5.3 Application Position
SFYTA3.H-V.A does not make fair use determinations. Users are responsible for their own fair use analysis. The Application's design assumes users need explicit authorization unless content is clearly public domain or self-created.

## 6. International Considerations

### 6.1 Jurisdiction Variations
Copyright laws vary by country:
- **United States**: Fair use doctrine
- **European Union**: Limited exceptions, no general fair use
- **United Kingdom**: Fair dealing for specific purposes
- **Canada**: Fair dealing with enumerated purposes
- **Australia**: Fair dealing, plus specific exceptions

### 6.2 User Responsibility
Users must comply with laws in their jurisdiction. What may be permissible in one country could be infringing in another.

## 7. Takedown and Complaint Process

### 7.1 For Rights Holders
If you believe SFYTA3.H-V.A is being used to infringe your copyright:
1. The Application is a **tool** that does not host or distribute content
2. All captured audio is stored locally on user devices
3. No central server contains user recordings (in local-first mode)
4. Contact the user directly if identifiable through platform channels

### 7.2 For Users Who Received Complaints
If you receive a takedown notice:
1. Review whether you have authorization for the content
2. Delete any recordings you cannot verify as authorized
3. Clear audit logs if desired
4. Consult legal counsel if uncertain about your rights

## 8. Educational and Research Use

### 8.1 Permitted Scenarios
Academic researchers and educators may use SFYTA3.H-V.A for:
- Archiving publicly available lectures with institutional permission
- Creating accessibility copies for students with disabilities
- Preserving oral histories with participant consent
- Building corpora of public domain or openly licensed materials

### 8.2 Documentation Best Practices
For research/educational use, maintain records of:
- Source URLs and access dates
- License terms or permissions obtained
- Institutional review board approvals (if applicable)
- Participant consent forms (for interviews/oral histories)

## 9. Commercial Use Restrictions

### 9.1 Personal/Educational License
This release of SFYTA3.H-V.A is intended for:
- Personal archival
- Educational purposes
- Non-commercial research

### 9.2 Commercial Licensing
Commercial entities seeking to use SFYTA3.H-V.A for:
- Professional audio production workflows
- Corporate training archives
- Commercial content creation

Should contact project maintainers regarding appropriate licensing terms.

## 10. Updates and Changes

This policy may be updated to reflect:
- Changes in copyright law
- New court decisions affecting archival rights
- Evolution of platform terms of service
- Feedback from rights holders and users

Users will be notified of material changes through the Application interface.

---

## বাংলা সারাংশ (Bengali Summary)

শুধুমাত্র অনুমোদিত উৎস থেকে অডিও ক্যাপচার করুন: নিজের তৈরি কন্টেন্ট, লাইসেন্সপ্রাপ্ত উপকরণ, পাবলিক ডোমেইন কাজ, বা সৃষ্টিকর্তার অনুমতিপ্রাপ্ত ডাউনলোড। DRM সুরক্ষিত স্ট্রিম, সাবস্ক্রিপশন কন্টেন্ট অনুমতি ছাড়া, বা পাইরেটেড উপকরণ ক্যাপচার করা নিষিদ্ধ। প্রতিটি ক্যাপচারের আগে অধিকার নিশ্চিত করতে হবে এবং সুরক্ষিত কন্টেন্ট স্বয়ংক্রিয়ভাবে ব্লক করা হয়।
