export const TURBO_LIMITS = {
  minSpeed: 2,
  maxSpeed: 8,
  maxInputBytes: 256 * 1024 * 1024,
  maxInputSeconds: 30 * 60,
  chunkSamples: 262_144,
} as const;

export type TurboProgress = {
  processedSamples: number;
  totalSamples: number;
  percent: number;
  estimatedSecondsRemaining: number | null;
};

export type TurboQualityReport = {
  expectedSamples: number;
  actualSamples: number;
  durationRatio: number;
  peak: number;
  finite: boolean;
  passed: boolean;
};

export function clampTurboSpeed(speed: number) {
  if (!Number.isFinite(speed)) return TURBO_LIMITS.minSpeed;
  return Math.min(TURBO_LIMITS.maxSpeed, Math.max(TURBO_LIMITS.minSpeed, speed));
}

export function validateTurboInput(samples: Float32Array, sampleRate: number, speed: number) {
  const normalizedSpeed = clampTurboSpeed(speed);
  if (!Number.isFinite(sampleRate) || sampleRate <= 0) throw new Error("Turbo requires a valid input sample rate.");
  if (samples.byteLength > TURBO_LIMITS.maxInputBytes) throw new Error("Turbo stopped safely because this capture exceeds the 256 MB processing limit.");
  if (samples.length / sampleRate > TURBO_LIMITS.maxInputSeconds) throw new Error("Turbo stopped safely because this capture exceeds the 30 minute processing limit.");
  return normalizedSpeed;
}

export function estimateTurboOutputSamples(inputSamples: number, speed: number) {
  return Math.max(1, Math.floor(inputSamples / clampTurboSpeed(speed)));
}

/**
 * Time-compresses an authorized PCM buffer using playback-rate semantics.
 * Linear interpolation avoids hard sample drops while intentionally retaining
 * the pitch change that a real HTMLMediaElement playbackRate produces.
 * Work is yielded between chunks so the UI can report progress and the main
 * thread remains responsive for bounded recordings.
 */
export async function processTurbo(
  samples: Float32Array,
  sampleRate: number,
  speed: number,
  onProgress?: (progress: TurboProgress) => void,
) {
  const normalizedSpeed = validateTurboInput(samples, sampleRate, speed);
  const totalSamples = estimateTurboOutputSamples(samples.length, normalizedSpeed);
  const output = new Float32Array(totalSamples);
  const startedAt = performance.now();

  for (let offset = 0; offset < totalSamples; offset += TURBO_LIMITS.chunkSamples) {
    const end = Math.min(offset + TURBO_LIMITS.chunkSamples, totalSamples);
    for (let index = offset; index < end; index += 1) {
      const position = index * normalizedSpeed;
      const lower = Math.min(Math.floor(position), samples.length - 1);
      const upper = Math.min(lower + 1, samples.length - 1);
      const weight = position - lower;
      output[index] = samples[lower] * (1 - weight) + samples[upper] * weight;
    }

    const processedSamples = end;
    const percent = Math.round((processedSamples / totalSamples) * 100);
    const elapsedSeconds = Math.max(0.001, (performance.now() - startedAt) / 1000);
    const remaining = processedSamples ? (totalSamples - processedSamples) * (elapsedSeconds / processedSamples) : 0;
    onProgress?.({ processedSamples, totalSamples, percent, estimatedSecondsRemaining: processedSamples === totalSamples ? 0 : remaining });
    if (end < totalSamples) await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }

  return output;
}

export function validateTurboQuality(input: Float32Array, output: Float32Array, speed: number): TurboQualityReport {
  const normalizedSpeed = clampTurboSpeed(speed);
  const expectedSamples = estimateTurboOutputSamples(input.length, normalizedSpeed);
  let peak = 0;
  let finite = true;
  for (let index = 0; index < output.length; index += 1) {
    const sample = output[index];
    finite &&= Number.isFinite(sample);
    peak = Math.max(peak, Math.abs(sample));
  }
  const durationRatio = input.length ? output.length / input.length : 0;
  const ratioWithinTolerance = Math.abs(output.length - expectedSamples) <= 1;
  const passed = finite && peak <= 1.0001 && ratioWithinTolerance;
  return { expectedSamples, actualSamples: output.length, durationRatio, peak, finite, passed };
}

export function formatTurboEta(seconds: number | null) {
  if (seconds === null || !Number.isFinite(seconds)) return "estimating time remaining";
  if (seconds < 1) return "finishing now";
  return `${Math.ceil(seconds)}s remaining`;
}
