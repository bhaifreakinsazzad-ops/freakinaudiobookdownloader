import type { EncodedAudio, EncoderOptions, EncoderProgress } from "./encoder";

type WorkerMessage =
  | { id: string; type: "progress"; processedSamples: number; totalSamples: number }
  | ({ id: string; type: "complete" } & Omit<EncodedAudio, "blob"> & { blob: Blob })
  | { id: string; type: "error"; message: string };

export function encodeWithWorker(samples: Float32Array, options: EncoderOptions, onProgress?: (progress: EncoderProgress) => void) {
  return new Promise<EncodedAudio>((resolve, reject) => {
    const worker = new Worker(new URL("./encoder.worker.ts", import.meta.url), { type: "module" });
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `encode-${Date.now()}`;
    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;
      if (message.id !== id) return;
      if (message.type === "progress") {
        onProgress?.({ processedSamples: message.processedSamples, totalSamples: message.totalSamples });
        return;
      }
      worker.terminate();
      if (message.type === "error") {
        reject(new Error(message.message));
        return;
      }
      resolve({ blob: message.blob, mimeType: message.mimeType, extension: message.extension as "wav" | "mp3", sampleRate: message.sampleRate, channels: message.channels, bitrate: message.bitrate, durationSeconds: message.durationSeconds });
    };
    worker.onerror = (event) => {
      worker.terminate();
      reject(new Error(event.message || "Audio worker failed"));
    };
    worker.postMessage({ id, samples, options }, [samples.buffer]);
  });
}
