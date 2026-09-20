# Getting Started

## Prerequisites

Install Node.js 22 or a compatible current release and pnpm 10.x. A modern desktop browser is required for display-audio capture. HTTPS is required for service-worker registration and PWA installation outside localhost.

## Install and run

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open the displayed Vite URL. The library and settings views can be explored without capture permission. To capture, choose a browser tab in the visible share dialog and enable share audio.

## Build and serve production output

```bash
pnpm release:check
NODE_ENV=production PORT=3000 pnpm start
```

The release check creates `dist/public`, `dist/index.js`, `dist/extension`, and `dist/sfyta3-h-v-a-extension.zip`. Deploy the project behind HTTPS, preserve SPA fallback routing, and serve service-worker requests from the same origin.

## Operating the app

Rights confirmation must be accepted before capture. The source analyzer and protected-source decision run before capture; protected or unknown-authority sources are blocked. The local archive is available from the Library view for playback, waveform preview, chapters, tags, favorites, archive/restore, search, export, download, deletion, and retry recovery.

Local-only mode is the default. Optional sync is exposed in Settings and uses a mock provider until a production adapter is configured. Do not enable file upload unless the user has reviewed and explicitly accepted that choice.

## Troubleshooting

If capture is unavailable, use a desktop browser, confirm that the tab-share dialog includes audio, and check that the page is served from a secure context. If the PWA does not install, reload once to allow the service worker to activate and verify that the deployment serves `/manifest.json`, `/sw.js`, and the icon paths with HTTP 200 responses.
