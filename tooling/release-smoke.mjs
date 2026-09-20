import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = [
  "dist/public/index.html",
  "dist/public/manifest.json",
  "dist/public/sw.js",
  "dist/extension/manifest.json",
  "dist/extension/background.js",
  "dist/extension/popup.html",
  "dist/extension/popup.js",
  "dist/extension/icons/icon-128.svg",
  "dist/sfyta3-h-v-a-extension.zip",
];
for (const relative of required) {
  await access(path.join(root, relative));
}
const html = await readFile(path.join(root, "dist/public/index.html"), "utf8");
const manifest = JSON.parse(
  await readFile(path.join(root, "dist/public/manifest.json"), "utf8")
);
const serviceWorker = await readFile(
  path.join(root, "dist/public/sw.js"),
  "utf8"
);
if (!html.includes("SFYTA3.H-V.A"))
  throw new Error("production shell branding missing");
if (manifest.display !== "standalone" || manifest.start_url !== "/")
  throw new Error("installable manifest contract failed");
if (
  !serviceWorker.includes("CACHE_VERSION") ||
  !serviceWorker.includes('request.mode === "navigate"')
)
  throw new Error("offline service worker contract failed");
const extensionManifest = JSON.parse(
  await readFile(path.join(root, "dist/extension/manifest.json"), "utf8")
);
if (
  extensionManifest.manifest_version !== 3 ||
  extensionManifest.action?.default_popup !== "popup.html"
)
  throw new Error("extension manifest contract failed");
console.log(
  "E2E-capability smoke passed: production shell, manifest, service worker, and extension artifacts are present."
);
