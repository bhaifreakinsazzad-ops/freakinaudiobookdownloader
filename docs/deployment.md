# Deployment Guide - SFYTA3.H-V.A

**Version:** 1.0.0  
**Last Updated:** 2026-09-20  
**Status:** Production Ready

---

## 1. Build Configuration

### 1.1 Build Command

```bash
pnpm build
```

### 1.2 Output Directory

```
dist/
├── public/           # Static web assets
│   ├── index.html    # Entry point (368KB)
│   └── assets/       # Bundled JS/CSS
│       ├── index-*.js      # Main bundle (577KB)
│       ├── index-*.css     # Styles (136KB)
│       └── encoder.worker-* # Web Worker (172KB)
├── index.js          # Express server entry (788B)
├── extension/        # Built MV3 extension
└── sfyta3-h-v-a-extension.zip  # Packaged extension
```

### 1.3 Environment Variables Template

Create `.env` file (optional, local-first by default):

```bash
# .env.example

# Optional: Server port (default: 3000)
PORT=3000

# Optional: Cloud sync configuration (NOT REQUIRED for local-only mode)
# SYNC_PROVIDER=supabase
# SYNC_ENDPOINT=https://your-instance.supabase.co
# SYNC_ANON_KEY=your-anon-key-here

# Optional: Feature flags
# ENABLE_TELEMETRY=false
# ENABLE_ANALYTICS=false
```

**Important:** Never commit `.env` files. Use `.env.example` as template.

---

## 2. Deployment Targets

### 2.1 Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Configuration:** `vercel.json`
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 2.2 Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist/public
```

**Configuration:** `netlify.toml`
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2.3 Cloudflare Pages

```bash
# Install Wrangler
npm i -g wrangler

# Deploy
wrangler pages deploy dist/public --project-name=sfyta3-h-v-a
```

### 2.4 Self-Hosted (Node.js)

```bash
# Production server
cd dist
node index.js
```

Or with PM2:
```bash
pm2 start index.js --name sfyta3-h-v-a
pm2 save
pm2 startup
```

---

## 3. HTTPS Requirement

**PWA installation requires HTTPS** (except localhost).

### 3.1 SSL Certificate Options

- **Let's Encrypt** (free, auto-renewing)
- **Cloudflare SSL** (free, managed)
- **Vercel/Netlify** (automatic HTTPS)

### 3.2 Self-Hosted SSL Setup

```bash
# Using Certbot
sudo certbot --nginx -d your-domain.com
```

---

## 4. Domain/Subdomain Plan

### Recommended Structure

| Subdomain | Purpose | SSL |
|-----------|---------|-----|
| `app.yourdomain.com` | Main PWA | Required |
| `api.yourdomain.com` | Future cloud API | Required |
| `privacy.yourdomain.com` | Privacy policy page | Required |

### DNS Records

```
A    app    → your-server-ip
CNAME api   → your-api-endpoint
TXT  @      → verification records
```

---

## 5. Cache Strategy

### 5.1 Service Worker Caching

Current implementation (`client/src/service-worker.ts`):

- **Static assets:** Cache-first, indefinite retention
- **HTML shell:** Network-first, fallback to cache
- **API requests:** Network-only (no API calls in local mode)

### 5.2 Browser Cache Headers

For self-hosted deployments:

```nginx
# Nginx configuration
location /assets/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

location / {
  expires 1h;
  add_header Cache-Control "no-cache";
}
```

---

## 6. Service Worker Update Strategy

### 6.1 Current Behavior

- Service worker activates immediately on install
- Old workers serve cached content until tabs closed
- New tabs use updated worker

### 6.2 Update Flow

1. User visits app → SW checks for updates
2. New SW downloads in background
3. On next reload, new SW activates
4. Toast notification prompts user to refresh

### 6.3 Manual Update Check

Users can force update via:
- Settings → Advanced → Check for updates
- Hard refresh (Ctrl+Shift+R)

---

## 7. Offline Fallback Behavior

### 7.1 What Works Offline

- ✅ Navigate to all installed routes
- ✅ View library recordings
- ✅ Playback existing audio
- ✅ Edit metadata/tags
- ✅ Export/download recordings

### 7.2 What Requires Network

- ❌ Initial PWA installation (first load)
- ❌ Audio capture (requires browser APIs)
- ❌ Cloud sync (if enabled)
- ❌ External source analysis

### 7.3 Offline Indicator

UI displays offline badge when `navigator.onLine === false`.

---

## 8. Error Boundary / Not-Found Page

### 8.1 React Error Boundaries

Implemented in root layout:
- Catches component rendering errors
- Displays friendly error message
- Offers reload option

### 8.2 404 Handling

SPA routing ensures all paths resolve to `index.html`. No true 404s within app scope.

---

## 9. Privacy/Terms Routes

### 9.1 Recommended URL Structure

```
/privacy  → Privacy Policy
/terms    → Terms of Use
/copyright → Copyright & Authorized Use
/help     → Help Center
/about    → About SFYTA3.H-V.A
```

### 9.2 Implementation

Add modal components or dedicated pages that render markdown from `docs/`:

```tsx
// Example: PrivacyPolicyPage.tsx
import privacyPolicy from '../docs/privacy-policy.md';

export function PrivacyPolicyPage() {
  return <MarkdownContent source={privacyPolicy} />;
}
```

---

## 10. Support Contact Page

### 10.1 Contact Information

Include in `/help` or `/about`:

- **Email:** support@yourdomain.com (configure as needed)
- **GitHub Issues:** https://github.com/your-org/sfyta3-h-v-a/issues
- **Documentation:** https://yourdomain.com/docs

### 10.2 Support Form (Optional)

Integrate with:
- EmailJS (client-side email)
- Formspree (form backend)
- GitHub Issues API (direct issue creation)

---

## 11. Monitoring / Opt-In Analytics Plan

### 11.1 Current State

**No telemetry enabled by default.**

### 11.2 If Adding Analytics

Required steps:
1. Update privacy policy with analytics disclosure
2. Add opt-in toggle in Settings
3. Implement anonymized tracking only
4. Exclude all audio content from events
5. Provide disable mechanism

### 11.3 Recommended Tools

- **Plausible** (privacy-focused, GDPR compliant)
- **Fathom** (simple, no cookies)
- **Self-hosted Matomo** (full control)

### 11.4 Crash Reporting

Consider:
- **Sentry** (with PII filtering)
- **LogRocket** (session replay, consent required)

---

## 12. Backup/Restore Guidance

### 12.1 Local Export

Users can export:
- Individual recordings (WAV/MP3)
- Recording metadata (JSON)
- Full library export (planned feature)

### 12.2 Manual IndexedDB Backup

Advanced users can backup via:
```javascript
// Browser DevTools → Application → IndexedDB → Export
```

### 12.3 Future Cloud Backup

When cloud sync is enabled:
- Automatic encrypted backup to configured provider
- Restore from any authenticated device
- Version history (planned)

---

## 13. Production Headers (Self-Hosted)

### 13.1 Security Headers

```nginx
# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self' https:; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" always;

# Prevent MIME sniffing
add_header X-Content-Type-Options "nosniff" always;

# Referrer Policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Permissions Policy (disable unnecessary features)
add_header Permissions-Policy "microphone=(), camera=(), geolocation=(), payment=()" always;

# XSS Protection (legacy browsers)
add_header X-XSS-Protection "1; mode=block" always;

# Frame options
add_header X-Frame-Options "DENY" always;
```

### 13.2 CSP Notes

- `'wasm-unsafe-eval'` required for MP3 encoder worker
- `blob:` required for audio playback
- `data:` required for waveform images
- No remote script sources allowed

---

## 14. Deployment Checklist

See `docs/deployment-checklist.md` for complete pre-launch verification.

---

## 15. Rollback Procedure

### 15.1 Vercel/Netlify

```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-id]
```

### 15.2 Self-Hosted

```bash
# Keep previous build
cp -r dist dist-backup-$(date +%Y%m%d)

# Rollback
rm -rf dist
mv dist-backup-YYYYMMDD dist
pm2 restart sfyta3-h-v-a
```

---

## 16. Troubleshooting

### 16.1 Common Issues

| Issue | Solution |
|-------|----------|
| PWA won't install | Verify HTTPS, check service worker registration |
| Offline mode fails | Clear cache, hard refresh |
| Build fails on Windows | Use `cross-env`, ensure Node 22+ |
| Extension won't load | Check manifest version, verify icons exist |

### 16.2 Debug Mode

```bash
# Enable verbose logging
DEBUG=sfyta3:* pnpm start
```

---

**Document Status:** Complete  
**Next Review:** Post-pilot feedback incorporation
