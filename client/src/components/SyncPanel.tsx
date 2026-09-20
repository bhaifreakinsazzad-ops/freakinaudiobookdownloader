import { useMemo, useState } from "react";
import { Cloud, KeyRound, RefreshCw, ShieldCheck } from "lucide-react";
import {
  createLocalSyncProvider,
  defaultSyncOptions,
  type ConflictResolution,
  type SyncStatus,
} from "@/lib/sync";
import type { StoredRecording } from "@/lib/storage";

type SyncRecording = { id: string; title: string; updatedAt?: number };

export default function SyncPanel({
  localOnly,
  recordings,
  onAudit,
}: {
  localOnly: boolean;
  recordings: SyncRecording[];
  onAudit: (
    label: string,
    detail: string,
    tone: "green" | "violet" | "amber" | "red"
  ) => void;
}) {
  const provider = useMemo(() => createLocalSyncProvider(), []);
  const [status, setStatus] = useState<SyncStatus>(
    localOnly ? "local-only" : "disabled"
  );
  const [uploadFiles, setUploadFiles] = useState(false);
  const [conflictResolution, setConflictResolution] =
    useState<ConflictResolution>("newest-wins");
  const [busy, setBusy] = useState(false);
  const [lastDetail, setLastDetail] = useState(
    "No cloud connection is active."
  );

  const sync = async () => {
    setBusy(true);
    setStatus("syncing");
    try {
      await provider.signIn();
      await provider.registerDevice({
        id: `device-${navigator.userAgent.length}`,
        name: `${navigator.platform || "Browser"} device`,
      });
      const result = await provider.syncMetadata(
        recordings.map(recording => ({
          recording: recording as StoredRecording,
          revision: recording.updatedAt || Date.now(),
          updatedAt: recording.updatedAt || Date.now(),
          deviceId: "current-device",
        })),
        { ...defaultSyncOptions(), uploadFiles, conflictResolution }
      );
      setStatus(result.status);
      setLastDetail(
        `${result.pushed} metadata item(s) pushed · ${result.conflicts.length} conflict(s) · files ${uploadFiles ? "allowed by consent" : "not uploaded"}.`
      );
      onAudit(
        "Sync enabled",
        `Mock provider · ${result.pushed} metadata item(s) synchronized`,
        result.conflicts.length ? "amber" : "green"
      );
    } catch (error) {
      setStatus("error");
      setLastDetail(error instanceof Error ? error.message : "Sync failed.");
      onAudit(
        "Sync failed",
        "The optional provider could not complete synchronization",
        "red"
      );
    } finally {
      setBusy(false);
    }
  };

  const disable = () => {
    setStatus("local-only");
    setLastDetail(
      "Cloud sync disabled. Local IndexedDB remains the source of truth."
    );
    onAudit(
      "Sync disabled",
      "Local-only mode restored; no cloud writes will be attempted",
      "amber"
    );
  };

  return (
    <div className="settings-card sync-panel">
      <div className="settings-card-head">
        <div className="settings-icon violet">
          <Cloud size={18} />
        </div>
        <div>
          <h2>Optional encrypted sync</h2>
          <p>
            Provider abstraction ready for Supabase, Clerk, S3/R2, or a custom
            backend.
          </p>
        </div>
        <span className={`sync-status sync-${status}`}>{status}</span>
      </div>
      <div className="sync-panel-copy">
        <ShieldCheck size={15} />
        <span>
          Local-only remains the default. Metadata encryption and file
          encryption hooks are exposed to the provider; this preview uses a mock
          provider only.
        </span>
      </div>
      <div className="setting-row">
        <div>
          <b>Conflict strategy</b>
          <span>Deterministic resolution for concurrent metadata edits</span>
        </div>
        <select
          value={conflictResolution}
          onChange={event =>
            setConflictResolution(event.target.value as ConflictResolution)
          }
        >
          <option value="newest-wins">Newest update wins</option>
          <option value="local-wins">This device wins</option>
          <option value="remote-wins">Remote wins</option>
        </select>
      </div>
      <div className="setting-row">
        <div>
          <b>Upload audio files</b>
          <span>Requires explicit consent; disabled by default</span>
        </div>
        <button
          className={`toggle ${uploadFiles ? "on" : ""}`}
          onClick={() => setUploadFiles(value => !value)}
          aria-label="Toggle explicit file upload consent"
        >
          <span />
        </button>
      </div>
      <div className="sync-actions">
        <button
          className="primary-button"
          disabled={busy || localOnly}
          onClick={() => void sync()}
        >
          <RefreshCw size={15} className={busy ? "spin" : ""} />{" "}
          {busy ? "Syncing" : "Sync metadata"}
        </button>
        <button
          className="outline-button"
          disabled={status === "local-only"}
          onClick={disable}
        >
          <KeyRound size={15} /> Disable sync
        </button>
      </div>
      <small className="sync-detail">{lastDetail}</small>
    </div>
  );
}
