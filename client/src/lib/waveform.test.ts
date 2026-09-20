import { describe, expect, it } from "vitest";
import { generateWaveformPeaks } from "./waveform";

describe("waveform peak generation", () => {
  it("creates the requested number of bounded peaks", () => {
    const samples = new Float32Array([0, 0.2, -0.8, 0.4, 1.2, -0.3]);
    const peaks = generateWaveformPeaks(samples, 3);
    expect(peaks).toHaveLength(3);
    expect(peaks).toEqual([0.2, 0.8, 1]);
    expect(peaks.every((peak) => peak >= 0 && peak <= 1)).toBe(true);
  });

  it("returns stable silence for empty input", () => {
    expect(generateWaveformPeaks(new Float32Array(), 4)).toEqual([0, 0, 0, 0]);
  });
});
