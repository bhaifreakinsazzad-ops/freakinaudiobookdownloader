import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SERVICE_WORKER_PATH } from "./pwa";

const projectRoot = resolve(__dirname, "../../..");
const manifest = JSON.parse(readFileSync(resolve(projectRoot, "client/public/manifest.json"), "utf8")) as { display: string; start_url: string; scope: string; icons: Array<{ src: string }> };
const serviceWorker = readFileSync(resolve(projectRoot, "client/public/sw.js"), "utf8");

describe("PWA shell", () => {
  it("has installable manifest metadata and icons", () => {
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.scope).toBe("/");
    expect(manifest.icons.map((icon) => icon.src)).toEqual(["/icons/icon-192.svg", "/icons/icon-512.svg"]);
  });

  it("uses a versioned cache and offline navigation fallback", () => {
    expect(SERVICE_WORKER_PATH).toBe("/sw.js");
    expect(serviceWorker).toContain("CACHE_VERSION");
    expect(serviceWorker).toContain("request.mode === \"navigate\"");
    expect(serviceWorker).toContain("caches.match(\"/\")");
  });

  it("keeps the local-first app shell and service worker in public assets", () => {
    expect(readFileSync(resolve(projectRoot, "client/src/lib/storage.ts"), "utf8")).toContain("indexedDB.open");
    expect(readFileSync(resolve(projectRoot, "client/index.html"), "utf8")).toContain("/manifest.json");
  });
});
