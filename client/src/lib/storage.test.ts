import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  deleteAuditEvents,
  deleteChapter,
  deleteRecording,
  getPlaybackState,
  deleteStorageDatabase,
  getRecording,
  getRecordingBlob,
  getSetting,
  getWaveform,
  listAuditEvents,
  listChapters,
  listRecordings,
  listSources,
  putAuditEvent,
  putChapter,
  putPlaybackState,
  putRecording,
  putSetting,
  putSource,
  putWaveform,
  updateRecordingMetadata,
  toStorageError,
  type StoredRecording,
} from "./storage";

function recording(overrides: Partial<StoredRecording> = {}): StoredRecording {
  const now = Date.now();
  return {
    id: "recording-1",
    sourceId: "source-1",
    title: "The Quiet Practice",
    subtitle: "Chapter 03",
    source: "Authorized web source",
    status: "ready",
    mode: "normal",
    format: "wav",
    durationSeconds: 42,
    fileSizeBytes: 0,
    channels: 1,
    mimeType: "audio/wav",
    color: "violet",
    localOnly: true,
    createdAt: now,
    updatedAt: now,
    chunkCount: 0,
    ...overrides,
  };
}

function audioBlob(size: number, type = "audio/wav") {
  return new Blob([new Uint8Array(size).fill(7)], { type });
}

describe("IndexedDB storage repository", () => {
  beforeEach(async () => {
    await deleteStorageDatabase();
  });

  afterEach(async () => {
    await deleteStorageDatabase();
  });

  it("creates a recording and stores large audio as ordered chunks", async () => {
    const source = audioBlob(2_500_123);
    const saved = await putRecording(recording(), source, 1_000_000);

    expect(saved.chunkCount).toBe(3);
    expect(saved.fileSizeBytes).toBe(source.size);
    expect(await getRecording("recording-1")).toMatchObject({ title: "The Quiet Practice", chunkCount: 3 });

    const restored = await getRecordingBlob("recording-1");
    expect(restored).toBeDefined();
    expect(restored?.size).toBe(source.size);
    expect(restored?.type).toBe("audio/wav");
  });

  it("supports search, source filtering, and format filtering", async () => {
    await putRecording(recording({ id: "one", sourceId: "source-1", title: "The Quiet Practice", format: "wav" }), audioBlob(5));
    await putRecording(recording({ id: "two", sourceId: "source-2", title: "A Field Guide", format: "mp3", createdAt: Date.now() + 10 }), audioBlob(8, "audio/mpeg"));

    expect((await listRecordings({ query: "quiet" })).map((row) => row.id)).toEqual(["one"]);
    expect((await listRecordings({ sourceId: "source-2" })).map((row) => row.id)).toEqual(["two"]);
    expect((await listRecordings({ format: "mp3" })).map((row) => row.id)).toEqual(["two"]);
  });

  it("deletes a recording, its chunks, and its waveform", async () => {
    await putRecording(recording(), audioBlob(25));
    await putWaveform({ recordingId: "recording-1", peaks: [0.1, 0.8], createdAt: Date.now(), updatedAt: Date.now() });
    expect(await getWaveform("recording-1")).toBeDefined();

    await deleteRecording("recording-1");

    expect(await getRecording("recording-1")).toBeUndefined();
    expect(await getRecordingBlob("recording-1")).toBeUndefined();
    expect(await getWaveform("recording-1")).toBeUndefined();
  });

  it("persists sources, audit events, and settings", async () => {
    await putSource({ id: "source-1", type: "generic-web", url: "https://example.com/audio", title: "Example", licenseStatus: "authorized", drmDetected: false, createdAt: 1, updatedAt: 1 });
    await putAuditEvent({ id: "audit-1", label: "Rights confirmed", detail: "Authorized source", tone: "green", action: "rights_confirmed", createdAt: 2, timeLabel: "Just now" });
    await putSetting("localOnly", true);

    expect((await listSources()).map((source) => source.id)).toEqual(["source-1"]);
    expect((await listAuditEvents()).map((event) => event.id)).toEqual(["audit-1"]);
    expect(await getSetting<boolean>("localOnly")).toMatchObject({ key: "localOnly", value: true });

    await deleteAuditEvents();
    expect(await listAuditEvents()).toEqual([]);
  });

  it("persists metadata, chapters, playback state, and chapter deletion", async () => {
    await putRecording(recording(), audioBlob(25));
    const updated = await updateRecordingMetadata("recording-1", { title: "Renamed", tags: ["focus", "chapter"], favorite: true, archived: true });
    expect(updated).toMatchObject({ title: "Renamed", tags: ["focus", "chapter"], favorite: true, archived: true });

    await putChapter({ id: "chapter-1", recordingId: "recording-1", startSeconds: 12, title: "Opening", createdAt: 1, updatedAt: 1 });
    await putChapter({ id: "chapter-2", recordingId: "recording-1", startSeconds: 4, title: "Intro", createdAt: 1, updatedAt: 1 });
    expect((await listChapters("recording-1")).map((chapter) => chapter.title)).toEqual(["Intro", "Opening"]);
    await deleteChapter("chapter-1");
    expect((await listChapters("recording-1")).map((chapter) => chapter.title)).toEqual(["Intro"]);

    await putPlaybackState({ recordingId: "recording-1", positionSeconds: 8, volume: 0.6, speed: 1.25, updatedAt: 2 });
    expect(await getPlaybackState("recording-1")).toMatchObject({ positionSeconds: 8, volume: 0.6, speed: 1.25 });
  });

  it("persists explicit compliance and sync audit actions", async () => {
    const actions = ["rights_confirmed", "capture_blocked", "sync_enabled", "sync_disabled", "sync_failed"] as const;
    for (const [index, action] of actions.entries()) {
      await putAuditEvent({ id: `audit-${action}`, label: action, detail: "Compliance event", tone: action === "capture_blocked" ? "red" : "green", action, createdAt: index + 1, timeLabel: "Just now" });
    }
    expect((await listAuditEvents()).map((event) => event.action).sort()).toEqual([...actions].sort());
  });

  it("normalizes quota failures into an actionable storage error", () => {
    const error = toStorageError(new DOMException("storage full", "QuotaExceededError"));
    expect(error.code).toBe("quota-exceeded");
    expect(error.message).toContain("storage is full");
  });
});
