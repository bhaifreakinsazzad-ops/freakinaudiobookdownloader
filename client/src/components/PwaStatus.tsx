import { useEffect, useState } from "react";
import { Download, WifiOff, X } from "lucide-react";
import { isOffline, isStandaloneDisplayMode } from "@/lib/pwa";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export default function PwaStatus() {
  const [offline, setOffline] = useState(isOffline());
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandaloneDisplayMode());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    const onBeforeInstall = (event: Event) => { event.preventDefault(); setInstallEvent(event as InstallPromptEvent); };
    const onInstalled = () => { setInstalled(true); setInstallEvent(null); };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setInstallEvent(null);
  };

  if (dismissed || installed) return null;
  if (offline) return <div className="pwa-status pwa-offline" role="status"><WifiOff size={15} /><span>Offline mode — your local library remains available. Capture requires browser media permission.</span><button onClick={() => setDismissed(true)} aria-label="Dismiss offline status"><X size={15} /></button></div>;
  if (!installEvent) return null;
  return <div className="pwa-status pwa-install" role="status"><Download size={15} /><span>Install SFYTA3.H-V.A for fast offline access to your local library.</span><button className="pwa-install-button" onClick={() => void install()}>Install</button><button onClick={() => setDismissed(true)} aria-label="Dismiss install prompt"><X size={15} /></button></div>;
}
