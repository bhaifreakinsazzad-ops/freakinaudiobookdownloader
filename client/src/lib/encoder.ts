import lamejs from "@breezystack/lamejs";

export type EncoderFormat = "wav" | "mp3";
export type EncoderChannels = 1 | 2;

export interface EncoderOptions {
  format: EncoderFormat;
  inputSampleRate?: number;
  sampleRate: number;
  channels: EncoderChannels;
  bitrate: number;
  title: string;
  artist?: string;
  album?: string;
  source?: string;
}

export interface EncodedAudio {
  blob: Blob;
  mimeType: string;
  extension: EncoderFormat;
  sampleRate: number;
  channels: EncoderChannels;
  bitrate: number;
  durationSeconds: number;
}

export interface EncoderProgress {
  processedSamples: number;
  totalSamples: number;
}

const MP3_BLOCK_SIZE = 1152;

export function sanitizeFilename(value: string, extension: string) {
  const base = value
    .normalize("NFKC")
    .replace(/[\\/:*?"<>|\u0000-\u001F]/g, "-")
    .replace(/[^a-zA-Z0-9._ -]+/g, "")
    .replace(/\s+/g, " ")
    .replace(/-+/g, "-")
    .replace(/^[. -]+|[. -]+$/g, "")
    .slice(0, 120) || "sfyta3-capture";
  const cleanExtension = extension.replace(/[^a-z0-9]/gi, "").toLowerCase();
  return `${base}.${cleanExtension}`;
}

export function encodeWav(samples: Float32Array, sampleRate: number, channels: EncoderChannels) {
  const interleaved = toInterleavedInt16(samples, channels);
  const buffer = new ArrayBuffer(44 + interleaved.length * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, text: string) => {
    for (let index = 0; index < text.length; index += 1) view.setUint8(offset + index, text.charCodeAt(index));
  };
  writeString(0, "RIFF");
  view.setUint32(4, 36 + interleaved.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, interleaved.length * 2, true);
  for (let index = 0; index < interleaved.length; index += 1) view.setInt16(44 + index * 2, interleaved[index], true);
  return new Blob([buffer], { type: "audio/wav" });
}

export function encodeMp3(samples: Float32Array, options: Pick<EncoderOptions, "sampleRate" | "channels" | "bitrate" | "title" | "artist" | "album" | "source">, onProgress?: (progress: EncoderProgress) => void) {
  const prepared = prepareChannels(samples, options.channels);
  const encoder = new lamejs.Mp3Encoder(options.channels, options.sampleRate, options.bitrate);
  const output: Uint8Array[] = [];
  const totalSamples = prepared.left.length;
  for (let offset = 0; offset < totalSamples; offset += MP3_BLOCK_SIZE) {
    const end = Math.min(offset + MP3_BLOCK_SIZE, totalSamples);
    const left = prepared.left.subarray(offset, end);
    const encoded = options.channels === 2
      ? encoder.encodeBuffer(left, prepared.right.subarray(offset, end))
      : encoder.encodeBuffer(left);
    if (encoded.length) output.push(new Uint8Array(encoded));
    onProgress?.({ processedSamples: end, totalSamples });
  }
  const flushed = encoder.flush();
  if (flushed.length) output.push(new Uint8Array(flushed));
  const audio = new Blob(output, { type: "audio/mpeg" });
  return new Blob([createId3Tag({ title: options.title, artist: options.artist, album: options.album, source: options.source }), audio], { type: "audio/mpeg" });
}

export function encodeAudio(samples: Float32Array, options: EncoderOptions, onProgress?: (progress: EncoderProgress) => void): EncodedAudio {
  const resampled = resampleMono(samples, options.inputSampleRate || options.sampleRate, options.sampleRate);
  const blob = options.format === "mp3"
    ? encodeMp3(resampled, options, onProgress)
    : encodeWav(resampled, options.sampleRate, options.channels);
  return {
    blob,
    mimeType: blob.type,
    extension: options.format,
    sampleRate: options.sampleRate,
    channels: options.channels,
    bitrate: options.bitrate,
    durationSeconds: resampled.length / options.sampleRate,
  };
}

export function resampleMono(samples: Float32Array, fromRate: number, toRate: number) {
  if (!samples.length || fromRate === toRate) return samples;
  const outputLength = Math.max(1, Math.round(samples.length * toRate / fromRate));
  const output = new Float32Array(outputLength);
  const ratio = fromRate / toRate;
  for (let index = 0; index < outputLength; index += 1) {
    const position = index * ratio;
    const lower = Math.floor(position);
    const upper = Math.min(lower + 1, samples.length - 1);
    const weight = position - lower;
    output[index] = samples[lower] * (1 - weight) + samples[upper] * weight;
  }
  return output;
}

function prepareChannels(samples: Float32Array, channels: EncoderChannels) {
  const mono = toInt16(samples);
  if (channels === 1) return { left: mono, right: mono };
  return { left: mono, right: mono.slice() };
}

function toInterleavedInt16(samples: Float32Array, channels: EncoderChannels) {
  const mono = toInt16(samples);
  if (channels === 1) return mono;
  const stereo = new Int16Array(mono.length * 2);
  for (let index = 0; index < mono.length; index += 1) {
    stereo[index * 2] = mono[index];
    stereo[index * 2 + 1] = mono[index];
  }
  return stereo;
}

function toInt16(samples: Float32Array) {
  const output = new Int16Array(samples.length);
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    output[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return output;
}

function createId3Tag(metadata: { title: string; artist?: string; album?: string; source?: string }) {
  const frames = [
    createTextFrame("TIT2", metadata.title),
    createTextFrame("TPE1", metadata.artist || "SFYTA3.H-V.A"),
    createTextFrame("TALB", metadata.album || "Local Archive"),
    metadata.source ? createTextFrame("TSRC", metadata.source) : null,
  ].filter((frame): frame is Uint8Array => Boolean(frame));
  const payloadLength = frames.reduce((total, frame) => total + frame.length, 0);
  const tag = new Uint8Array(10 + payloadLength);
  tag.set([0x49, 0x44, 0x33, 0x03, 0x00, 0x00, (payloadLength >> 21) & 0x7f, (payloadLength >> 14) & 0x7f, (payloadLength >> 7) & 0x7f, payloadLength & 0x7f]);
  let offset = 10;
  for (const frame of frames) { tag.set(frame, offset); offset += frame.length; }
  return tag;
}

function createTextFrame(id: string, value: string) {
  const text = new TextEncoder().encode(value);
  const payload = new Uint8Array(text.length + 1);
  payload[0] = 0x03;
  payload.set(text, 1);
  const frame = new Uint8Array(10 + payload.length);
  for (let index = 0; index < 4; index += 1) frame[index] = id.charCodeAt(index);
  const size = payload.length;
  frame[4] = (size >> 24) & 0xff;
  frame[5] = (size >> 16) & 0xff;
  frame[6] = (size >> 8) & 0xff;
  frame[7] = size & 0xff;
  frame.set(payload, 10);
  return frame;
}
