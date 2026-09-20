# SFYTA3.H-V.A Capture Layer

This is a publishable Manifest V3 companion extension for the SFYTA3.H-V.A web application. It provides a popup with deployment URL configuration, a health/status surface, and an explicit handoff to the web app. The extension never records in the background and does not bypass DRM or protected media.

The current release deliberately keeps capture in the web application, where rights confirmation, protected-source decisions, and the visible browser permission flow are enforced. Extension messaging rejects capture requests outside that gate. This preserves a least-privilege store package while leaving a clear boundary for a future reviewed capture integration.

Build and validate from the repository root:

```bash
pnpm extension:check
pnpm extension:test
pnpm extension:package
```

The packaged output is `dist/extension/`, with the ZIP at `dist/sfyta3-h-v-a-extension.zip`.
