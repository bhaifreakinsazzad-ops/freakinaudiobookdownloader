import { describe, expect, it } from "vitest";
import {
  createLocalSyncProvider,
  defaultSyncOptions,
  type SyncMetadata,
} from "./sync";
import type { StoredRecording } from "./storage";

const recording = (id = "recording-1", updatedAt = 10): StoredRecording => ({
  id,
  sourceId: "source-1",
  title: "Sample",
  subtitle: "Chapter",
  source: "Authorized",
  status: "ready",
  mode: "normal",
  format: "wav",
  durationSeconds: 10,
  fileSizeBytes: 4,
  channels: 1,
  mimeType: "audio/wav",
  color: "violet",
  localOnly: true,
  createdAt: 1,
  updatedAt,
  chunkCount: 1,
});
const metadata = (updatedAt = 10): SyncMetadata => ({
  recording: recording("recording-1", updatedAt),
  revision: updatedAt,
  updatedAt,
  deviceId: "device-1",
});

describe("mock sync provider", () => {
  it("requires auth and device registration, then syncs metadata without files by default", async () => {
    const provider = createLocalSyncProvider();
    await expect(
      provider.syncMetadata([metadata()], defaultSyncOptions())
    ).rejects.toThrow("Sign in");
    await provider.signIn();
    await provider.registerDevice({ id: "device-1", name: "Test browser" });
    const result = await provider.syncMetadata(
      [metadata()],
      defaultSyncOptions()
    );
    expect(result).toMatchObject({
      status: "synced",
      pushed: 1,
      uploadedFiles: 0,
    });
  });

  it("reports conflicts and applies the configured strategy", async () => {
    const provider = createLocalSyncProvider();
    await provider.signIn();
    await provider.registerDevice({ id: "device-1", name: "Test browser" });
    await provider.syncMetadata([metadata(10)], defaultSyncOptions());
    const result = await provider.syncMetadata([metadata(20)], {
      ...defaultSyncOptions(),
      conflictResolution: "local-wins",
    });
    expect(result.status).toBe("conflict");
    expect(result.conflicts[0].recordingId).toBe("recording-1");
  });

  it("runs encryption hooks and only uploads after explicit consent", async () => {
    const provider = createLocalSyncProvider();
    await provider.signIn();
    await provider.registerDevice({ id: "device-1", name: "Test browser" });
    let encryptedMetadata = 0;
    let encryptedFile = 0;
    const options = {
      ...defaultSyncOptions(),
      uploadFiles: true,
      encryption: {
        encryptMetadata: async (value: SyncMetadata) => {
          encryptedMetadata += 1;
          return { value };
        },
        encryptFile: async (file: Blob) => {
          encryptedFile += 1;
          return file;
        },
      },
    };
    await provider.syncMetadata([metadata()], options);
    const upload = await provider.uploadFile!(
      "recording-1",
      new Blob(["audio"]),
      options
    );
    expect(upload.uploaded).toBe(true);
    expect(encryptedMetadata).toBe(1);
    expect(encryptedFile).toBe(1);
    const noConsent = await provider.uploadFile!(
      "recording-2",
      new Blob(["audio"]),
      { ...options, uploadFiles: false }
    );
    expect(noConsent.uploaded).toBe(false);
  });
});
