# Deployment Checklist - SFYTA3.H-V.A

**Version:** 1.0.0  
**Date:** 2026-09-20  
**Purpose:** Pre-launch verification for web app and PWA deployment

---

## Pre-Deployment Verification

### Build Artifacts

- [ ] `pnpm build` completes without errors
- [ ] `dist/public/index.html` exists and is valid HTML
- [ ] `dist/public/assets/` contains JS, CSS bundles
- [ ] `dist/index.js` server entry point exists
- [ ] Service worker file present in build output
- [ ] PWA manifest (`manifest.json`) included in build

### TypeScript & Linting

- [ ] `pnpm typecheck` passes (0 errors)
- [ ] `pnpm lint` passes (all files formatted)
- [ ] Extension typecheck: `pnpm extension:check` passes

### Testing

- [ ] Unit tests pass: `pnpm test` (30+ tests)
- [ ] Extension tests pass: `pnpm extension:test` (3+ tests)
- [ ] E2E smoke test passes: `pnpm e2e:smoke`

### Extension Package

- [ ] `pnpm extension:build` succeeds
- [ ] `pnpm extension:package` creates ZIP
- [ ] `dist/sfyta3-h-v-a-extension.zip` exists
- [ ] Manifest version is MV3
- [ ] Icons present (16px, 48px, 128px)

---

## Environment Configuration

### Environment Variables

- [ ] `.env` file created from `.env.example` (if needed)
- [ ] No secrets committed to repository
- [ ] PORT variable set (default: 3000)
- [ ] Sync configuration left empty for local-only mode

### HTTPS/SSL

- [ ] SSL certificate installed (for production domain)
- [ ] HTTPS redirect configured
- [ ] Certificate validity verified (not expired)
- [ ] Let's Encrypt auto-renewal configured (if applicable)

### Domain Configuration

- [ ] DNS records point to deployment target
- [ ] Subdomain configured (e.g., `app.yourdomain.com`)
- [ ] Custom domain verified in hosting platform
- [ ] WWW redirect configured (optional)

---

## PWA Validation

### Manifest Requirements

- [ ] `manifest.json` present in build output
- [ ] `name` field set: "SFYTA3.H-V.A"
- [ ] `short_name` field set
- [ ] `start_url` set to "/"
- [ ] `display` set to "standalone"
- [ ] `theme_color` matches app branding
- [ ] `background_color` set
- [ ] Icons array includes multiple sizes (192x192, 512x512)

### Service Worker

- [ ] Service worker registers successfully
- [ ] `clients.claim()` called for immediate activation
- [ ] Cache strategy implemented (cache-first for assets)
- [ ] Offline fallback page configured
- [ ] Update notification logic present

### Install Prompt

- [ ] `beforeinstallprompt` event handled
- [ ] Install button/banner appears when eligible
- [ ] Manual install instructions available
- [ ] PWA installs on Chrome/Edge desktop
- [ ] PWA installs on mobile browsers (tested)

### Offline Functionality

- [ ] App shell cached for offline use
- [ ] Library page loads offline
- [ ] Playback works offline (existing recordings)
- [ ] Navigation works offline (cached routes)
- [ ] Offline indicator displays when disconnected
- [ ] Graceful degradation for capture features

---

## Security Headers

### Self-Hosted Deployments

- [ ] Content-Security-Policy header configured
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] Referrer-Policy configured
- [ ] Permissions-Policy restricts unnecessary features
- [ ] HSTS enabled (Strict-Transport-Security)

### CSP Validation

- [ ] `'self'` allowed for scripts/styles
- [ ] `'wasm-unsafe-eval'` for encoder worker
- [ ] `blob:` allowed for audio playback
- [ ] `data:` allowed for images/waveforms
- [ ] No unsafe-inline (except where required)
- [ ] frame-ancestors 'none' prevents clickjacking

---

## Privacy & Compliance

### Policy Documents

- [ ] Privacy policy accessible at `/privacy`
- [ ] Terms of use accessible at `/terms`
- [ ] Copyright policy accessible at `/copyright`
- [ ] Help/About page with contact info

### UI Links

- [ ] Footer contains privacy policy link
- [ ] Settings page links to privacy policy
- [ ] Rights confirmation modal visible before capture
- [ ] DRM blocked message explains restriction
- [ ] Audit log view accessible

### Data Handling

- [ ] No analytics enabled by default
- [ ] No telemetry without consent
- [ ] IndexedDB storage is local-only
- [ ] Cloud sync disabled by default
- [ ] Export/delete functions work correctly

---

## Performance

### Bundle Analysis

- [ ] Main bundle size noted (>500KB warning acceptable for MVP)
- [ ] Code splitting planned for future optimization
- [ ] Lazy loading implemented for heavy components
- [ ] Encoder worker loaded separately

### Load Time

- [ ] First contentful paint < 3s on 4G
- [ ] Time to interactive < 5s on mid-range mobile
- [ ] Lighthouse performance score > 80

### Caching

- [ ] Static assets have long cache TTL (1 year)
- [ ] HTML has short cache TTL or no-cache
- [ ] Service worker updates detected properly

---

## Error Handling

### Boundaries

- [ ] React error boundaries catch rendering errors
- [ ] Friendly error messages displayed
- [ ] Reload option offered on critical errors
- [ ] Error logging configured (if enabled)

### 404 Handling

- [ ] Unknown routes redirect to index.html (SPA behavior)
- [ ] Custom 404 page shown if needed
- [ ] Deep linking works (client-side routing)

---

## Browser Compatibility

### Desktop Browsers

- [ ] Chrome/Edge (Chromium) - Full support
- [ ] Firefox - Tested for capture/playback
- [ ] Safari - Tested for capture/playback
- [ ] `getDisplayMedia` API supported

### Mobile Browsers

- [ ] Chrome Android - Capture works
- [ ] Safari iOS - Limited capture explained
- [ ] PWA install prompt works on supported devices
- [ ] Touch interactions tested

### Fallback Behavior

- [ ] Unsupported browsers see graceful message
- [ ] Mobile limitations documented in UI
- [ ] No confusing dead buttons

---

## Monitoring Setup

### Optional Analytics

- [ ] Analytics tool selected (Plausible/Fathom/Matomo)
- [ ] Opt-in mechanism implemented
- [ ] Privacy policy updated with analytics disclosure
- [ ] PII excluded from tracking
- [ ] Audio content never tracked

### Error Tracking

- [ ] Sentry/crash reporting configured (optional)
- [ ] PII filtering enabled
- [ ] Source maps uploaded securely (if used)
- [ ] Alert thresholds configured

---

## Backup & Recovery

### Rollback Plan

- [ ] Previous deployment archived
- [ ] Rollback procedure documented
- [ ] Database migration rollback tested (if applicable)
- [ ] PM2/systemd restart commands ready

### Data Backup

- [ ] User export functionality tested
- [ ] Manual IndexedDB backup procedure documented
- [ ] Future cloud backup strategy outlined

---

## Documentation

### User-Facing Docs

- [ ] Getting started guide available
- [ ] FAQ published
- [ ] Troubleshooting guide accessible
- [ ] Privacy policy readable

### Developer Docs

- [ ] README.md up to date
- [ ] Architecture documentation current
- [ ] API documentation (if applicable)
- [ ] Changelog maintained

---

## Final Smoke Test

### Production URL Verification

- [ ] Homepage loads (HTTP 200)
- [ ] All routes navigable
- [ ] Capture flow works end-to-end
- [ ] Rights confirmation required
- [ ] Recording persists after reload
- [ ] Playback works
- [ ] Download works
- [ ] Settings save correctly
- [ ] PWA install prompt appears
- [ ] Offline mode functional

### Console Checks

- [ ] No JavaScript errors in console
- [ ] No CORS errors
- [ ] No mixed content warnings
- [ ] Service worker registered without errors

---

## Sign-Off

### Team Approval

- [ ] Engineering lead approval
- [ ] QA sign-off
- [ ] Security review complete
- [ ] Compliance checklist passed
- [ ] Product manager approval

### Go/No-Go Decision

- [ ] **GO** - All checks passed, ready for launch
- [ ] **CONDITIONAL GO** - Minor non-blocking issues remain
- [ ] **NO-GO** - Critical blockers identified

**Decision Date:** _______________  
**Approved By:** _______________  
**Launch Date:** _______________

---

**Notes:**  
_______________________________________  
_______________________________________  
_______________________________________
