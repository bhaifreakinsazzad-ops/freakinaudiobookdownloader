# Operations Manual - SFYTA3.H-V.A

**Version:** 1.0.0  
**Last Updated:** 2026-09-20  
**Purpose:** Post-launch operational procedures and maintenance guidelines

---

## 1. Versioning Policy

### 1.1 Semantic Versioning

SFYTA3.H-V.A follows [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Breaking changes, incompatible API changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes, security patches (backwards compatible)

### 1.2 Version Numbers

| Component | Location | Example |
|-----------|----------|---------|
| Web App | `package.json` version | `1.0.0` |
| Extension | `apps/extension/manifest.json` | `1.0.0` |
| Build artifacts | `dist/` output | Embedded in bundle |

### 1.3 Compatibility Matrix

| Web App Version | Extension Version | Status |
|-----------------|-------------------|--------|
| 1.x.x | 1.x.x | ✅ Fully Compatible |
| 1.x.x | 0.x.x | ⚠️ Limited Features |
| 0.x.x | 1.x.x | ❌ Not Supported |

**Note:** Extension is optional; web app functions independently.

---

## 2. Changelog Process

### 2.1 Changelog File

Location: `docs/changelog.md`

Format follows [Keep a Changelog](https://keepachangelog.com/):

```markdown
## [1.0.0] - 2026-09-20

### Added
- Rights confirmation modal with Bengali translation
- DRM/protected content blocking
- IndexedDB v2 persistence layer
- WAV/MP3 encoding with ID3 metadata
- Turbo mode (2×–8× time compression)

### Changed
- Migrated from localStorage to IndexedDB
- Improved error messages for quota issues

### Fixed
- Recording loss after popup close
- Memory crash on long recordings

### Security
- Blocked unauthorized cloud upload
- Added message validation in extension
```

### 2.2 User-Facing Release Notes

Published in:
- GitHub Releases page
- In-app changelog modal (Settings → What's New)
- Email newsletter (if subscribed)

### 2.3 Internal Migration Notes

For breaking changes or schema migrations:

```markdown
## Migration Notes - v1.0.0

### IndexedDB Schema Change
- Old: localStorage-based storage
- New: IndexedDB v2 with chunked blobs
- Migration: Automatic on first launch
- Rollback: Export data before upgrade
```

---

## 3. Bug Triage Process

### 3.1 Severity Levels

| Level | Name | Response Time | Resolution Target |
|-------|------|---------------|-------------------|
| P0 | Critical | < 4 hours | < 24 hours |
| P1 | Major | < 24 hours | < 1 week |
| P2 | Minor | < 1 week | Next release |
| P3 | Enhancement | Backlog | Future planning |

### 3.2 Severity Definitions

**P0 - Critical Blocker**
- Compliance violation (rights bypass, DRM capture possible)
- Data loss (recordings deleted unexpectedly)
- Security vulnerability (XSS, CSRF, data exposure)
- Complete application failure (won't load, won't start)

**P1 - Major Issue**
- Core feature broken (capture fails, playback fails)
- Significant degradation (extreme slowness, frequent crashes)
- Extension lifecycle failure
- Storage quota handling failure

**P2 - Minor Issue**
- Non-critical bug (UI glitch, typo)
- Edge case failure (rare browser/version)
- Performance issue (noticeable but not blocking)

**P3 - Enhancement**
- Feature request
- UX improvement suggestion
- Documentation update

### 3.3 Support Intake

Channels:
- GitHub Issues (preferred)
- Email: support@yourdomain.com
- In-app feedback form

Required information:
- Device/OS/browser version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/logs if applicable

### 3.4 Security Vulnerability Disclosure

Process:
1. Report to security@yourdomain.com (encrypted preferred)
2. Acknowledge receipt within 24 hours
3. Investigate and confirm severity within 72 hours
4. Develop patch and test
5. Release security update (P0 timeline)
6. Public disclosure after user patch window (14 days)

---

## 4. Monitoring Plan

### 4.1 Current State (Local-First)

**No telemetry enabled by default.**

Monitoring relies on:
- User-reported issues
- GitHub Issue tracking
- Manual testing before releases

### 4.2 Crash Reporting (If Enabled)

Recommended tools:
- **Sentry** (with strict PII filtering)
- **LogRocket** (session replay, consent required)

Configuration requirements:
- Filter all audio content from reports
- Anonymize user identifiers
- Exclude IndexedDB data
- Opt-in only with clear disclosure

### 4.3 Error Tracking Metrics

Track (anonymized, aggregated):
- JavaScript error rates by type
- Extension installation failures
- Service worker registration failures
- Encoding failure counts
- Storage quota exceeded events
- Compliance block events (DRM detected)

### 4.4 Performance Metrics

Monitor:
- First contentful paint (FCP)
- Time to interactive (TTI)
- Bundle sizes (regression detection)
- Service worker cache hit rates
- IndexedDB operation latency

### 4.5 Extension Update Failures

Monitor via Chrome Web Store Dashboard:
- Installation counts
- Active user counts
- Update failure rates
- Uninstall reasons (if provided)

### 4.6 Storage Quota Issues

Alert when:
- >10% of users approach quota limit
- QuotaExceededError rate increases
- Average recording size grows unexpectedly

### 4.7 Encoding Failures

Track:
- MP3 encoder worker failures
- WAV encoding errors
- Turbo mode processing failures
- Average encoding time per minute of audio

### 4.8 Compliance Block Events

Log (locally, audit trail):
- Rights confirmation denials
- DRM/protected source blocks
- Unknown license status blocks
- Capture permission denials

**Do not transmit compliance events to external servers without explicit consent.**

---

## 5. Update Process

### 5.1 Web Deploy Rollback

**Vercel/Netlify:**
```bash
# List deployments
vercel ls

# Rollback
vercel rollback [deployment-id]
```

**Self-Hosted:**
```bash
# Stop current
pm2 stop sfyta3-h-v-a

# Restore backup
rm -rf dist
cp -r dist-backup-YYYYMMDD dist

# Restart
pm2 start sfyta3-h-v-a
```

### 5.2 Extension Store Rollout

Chrome Web Store:
1. Submit new version for review
2. Wait for approval (typically 1-3 days)
3. Gradual rollout (optional): 10% → 50% → 100%
4. Monitor for issues at each stage
5. Full rollout or halt based on feedback

**Rollback:** Cannot undo published version. Must publish fix as higher version number.

### 5.3 Staged Rollout Strategy

Recommended for major updates:

| Stage | Percentage | Duration | Criteria |
|-------|------------|----------|----------|
| Alpha | Internal team | 1 week | All tests pass |
| Beta | Pilot users (5-20) | 2 weeks | No P0/P1 issues |
| Canary | 10% public | 3 days | Low error rate |
| Gradual | 50% public | 3 days | Stable metrics |
| Full | 100% public | Ongoing | Monitor closely |

### 5.4 IndexedDB Schema Migration

**Migration Plan:**

1. **Version numbering:** Increment DB version in `openDatabase()`
2. **Migration function:** Handle `onupgradeneeded` event
3. **Backward compatibility:** Support old schema during transition
4. **Data backup:** Export user data before migration
5. **Rollback plan:** Provide downgrade path if migration fails

**Example:**
```typescript
const request = indexedDB.open('sfyta3-h-v-a', 3); // v2 → v3

request.onupgradeneeded = (event) => {
  const db = (event.target as IDBOpenDBRequest).result;
  const oldVersion = event.oldVersion;
  
  if (oldVersion < 3) {
    // Create new store, migrate data
    const newStore = db.createObjectStore('new_store', { keyPath: 'id' });
    // ... migration logic
  }
};
```

### 5.5 User Data Backup Before Migration

**Automated backup:**
- Export all recordings to ZIP before migration
- Prompt user to download backup
- Store backup temporarily in IndexedDB

**Manual backup instructions:**
- Settings → Advanced → Export Library
- Browser DevTools → Application → IndexedDB → Export

---

## 6. Deprecation Policy

### 6.1 Old Versions

- Support current MAJOR version only
- MINOR/PATCH updates encouraged but not forced
- No security patches for versions >1 MAJOR behind
- Migration guide provided for breaking changes

### 6.2 Unsupported Browsers

Minimum supported:
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions

Deprecation process:
1. Announce deprecation 3 months in advance
2. Add console warnings in unsupported browsers
3. Gracefully degrade functionality
4. Eventually block access with upgrade message

### 6.3 Removed Formats/Features

When removing features:
1. Mark as "deprecated" in release notes
2. Provide migration path (e.g., export format converter)
3. Support read-only access to old data
4. Remove write support after 6 months
5. Full removal after 1 year with notice

---

## 7. Security Patch Process

### 7.1 Dependency Updates

**Automated:**
- Dependabot/Renovate for PR creation
- Weekly dependency audit (`pnpm audit`)
- Auto-merge PATCH updates for dev dependencies

**Manual Review Required:**
- MAJOR version bumps
- Production dependencies
- Security-sensitive packages (crypto, encoding)

### 7.2 Emergency Release Path

For critical security vulnerabilities:

1. **Identify:** Confirm vulnerability scope and severity
2. **Patch:** Develop minimal fix (avoid feature creep)
3. **Test:** Focused regression testing on affected areas
4. **Release:** Bump PATCH version (or MAJOR if breaking)
5. **Disclose:** Publish security advisory after patch available
6. **Monitor:** Watch for exploitation attempts

### 7.3 Disclosure Timeline

| Day | Action |
|-----|--------|
| 0 | Vulnerability reported |
| 1 | Acknowledge receipt |
| 3 | Confirm severity, begin patch |
| 7 | Patch developed and tested |
| 10 | Release security update |
| 14 | Public disclosure (advisory published) |

---

## 8. Platform Adapter Maintenance

### 8.1 ElevenLabs Reader DOM Changes

**Risk:** Platform HTML structure changes break adapter

**Mitigation:**
- Use robust selectors (data attributes, ARIA labels)
- Implement multiple detection strategies
- Fail gracefully with generic capture fallback
- Monitor adapter success rate

**Detection:**
```typescript
// Multiple signals for platform detection
const signals = {
  urlPattern: /elevenlabs\.io\/reader/,
  domElement: document.querySelector('[data-reader-content]'),
  metaTag: document.querySelector('meta[name="generator"][content*="ElevenLabs"]')
};
```

### 8.2 Adapter Breakage Monitoring

Track:
- Adapter detection success rate
- Source analysis failures by platform
- User reports of "unsupported source"

Alert when:
- Detection rate drops >20% week-over-week
- Specific platform suddenly fails

### 8.3 Fallback Generic Capture

When platform-specific adapter fails:
1. Fall back to generic `getDisplayMedia` capture
2. Display warning: "Source analysis unavailable"
3. Require enhanced rights confirmation
4. Log event for investigation

### 8.4 Test Fixtures for Adapter Updates

Maintain:
- Sample HTML snapshots from supported platforms
- Mock source signals for testing
- Integration tests for each adapter
- Regression tests after platform changes

---

## 9. Support Materials

### 9.1 FAQ

Location: `docs/faq.md`

Common topics:
- How to install PWA
- Why capture is blocked (DRM)
- How to export recordings
- Storage quota limits
- Extension vs web app differences

### 9.2 Troubleshooting Guide

Location: `docs/troubleshooting.md`

Sections:
- Installation issues
- Capture failures
- Playback problems
- Export/download errors
- Extension connectivity
- Offline mode issues

### 9.3 Privacy/Help Center Links

Always accessible from:
- Settings page
- Footer (web deployment)
- Extension popup
- About modal

### 9.4 Known Limitations Page

Document:
- Mobile Safari capture limitations
- Maximum recording length (30 min / 256 MB)
- Supported formats (WAV, MP3 only)
- Browser compatibility notes
- Cloud sync mock status

---

## 10. On-Call / Ownership

### 10.1 Responsibility Matrix

| Area | Primary Owner | Backup |
|------|---------------|--------|
| Extension Lifecycle | Extension Engineer | Frontend Lead |
| Audio Encoding | Audio Engineer | Backend Lead |
| Compliance Reports | Compliance Officer | Legal Counsel |
| Security Vulnerabilities | Security Engineer | CTO |
| Storage/IndexedDB | Frontend Lead | Database Engineer |
| PWA/Service Worker | Frontend Engineer | DevOps |
| UI/UX Issues | Product Designer | Frontend Lead |

### 10.2 Escalation Path

1. **Level 1:** On-call engineer triages issue
2. **Level 2:** Domain expert engaged (encoding, storage, etc.)
3. **Level 3:** Engineering lead makes go/no-go decision
4. **Level 4:** Executive escalation for legal/compliance crises

### 10.3 On-Call Rotation

Recommended schedule:
- Weekly rotation among senior engineers
- Clear handoff procedure
- Escalation contacts documented
- Runbook for common incidents

---

## 11. Incident Response

### 11.1 Incident Classification

| Type | Examples | Response |
|------|----------|----------|
| Security | Data breach, XSS, auth bypass | P0, immediate response |
| Compliance | DRM bypass discovered, rights modal broken | P0, legal notification |
| Data Loss | Recordings deleted, corruption | P0, user communication |
| Outage | App won't load, CDN failure | P0/P1 depending on scope |
| Degradation | Slow performance, encoding failures | P1/P2 |

### 11.2 Communication Templates

**User Notification:**
```
Subject: Important Update Regarding SFYTA3.H-V.A

We've identified an issue affecting [feature]. Our team is working on a fix.

Impact: [description]
Workaround: [if available]
Expected Resolution: [timeline]

We apologize for the inconvenience.
```

**Post-Incident Report:**
```
Incident Date: YYYY-MM-DD
Duration: X hours
Severity: P0/P1/P2

Summary: [what happened]

Root Cause: [technical explanation]

Resolution: [how it was fixed]

Prevention: [steps to avoid recurrence]
```

---

## 12. Quarterly Review Checklist

Every quarter, review:

- [ ] Dependency audit (`pnpm audit`)
- [ ] Browser support matrix update
- [ ] Compliance policy review (legal changes)
- [ ] Security incident log review
- [ ] User feedback themes analysis
- [ ] Performance benchmark comparison
- [ ] Documentation accuracy check
- [ ] Backup/restore procedure test
- [ ] Rollback procedure test
- [ ] On-call rotation effectiveness

---

**Document Owner:** Engineering Operations Lead  
**Review Frequency:** Quarterly  
**Next Review Date:** 2026-12-20
