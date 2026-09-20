# Pilot Install Guide - SFYTA3.H-V.A

**Version:** 1.0.0  
**For:** Pilot Program Participants  
**Last Updated:** 2026-09-20

---

## Welcome to the SFYTA3.H-V.A Pilot!

Thank you for participating in our controlled pilot program. This guide will help you install and configure both the web application (PWA) and the optional browser extension companion.

**Estimated Setup Time:** 15-20 minutes

---

## Prerequisites

Before starting, ensure you have:

- [ ] Modern desktop/laptop computer (Windows 10+, macOS 12+, or Linux)
- [ ] Chrome, Edge, or Firefox browser (latest version)
- [ ] Stable internet connection (for initial setup)
- [ ] Administrator access to install software
- [ ] Authorized audio content to test with (public domain, Creative Commons, or personally owned)

**Important:** This is beta software. Do not use for mission-critical workflows. Export important recordings promptly.

---

## Part 1: Web Application Installation

### Option A: Access Hosted Instance (Recommended for Most Pilots)

If the pilot team has deployed a hosted instance:

1. **Open your browser**
2. **Navigate to:** `https://pilot.sfyta3-h-v-a.example.com` (URL provided by pilot coordinator)
3. **Bookmark the page** for easy access
4. **Proceed to PWA Installation** (below)

### Option B: Local Development Setup (Technical Pilots Only)

If you prefer to run locally:

```bash
# Clone repository
git clone https://github.com/your-org/sfyta3-h-v-a.git
cd sfyta3-h-v-a

# Install dependencies
pnpm install

# Build production version
pnpm build

# Start server
pnpm start
```

Then open: `http://localhost:3000`

---

## Part 2: PWA (Progressive Web App) Installation

Installing as a PWA provides an app-like experience with offline support.

### Chrome/Edge (Desktop)

1. **Open the web app** in your browser
2. **Look for the install icon** in the address bar (⊕ or ↓ icon)
3. **Click "Install"** or "Install SFYTA3.H-V.A"
4. **Confirm** installation when prompted
5. **App opens** in standalone window

**Alternative method:**
1. Click browser menu (⋮)
2. Select "More tools" → "Create shortcut"
3. Check "Open as window"
4. Click "Create"

### Firefox (Desktop)

Firefox doesn't support traditional PWA installation, but you can create a bookmark:

1. Click the star icon in address bar
2. Choose bookmarks folder
3. Click "Save"

For app-like experience:
1. Open `about:config`
2. Search for `browser.ssb.enabled`
3. Set to `true`
4. Restart Firefox

### Verifying PWA Installation

- [ ] App opens in separate window (not browser tab)
- [ ] No browser address bar visible
- [ ] App icon appears in taskbar/dock
- [ ] App listed in system applications

---

## Part 3: Extension Companion Installation (Optional)

The extension provides quick access and status indicators. It does NOT perform capture independently—the web app handles all recording.

### Step 1: Load Unpacked Extension (All Platforms)

1. **Build the extension:**
   ```bash
   cd /path/to/sfyta3-h-v-a
   pnpm extension:package
   ```

2. **Locate the built extension:**
   - Path: `dist/extension/`
   - Or unzip: `dist/sfyta3-h-v-a-extension.zip`

3. **Open browser extensions page:**
   - **Chrome/Edge:** `chrome://extensions/`
   - **Firefox:** `about:debugging#/runtime/this-firefox`

4. **Enable Developer Mode:**
   - Toggle "Developer mode" (top right on Chrome/Edge)

5. **Load unpacked extension:**
   - Click "Load unpacked" button
   - Navigate to `dist/extension/` folder
   - Select the folder

6. **Verify installation:**
   - Extension icon appears in toolbar
   - No error messages shown

### Step 2: Configure Extension

1. **Click extension icon** in toolbar
2. **Enter web app URL:**
   - Hosted: `https://pilot.sfyta3-h-v-a.example.com`
   - Local: `http://localhost:3000`
3. **Click "Save"**
4. **Status shows:** "Connected" or "Ready"

### Troubleshooting Extension

| Issue | Solution |
|-------|----------|
| Icon not visible | Pin extension from extensions menu |
| "Manifest not found" | Ensure loading correct folder (has manifest.json) |
| Can't save URL | Check browser console for errors |
| Status always "Disconnected" | Verify web app URL is accessible |

---

## Part 4: First Capture Session

### Before You Start

**Legal Reminder:** Only capture content you have the right to archive:
- Public domain works (e.g., LibriVox audiobooks)
- Creative Commons licensed content
- Content you own/purchased for personal use
- Educational content with appropriate licenses

**DO NOT** attempt to capture:
- DRM-protected paid content (will be blocked)
- Subscription-only content without authorization
- Any content that violates copyright law

### Your First Recording

1. **Open SFYTA3.H-V.A** (via PWA or browser)

2. **Review Rights Confirmation:**
   - Read the rights confirmation modal carefully
   - Check all three affirmation boxes
   - Click "I Confirm" to proceed

3. **Start Capture:**
   - Click "Start Capture" button
   - Browser permission dialog appears
   - Select the tab/window with your audio source
   - Check "Share system audio" if available
   - Click "Share"

4. **Recording Indicators:**
   - Red dot appears (recording in progress)
   - Timer shows elapsed time
   - Waveform visualizes audio levels

5. **Stop Recording:**
   - Click "Stop" button when finished
   - Encoding begins automatically
   - Wait for encoding to complete

6. **Review Recording:**
   - Appears in Library section
   - Click play button to listen
   - Edit title, tags, chapters as needed

7. **Export/Download:**
   - Click download icon
   - Choose WAV or MP3 format
   - File saves to Downloads folder

---

## Part 5: Verification Checklist

Complete these checks during Week 0:

### Basic Functionality

- [ ] Web app loads successfully
- [ ] Rights confirmation modal appears
- [ ] Can start capture session
- [ ] Browser permission dialog shows
- [ ] Recording indicator visible during capture
- [ ] Can stop recording
- [ ] Encoding completes without error
- [ ] Recording appears in library
- [ ] Playback works
- [ ] Download creates valid audio file

### Persistence

- [ ] Close browser completely
- [ ] Reopen browser/app
- [ ] Recording still present in library
- [ ] Playback still works after restart

### PWA Features

- [ ] App installs as PWA
- [ ] Opens in standalone window
- [ ] Works offline (library accessible without network)
- [ ] Install icon no longer appears after installation

### Extension (if installed)

- [ ] Extension icon visible in toolbar
- [ ] Popup opens when clicked
- [ ] Can save web app URL
- [ ] Status shows "Connected"
- [ ] Can launch web app from extension

### Compliance

- [ ] Rights confirmation required before first capture
- [ ] Cannot bypass rights modal
- [ ] Attempting to capture protected source shows block message
- [ ] Audit log view shows your actions

---

## Part 6: Known Limitations

Be aware of these limitations during the pilot:

### Functional Limits

- **Maximum recording length:** 30 minutes per session
- **Storage limit:** 256 MB per recording
- **Formats:** WAV and MP3 only (no FLAC, AAC, Opus yet)
- **Mobile:** Limited support on Android; iOS not supported

### Technical Notes

- **Bundle size:** Main app >500KB (may load slowly on slow connections)
- **Cloud sync:** Not available in pilot (local-only storage)
- **Browser E2E tests:** Manual verification required

### Compliance Boundaries

- **DRM detection:** Client-side only; may not catch all protected content
- **Audit log:** Stored locally; not tamper-evident
- **Jurisdiction:** You are responsible for understanding local copyright law

---

## Part 7: Getting Help

### Documentation

- **Getting Started:** `docs/getting-started.md`
- **FAQ:** `docs/faq.md` (if available)
- **Troubleshooting:** `docs/troubleshooting.md`
- **Privacy Policy:** `docs/privacy-policy.md`
- **Terms of Use:** `docs/terms-of-use.md`

### Support Channels

**For Technical Issues:**
- GitHub Issues: https://github.com/your-org/sfyta3-h-v-a/issues
  - Use label: `pilot-feedback`
  - Include steps to reproduce
- Email: pilot-support@yourdomain.com

**For Compliance Questions:**
- Email: compliance@yourdomain.com

**For Security Concerns:**
- Email: security@yourdomain.com
- Encrypt sensitive reports

**Real-Time Discussion:**
- Slack/Discord: #pilot-feedback channel (invite provided separately)

### Weekly Cadence

- **Monday:** Weekly goals email
- **Wednesday:** Mid-week check-in reminder
- **Friday:** Submit weekly feedback survey
- **Week 1-4:** Attend weekly sync call (calendar invite provided)

---

## Part 8: Feedback Submission

### When to Submit Feedback

- **Weekly:** Every Friday (survey link emailed)
- **Ad-hoc:** Immediately for P0/P1 issues
- **End of pilot:** Final survey and exit interview

### How to Submit

**Option 1: GitHub Issues (Preferred)**
1. Go to: https://github.com/your-org/sfyta3-h-v-a/issues
2. Click "New Issue"
3. Select "Pilot Feedback" template
4. Complete all applicable sections
5. Attach screenshots/logs if helpful
6. Submit

**Option 2: Email**
- Send to: pilot-support@yourdomain.com
- Use subject: "[Pilot Feedback] Week X - Brief Description"
- Include details from feedback template

**Option 3: Slack/Discord**
- Post in: #pilot-feedback channel
- Tag @pilot-coordinator for urgent issues

---

## Part 9: Exit Criteria

The pilot will be considered successful if:

- [ ] Zero P0 compliance failures (no rights bypass, no DRM capture)
- [ ] Zero invalid audio files produced
- [ ] Zero data loss incidents
- [ ] Audio quality acceptable (>80% approval)
- [ ] Library persistence stable (>95% success rate)
- [ ] PWA install works on supported browsers
- [ ] Offline mode functional

Your participation helps us validate these criteria!

---

## Part 10: Next Steps After Setup

1. **Complete your first capture session** within 48 hours of setup
2. **Submit Week 0 feedback** confirming successful installation
3. **Attend Week 1 sync call** (calendar invite provided)
4. **Plan 3+ capture sessions** for Week 2
5. **Test edge cases** in Week 3 (long recordings, large library)
6. **Complete final survey** in Week 4

---

## Quick Reference

| Task | Location |
|------|----------|
| Start capture | Home page → Start Capture button |
| View library | Library tab |
| Download recording | Library → Download icon |
| Edit metadata | Library → Click recording → Edit |
| Check audit log | Settings → Audit Log |
| Change settings | Settings tab |
| View privacy policy | Settings → Privacy Policy card |
| Get help | Settings → Help/About (or docs folder) |

---

**Welcome aboard!** We're excited to have you as part of the SFYTA3.H-V.A pilot program. Your feedback is invaluable in shaping this product.

**Pilot Coordinator Contact:** pilot-lead@yourdomain.com

---

*Document Version: 1.0.0*  
*Last Updated: 2026-09-20*  
*Valid for Pilot Weeks 0-4*
