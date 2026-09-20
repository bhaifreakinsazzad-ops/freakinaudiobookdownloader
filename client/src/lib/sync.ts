import type { StoredRecording } from "./storage";

export type SyncStatus =
  | "local-only"
  | "disabled"
  | "ready"
  | "syncing"
  | "synced"
  | "conflict"
  | "error";
export type ConflictResolution = "local-wins" | "remote-wins" | "newest-wins";

export interface SyncUser {
  id: string;
  email?: string;
  displayName?: string;
}
export interface SyncDevice {
  id: string;
  name: string;
  registeredAt: number;
  lastSeenAt: number;
}
export interface SyncMetadata {
  recording: StoredRecording;
  revision: number;
  updatedAt: number;
  deviceId: string;
}
export interface SyncConflict {
  recordingId: string;
  local: SyncMetadata;
  remote: SyncMetadata;
  resolution: ConflictResolution;
}
export interface EncryptionHooks {
  encryptMetadata?: (payload: SyncMetadata) => Promise<unknown>;
  decryptMetadata?: (payload: unknown) => Promise<SyncMetadata>;
  encryptFile?: (file: Blob, recordingId: string) => Promise<Blob>;
}
export interface SyncOptions {
  uploadFiles: boolean;
  encryption: EncryptionHooks;
  conflictResolution: ConflictResolution;
}
export interface SyncResult {
  status: SyncStatus;
  pushed: number;
  pulled: number;
  conflicts: SyncConflict[];
  uploadedFiles: number;
}

export interface SyncProvider {
  readonly id: string;
  readonly label: string;
  signIn(): Promise<SyncUser>;
  signOut(): Promise<void>;
  currentUser(): Promise<SyncUser | null>;
  registerDevice(
    device: Omit<SyncDevice, "registeredAt" | "lastSeenAt">
  ): Promise<SyncDevice>;
  syncMetadata(
    items: SyncMetadata[],
    options: SyncOptions
  ): Promise<SyncResult>;
  uploadFile?(
    recordingId: string,
    file: Blob,
    options: SyncOptions
  ): Promise<{ uploaded: boolean }>;
}

function chooseConflict(
  local: SyncMetadata,
  remote: SyncMetadata,
  strategy: ConflictResolution
) {
  if (strategy === "local-wins") return local;
  if (strategy === "remote-wins") return remote;
  return local.updatedAt >= remote.updatedAt ? local : remote;
}

export class MockSyncProvider implements SyncProvider {
  readonly id = "mock";
  readonly label = "Mock encrypted provider (development)";
  private user: SyncUser | null = null;
  private device: SyncDevice | null = null;
  private readonly remote = new Map<string, SyncMetadata>();
  private readonly uploaded = new Set<string>();

  async signIn() {
    this.user = {
      id: "mock-user",
      email: "local@example.invalid",
      displayName: "Local Sync Preview",
    };
    return this.user;
  }
  async signOut() {
    this.user = null;
  }
  async currentUser() {
    return this.user;
  }
  async registerDevice(
    device: Omit<SyncDevice, "registeredAt" | "lastSeenAt">
  ) {
    const now = Date.now();
    this.device = {
      ...device,
      registeredAt: this.device?.registeredAt || now,
      lastSeenAt: now,
    };
    return this.device;
  }
  async syncMetadata(items: SyncMetadata[], options: SyncOptions) {
    if (!this.user || !this.device)
      throw new Error("Sign in and register a device before syncing.");
    const conflicts: SyncConflict[] = [];
    let pushed = 0;
    let pulled = 0;
    for (const item of items) {
      const payload = options.encryption.encryptMetadata
        ? await options.encryption.encryptMetadata(item)
        : item;
      const remote = this.remote.get(item.recording.id);
      if (!remote) {
        this.remote.set(item.recording.id, item);
        pushed += 1;
        continue;
      }
      if (
        remote.revision === item.revision &&
        remote.updatedAt === item.updatedAt
      )
        continue;
      const winner = chooseConflict(item, remote, options.conflictResolution);
      conflicts.push({
        recordingId: item.recording.id,
        local: item,
        remote,
        resolution: options.conflictResolution,
      });
      if (winner === item) {
        this.remote.set(item.recording.id, item);
        pushed += 1;
      } else pulled += 1;
      void payload;
    }
    return {
      status: conflicts.length ? "conflict" : "synced",
      pushed,
      pulled,
      conflicts,
      uploadedFiles: this.uploaded.size,
    } satisfies SyncResult;
  }
  async uploadFile(recordingId: string, file: Blob, options: SyncOptions) {
    if (!options.uploadFiles) return { uploaded: false };
    if (!this.user || !this.device)
      throw new Error("Sign in and register a device before uploading.");
    const encrypted = options.encryption.encryptFile
      ? await options.encryption.encryptFile(file, recordingId)
      : file;
    if (encrypted.size > 0) this.uploaded.add(recordingId);
    return { uploaded: encrypted.size > 0 };
  }
}

export function createLocalSyncProvider() {
  return new MockSyncProvider();
}
export function defaultSyncOptions(): SyncOptions {
  return {
    uploadFiles: false,
    conflictResolution: "newest-wins",
    encryption: {},
  };
}
