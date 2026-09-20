# Data Retention and Deletion Policy

**Effective date:** 2026-09-20  
**Version:** 1.0.0

## 1. Overview

This document describes how SFYTA3.H-V.A retains and deletes user data. The Application follows a **local-first, user-controlled** data model where users retain full control over their recordings, metadata, and audit logs.

## 2. Data Storage Locations

### 2.1 Primary Storage: IndexedDB

All user data is stored in the browser's IndexedDB database:

| Store Name | Data Type | Size Limit (typical) |
|------------|-----------|---------------------|
| `recordings` | Audio metadata (title, source, duration, etc.) | ~1 KB per recording |
| `chunks` | Ordered audio blob chunks (actual audio data) | Up to 256 MB or browser quota |
| `waveforms` | Precomputed waveform peak arrays | ~10 KB per recording |
| `chapters` | Chapter markers and titles | ~500 bytes per chapter |
| `sources` | Source metadata and analysis results | ~2 KB per source |
| `audit_events` | Compliance audit trail entries | ~500 bytes per event |
| `settings` | User preferences (language, local-only mode, etc.) | ~200 bytes total |
| `playback_state` | Resume position and volume settings | ~100 bytes per recording |

### 2.2 Browser Quotas

Typical storage limits:
- **Chrome/Edge**: 60% of available disk space, up to 256 MB per origin without prompt
- **Firefox**: 50% of available disk space, up to 2 GB per origin
- **Safari**: Varies; typically 1-2 GB per origin

When approaching quota limits, the Application:
- Displays warning messages to users
- Prevents new captures until space is freed
- Suggests deleting old recordings or exporting externally

### 2.3 No Cloud Storage (Default Mode)

In default local-first mode:
- **No data leaves your device**
- No servers store your recordings
- No accounts or authentication required
- No synchronization across devices

### 2.4 Optional Cloud Sync (If Enabled)

If user explicitly enables cloud sync with a production provider:
- Separate retention policies apply (provider-specific)
- User must consent to upload terms before activation
- Encryption strategy documented in sync adapter code
- Currently: mock provider only (no real backend connected)

## 3. Data Retention Periods

### 3.1 Default Retention

| Data Type | Retention Period | Trigger for Deletion |
|-----------|------------------|---------------------|
| Recordings (audio + metadata) | Indefinite (until user deletes) | User-initiated deletion |
| Waveform peaks | Indefinite (until recording deleted) | Recording deletion |
| Chapters | Indefinite (until recording/chapter deleted) | Recording or chapter deletion |
| Audit events | Indefinite (until user clears) | User-initiated audit clear |
| Settings | Indefinite (until browser data cleared) | Browser storage reset |
| Playback state | Indefinite (until recording deleted) | Recording deletion |
| Source records | Indefinite (until manually cleared) | Not currently exposed in UI |

### 3.2 Rationale for Indefinite Retention

The Application is designed as a **personal archive tool**. Users may wish to retain recordings indefinitely for:
- Long-term personal reference
- Educational or research purposes
- Historical preservation
- Accessibility accommodations

Users are expected to manage their own retention based on their needs and legal obligations.

### 3.3 Recommended Retention Practices

Users should periodically review and delete:
- Recordings no longer needed
- Recordings where authorization has expired
- Test or failed captures
- Duplicate recordings
- Content subject to time-limited licenses

## 4. User-Initiated Deletion

### 4.1 Deleting Individual Recordings

**From Library View:**
1. Navigate to Archive Library
2. Locate the recording to delete
3. Click the delete/trash icon
4. Confirm deletion in dialog

**What is deleted:**
- Recording metadata from `recordings` store
- All audio chunks from `chunks` store
- Associated waveform from `waveforms` store
- Associated chapters from `chapters` store
- Playback state from `playback_state` store

**Audit trail:** A `deleted` event is added to audit log before deletion occurs.

### 4.2 Clearing Audit Events

**From Audit View:**
1. Navigate to Audit Log
2. Click "Clear view" button
3. Confirm clearing all events

**What is deleted:**
- All records from `audit_events` store

**Note:** This does not delete recordings, only the audit trail.

### 4.3 Bulk Deletion

Current implementation supports:
- Individual recording deletion
- Full audit log clearing

Future versions may add:
- Multi-select deletion
- Filtered bulk operations (e.g., delete all archived)
- Automatic cleanup rules

## 5. Browser-Level Deletion

### 5.1 Clearing Site Data

Users can delete all SFYTA3.H-V.A data via browser settings:

**Chrome/Edge:**
1. Go to `chrome://settings/siteData`
2. Search for the site URL
3. Click trash icon or "Clear data"

**Firefox:**
1. Go to `about:preferences#privacy`
2. Click "Manage Data"
3. Find site and click "Remove Selected"

**Safari:**
1. Go to Preferences → Privacy
2. Click "Manage Website Data"
3. Find site and click "Remove"

**Effect:** All IndexedDB stores, localStorage, and cache are permanently deleted.

### 5.2 Private/Incognito Mode

Data created in private browsing sessions:
- Is automatically deleted when session ends
- Does not persist across browser restarts
- Should not be used for recordings intended to be kept

### 5.3 Browser Profile Deletion

Deleting entire browser profile removes:
- All extension data
- All site data including SFYTA3.H-V.A
- Bookmarks, history, passwords (browser-wide)

## 6. Export Before Deletion

### 6.1 Exporting Recordings

Before deleting, users may export recordings:

1. Navigate to Library
2. Click download/export on desired recording
3. Choose format (WAV or MP3)
4. Save file to local filesystem

**Export includes:**
- Audio content in selected format
- ID3/metadata tags (title, artist, album, source)

**Export does NOT include:**
- Chapter markers (not embedded in audio files)
- Waveform data (must be regenerated)
- Audit history
- Playback position

### 6.2 External Backup Recommendations

Users should maintain external backups of important recordings:
- Copy exported files to cloud storage (Google Drive, Dropbox, etc.)
- Burn to optical media for long-term archival
- Store on external hard drives
- Use dedicated backup software

## 7. Deletion Limitations

### 7.1 What Cannot Be Undone

Once deleted, the following **cannot be recovered**:
- Audio chunks (original recording quality)
- Custom chapter markers
- Manually edited metadata
- Audit event history
- Playback resume position

### 7.2 No Recycle Bin

The Application does not implement:
- Trash/recycle bin functionality
- Undo after deletion
- Version history
- Snapshot recovery

Deleted data is immediately removed from IndexedDB.

### 7.3 Exported Files Unaffected

Deletion within the Application:
- Does NOT affect files already downloaded to your device
- Does NOT remove copies in external backups
- Does NOT notify third parties of deletion

Users remain responsible for managing exported copies.

## 8. Data Portability

### 8.1 Export Formats

Supported export formats:
- **WAV**: Uncompressed, highest quality, large file size
- **MP3**: Compressed, good quality, smaller file size (LAME encoder)

### 8.2 Metadata Export

Recording metadata can be viewed but not currently exported as structured data (JSON, CSV). Future versions may add:
- JSON export of library catalog
- CSV export for spreadsheet analysis
- OPML export of chapter markers

### 8.3 Import Functionality

Currently, the Application does not support importing recordings created outside the app. Each recording is tied to:
- Source record captured at time of creation
- Chunk structure optimized for streaming playback
- Waveform precomputed for display

## 9. Special Circumstances

### 9.1 Legal Hold or Preservation Orders

The Application provides no mechanism for:
- Legal hold (preventing deletion)
- Litigation preservation
- Regulatory retention requirements

Users subject to such requirements must:
- Export relevant recordings externally
- Maintain separate documentation
- Consult legal counsel

### 9.2 Account Termination (Future Cloud Sync)

If cloud sync is enabled with a production provider:
- Account termination may trigger data deletion per provider terms
- Local copies remain unaffected unless explicitly synced for deletion
- Users should export data before closing accounts

### 9.3 Device Loss or Failure

If device is lost, stolen, or fails:
- All local recordings are lost unless exported
- No cloud recovery available (in local-first mode)
- Browser sync (if enabled) may restore settings but not recordings

**Recommendation:** Regularly export important recordings to external storage.

## 10. Children and Data Deletion

Parents or guardians should:
- Review recordings made by children
- Delete inappropriate or unauthorized captures
- Teach children about responsible archival practices
- Monitor storage usage to prevent quota issues

## 11. Contact and Support

For questions about data retention or deletion:
- Review this policy document
- Check Application help/about section
- Refer to project repository for support channels

---

## বাংলা সারাংশ (Bengali Summary)

সমস্ত রেকর্ডিং আপনার ব্রাউজারে স্থানীয়ভাবে সংরক্ষিত হয়। আপনি যেকোনো সময় পৃথক রেকর্ডিং মুছে ফেলতে পারেন বা সমস্ত অডিট লগ পরিষ্কার করতে পারেন। ব্রাউজারের সাইট ডেটা মুছে ফেললে সব ডেটা চিরস্থায়ীভাবে মুছে যাবে। গুরুত্বপূর্ণ রেকর্ডিং এক্সপোর্ট করে বাইরে ব্যাকআপ রাখুন কারণ মুছে ফেলার পর পুনরুদ্ধার করা যায় না।
