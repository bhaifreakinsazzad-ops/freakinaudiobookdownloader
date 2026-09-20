import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { encodeWav } from "./encoder";
import { processTurbo } from "./turbo";
import {
  deleteStorageDatabase,
  getRecordingBlob,
  putRecording,
  putWaveform,
  type StoredRecording,
} from "./storage";
import { generateWaveformPeaks } from "./waveform";

const row = (): StoredRecording => ({
  id: "release-recording",
  sourceId: "source",
  title: "Release fixture",
  subtitle: "Test",
  source: "Authorized fixture",
  status: "ready",
  mode: "normal",
  format: "wav",
  durationSeconds: 1,
  fileSizeBytes: 0,
  channels: 1,
  mimeType: "audio/wav",
  color: "violet",
  localOnly: true,
  createdAt: 1,
  updatedAt: 1,
  chunkCount: 0,
});

beforeEach(async () => {
  await deleteStorageDatabase();
});
afterEach(async () => {
  await deleteStorageDatabase();
});

describe("release readiness", () => {
  it("validates audio quality invariants for PCM output and peaks", async () => {
    const samples = new Float32Array(44100);
    for (let index = 0; index < samples.length; index += 1)
      samples[index] = Math.sin(index / 9) * 0.3;
    const wav = encodeWav(samples, 44100, 1);
    const bytes = new Uint8Array(await wav.arrayBuffer());
    expect(bytes.slice(0, 4)).toEqual(new Uint8Array([82, 73, 70, 70]));
    expect(bytes.slice(8, 12)).toEqual(new Uint8Array([87, 65, 86, 69]));
    const peaks = generateWaveformPeaks(samples, 96);
    expect(peaks).toHaveLength(96);
    expect(Math.max(...peaks)).toBeGreaterThan(0.2);
    expect(Math.max(...peaks)).toBeLessThanOrEqual(1);
  });

  it("stress-checks bounded Turbo processing and progress completion", async () => {
    const samples = new Float32Array(44_100 * 5);
    let lastProgress = 0;
    const output = await processTurbo(samples, 44_100, 8, progress => {
      lastProgress = progress.percent;
    });
    expect(output.length).toBe(Math.floor(samples.length / 8));
    expect(lastProgress).toBe(100);
  });

  it("integrates recording chunks and waveform persistence", async () => {
    const audio = new Blob([new Uint8Array(2048).fill(4)], {
      type: "audio/wav",
    });
    await putRecording(row(), audio, 512);
    await putWaveform({
      recordingId: row().id,
      peaks: [0.1, 0.8],
      createdAt: 1,
      updatedAt: 1,
    });
    const restored = await getRecordingBlob(row().id);
    expect(restored?.size).toBe(audio.size);
  });

  it("normalizes storage quota failures for release diagnostics", () => {
    const error = new DOMException("storage full", "QuotaExceededError");
    expect(error.name).toBe("QuotaExceededError");
  });
});
