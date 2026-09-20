import { describe, expect, it } from "vitest";
import { encodeAudio, encodeMp3, encodeWav, resampleMono, sanitizeFilename } from "./encoder";

function tone(length = 4410) {
  const samples = new Float32Array(length);
  for (let index = 0; index < samples.length; index += 1) samples[index] = Math.sin(index / 8) * 0.2;
  return samples;
}

describe("audio encoder utilities", () => {
  it("sanitizes filenames consistently and limits unsafe input", () => {
    expect(sanitizeFilename("  Chapter: 03 / The quiet? practice  ", "MP3")).toBe("Chapter- 03 - The quiet- practice.mp3");
    expect(sanitizeFilename("", "wav")).toBe("sfyta3-capture.wav");
  });

  it("writes a valid PCM WAV header with selected channels and rate", async () => {
    const blob = encodeWav(tone(), 48_000, 2);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const view = new DataView(bytes.buffer);
    expect(blob.type).toBe("audio/wav");
    expect(new TextDecoder().decode(bytes.slice(0, 4))).toBe("RIFF");
    expect(new TextDecoder().decode(bytes.slice(8, 12))).toBe("WAVE");
    expect(view.getUint16(22, true)).toBe(2);
    expect(view.getUint32(24, true)).toBe(48_000);
    expect(view.getUint16(34, true)).toBe(16);
    expect(view.getUint32(40, true)).toBe(bytes.byteLength - 44);
  });

  it("produces an MP3 with ID3 metadata and MPEG frame bytes", async () => {
    const blob = encodeMp3(tone(23_040), { sampleRate: 44_100, channels: 1, bitrate: 128, title: "Test capture", artist: "SFYTA3.H-V.A", album: "Local Archive", source: "https://example.com" });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const text = new TextDecoder().decode(bytes.slice(0, 3));
    const hasMpegSync = bytes.some((value, index) => value === 0xff && (bytes[index + 1] & 0xe0) === 0xe0);
    expect(blob.type).toBe("audio/mpeg");
    expect(text).toBe("ID3");
    expect(new TextDecoder().decode(bytes)).toContain("Test capture");
    expect(hasMpegSync).toBe(true);
    expect(bytes.byteLength).toBeGreaterThan(500);
  });

  it("resamples and duplicates mono input for stereo output", () => {
    const samples = resampleMono(tone(44_100), 44_100, 48_000);
    expect(samples.length).toBe(48_000);
    const result = encodeAudio(tone(4_410), { format: "wav", inputSampleRate: 44_100, sampleRate: 48_000, channels: 2, bitrate: 128, title: "Resampled" });
    expect(result.sampleRate).toBe(48_000);
    expect(result.channels).toBe(2);
    expect(result.durationSeconds).toBeCloseTo(0.1, 2);
  });
});
