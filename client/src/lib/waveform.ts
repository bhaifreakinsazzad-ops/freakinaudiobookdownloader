export function generateWaveformPeaks(samples: Float32Array, peakCount = 96) {
  const count = Math.max(1, Math.floor(peakCount));
  return Array.from({ length: count }, (_, index) => {
    const start = Math.floor((index / count) * samples.length);
    const end = Math.max(start + 1, Math.floor(((index + 1) / count) * samples.length));
    let peak = 0;
    for (let cursor = start; cursor < Math.min(end, samples.length); cursor += 1) peak = Math.max(peak, Math.abs(samples[cursor]));
    return Math.round(Math.min(1, peak) * 1000) / 1000;
  });
}
