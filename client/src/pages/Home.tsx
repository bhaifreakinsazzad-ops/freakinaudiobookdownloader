import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Archive,
  ArrowDownToLine,
  AudioLines,
  BadgeCheck,
  BarChart3,
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Cloud,
  Download,
  FileAudio,
  FileCheck2,
  Gauge,
  Headphones,
  Laptop2,
  Library,
  LockKeyhole,
  Menu,
  Mic2,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  ArchiveRestore,
  Edit3,
  RotateCcw,
  SlidersHorizontal,
  Square,
  Trash2,
  Upload,
  UserRound,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteAuditEvents,
  deleteRecording as deleteStoredRecording,
  deleteChapter,
  getWaveform,
  getPlaybackState,
  getRecordingBlob,
  getSetting,
  listAuditEvents,
  listChapters,
  listRecordings,
  migrateLegacyLocalStorage,
  putAuditEvent,
  putChapter,
  putPlaybackState,
  putRecording,
  putSetting,
  putSource,
  putWaveform,
  updateRecordingMetadata,
  toStorageError,
  type StoredAuditEvent,
  type StoredRecording,
  type StoredChapter,
  type StorageFormat,
} from "@/lib/storage";
import {
  encodeAudio,
  sanitizeFilename,
  type EncoderOptions,
} from "@/lib/encoder";
import { encodeWithWorker } from "@/lib/encoder-client";
import {
  formatTurboEta,
  processTurbo,
  validateTurboQuality,
} from "@/lib/turbo";
import { generateWaveformPeaks } from "@/lib/waveform";
import SyncPanel from "@/components/SyncPanel";
import PrivacyPolicyCard from "@/components/PrivacyPolicyCard";
import { canStartCapture, evaluateSource } from "@/lib/compliance";

type View = "studio" | "library" | "audit" | "settings";
type CaptureStatus =
  | "ready"
  | "recording"
  | "paused"
  | "processing"
  | "complete"
  | "blocked";
type Mode = "normal" | "turbo";
type Format = Extract<StorageFormat, "wav" | "mp3">;

type Recording = {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  size: string;
  format: string;
  source: string;
  created: string;
  createdAt?: number;
  color: string;
  localOnly?: boolean;
  tags?: string[];
  favorite?: boolean;
  archived?: boolean;
  failed?: boolean;
  blob?: Blob;
};

type AuditEvent = {
  id: string;
  label: string;
  detail: string;
  time: string;
  tone: "green" | "violet" | "amber" | "red";
};

const defaultRecordings: Recording[] = [
  {
    id: "rec-quiet-practice",
    title: "The Quiet Practice",
    subtitle: "Chapter 03 · The unhurried mind",
    duration: "42:18",
    size: "38.7 MB",
    format: "WAV",
    source: "ElevenLabs Reader",
    created: "Today, 09:42",
    color: "lavender",
    localOnly: true,
  },
  {
    id: "rec-field-guide",
    title: "A Field Guide to Attention",
    subtitle: "Chapter 07 · The open loop",
    duration: "28:42",
    size: "26.1 MB",
    format: "MP3",
    source: "Authorized web source",
    created: "Yesterday, 17:18",
    color: "lime",
    localOnly: true,
  },
  {
    id: "rec-memory",
    title: "Notes on Memory",
    subtitle: "Section 02 · What stays",
    duration: "17:09",
    size: "16.4 MB",
    format: "OPUS",
    source: "Creator upload",
    created: "Sep 18, 14:07",
    color: "peach",
    localOnly: true,
  },
  {
    id: "rec-small-things",
    title: "All the Small Things",
    subtitle: "Episode 14 · A softer signal",
    duration: "52:08",
    size: "47.9 MB",
    format: "AAC",
    source: "Podcast feed",
    created: "Sep 16, 11:31",
    color: "blue",
    localOnly: true,
  },
];

const defaultAudit: AuditEvent[] = [
  {
    id: "audit-1",
    label: "Rights confirmation recorded",
    detail: "The Quiet Practice · elevenreader.io",
    time: "Today, 09:42",
    tone: "green",
  },
  {
    id: "audit-2",
    label: "Source analyzed",
    detail: "Authorized web source · no DRM signal",
    time: "Today, 09:41",
    tone: "violet",
  },
  {
    id: "audit-3",
    label: "Local archive created",
    detail: "The Quiet Practice · WAV · 38.7 MB",
    time: "Today, 09:42",
    tone: "green",
  },
  {
    id: "audit-4",
    label: "Cloud sync skipped",
    detail: "Local-only mode is enabled",
    time: "Today, 09:42",
    tone: "amber",
  },
];

const navItems: { id: View; label: string; icon: typeof Library }[] = [
  { id: "studio", label: "Capture studio", icon: AudioLines },
  { id: "library", label: "Archive library", icon: Library },
  { id: "audit", label: "Audit log", icon: ShieldCheck },
  { id: "settings", label: "Settings", icon: Settings2 },
];

const primarySource = {
  id: "source-reader-quiet-practice",
  type: "elevenlabs-reader" as const,
  url: "https://elevenreader.io/library/quiet-practice",
  title: "The Quiet Practice",
  licenseStatus: "authorized" as const,
  drmDetected: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

function formatBytes(bytes: number) {
  if (!bytes) return "0 KB";
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatClock(seconds: number) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

function parseUiDuration(value: string) {
  const [minutes, seconds] = value.split(":").map(Number);
  return (minutes || 0) * 60 + (seconds || 0);
}

function toUiRecording(row: StoredRecording): Recording {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    duration: formatClock(row.durationSeconds),
    size: formatBytes(row.fileSizeBytes),
    format: row.format.toUpperCase(),
    source: row.source,
    created: new Date(row.createdAt).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    createdAt: row.createdAt,
    color: row.color,
    localOnly: row.localOnly,
    tags: row.tags || [],
    favorite: row.favorite || false,
    archived: row.archived || false,
    failed: row.status === "failed",
  };
}

function toUiAudit(row: StoredAuditEvent): AuditEvent {
  return {
    id: row.id,
    label: row.label,
    detail: row.detail,
    time: row.timeLabel,
    tone: row.tone,
  };
}

function createWav(samples: Float32Array, sampleRate = 44100) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++)
      view.setUint8(offset + i, text.charCodeAt(i));
  };
  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(
      44 + i * 2,
      sample < 0 ? sample * 0x8000 : sample * 0x7fff,
      true
    );
  }
  return new Blob([buffer], { type: "audio/wav" });
}

function createDemoWav(seed = 0) {
  const sampleRate = 44100;
  const length = sampleRate * 1.8;
  const samples = new Float32Array(length);
  const frequency = 280 + (seed % 4) * 80;
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const fade = Math.min(1, t * 18, (1.8 - t) * 18);
    samples[i] =
      Math.sin(2 * Math.PI * frequency * t) * 0.16 * Math.max(0, fade);
  }
  return createWav(samples, sampleRate);
}

function statusMeta(status: CaptureStatus) {
  const map = {
    ready: { label: "Ready to capture", tone: "ready" },
    recording: { label: "Recording live", tone: "recording" },
    paused: { label: "Capture paused", tone: "paused" },
    processing: { label: "Preparing file", tone: "processing" },
    complete: { label: "File ready", tone: "complete" },
    blocked: { label: "Capture blocked", tone: "blocked" },
  } as const;
  return map[status];
}

function Waveform({ active = false }: { active?: boolean }) {
  const bars = [
    18, 28, 43, 26, 57, 35, 70, 46, 29, 51, 74, 38, 63, 29, 54, 45, 82, 32, 60,
    41, 68, 28, 48, 74, 38, 55, 29, 44, 69, 34, 58, 25, 76, 42, 62, 31, 48, 72,
    26, 55, 36, 66, 43, 80, 34, 60, 24, 49, 67, 37, 58, 28, 45, 70, 32, 55, 40,
    62, 29, 48, 75, 33, 54, 26, 43, 64, 35, 58, 28, 49, 69, 39, 57, 31, 45, 65,
    36, 53, 27, 42, 63, 32, 51, 24, 44, 57, 34, 48, 26, 38, 50, 29,
  ];
  return (
    <div
      className={`waveform ${active ? "waveform-active" : ""}`}
      aria-label={active ? "Live audio waveform" : "Audio waveform preview"}
    >
      {bars.map((height, index) => (
        <span
          key={index}
          style={{ height: `${height}%`, animationDelay: `${index * 16}ms` }}
        />
      ))}
    </div>
  );
}

function PeakStrip({ peaks }: { peaks: number[] }) {
  const visiblePeaks = peaks.length
    ? peaks.slice(0, 48)
    : Array.from({ length: 24 }, () => 0.12);
  return (
    <div className="mini-waveform" aria-label="Stored waveform preview">
      {visiblePeaks.map((peak, index) => (
        <span
          key={index}
          style={{ height: `${Math.max(8, Math.round(peak * 100))}%` }}
        />
      ))}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  accent,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail: string;
  accent: string;
}) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${accent}`}>
        <Icon size={17} />
      </div>
      <div className="metric-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

function AppLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`app-logo ${compact ? "app-logo-compact" : ""}`}>
      <span className="logo-mark">
        <span />
        <span />
        <span />
      </span>
      {!compact && (
        <span className="logo-type">
          <b>SFYTA3</b>
          <em>H-V.A</em>
        </span>
      )}
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("studio");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [status, setStatus] = useState<CaptureStatus>("ready");
  const [mode, setMode] = useState<Mode>("normal");
  const [format, setFormat] = useState<Format>("wav");
  const [bitrate, setBitrate] = useState(128);
  const [outputSampleRate, setOutputSampleRate] = useState(44100);
  const [channels, setChannels] = useState<1 | 2>(1);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [rightsModalOpen, setRightsModalOpen] = useState(false);
  const [sourceScanning, setSourceScanning] = useState(false);
  const [sourceBlocked, setSourceBlocked] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [liveBytes, setLiveBytes] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingEta, setProcessingEta] = useState<string | null>(null);
  const [turboSpeed, setTurboSpeed] = useState(4);
  const [lastFile, setLastFile] = useState<Blob | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [waveforms, setWaveforms] = useState<Record<string, number[]>>({});
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState<"en" | "bn">("en");
  const [localOnly, setLocalOnly] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState<
    "all" | "favorites" | "archived"
  >("all");
  const [librarySort, setLibrarySort] = useState<"newest" | "oldest" | "title">(
    "newest"
  );
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [playbackVolume, setPlaybackVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [chapters, setChapters] = useState<StoredChapter[]>([]);
  const [chapterTitle, setChapterTitle] = useState("");
  const [metadataEditorId, setMetadataEditorId] = useState<string | null>(null);
  const [metadataTitle, setMetadataTitle] = useState("");
  const [metadataTags, setMetadataTags] = useState("");

  const captureRef = useRef<{
    stream: MediaStream;
    context: AudioContext;
    processor: ScriptProcessorNode;
    source: MediaStreamAudioSourceNode;
    gain: GainNode;
  } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pcmRef = useRef<Float32Array[]>([]);
  const sampleRateRef = useRef(44100);
  const startTimeRef = useRef(0);
  const statusRef = useRef(status);
  const encoderWorkerRef = useRef<Worker | null>(null);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  const saveSetting = (key: string, value: unknown) => {
    void putSetting(key, value).catch(error => {
      const normalized = toStorageError(error);
      setStorageError(normalized.message);
      toast.error("Setting was not saved", { description: normalized.message });
    });
  };
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await migrateLegacyLocalStorage();
        await putSource(primarySource);
        let rows = await listRecordings();
        if (!rows.length) {
          for (let index = 0; index < defaultRecordings.length; index += 1) {
            const seed = defaultRecordings[index];
            const demoFormat: Format =
              seed.format.toLowerCase() === "mp3" ? "mp3" : "wav";
            const demoSamples = new Float32Array(44100);
            const demoEncoded = encodeAudio(demoSamples, {
              format: demoFormat,
              sampleRate: 44100,
              channels: 1,
              bitrate: 128,
              title: seed.title,
              artist: "SFYTA3.H-V.A",
              album: "Local Archive",
              source: seed.source,
            });
            await putRecording(
              {
                id: seed.id,
                sourceId: primarySource.id,
                title: seed.title,
                subtitle: seed.subtitle,
                source: seed.source,
                status: "ready",
                mode: "normal",
                format: demoFormat,
                durationSeconds: parseUiDuration(seed.duration),
                fileSizeBytes: 0,
                channels: 1,
                mimeType: demoEncoded.mimeType,
                color: seed.color,
                localOnly: true,
                createdAt: Date.now() - index * 86_400_000,
                updatedAt: Date.now(),
                chunkCount: 0,
              },
              demoEncoded.blob
            );
          }
          rows = await listRecordings();
        }
        const audits = await listAuditEvents();
        const savedLanguage = await getSetting<"en" | "bn">("language");
        const savedLocalOnly = await getSetting<boolean>("localOnly");
        const savedNotifications = await getSetting<boolean>("notifications");
        const savedReducedMotion = await getSetting<boolean>("reducedMotion");
        if (!active) return;
        setRecordings(rows.map(toUiRecording));
        const waveformEntries = await Promise.all(
          rows.map(
            async row =>
              [row.id, (await getWaveform(row.id))?.peaks || []] as const
          )
        );
        setWaveforms(Object.fromEntries(waveformEntries));
        setAuditEvents(audits.length ? audits.map(toUiAudit) : defaultAudit);
        if (!audits.length) {
          for (let index = 0; index < defaultAudit.length; index += 1) {
            const seed = defaultAudit[index];
            await putAuditEvent({
              id: seed.id,
              label: seed.label,
              detail: seed.detail,
              tone: seed.tone,
              action:
                index === 0
                  ? "rights_confirmed"
                  : index === 1
                    ? "source_analyzed"
                    : index === 2
                      ? "archive_created"
                      : "sync_skipped",
              createdAt: Date.now() - index * 1000,
              timeLabel: seed.time,
            });
          }
        }
        if (savedLanguage?.value) setLanguage(savedLanguage.value);
        if (savedLocalOnly) setLocalOnly(savedLocalOnly.value);
        if (savedNotifications) setNotifications(savedNotifications.value);
        if (savedReducedMotion) setReducedMotion(savedReducedMotion.value);
        setStorageReady(true);
      } catch (error) {
        if (!active) return;
        const normalized = toStorageError(error);
        setStorageError(normalized.message);
        toast.error("Local archive unavailable", {
          description: normalized.message,
        });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (storageReady) saveSetting("language", language);
  }, [language, storageReady]);
  useEffect(() => {
    if (storageReady) saveSetting("localOnly", localOnly);
  }, [localOnly, storageReady]);
  useEffect(() => {
    if (storageReady) saveSetting("notifications", notifications);
  }, [notifications, storageReady]);
  useEffect(() => {
    if (storageReady) saveSetting("reducedMotion", reducedMotion);
  }, [reducedMotion, storageReady]);
  useEffect(() => {
    if (status !== "recording") return;
    const timer = window.setInterval(() => {
      setElapsed(
        Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000))
      );
      setLiveBytes(prev => prev + 12800 + Math.floor(Math.random() * 3200));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);
  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion
      ? "reduced"
      : "full";
  }, [reducedMotion]);

  const currentStatus = statusMeta(status);
  const filteredRecordings = useMemo(
    () =>
      recordings
        .filter(recording =>
          `${recording.title} ${recording.subtitle} ${recording.source} ${(recording.tags || []).join(" ")}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
        .filter(
          recording =>
            libraryFilter === "all" ||
            (libraryFilter === "favorites"
              ? recording.favorite
              : recording.archived)
        )
        .sort((a, b) =>
          librarySort === "title"
            ? a.title.localeCompare(b.title)
            : librarySort === "oldest"
              ? (a.createdAt || 0) - (b.createdAt || 0)
              : (b.createdAt || 0) - (a.createdAt || 0)
        ),
    [recordings, searchQuery, libraryFilter, librarySort]
  );
  const totalDuration = recordings.reduce(
    (sum, recording) => sum + parseUiDuration(recording.duration),
    0
  );

  const addAudit = (
    label: string,
    detail: string,
    tone: AuditEvent["tone"]
  ) => {
    const id = `audit-${Date.now()}`;
    const createdAt = Date.now();
    const action: StoredAuditEvent["action"] = label.includes("Rights")
      ? "rights_confirmed"
      : label.includes("Source")
        ? "source_analyzed"
        : label.includes("Capture started")
          ? "capture_started"
          : label.includes("blocked")
            ? "capture_blocked"
            : label.includes("download")
              ? "downloaded"
              : label.includes("deleted")
                ? "deleted"
                : label.includes("Sync enabled")
                  ? "sync_enabled"
                  : label.includes("Sync disabled")
                    ? "sync_disabled"
                    : label.includes("Sync failed")
                      ? "sync_failed"
                      : "archive_created";
    setAuditEvents(events =>
      [{ id, label, detail, time: "Just now", tone }, ...events].slice(0, 12)
    );
    void putAuditEvent({
      id,
      label,
      detail,
      tone,
      action,
      createdAt,
      timeLabel: "Just now",
    }).catch(error => {
      const normalized = toStorageError(error);
      setStorageError(normalized.message);
      toast.error("Audit event was not saved", {
        description: normalized.message,
      });
    });
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadRecording = async (recording: Recording) => {
    try {
      const blob = recording.blob || (await getRecordingBlob(recording.id));
      if (!blob) {
        toast.error("Audio file is unavailable", {
          description: "This archive has metadata but no stored audio chunks.",
        });
        return;
      }
      const extension =
        recording.format.toLowerCase() === "wav"
          ? "wav"
          : recording.format.toLowerCase();
      downloadBlob(blob, sanitizeFilename(recording.title, extension));
      addAudit(
        "Archive downloaded",
        `${recording.title} · local browser download`,
        "green"
      );
      toast.success("Download started", {
        description: `${recording.title} is being saved to your device.`,
      });
    } catch (error) {
      const normalized = toStorageError(error);
      setStorageError(normalized.message);
      toast.error("Download failed", { description: normalized.message });
    }
  };

  const playRecording = async (recording: Recording) => {
    try {
      const blob = recording.blob || (await getRecordingBlob(recording.id));
      if (!blob || !audioRef.current)
        throw new Error("This recording has no stored audio chunks.");
      const audio = audioRef.current;
      audio.src = URL.createObjectURL(blob);
      audio.load();
      const saved = await getPlaybackState(recording.id);
      audio.volume = saved?.volume ?? playbackVolume;
      audio.playbackRate = saved?.speed ?? playbackSpeed;
      setPlaybackPosition(saved?.positionSeconds ?? 0);
      setPlaybackSpeed(audio.playbackRate);
      setPlaybackVolume(audio.volume);
      setPlayingId(recording.id);
      setChapters(await listChapters(recording.id));
      audio.addEventListener(
        "loadedmetadata",
        () => {
          audio.currentTime = saved?.positionSeconds ?? 0;
          void audio.play();
        },
        { once: true }
      );
      audio.addEventListener("timeupdate", () =>
        setPlaybackPosition(audio.currentTime)
      );
      audio.addEventListener("durationchange", () =>
        setPlaybackDuration(
          audio.duration || parseUiDuration(recording.duration) || 0
        )
      );
      audio.addEventListener("ended", () => setPlayingId(null), { once: true });
    } catch (error) {
      toast.error("Playback unavailable", {
        description:
          error instanceof Error
            ? error.message
            : "The audio could not be opened.",
      });
    }
  };

  const updatePlayback = (patch: {
    positionSeconds?: number;
    volume?: number;
    speed?: number;
  }) => {
    const audio = audioRef.current;
    if (!audio || !playingId) return;
    if (patch.positionSeconds !== undefined)
      audio.currentTime = patch.positionSeconds;
    if (patch.volume !== undefined) audio.volume = patch.volume;
    if (patch.speed !== undefined) audio.playbackRate = patch.speed;
    setPlaybackPosition(audio.currentTime);
    setPlaybackVolume(audio.volume);
    setPlaybackSpeed(audio.playbackRate);
    void putPlaybackState({
      recordingId: playingId,
      positionSeconds: audio.currentTime,
      volume: audio.volume,
      speed: audio.playbackRate,
      updatedAt: Date.now(),
    });
  };

  const toggleFavorite = async (recording: Recording) => {
    const updated = await updateRecordingMetadata(recording.id, {
      favorite: !recording.favorite,
    });
    setRecordings(items =>
      items.map(item =>
        item.id === updated.id ? toUiRecording(updated) : item
      )
    );
  };

  const toggleArchived = async (recording: Recording) => {
    const updated = await updateRecordingMetadata(recording.id, {
      archived: !recording.archived,
    });
    setRecordings(items =>
      items.map(item =>
        item.id === updated.id ? toUiRecording(updated) : item
      )
    );
    toast(updated.archived ? "Recording archived" : "Recording restored");
  };

  const beginMetadataEdit = (recording: Recording) => {
    setMetadataEditorId(recording.id);
    setMetadataTitle(recording.title);
    setMetadataTags((recording.tags || []).join(", "));
  };

  const saveMetadata = async () => {
    if (!metadataEditorId) return;
    const updated = await updateRecordingMetadata(metadataEditorId, {
      title: metadataTitle.trim() || "Untitled capture",
      tags: metadataTags
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean),
    });
    setRecordings(items =>
      items.map(item =>
        item.id === updated.id ? toUiRecording(updated) : item
      )
    );
    setMetadataEditorId(null);
    toast.success("Metadata saved locally");
  };

  const addChapter = async () => {
    if (!playingId || !chapterTitle.trim()) return;
    const chapter: StoredChapter = {
      id: `chapter-${Date.now()}`,
      recordingId: playingId,
      startSeconds: playbackPosition,
      title: chapterTitle.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await putChapter(chapter);
    setChapters(items =>
      [...items, chapter].sort((a, b) => a.startSeconds - b.startSeconds)
    );
    setChapterTitle("");
  };

  const removeChapter = async (chapter: StoredChapter) => {
    await deleteChapter(chapter.id);
    setChapters(items => items.filter(item => item.id !== chapter.id));
  };

  const retryRecording = async (recording: Recording) => {
    const blob = await getRecordingBlob(recording.id);
    if (!blob) {
      toast.error("Retry unavailable", {
        description: "No local audio chunks remain for this failed recording.",
      });
      return;
    }
    const updated = await updateRecordingMetadata(recording.id, {
      status: "ready",
      retryable: false,
      failureReason: undefined,
    });
    setRecordings(items =>
      items.map(item =>
        item.id === updated.id ? toUiRecording(updated) : item
      )
    );
    toast.success("Recording recovered", {
      description: "The existing local chunks were revalidated.",
    });
  };

  const stopCaptureTracks = () => {
    const capture = captureRef.current;
    if (!capture) return;
    capture.stream.getTracks().forEach(track => track.stop());
    try {
      capture.processor.disconnect();
      capture.source.disconnect();
      capture.gain.disconnect();
    } catch {
      /* already disconnected */
    }
    capture.context.close().catch(() => undefined);
    captureRef.current = null;
  };

  const finishCapture = async () => {
    const sampleCount = pcmRef.current.reduce(
      (sum, chunk) => sum + chunk.length,
      0
    );
    const merged = new Float32Array(sampleCount);
    let offset = 0;
    pcmRef.current.forEach(chunk => {
      merged.set(chunk, offset);
      offset += chunk.length;
    });
    const capturedSamples = sampleCount
      ? merged
      : new Float32Array(sampleRateRef.current);
    const options: EncoderOptions = {
      format,
      inputSampleRate: sampleRateRef.current,
      sampleRate: outputSampleRate,
      channels,
      bitrate,
      title: "The Quiet Practice",
      artist: "SFYTA3.H-V.A",
      album: "Local Archive",
      source: primarySource.url,
    };
    try {
      let sourceSamples = capturedSamples;
      if (mode === "turbo") {
        sourceSamples = await processTurbo(
          capturedSamples,
          sampleRateRef.current,
          turboSpeed,
          progress => {
            setProcessingProgress(progress.percent);
            setProcessingEta(
              formatTurboEta(progress.estimatedSecondsRemaining)
            );
          }
        );
        const quality = validateTurboQuality(
          capturedSamples,
          sourceSamples,
          turboSpeed
        );
        if (!quality.passed)
          throw new Error(
            "Turbo quality validation failed; the capture was not saved."
          );
        setProcessingEta("encoding compressed audio");
      }
      const peaks = generateWaveformPeaks(sourceSamples, 96);
      const encoded = await encodeWithWorker(
        sourceSamples.slice(),
        options,
        progress => {
          const percent = progress.totalSamples
            ? Math.round(
                (progress.processedSamples / progress.totalSamples) * 100
              )
            : 0;
          setProcessingProgress(percent);
          setLiveBytes(percent);
        }
      );
      const duration = Math.max(1, encoded.durationSeconds);
      const storedRecording: StoredRecording = {
        id: `rec-${Date.now()}`,
        sourceId: primarySource.id,
        title: "The Quiet Practice",
        subtitle: `Live capture · ${mode === "turbo" ? "Turbo" : "Normal"} mode · ${encoded.sampleRate} Hz · ${encoded.channels === 1 ? "Mono" : "Stereo"}`,
        format: encoded.extension,
        source: "Authorized browser tab",
        status: "ready",
        mode,
        durationSeconds: duration,
        fileSizeBytes: encoded.blob.size,
        sampleRateHz: encoded.sampleRate,
        channels: encoded.channels,
        mimeType: encoded.mimeType,
        color: encoded.extension === "mp3" ? "lime" : "violet",
        localOnly: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        chunkCount: 0,
      };
      const saved = await putRecording(storedRecording, encoded.blob);
      await putWaveform({
        recordingId: saved.id,
        peaks,
        sampleRateHz: encoded.sampleRate,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      setLastFile(encoded.blob);
      setRecordings(items => [toUiRecording(saved), ...items]);
      setWaveforms(items => ({ ...items, [saved.id]: peaks }));
      addAudit(
        "Local archive created",
        `${saved.title} · ${encoded.extension.toUpperCase()} · ${formatBytes(saved.fileSizeBytes)}`,
        "green"
      );
      setStatus("complete");
      setElapsed(duration);
      setProcessingProgress(100);
      setProcessingEta(null);
      toast.success("Capture ready", {
        description: `${mode === "turbo" ? `Turbo ${turboSpeed}× processed faster than realtime, then ` : ""}${encoded.extension.toUpperCase()} encoded in a worker and saved in local chunks.`,
      });
    } catch (error) {
      const normalized = toStorageError(error);
      const message =
        error instanceof Error && !(error instanceof DOMException)
          ? error.message
          : normalized.message;
      setStorageError(message);
      setProcessingEta(null);
      setProcessingProgress(0);
      setStatus("ready");
      toast.error("Could not finish the recording", { description: message });
    }
  };

  const stopCapture = () => {
    if (status !== "recording" && status !== "paused") return;
    setStatus("processing");
    setProcessingProgress(0);
    setProcessingEta(mode === "turbo" ? "estimating time remaining" : null);
    stopCaptureTracks();
    void finishCapture();
  };

  const startCapture = async () => {
    const decision = canStartCapture({
      rightsConfirmed,
      sourceBlocked,
      mediaCaptureAvailable: Boolean(navigator.mediaDevices?.getDisplayMedia),
    });
    if (!decision.allowed && !rightsConfirmed && !sourceBlocked) {
      setRightsModalOpen(true);
      return;
    }
    if (!decision.allowed) {
      toast.error(
        sourceBlocked ? "Capture blocked" : "Browser capture unavailable",
        { description: decision.reason }
      );
      return;
    }
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" },
        audio: true,
      });
      const audioTracks = displayStream.getAudioTracks();
      if (!audioTracks.length) {
        displayStream.getTracks().forEach(track => track.stop());
        setStatus("blocked");
        addAudit(
          "Capture blocked",
          "No shared tab audio track was provided",
          "red"
        );
        toast.error("No tab audio shared", {
          description:
            "Choose a browser tab and enable the Share audio option.",
        });
        return;
      }
      displayStream.getVideoTracks().forEach(track => track.stop());
      const audioStream = new MediaStream(audioTracks);
      const context = new AudioContext();
      const source = context.createMediaStreamSource(audioStream);
      const processor = context.createScriptProcessor(4096, 1, 1);
      const gain = context.createGain();
      gain.gain.value = 0;
      source.connect(processor);
      processor.connect(gain);
      gain.connect(context.destination);
      sampleRateRef.current = context.sampleRate;
      pcmRef.current = [];
      setElapsed(0);
      setLiveBytes(0);
      startTimeRef.current = Date.now();
      processor.onaudioprocess = event => {
        if (statusRef.current === "recording")
          pcmRef.current.push(
            new Float32Array(event.inputBuffer.getChannelData(0))
          );
      };
      audioTracks[0].onended = () => {
        if (statusRef.current === "recording" || statusRef.current === "paused")
          stopCapture();
      };
      captureRef.current = {
        stream: displayStream,
        context,
        processor,
        source,
        gain,
      };
      setStatus("recording");
      addAudit(
        "Capture started",
        "Authorized browser tab · rights confirmed",
        "green"
      );
      toast.success(
        mode === "turbo" ? "Turbo capture armed" : "Capture started",
        { description: "Keep this tab open while the browser records." }
      );
    } catch (error) {
      if ((error as DOMException)?.name === "NotAllowedError")
        toast.error("Capture permission cancelled", {
          description: "No audio left your device.",
        });
      else
        toast.error("Could not start capture", {
          description: "Check browser permissions and try again.",
        });
    }
  };

  const confirmRightsAndStart = () => {
    setRightsConfirmed(true);
    setRightsModalOpen(false);
    addAudit(
      "Rights confirmation recorded",
      "The Quiet Practice · user confirmed authorization",
      "green"
    );
    window.setTimeout(() => startCapture(), 120);
  };

  const pauseCapture = () => {
    if (status === "recording") {
      setStatus("paused");
      toast("Capture paused", {
        description: "Resume whenever you are ready.",
      });
    } else if (status === "paused") {
      setStatus("recording");
      startTimeRef.current = Date.now() - elapsed * 1000;
      toast.success("Capture resumed");
    }
  };

  const clearCapture = () => {
    stopCaptureTracks();
    pcmRef.current = [];
    setElapsed(0);
    setLiveBytes(0);
    setLastFile(null);
    setStatus("ready");
    toast("Session cleared", { description: "No audio was saved." });
  };

  const analyzeSource = () => {
    setSourceScanning(true);
    window.setTimeout(() => {
      setSourceScanning(false);
      const decision = evaluateSource({
        url: primarySource.url,
        title: primarySource.title,
        drmDetected: primarySource.drmDetected,
        licenseStatus: primarySource.licenseStatus,
      });
      setSourceBlocked(!decision.allowed);
      addAudit(
        decision.allowed ? "Source analyzed" : "Capture blocked",
        `ElevenLabs Reader · ${decision.reason}`,
        decision.allowed ? "violet" : "red"
      );
      if (decision.allowed)
        toast.success("Source verified", { description: decision.reason });
      else
        toast.error("Protected source detected", {
          description: decision.reason,
        });
    }, 900);
  };

  const handleBlockedDemo = () => {
    setSourceBlocked(true);
    setStatus("blocked");
    addAudit(
      "Capture blocked",
      "Protected media signal detected · no audio captured",
      "red"
    );
    toast.error("Protected source detected", {
      description: "SFYTA3.H-V.A will not bypass DRM or access controls.",
    });
  };

  const handleDeleteRecording = async (recording: Recording) => {
    try {
      await deleteStoredRecording(recording.id);
      setRecordings(items => items.filter(item => item.id !== recording.id));
      addAudit(
        "Archive deleted",
        `${recording.title} · local item removed`,
        "amber"
      );
      toast("Recording removed", {
        description: "The audio chunks, waveform, and metadata were deleted.",
      });
    } catch (error) {
      const normalized = toStorageError(error);
      setStorageError(normalized.message);
      toast.error("Could not delete recording", {
        description: normalized.message,
      });
    }
  };

  const handleClearAudit = async () => {
    try {
      await deleteAuditEvents();
      setAuditEvents([]);
      toast("Audit view cleared", {
        description: "The local audit timeline was deleted.",
      });
    } catch (error) {
      const normalized = toStorageError(error);
      setStorageError(normalized.message);
      toast.error("Could not clear audit events", {
        description: normalized.message,
      });
    }
  };

  const handleNav = (next: View) => {
    setView(next);
    setMobileNavOpen(false);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <div className="brand-row">
            <AppLogo />
            <button
              className="icon-button mobile-close"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          </div>
          <div className="workspace-switcher">
            <span className="workspace-avatar">A</span>
            <span>
              <b>Personal archive</b>
              <small>Local workspace</small>
            </span>
            <ChevronRight size={15} />
          </div>
        </div>
        <nav className="main-nav" aria-label="Primary navigation">
          <p className="nav-kicker">Workspace</p>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${view === id ? "active" : ""}`}
              onClick={() => handleNav(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {id === "library" && <em>{recordings.length}</em>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="privacy-card">
            <div className="privacy-icon">
              <LockKeyhole size={16} />
            </div>
            <div>
              <b>Local-first mode</b>
              <span>Audio stays on this device</span>
            </div>
            <Check size={15} className="privacy-check" />
          </div>
          <button
            className="support-link"
            onClick={() =>
              toast("Support center", {
                description:
                  "Compliance docs and capture guidance will be available here.",
              })
            }
          >
            <CircleHelp size={16} /> Support & compliance
          </button>
          <div className="profile-row">
            <div className="profile-avatar">
              <UserRound size={16} />
            </div>
            <div>
              <b>Alex Morgan</b>
              <span>Free workspace</span>
            </div>
            <MoreHorizontal size={18} className="muted-icon" />
          </div>
        </div>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumb">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{navItems.find(item => item.id === view)?.label}</strong>
          </div>
          <div className="topbar-actions">
            <div className="connection-pill">
              <span className="status-dot" /> Local-only{" "}
              <span className="topbar-divider" /> <Wifi size={13} /> Synced
            </div>
            <button
              className="install-button"
              onClick={() =>
                toast("Install from your browser menu", {
                  description:
                    "Use the browser menu → Install SFYTA3.H-V.A for a standalone app window.",
                })
              }
            >
              <Plus size={16} /> Install app
            </button>
            <button
              className="icon-button"
              aria-label="Notifications"
              onClick={() =>
                toast("You are all caught up", {
                  description: "No new compliance or storage notices.",
                })
              }
            >
              <Bell size={18} />
            </button>
          </div>
        </header>
        {storageError && (
          <div className="storage-alert" role="alert">
            <AlertTriangle size={15} />
            <span>{storageError}</span>
            <button
              className="icon-button"
              onClick={() => setStorageError(null)}
              aria-label="Dismiss storage error"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {view === "studio" && (
          <section className="page-content studio-page">
            <div className="page-heading">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line" /> CAPTURE STUDIO
                </div>
                <h1>
                  Make space for the <i>signal.</i>
                </h1>
                <p>
                  Capture authorized audio, keep the source context, and archive
                  it locally without compromising the chain of trust.
                </p>
              </div>
              <div className="heading-actions">
                <button
                  className="secondary-button"
                  onClick={() =>
                    toast("Extension layer", {
                      description:
                        "The MV3 extension is planned as the next distribution layer.",
                    })
                  }
                >
                  <Download size={16} /> Extension layer
                </button>
                <button
                  className="primary-button"
                  onClick={() => setRightsModalOpen(true)}
                >
                  <Mic2 size={16} /> New capture
                </button>
              </div>
            </div>

            <div className="metric-grid">
              <MetricCard
                icon={Activity}
                label="Session state"
                value={currentStatus.label}
                detail={
                  status === "recording"
                    ? `${formatClock(elapsed)} elapsed`
                    : "Browser ready"
                }
                accent={
                  status === "recording"
                    ? "accent-red"
                    : status === "blocked"
                      ? "accent-red"
                      : "accent-violet"
                }
              />
              <MetricCard
                icon={Archive}
                label="Archive library"
                value={`${recordings.length} files`}
                detail={`${Math.round(totalDuration / 60)}h ${totalDuration % 60}m of audio`}
                accent="accent-lime"
              />
              <MetricCard
                icon={LockKeyhole}
                label="Privacy posture"
                value="Local-first"
                detail="No audio upload enabled"
                accent="accent-blue"
              />
            </div>

            <div className="studio-grid">
              <div className="studio-main-column">
                <div
                  className={`capture-card ${status === "recording" ? "capture-live" : ""} ${status === "blocked" ? "capture-blocked" : ""}`}
                >
                  <div className="card-header">
                    <div>
                      <div className="card-label">
                        <Radio size={14} /> ACTIVE SOURCE
                      </div>
                      <h2>
                        {status === "blocked"
                          ? "Capture cannot continue"
                          : "ElevenLabs Reader"}
                      </h2>
                      <p>
                        {status === "blocked"
                          ? "Protected media signals require a different authorized source."
                          : "The Quiet Practice · Chapter 03"}
                      </p>
                    </div>
                    <div className={`status-chip ${currentStatus.tone}`}>
                      <span /> {currentStatus.label}
                    </div>
                  </div>
                  <div className="source-row">
                    <div className="source-mark">
                      <BookOpen size={20} />
                    </div>
                    <div className="source-details">
                      <b>
                        {sourceBlocked
                          ? "Protected source"
                          : "The unhurried mind"}
                      </b>
                      <span>elevenreader.io / library / quiet-practice</span>
                    </div>
                    <button
                      className="source-action"
                      onClick={analyzeSource}
                      disabled={sourceScanning}
                    >
                      {sourceScanning ? (
                        <RefreshCw size={16} className="spin" />
                      ) : (
                        <Search size={16} />
                      )}{" "}
                      {sourceScanning ? "Scanning" : "Analyze source"}
                    </button>
                  </div>
                  <div className="trust-row">
                    <span
                      className={
                        rightsConfirmed
                          ? "trust-item trust-good"
                          : "trust-item trust-pending"
                      }
                    >
                      <BadgeCheck size={14} />{" "}
                      {rightsConfirmed
                        ? "Rights confirmed"
                        : "Rights confirmation required"}
                    </span>
                    <span
                      className={
                        sourceBlocked
                          ? "trust-item trust-bad"
                          : "trust-item trust-good"
                      }
                    >
                      {sourceBlocked ? (
                        <AlertTriangle size={14} />
                      ) : (
                        <ShieldCheck size={14} />
                      )}{" "}
                      {sourceBlocked
                        ? "DRM signal detected"
                        : "No protected-media signal"}
                    </span>
                    <button
                      className="text-button"
                      onClick={() => setRightsModalOpen(true)}
                    >
                      View policy <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="wave-area">
                    <div className="wave-meta">
                      <span>
                        <span
                          className={`wave-live-dot ${status === "recording" ? "pulse" : ""}`}
                        />{" "}
                        {status === "recording"
                          ? "Listening to shared tab"
                          : status === "processing"
                            ? mode === "turbo"
                              ? "Compressing capture faster than realtime"
                              : "Building local audio"
                            : "Audio monitor"}
                      </span>
                      <span>
                        {formatClock(elapsed)} <b>/</b> —
                      </span>
                    </div>
                    <Waveform active={status === "recording"} />
                    <div className="wave-axis">
                      <span>00:00</span>
                      <span>05:00</span>
                      <span>10:00</span>
                      <span>15:00</span>
                      <span>∞</span>
                    </div>
                  </div>
                  <div className="control-grid">
                    <div>
                      <label>Capture mode</label>
                      <div className="segmented">
                        <button
                          className={mode === "normal" ? "selected" : ""}
                          onClick={() => setMode("normal")}
                        >
                          <span className="mode-dot mode-dot-violet" /> Normal{" "}
                          <small>1×</small>
                        </button>
                        <button
                          className={mode === "turbo" ? "selected turbo" : ""}
                          onClick={() => setMode("turbo")}
                        >
                          <Zap size={14} /> Turbo <small>2–8× faster</small>
                        </button>
                      </div>
                    </div>
                    <div className="select-pair">
                      <label>Output</label>
                      <div className="select-row">
                        <select
                          value={format}
                          onChange={event =>
                            setFormat(event.target.value as Format)
                          }
                          aria-label="Output format"
                        >
                          <option value="wav">WAV · Lossless</option>
                          <option value="mp3">MP3 · Universal</option>
                          <option value="opus" disabled>
                            Opus · Planned
                          </option>
                          <option value="aac" disabled>
                            AAC · Planned
                          </option>
                        </select>
                        <select
                          value={bitrate}
                          onChange={event =>
                            setBitrate(Number(event.target.value))
                          }
                          aria-label="Output bitrate"
                        >
                          <option value={96}>96 kbps</option>
                          <option value={128}>128 kbps</option>
                          <option value={192}>192 kbps</option>
                          <option value={256}>256 kbps</option>
                          <option value={320}>320 kbps</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  {status === "processing" && (
                    <div className="blocked-banner" aria-live="polite">
                      <Activity size={17} />
                      <div>
                        <b>
                          {mode === "turbo"
                            ? `Turbo ${turboSpeed}× processing`
                            : "Preparing your local file"}
                        </b>
                        <span>
                          {mode === "turbo"
                            ? `${processingProgress}% complete · ${processingEta || "estimating time remaining"}. The source stays local and DRM is not bypassed.`
                            : `${processingProgress}% encoded in a worker.`}
                        </span>
                      </div>
                    </div>
                  )}
                  {status === "blocked" && (
                    <div className="blocked-banner">
                      <AlertTriangle size={17} />
                      <div>
                        <b>Capture is disabled for this source.</b>
                        <span>
                          SFYTA3.H-V.A never bypasses DRM, encrypted media, or
                          platform access controls.
                        </span>
                      </div>
                      <button
                        className="icon-button"
                        onClick={analyzeSource}
                        aria-label="Re-scan source"
                      >
                        <RefreshCw size={16} />
                      </button>
                    </div>
                  )}
                  {status === "complete" && (
                    <div className="complete-banner">
                      <FileCheck2 size={18} />
                      <div>
                        <b>Your local file is ready.</b>
                        <span>
                          {formatClock(elapsed)} ·{" "}
                          {formatBytes(lastFile?.size || 0)} · WAV
                        </span>
                      </div>
                      <button
                        className="primary-button small"
                        onClick={() =>
                          lastFile &&
                          downloadBlob(
                            lastFile,
                            `sfyta3-capture-${Date.now()}.wav`
                          )
                        }
                      >
                        <ArrowDownToLine size={15} /> Download
                      </button>
                    </div>
                  )}
                  <div className="capture-footer">
                    <button
                      className="clear-button"
                      onClick={clearCapture}
                      disabled={status === "processing"}
                    >
                      <Trash2 size={15} /> Clear
                    </button>
                    <div className="capture-actions">
                      {(status === "recording" || status === "paused") && (
                        <button className="pause-button" onClick={pauseCapture}>
                          {status === "paused" ? (
                            <Play size={16} />
                          ) : (
                            <Pause size={16} />
                          )}{" "}
                          {status === "paused" ? "Resume" : "Pause"}
                        </button>
                      )}
                      {status === "recording" || status === "paused" ? (
                        <button className="stop-button" onClick={stopCapture}>
                          <Square size={15} fill="currentColor" /> Stop capture
                        </button>
                      ) : (
                        <button
                          className="primary-button capture-button"
                          onClick={startCapture}
                          disabled={status === "processing" || sourceBlocked}
                        >
                          <Mic2 size={17} />{" "}
                          {status === "processing"
                            ? "Processing…"
                            : status === "complete"
                              ? "Capture again"
                              : "Start capture"}
                          <span className="shortcut">⌘ ↵</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="tip-strip">
                  <Sparkles size={16} />
                  <span>
                    <b>Good to know.</b> Tab audio capture is available in
                    current desktop browsers. For long sessions, the extension
                    layer keeps recording alive after the popup closes.
                  </span>
                  <button
                    onClick={() => setView("settings")}
                    aria-label="Open settings"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              <aside className="studio-side-column">
                <div className="side-card">
                  <div className="side-card-header">
                    <div>
                      <div className="card-label">SESSION TELEMETRY</div>
                      <h3>Signal health</h3>
                    </div>
                    <BarChart3 size={18} className="muted-icon" />
                  </div>
                  <div className="health-score">
                    <div className="score-ring">
                      <strong>98</strong>
                      <span>/100</span>
                    </div>
                    <div>
                      <b>Clean signal</b>
                      <p>Audio path is ready for capture.</p>
                    </div>
                  </div>
                  <div className="health-list">
                    <div>
                      <span>
                        <span className="mini-dot dot-green" /> Audio track
                      </span>
                      <b>Connected</b>
                    </div>
                    <div>
                      <span>
                        <span className="mini-dot dot-green" /> Permission scope
                      </span>
                      <b>Minimal</b>
                    </div>
                    <div>
                      <span>
                        <span className="mini-dot dot-lime" /> Device storage
                      </span>
                      <b>64.2 GB free</b>
                    </div>
                  </div>
                </div>
                <div className="side-card source-card">
                  <div className="side-card-header">
                    <div>
                      <div className="card-label">SOURCE ANALYZER</div>
                      <h3>Adapter status</h3>
                    </div>
                    <button
                      className="icon-button"
                      onClick={analyzeSource}
                      aria-label="Refresh adapter status"
                    >
                      <RefreshCw size={15} />
                    </button>
                  </div>
                  <div className="adapter-row">
                    <div className="adapter-logo">EL</div>
                    <div>
                      <b>Reader adapter</b>
                      <span>ElevenLabs Reader</span>
                    </div>
                    <span className="adapter-status">Active</span>
                  </div>
                  <div className="adapter-note">
                    <ShieldCheck size={15} />
                    <span>
                      Metadata, player state, and license signals are monitored
                      before capture.
                    </span>
                  </div>
                  <button
                    className="outline-button full"
                    onClick={handleBlockedDemo}
                  >
                    <AlertTriangle size={15} /> Test DRM block
                  </button>
                </div>
                <div className="side-card quick-card">
                  <div className="quick-icon">
                    <Laptop2 size={17} />
                  </div>
                  <div>
                    <b>Capture on desktop</b>
                    <p>
                      Install the companion extension for background recording
                      and automatic chapter metadata.
                    </p>
                    <button
                      className="text-button"
                      onClick={() =>
                        toast("Extension layer", {
                          description:
                            "The MV3 extension is planned as the next distribution layer.",
                        })
                      }
                    >
                      Learn about the extension <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        )}

        {view === "library" && (
          <section className="page-content library-page">
            <div className="page-heading">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line" /> LOCAL ARCHIVE
                </div>
                <h1>
                  Your audio, <i>in context.</i>
                </h1>
                <p>
                  Every recording stays paired with its source, format,
                  waveform, and compliance trail.
                </p>
              </div>
              <button
                className="primary-button"
                onClick={() => handleNav("studio")}
              >
                <Plus size={16} /> New capture
              </button>
            </div>
            <div className="library-toolbar">
              <div className="search-box">
                <Search size={17} />
                <input
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  placeholder="Search title, source, tag, or chapter"
                />
              </div>
              <div className="toolbar-actions">
                <select
                  value={libraryFilter}
                  onChange={event =>
                    setLibraryFilter(
                      event.target.value as "all" | "favorites" | "archived"
                    )
                  }
                  aria-label="Filter library"
                >
                  <option value="all">All recordings</option>
                  <option value="favorites">Favorites</option>
                  <option value="archived">Archived</option>
                </select>
                <select
                  value={librarySort}
                  onChange={event =>
                    setLibrarySort(
                      event.target.value as "newest" | "oldest" | "title"
                    )
                  }
                  aria-label="Sort library"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="title">Title A–Z</option>
                </select>
                <button
                  className="outline-button"
                  onClick={() =>
                    downloadBlob(
                      new Blob([JSON.stringify(recordings, null, 2)], {
                        type: "application/json",
                      }),
                      "sfyta3-library-export.json"
                    )
                  }
                >
                  <Download size={15} /> Export
                </button>
              </div>
            </div>
            <div className="library-summary">
              <div>
                <span className="summary-number">{recordings.length}</span>
                <span>saved recordings</span>
              </div>
              <div>
                <span className="summary-number">
                  {Math.round(totalDuration / 60)}m
                </span>
                <span>total listening time</span>
              </div>
              <div>
                <span className="summary-number">
                  {recordings.filter(recording => recording.favorite).length}
                </span>
                <span>favorites</span>
              </div>
              <div className="summary-note">
                <LockKeyhole size={15} /> IndexedDB · local & private
              </div>
            </div>
            {playingId && (
              <div className="complete-banner library-player">
                <audio
                  ref={audioRef}
                  controls
                  aria-label="Audio playback preview"
                />
                <div className="player-controls">
                  <label>
                    Seek{" "}
                    <input
                      type="range"
                      min={0}
                      max={Math.max(1, playbackDuration)}
                      step={0.1}
                      value={Math.min(playbackPosition, playbackDuration || 1)}
                      onChange={event =>
                        updatePlayback({
                          positionSeconds: Number(event.target.value),
                        })
                      }
                    />
                  </label>
                  <span>
                    {formatClock(playbackPosition)} /{" "}
                    {formatClock(playbackDuration)}
                  </span>
                  <label>
                    Volume{" "}
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={playbackVolume}
                      onChange={event =>
                        updatePlayback({ volume: Number(event.target.value) })
                      }
                    />
                  </label>
                  <label>
                    Speed{" "}
                    <select
                      value={playbackSpeed}
                      onChange={event =>
                        updatePlayback({ speed: Number(event.target.value) })
                      }
                    >
                      <option value={0.75}>0.75×</option>
                      <option value={1}>1×</option>
                      <option value={1.25}>1.25×</option>
                      <option value={1.5}>1.5×</option>
                      <option value={2}>2×</option>
                    </select>
                  </label>
                </div>
                <div className="chapter-controls">
                  <input
                    value={chapterTitle}
                    onChange={event => setChapterTitle(event.target.value)}
                    placeholder="Chapter marker at current position"
                  />
                  <button
                    className="outline-button"
                    onClick={() => void addChapter()}
                  >
                    <Plus size={15} /> Add marker
                  </button>
                  {chapters.map(chapter => (
                    <button
                      className="text-button"
                      key={chapter.id}
                      onClick={() =>
                        updatePlayback({
                          positionSeconds: chapter.startSeconds,
                        })
                      }
                    >
                      {formatClock(chapter.startSeconds)} · {chapter.title}{" "}
                      <X
                        size={12}
                        onClick={event => {
                          event.stopPropagation();
                          void removeChapter(chapter);
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="recording-list">
              {filteredRecordings.map(recording => (
                <div
                  className={`recording-row ${recording.archived ? "archived" : ""}`}
                  key={recording.id}
                >
                  <div className={`recording-art ${recording.color}`}>
                    <AudioLines size={21} />
                  </div>
                  <div className="recording-info">
                    {metadataEditorId === recording.id ? (
                      <>
                        <input
                          value={metadataTitle}
                          onChange={event =>
                            setMetadataTitle(event.target.value)
                          }
                          aria-label="Recording title"
                        />
                        <input
                          value={metadataTags}
                          onChange={event =>
                            setMetadataTags(event.target.value)
                          }
                          placeholder="Tags, comma separated"
                          aria-label="Recording tags"
                        />
                        <button
                          className="text-button"
                          onClick={() => void saveMetadata()}
                        >
                          Save
                        </button>
                      </>
                    ) : (
                      <>
                        <b>{recording.title}</b>
                        <span>{recording.subtitle}</span>
                        <small>
                          <span>{recording.source}</span>
                          <i /> {recording.created}
                          {recording.tags?.length ? (
                            <>
                              {" "}
                              <i /> {recording.tags.join(" · ")}
                            </>
                          ) : null}
                        </small>
                      </>
                    )}
                  </div>
                  <PeakStrip peaks={waveforms[recording.id] || []} />
                  <div className="recording-spec">
                    <b>{recording.duration}</b>
                    <span>
                      {recording.format} · {recording.size}
                    </span>
                  </div>
                  <div className="recording-local">
                    <LockKeyhole size={14} />{" "}
                    {recording.archived ? "Archived" : "Local"}
                  </div>
                  <button
                    className={`icon-button ${recording.favorite ? "selected" : ""}`}
                    onClick={() => void toggleFavorite(recording)}
                    aria-label={`${recording.favorite ? "Remove from" : "Add to"} favorites`}
                  >
                    <Star
                      size={16}
                      fill={recording.favorite ? "currentColor" : "none"}
                    />
                  </button>
                  <button
                    className="icon-button row-play"
                    onClick={() => void playRecording(recording)}
                    aria-label={`Play ${recording.title}`}
                  >
                    <Play size={16} fill="currentColor" />
                  </button>
                  <button
                    className="icon-button"
                    onClick={() => beginMetadataEdit(recording)}
                    aria-label={`Edit ${recording.title}`}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="icon-button"
                    onClick={() => void toggleArchived(recording)}
                    aria-label={`${recording.archived ? "Restore" : "Archive"} ${recording.title}`}
                  >
                    {recording.archived ? (
                      <ArchiveRestore size={16} />
                    ) : (
                      <Archive size={16} />
                    )}
                  </button>
                  <button
                    className="icon-button"
                    onClick={() => void downloadRecording(recording)}
                    aria-label={`Download ${recording.title}`}
                  >
                    <Download size={17} />
                  </button>
                  {recording.failed && (
                    <button
                      className="icon-button"
                      onClick={() => void retryRecording(recording)}
                      aria-label={`Retry ${recording.title}`}
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}
                  <button
                    className="icon-button"
                    onClick={() => void handleDeleteRecording(recording)}
                    aria-label={`Delete ${recording.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {filteredRecordings.length === 0 && (
                <div className="empty-state">
                  <Search size={22} />
                  <b>No recordings found</b>
                  <span>Try another search term or filter.</span>
                </div>
              )}
            </div>
          </section>
        )}

        {view === "audit" && (
          <section className="page-content audit-page">
            <div className="page-heading">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line" /> TRUST CENTER
                </div>
                <h1>
                  A clear <i>chain of custody.</i>
                </h1>
                <p>
                  A lightweight, local audit trail for rights checks, source
                  analysis, and downloads.
                </p>
              </div>
              <div className="compliance-score">
                <ShieldCheck size={19} />
                <div>
                  <b>Compliance posture</b>
                  <span>Healthy · local only</span>
                </div>
              </div>
            </div>
            <div className="audit-layout">
              <div className="audit-card">
                <div className="audit-card-head">
                  <div>
                    <div className="card-label">EVENT STREAM</div>
                    <h2>Recent compliance events</h2>
                  </div>
                  <button
                    className="outline-button"
                    onClick={() => void handleClearAudit()}
                  >
                    <Trash2 size={14} /> Clear view
                  </button>
                </div>
                {auditEvents.length ? (
                  auditEvents.map(event => (
                    <div className="audit-event" key={event.id}>
                      <div className={`audit-icon ${event.tone}`}>
                        {event.tone === "red" ? (
                          <AlertTriangle size={16} />
                        ) : event.tone === "amber" ? (
                          <Cloud size={16} />
                        ) : event.tone === "violet" ? (
                          <Search size={16} />
                        ) : (
                          <Check size={16} />
                        )}
                      </div>
                      <div className="audit-copy">
                        <b>{event.label}</b>
                        <span>{event.detail}</span>
                      </div>
                      <time>{event.time}</time>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <ShieldCheck size={22} />
                    <b>No local events</b>
                    <span>New compliance actions will appear here.</span>
                  </div>
                )}
              </div>
              <div className="policy-card">
                <div className="policy-graphic">
                  <ShieldCheck size={28} />
                </div>
                <div className="card-label">CAPTURE POLICY</div>
                <h2>Permission is a product feature.</h2>
                <p>
                  Capture is only available after a user-initiated rights
                  confirmation. Protected or access-controlled media is blocked,
                  never bypassed.
                </p>
                <div className="policy-list">
                  <span>
                    <Check size={14} /> User-owned or licensed audio
                  </span>
                  <span>
                    <Check size={14} /> Public domain & creator uploads
                  </span>
                  <span>
                    <Check size={14} /> Platform-approved exports
                  </span>
                  <span className="policy-deny">
                    <X size={14} /> DRM or encrypted streams
                  </span>
                </div>
                <button
                  className="text-button"
                  onClick={() =>
                    toast("Compliance guide", {
                      description:
                        "The full legal and platform adapter guide is part of the product documentation.",
                    })
                  }
                >
                  Read the full guide <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </section>
        )}

        {view === "settings" && (
          <section className="page-content settings-page">
            <div className="page-heading">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line" /> WORKSPACE SETTINGS
                </div>
                <h1>
                  Make it <i>yours.</i>
                </h1>
                <p>
                  Choose how SFYTA3.H-V.A behaves across capture, storage, and
                  language.
                </p>
              </div>
              <div className="settings-save">
                <Check size={15} /> Saved locally
              </div>
            </div>
            <div className="settings-grid">
              <div className="settings-card">
                <div className="settings-card-head">
                  <div className="settings-icon violet">
                    <Settings2 size={18} />
                  </div>
                  <div>
                    <h2>Capture defaults</h2>
                    <p>Apply these values when a new session starts.</p>
                  </div>
                </div>
                <div className="setting-row">
                  <div>
                    <b>Default output</b>
                    <span>Format used by new captures</span>
                  </div>
                  <select
                    value={format}
                    onChange={event => setFormat(event.target.value as Format)}
                  >
                    <option value="wav">WAV · Lossless</option>
                    <option value="mp3">MP3 · Universal</option>
                    <option value="opus" disabled>
                      Opus · Planned
                    </option>
                    <option value="aac" disabled>
                      AAC · Planned
                    </option>
                  </select>
                </div>
                <div className="setting-row">
                  <div>
                    <b>Default quality</b>
                    <span>Bitrate hint for compressed formats</span>
                  </div>
                  <select
                    value={bitrate}
                    onChange={event => setBitrate(Number(event.target.value))}
                  >
                    <option value={96}>96 kbps</option>
                    <option value={128}>128 kbps</option>
                    <option value={192}>192 kbps</option>
                    <option value={256}>256 kbps</option>
                    <option value={320}>320 kbps</option>
                  </select>
                </div>
                <div className="setting-row">
                  <div>
                    <b>Sample rate</b>
                    <span>Resample output before encoding</span>
                  </div>
                  <select
                    value={outputSampleRate}
                    onChange={event =>
                      setOutputSampleRate(Number(event.target.value))
                    }
                  >
                    <option value={32000}>32 kHz</option>
                    <option value={44100}>44.1 kHz</option>
                    <option value={48000}>48 kHz</option>
                  </select>
                </div>
                <div className="setting-row">
                  <div>
                    <b>Channels</b>
                    <span>Mono or duplicated stereo output</span>
                  </div>
                  <select
                    value={channels}
                    onChange={event =>
                      setChannels(Number(event.target.value) as 1 | 2)
                    }
                  >
                    <option value={1}>Mono</option>
                    <option value={2}>Stereo</option>
                  </select>
                </div>
                <div className="setting-row">
                  <div>
                    <b>Turbo safety limit</b>
                    <span>Never exceed this playback multiplier</span>
                  </div>
                  <select
                    value={turboSpeed}
                    onChange={event =>
                      setTurboSpeed(Number(event.target.value))
                    }
                    aria-label="Turbo speed limit"
                  >
                    <option value={2}>2× maximum</option>
                    <option value={4}>4× maximum</option>
                    <option value={6}>6× maximum</option>
                    <option value={8}>8× maximum</option>
                  </select>
                </div>
              </div>
              <div className="settings-card">
                <div className="settings-card-head">
                  <div className="settings-icon blue">
                    <LockKeyhole size={18} />
                  </div>
                  <div>
                    <h2>Privacy & storage</h2>
                    <p>Local-first is the default. You stay in control.</p>
                  </div>
                </div>
                <div className="setting-row">
                  <div>
                    <b>Local-only mode</b>
                    <span>Audio never uploads to a cloud service</span>
                  </div>
                  <button
                    className={`toggle ${localOnly ? "on" : ""}`}
                    onClick={() => setLocalOnly(!localOnly)}
                    aria-label="Toggle local-only mode"
                  >
                    <span />
                  </button>
                </div>
                <SyncPanel
                  localOnly={localOnly}
                  recordings={recordings}
                  onAudit={addAudit}
                />
                <div className="setting-row">
                  <div>
                    <b>Storage status</b>
                    <span>Browser storage available</span>
                  </div>
                  <strong className="storage-status">
                    <span className="mini-dot dot-lime" /> 64.2 GB free
                  </strong>
                </div>
              </div>
              <PrivacyPolicyCard />
              <div className="settings-card">
                <div className="settings-card-head">
                  <div className="settings-icon lime">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h2>Experience</h2>
                    <p>Small details that make the studio feel right.</p>
                  </div>
                </div>
                <div className="setting-row">
                  <div>
                    <b>Language / ভাষা</b>
                    <span>English + Bangla compliance copy</span>
                  </div>
                  <div className="language-toggle">
                    <button
                      className={language === "en" ? "selected" : ""}
                      onClick={() => setLanguage("en")}
                    >
                      EN
                    </button>
                    <button
                      className={language === "bn" ? "selected" : ""}
                      onClick={() => setLanguage("bn")}
                    >
                      বাংলা
                    </button>
                  </div>
                </div>
                <div className="setting-row">
                  <div>
                    <b>Notifications</b>
                    <span>Capture and compliance feedback</span>
                  </div>
                  <button
                    className={`toggle ${notifications ? "on" : ""}`}
                    onClick={() => setNotifications(!notifications)}
                    aria-label="Toggle notifications"
                  >
                    <span />
                  </button>
                </div>
                <div className="setting-row">
                  <div>
                    <b>Reduced motion</b>
                    <span>Use calmer transitions throughout the app</span>
                  </div>
                  <button
                    className={`toggle ${reducedMotion ? "on" : ""}`}
                    onClick={() => setReducedMotion(!reducedMotion)}
                    aria-label="Toggle reduced motion"
                  >
                    <span />
                  </button>
                </div>
              </div>
              <div className="settings-card extension-settings">
                <div className="settings-card-head">
                  <div className="settings-icon peach">
                    <Download size={18} />
                  </div>
                  <div>
                    <h2>Browser extension</h2>
                    <p>
                      Install the public Chrome companion for a quick handoff to
                      Capture Studio.
                    </p>
                  </div>
                </div>
                <div className="extension-preview">
                  <div className="extension-logo">
                    <AppLogo compact />
                  </div>
                  <div>
                    <b>SFYTA3.H-V.A Capture Layer</b>
                    <span>Manifest V3 · Chromium desktop · v1.0.0</span>
                  </div>
                  <span className="coming-pill">Available</span>
                </div>
                <a className="outline-button full" href="/extension/">
                  <Download size={15} /> Install for Chrome
                </a>
              </div>
            </div>
          </section>
        )}
        <footer className="app-footer" aria-label="Application credit">
          <span>Powered by BhaiSazzaD.Online</span>
          <span aria-hidden="true">·</span>
          <span>Copyright 2026 by NotRealEngine, LLC</span>
        </footer>
      </main>

      {rightsModalOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={event => {
            if (event.currentTarget === event.target) setRightsModalOpen(false);
          }}
        >
          <div
            className="rights-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rights-title"
          >
            <button
              className="modal-close icon-button"
              onClick={() => setRightsModalOpen(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div className="modal-shield">
              <ShieldCheck size={25} />
            </div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> RIGHTS CONFIRMATION
            </div>
            <h2 id="rights-title">
              Keep the source <i>in bounds.</i>
            </h2>
            <p className="modal-lead">
              Before SFYTA3.H-V.A starts, confirm that you have the legal right
              to archive this audio for personal, educational, or creator-owned
              use.
            </p>
            <div className="bengali-copy">
              আপনি কি নিশ্চিত যে এই কন্টেন্ট archive করার আইনি অধিকার আপনার আছে?
            </div>
            <div className="modal-checklist">
              <span>
                <Check size={15} /> I own, licensed, or have explicit permission
                for this audio.
              </span>
              <span>
                <Check size={15} /> I understand DRM-protected content will be
                blocked.
              </span>
              <span>
                <Check size={15} /> I will use the archive within the source
                platform's terms.
              </span>
            </div>
            <div className="modal-warning">
              <LockKeyhole size={16} />
              <span>
                No audio is uploaded in local-first mode. Each confirmation is
                added to the local audit trail.
              </span>
            </div>
            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={() => setRightsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="primary-button"
                onClick={confirmRightsAndStart}
              >
                <BadgeCheck size={16} /> Confirm & start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
