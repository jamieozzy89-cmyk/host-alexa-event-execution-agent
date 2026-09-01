import type { HostState } from "../domain/types.js";

export const HOST_PERSISTENCE_SCHEMA_VERSION = 2 as const;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type PersistenceSource = "primary" | "backup" | "temporary";

export interface PersistedHostEnvelopeV1 {
  schemaVersion: typeof HOST_PERSISTENCE_SCHEMA_VERSION;
  eventId: string;
  savedAt: string;
  stateSha256: string;
  state: HostState;
}

export interface PersistenceSaveResult {
  eventId: string;
  revision: number;
  savedAt: string;
  stateSha256: string;
}

export interface PersistenceLoadResult {
  state: HostState;
  savedAt: string;
  stateSha256: string;
  source: PersistenceSource;
  recovered: boolean;
}

export interface HostPersistenceAdapter {
  save(state: HostState, savedAt?: string): Promise<PersistenceSaveResult>;
  load(eventId: string): Promise<PersistenceLoadResult | null>;
  remove(eventId: string): Promise<void>;
}
