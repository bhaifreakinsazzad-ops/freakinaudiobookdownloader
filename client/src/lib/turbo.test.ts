import { describe, expect, it } from "vitest";
import { clampTurboSpeed, estimateTurboOutputSamples, processTurbo, TURBO_LIMITS, validateTurboInput, validateTurboQuality } from "./turbo";

function ramp(length: number) {
  const samples = new Float32Array(length);
  for (let index = 0; index < length; index += 1) samples[index] = index / length;
  return samples;
}

describe("Turbo processing", () => {
  it("clamps the safety speed range", () => {
    expect(clampTurboSpeed(1)).toBe(2);
    expect(clampTurboSpeed(4)).toBe(4);
    expect(clampTurboSpeed(99)).toBe(8);
    expect(estimateTurboOutputSamples(800, 4)).toBe(200);
  });

  it("compresses PCM faster than realtime and reports progress", async () => {
    const input = ramp(TURBO_LIMITS.chunkSamples * 4 + 10);
    const progress: number[] = [];
    const output = await processTurbo(input, 48_000, 4, (event) => progress.push(event.percent));
    expect(output.length).toBe(Math.floor(input.length / 4));
    expect(progress.at(-1)).toBe(100);
    expect(progress.length).toBeGreaterThan(1);
    expect(output[1]).toBeGreaterThan(output[0]);
  });

  it("passes finite, bounded output quality validation", async () => {
    const input = ramp(4_800);
    const output = await processTurbo(input, 48_000, 2);
    const report = validateTurboQuality(input, output, 2);
    expect(report.passed).toBe(true);
    expect(report.durationRatio).toBeCloseTo(0.5, 3);
    expect(report.peak).toBeLessThanOrEqual(1);
  });

  it("rejects recordings beyond the memory and duration safety limits", () => {
    expect(() => validateTurboInput(new Float32Array(1), 0, 4)).toThrow(/sample rate/i);
    expect(() => validateTurboInput(new Float32Array(TURBO_LIMITS.maxInputBytes / 4 + 1), 48_000, 4)).toThrow(/256 MB/i);
    expect(() => validateTurboInput(new Float32Array(1_000 * (TURBO_LIMITS.maxInputSeconds + 1)), 1_000, 4)).toThrow(/30 minute/i);
  });
});
