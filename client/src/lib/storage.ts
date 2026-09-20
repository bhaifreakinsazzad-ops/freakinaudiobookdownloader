export const STORAGE_DB_NAME = "sfyta3-h-v-a";
export const STORAGE_DB_VERSION = 2;
export const AUDIO_CHUNK_SIZE = 1024 * 1024;

export type RecordingStatus = "capturing" | "processing" | "ready" | "failed";
export type StorageFormat = "wav" | "mp3" | "opus" | "aac" | "flac";
export type StorageMode = "normal" | "turbo";
export type LicenseStatus = "authorized" | "public-domain" | "unknown" | "blocked";

export interface StoredRecording {
  id: string;
  sourceId: string;
  title: string;
  subtitle: string;
  source: string;
  status: RecordingStatus;
  mode: StorageMode;
  format: StorageFormat;
  durationSeconds: number;
  fileSizeBytes: number;
  sampleRateHz?: number;
  channels: 1 | 2;
  mimeType: string;
  color: string;
  localOnly: boolean;
  createdAt: number;
  updatedAt: number;
  chunkCount: number;
  tags?: string[];
  favorite?: boolean;
  archived?: boolean;
  failureReason?: string;
  retryable?: boolean;
}

export interface RecordingChunk {
  id: string;
  recordingId: string;
  sequence: number;
  data: Blob;
  sizeBytes: number;
}

export interface StoredSource {
  id: string;
  type: "elevenlabs-reader" | "generic-web" | "upload" | "podcast";
  url: string;
  title: string;
  author?: string;
  licenseStatus: LicenseStatus;
  drmDetected: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface StoredAuditEvent {
  id: string;
  label: string;
  detail: string;
  tone: "green" | "violet" | "amber" | "red";
  action: "rights_confirmed" | "source_analyzed" | "capture_started" | "capture_blocked" | "archive_created" | "downloaded" | "deleted" | "sync_skipped" | "sync_enabled" | "sync_disabled" | "sync_failed";
  sourceUrl?: string;
  recordingId?: string;
  createdAt: number;
  timeLabel: string;
}

export interface StoredSetting<T = unknown> {
  key: string;
  value: T;
  updatedAt: number;
}

export interface StoredWaveform {
  recordingId: string;
  peaks: number[];
  sampleRateHz?: number;
  createdAt: number;
  updatedAt: number;
}

export interface StoredChapter {
  id: string;
  recordingId: string;
  startSeconds: number;
  title: string;
  note?: string;
  createdAt: number;
  updatedAt: number;
}

export interface StoredPlaybackState {
  recordingId: string;
  positionSeconds: number;
  volume: number;
  speed: number;
  updatedAt: number;
}

export type StorageErrorCode = "quota-exceeded" | "unavailable" | "corrupt" | "unknown";

export class StorageLayerError extends Error {
  readonly code: StorageErrorCode;
  readonly causeValue?: unknown;

  constructor(code: StorageErrorCode, message: string, causeValue?: unknown) {
    super(message);
    this.name = "StorageLayerError";
    this.code = code;
    this.causeValue = causeValue;
  }
}

type StoreName = "recordings" | "recordingChunks" | "sources" | "auditEvents" | "settings" | "waveforms";

function isQuotaError(error: unknown) {
  return error instanceof DOMException && (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED") || (error instanceof Error && /quota|storage full/i.test(error.message));
}

export function toStorageError(error: unknown): StorageLayerError {
  if (error instanceof StorageLayerError) return error;
  if (isQuotaError(error)) return new StorageLayerError("quota-exceeded", "Browser storage is full. Delete recordings or free device space and try again.", error);
  if (typeof indexedDB === "undefined") return new StorageLayerError("unavailable", "IndexedDB is not available in this browser.", error);
  if (error instanceof DOMException && error.name === "VersionError") return new StorageLayerError("corrupt", "The local archive schema could not be opened.", error);
  return new StorageLayerError("unknown", "The local archive could not be updated.", error);
}

function requestResult<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB request failed"));
  });
}

function transactionDone(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("IndexedDB transaction failed"));
    transaction.onabort = () => reject(transaction.error || new Error("IndexedDB transaction aborted"));
  });
}

function deleteByIndex(store: IDBObjectStore, indexName: string, value: IDBValidKey) {
  return new Promise<void>((resolve, reject) => {
    const request = store.index(indexName).openCursor(IDBKeyRange.only(value));
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve();
        return;
      }
      cursor.delete();
      cursor.continue();
    };
    request.onerror = () => reject(request.error || new Error("IndexedDB cursor failed"));
  });
}

export function openStorageDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(toStorageError(new Error("IndexedDB unavailable")));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(STORAGE_DB_NAME, STORAGE_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      const recordings = db.objectStoreNames.contains("recordings") ? request.transaction!.objectStore("recordings") : db.createObjectStore("recordings", { keyPath: "id" });
      if (!recordings.indexNames.contains("createdAt")) recordings.createIndex("createdAt", "createdAt");
      if (!recordings.indexNames.contains("sourceId")) recordings.createIndex("sourceId", "sourceId");
      if (!recordings.indexNames.contains("format")) recordings.createIndex("format", "format");

      const chunks = db.objectStoreNames.contains("recordingChunks") ? request.transaction!.objectStore("recordingChunks") : db.createObjectStore("recordingChunks", { keyPath: "id" });
      if (!chunks.indexNames.contains("recordingId")) chunks.createIndex("recordingId", "recordingId");
      if (!chunks.indexNames.contains("recordingSequence")) chunks.createIndex("recordingSequence", ["recordingId", "sequence"], { unique: true });

      const sources = db.objectStoreNames.contains("sources") ? request.transaction!.objectStore("sources") : db.createObjectStore("sources", { keyPath: "id" });
      if (!sources.indexNames.contains("url")) sources.createIndex("url", "url");
      if (!sources.indexNames.contains("licenseStatus")) sources.createIndex("licenseStatus", "licenseStatus");

      const audits = db.objectStoreNames.contains("auditEvents") ? request.transaction!.objectStore("auditEvents") : db.createObjectStore("auditEvents", { keyPath: "id" });
      if (!audits.indexNames.contains("createdAt")) audits.createIndex("createdAt", "createdAt");
      if (!audits.indexNames.contains("recordingId")) audits.createIndex("recordingId", "recordingId");
      if (!audits.indexNames.contains("action")) audits.createIndex("action", "action");

      if (!db.objectStoreNames.contains("settings")) db.createObjectStore("settings", { keyPath: "key" });
      if (!db.objectStoreNames.contains("waveforms")) db.createObjectStore("waveforms", { keyPath: "recordingId" });
      const chapters = db.objectStoreNames.contains("chapters") ? request.transaction!.objectStore("chapters") : db.createObjectStore("chapters", { keyPath: "id" });
      if (!chapters.indexNames.contains("recordingId")) chapters.createIndex("recordingId", "recordingId");
      if (!chapters.indexNames.contains("recordingStart")) chapters.createIndex("recordingStart", ["recordingId", "startSeconds"]);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(toStorageError(request.error));
    request.onblocked = () => reject(new StorageLayerError("unavailable", "Another tab is preventing the local archive from upgrading."));
  });
}

async function withDatabase<T>(work: (db: IDBDatabase) => Promise<T>) {
  let db: IDBDatabase | undefined;
  try {
    db = await openStorageDatabase();
    return await work(db);
  } catch (error) {
    throw toStorageError(error);
  } finally {
    db?.close();
  }
}

export async function putRecording(recording: StoredRecording, audio?: Blob, chunkSize = AUDIO_CHUNK_SIZE) {
  return withDatabase(async (db) => {
    const transaction = db.transaction(["recordings", "recordingChunks"], "readwrite");
    const recordings = transaction.objectStore("recordings");
    const chunks = transaction.objectStore("recordingChunks");
    await deleteByIndex(chunks, "recordingId", recording.id);
    let chunkCount = 0;
    if (audio && audio.size > 0) {
      for (let offset = 0; offset < audio.size; offset += chunkSize) {
        const data = audio.slice(offset, Math.min(offset + chunkSize, audio.size), audio.type || recording.mimeType);
        chunks.put({ id: `${recording.id}:${chunkCount}`, recordingId: recording.id, sequence: chunkCount, data, sizeBytes: data.size } satisfies RecordingChunk);
        chunkCount += 1;
      }
    }
    recordings.put({ ...recording, chunkCount, fileSizeBytes: audio?.size ?? recording.fileSizeBytes } satisfies StoredRecording);
    await transactionDone(transaction);
    return { ...recording, chunkCount, fileSizeBytes: audio?.size ?? recording.fileSizeBytes } satisfies StoredRecording;
  });
}

export async function getRecording(id: string) {
  return withDatabase(async (db) => {
    const transaction = db.transaction("recordings", "readonly");
    return (await requestResult(transaction.objectStore("recordings").get(id))) as StoredRecording | undefined;
  });
}

export async function listRecordings(filters: { query?: string; sourceId?: string; format?: StorageFormat } = {}) {
  return withDatabase(async (db) => {
    const transaction = db.transaction("recordings", "readonly");
    const rows = (await requestResult(transaction.objectStore("recordings").getAll())) as StoredRecording[];
    const query = filters.query?.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesQuery = !query || `${row.title} ${row.subtitle} ${row.source}`.toLowerCase().includes(query);
      const matchesSource = !filters.sourceId || row.sourceId === filters.sourceId;
      const matchesFormat = !filters.format || row.format === filters.format;
      return matchesQuery && matchesSource && matchesFormat;
    }).sort((a, b) => b.createdAt - a.createdAt);
  });
}

export async function getRecordingBlob(id: string) {
  return withDatabase(async (db) => {
    const transaction = db.transaction("recordingChunks", "readonly");
    const rows = (await requestResult(transaction.objectStore("recordingChunks").index("recordingId").getAll(id))) as RecordingChunk[];
    if (!rows.length) return undefined;
    rows.sort((a, b) => a.sequence - b.sequence);
    return new Blob(rows.map((row) => row.data), { type: rows[0].data.type || "audio/wav" });
  });
}

export async function deleteRecording(id: string) {
  return withDatabase(async (db) => {
    const transaction = db.transaction(["recordings", "recordingChunks", "waveforms", "chapters"], "readwrite");
    transaction.objectStore("recordings").delete(id);
    transaction.objectStore("waveforms").delete(id);
    await deleteByIndex(transaction.objectStore("chapters"), "recordingId", id);
    await deleteByIndex(transaction.objectStore("recordingChunks"), "recordingId", id);
    await transactionDone(transaction);
  });
}

export async function updateRecordingMetadata(id: string, patch: Partial<Pick<StoredRecording, "title" | "subtitle" | "tags" | "favorite" | "archived" | "failureReason" | "retryable" | "status">>) {
  return withDatabase(async (db) => {
    const transaction = db.transaction("recordings", "readwrite");
    const store = transaction.objectStore("recordings");
    const current = (await requestResult(store.get(id))) as StoredRecording | undefined;
    if (!current) throw new Error("Recording not found");
    const updated = { ...current, ...patch, updatedAt: Date.now() } satisfies StoredRecording;
    store.put(updated);
    await transactionDone(transaction);
    return updated;
  });
}

export async function putSource(source: StoredSource) {
  return withDatabase(async (db) => {
    const transaction = db.transaction("sources", "readwrite");
    transaction.objectStore("sources").put(source);
    await transactionDone(transaction);
    return source;
  });
}

export async function listSources() {
  return withDatabase(async (db) => {
    const transaction = db.transaction("sources", "readonly");
    return (await requestResult(transaction.objectStore("sources").getAll())) as StoredSource[];
  });
}

export async function putAuditEvent(event: StoredAuditEvent) {
  return withDatabase(async (db) => {
    const transaction = db.transaction("auditEvents", "readwrite");
    transaction.objectStore("auditEvents").put(event);
    await transactionDone(transaction);
    return event;
  });
}

export async function listAuditEvents(limit = 100) {
  return withDatabase(async (db) => {
    const transaction = db.transaction("auditEvents", "readonly");
    const rows = (await requestResult(transaction.objectStore("auditEvents").getAll())) as StoredAuditEvent[];
    return rows.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
  });
}

export async function deleteAuditEvents() {
  return withDatabase(async (db) => {
    const transaction = db.transaction("auditEvents", "readwrite");
    transaction.objectStore("auditEvents").clear();
    await transactionDone(transaction);
  });
}

export async function putSetting<T>(key: string, value: T) {
  const setting: StoredSetting<T> = { key, value, updatedAt: Date.now() };
  return withDatabase(async (db) => {
    const transaction = db.transaction("settings", "readwrite");
    transaction.objectStore("settings").put(setting);
    await transactionDone(transaction);
    return setting;
  });
}

export async function getSetting<T>(key: string) {
  return withDatabase(async (db) => {
    const transaction = db.transaction("settings", "readonly");
    return (await requestResult(transaction.objectStore("settings").get(key))) as StoredSetting<T> | undefined;
  });
}

export async function putWaveform(waveform: StoredWaveform) {
  return withDatabase(async (db) => {
    const transaction = db.transaction("waveforms", "readwrite");
    transaction.objectStore("waveforms").put(waveform);
    await transactionDone(transaction);
    return waveform;
  });
}

export async function getWaveform(recordingId: string) {
  return withDatabase(async (db) => {
    const transaction = db.transaction("waveforms", "readonly");
    return (await requestResult(transaction.objectStore("waveforms").get(recordingId))) as StoredWaveform | undefined;
  });
}

export async function putChapter(chapter: StoredChapter) {
  return withDatabase(async (db) => {
    const transaction = db.transaction("chapters", "readwrite");
    transaction.objectStore("chapters").put(chapter);
    await transactionDone(transaction);
    return chapter;
  });
}

export async function listChapters(recordingId: string) {
  return withDatabase(async (db) => {
    const transaction = db.transaction("chapters", "readonly");
    const rows = (await requestResult(transaction.objectStore("chapters").index("recordingId").getAll(recordingId))) as StoredChapter[];
    return rows.sort((a, b) => a.startSeconds - b.startSeconds);
  });
}

export async function deleteChapter(id: string) {
  return withDatabase(async (db) => {
    const transaction = db.transaction("chapters", "readwrite");
    transaction.objectStore("chapters").delete(id);
    await transactionDone(transaction);
  });
}

export async function putPlaybackState(state: StoredPlaybackState) {
  return putSetting(`playback:${state.recordingId}`, state);
}

export async function getPlaybackState(recordingId: string) {
  const setting = await getSetting<StoredPlaybackState>(`playback:${recordingId}`);
  return setting?.value;
}

export async function migrateLegacyLocalStorage() {
  if (typeof localStorage === "undefined") return { recordings: 0, auditEvents: 0 };
  const legacyRecordings = safeJson<unknown[]>(localStorage.getItem("sfyta3-recordings")) || [];
  const legacyAudits = safeJson<unknown[]>(localStorage.getItem("sfyta3-audit")) || [];
  let recordings = 0;
  let auditEvents = 0;
  if (legacyRecordings.length) {
    for (let index = 0; index < legacyRecordings.length; index += 1) {
      const value = legacyRecordings[index];
      const row = value as Partial<StoredRecording> & { duration?: string; size?: string; created?: string };
      if (!row.id || !row.title) continue;
      await putRecording({
        id: row.id,
        sourceId: row.sourceId || "legacy-source",
        title: row.title,
        subtitle: row.subtitle || "Migrated local recording",
        source: row.source || "Legacy local archive",
        status: "ready",
        mode: row.mode || "normal",
        format: row.format || "wav",
        durationSeconds: row.durationSeconds || parseDuration(row.duration || "0:00"),
        fileSizeBytes: row.fileSizeBytes || parseSize(row.size || "0 MB"),
        mimeType: row.mimeType || "audio/wav",
        channels: row.channels || 1,
        color: row.color || ["lavender", "lime", "peach", "blue"][index % 4],
        localOnly: row.localOnly ?? true,
        createdAt: row.createdAt || Date.now(),
        updatedAt: Date.now(),
        chunkCount: 0,
      });
      recordings += 1;
    }
    localStorage.removeItem("sfyta3-recordings");
  }
  if (legacyAudits.length) {
    for (let index = 0; index < legacyAudits.length; index += 1) {
      const value = legacyAudits[index];
      const row = value as Partial<StoredAuditEvent> & { time?: string };
      if (!row.id || !row.label) continue;
      await putAuditEvent({
        id: row.id,
        label: row.label,
        detail: row.detail || "Migrated local audit event",
        tone: row.tone || "violet",
        action: row.action || "source_analyzed",
        createdAt: row.createdAt || Date.now() - index,
        timeLabel: row.timeLabel || row.time || "Migrated",
      });
      auditEvents += 1;
    }
    localStorage.removeItem("sfyta3-audit");
  }
  return { recordings, auditEvents };
}

export async function deleteStorageDatabase() {
  if (typeof indexedDB === "undefined") return;
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(STORAGE_DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(toStorageError(request.error));
    request.onblocked = () => resolve();
  });
}

function safeJson<T>(value: string | null): T | undefined {
  if (!value) return undefined;
  try { return JSON.parse(value) as T; } catch { return undefined; }
}

function parseDuration(value: string) {
  const parts = value.split(":").map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function parseSize(value: string) {
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric)) return 0;
  if (/GB/i.test(value)) return numeric * 1024 * 1024 * 1024;
  if (/KB/i.test(value)) return numeric * 1024;
  return numeric * 1024 * 1024;
}
