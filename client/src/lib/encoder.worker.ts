import { encodeAudio, type EncoderOptions } from "./encoder";

type WorkerRequest = { id: string; samples: Float32Array; options: EncoderOptions };

type WorkerResponse =
  | { id: string; type: "progress"; processedSamples: number; totalSamples: number }
  | { id: string; type: "complete"; blob: Blob; mimeType: string; extension: string; sampleRate: number; channels: 1 | 2; bitrate: number; durationSeconds: number }
  | { id: string; type: "error"; message: string };

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id, samples, options } = event.data;
  try {
    const result = encodeAudio(samples, options, (progress) => {
      self.postMessage({ id, type: "progress", ...progress } satisfies WorkerResponse);
    });
    self.postMessage({ id, type: "complete", ...result } satisfies WorkerResponse);
  } catch (error) {
    self.postMessage({ id, type: "error", message: error instanceof Error ? error.message : "Audio encoding failed" } satisfies WorkerResponse);
  }
};
