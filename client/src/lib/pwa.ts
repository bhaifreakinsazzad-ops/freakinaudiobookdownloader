export const SERVICE_WORKER_PATH = "/sw.js";

export type PwaInstallState = "unavailable" | "available" | "installed";

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !window.isSecureContext) return Promise.resolve(null);
  return navigator.serviceWorker.register(SERVICE_WORKER_PATH, { scope: "/" }).catch(() => null);
}

export function isOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

export function isStandaloneDisplayMode() {
  return typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
}
