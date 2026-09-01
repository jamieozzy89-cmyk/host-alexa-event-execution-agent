import { validateHostState } from "../domain/state-validation.js";
import type { HostState } from "../domain/types.js";
import { PersistenceError } from "./errors.js";
import {
  HOST_PERSISTENCE_SCHEMA_VERSION,
  type HostPersistenceAdapter,
  type PersistedHostEnvelopeV1,
  type PersistenceLoadResult,
  type PersistenceSaveResult,
  type PersistenceSource,
  type StorageLike,
} from "./types.js";

function nowIso(): string {
  return new Date().toISOString();
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function sha256Hex(value: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new PersistenceError("Web Crypto SHA-256 is unavailable in this runtime.", "CRYPTO_UNAVAILABLE");
  const bytes = new TextEncoder().encode(value);
  const digest = await subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function statePayload(state: HostState): string {
  return JSON.stringify(state);
}

export interface JsonStoragePersistenceOptions {
  keyPrefix?: string;
}

export class JsonStoragePersistenceAdapter implements HostPersistenceAdapter {
  private readonly keyPrefix: string;

  constructor(
    private readonly storage: StorageLike,
    options: JsonStoragePersistenceOptions = {},
  ) {
    this.keyPrefix = options.keyPrefix ?? "host:v1:event";
  }

  keyFor(eventId: string, kind: "primary" | "backup" | "temporary" = "primary"): string {
    const suffix = kind === "primary" ? "" : kind === "backup" ? ":backup" : ":tmp";
    return `${this.keyPrefix}:${eventId}${suffix}`;
  }

  private async encode(state: HostState, savedAt: string): Promise<{ raw: string; envelope: PersistedHostEnvelopeV1 }> {
    validateHostState(state);
    const stateJson = statePayload(state);
    const stateSha256 = await sha256Hex(stateJson);
    const envelope: PersistedHostEnvelopeV1 = {
      schemaVersion: HOST_PERSISTENCE_SCHEMA_VERSION,
      eventId: state.event.id,
      savedAt,
      stateSha256,
      state: clone(state),
    };
    return { raw: JSON.stringify(envelope), envelope };
  }

  private async decode(raw: string, expectedEventId: string, source: PersistenceSource): Promise<PersistenceLoadResult> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch (error) {
      throw new PersistenceError(`Persisted ${source} snapshot is not valid JSON.`, "SNAPSHOT_INVALID_JSON", { cause: error });
    }
    if (!isRecord(parsed)) throw new PersistenceError(`Persisted ${source} snapshot is not an object.`, "SNAPSHOT_INVALID_ENVELOPE");
    if (parsed.schemaVersion !== HOST_PERSISTENCE_SCHEMA_VERSION) {
      throw new PersistenceError(
        `Unsupported persistence schema version ${String(parsed.schemaVersion)}; expected ${HOST_PERSISTENCE_SCHEMA_VERSION}.`,
        "SNAPSHOT_UNSUPPORTED_VERSION",
      );
    }
    if (typeof parsed.eventId !== "string" || parsed.eventId !== expectedEventId) {
      throw new PersistenceError(`Persisted ${source} snapshot event id does not match ${expectedEventId}.`, "SNAPSHOT_EVENT_MISMATCH");
    }
    if (typeof parsed.savedAt !== "string" || Number.isNaN(Date.parse(parsed.savedAt))) {
      throw new PersistenceError(`Persisted ${source} snapshot has an invalid savedAt timestamp.`, "SNAPSHOT_INVALID_ENVELOPE");
    }
    if (typeof parsed.stateSha256 !== "string" || parsed.stateSha256.length !== 64) {
      throw new PersistenceError(`Persisted ${source} snapshot has an invalid SHA-256 field.`, "SNAPSHOT_INVALID_ENVELOPE");
    }

    const state = parsed.state as unknown;
    const actualHash = await sha256Hex(JSON.stringify(state));
    if (actualHash !== parsed.stateSha256) {
      throw new PersistenceError(`Persisted ${source} snapshot failed SHA-256 integrity verification.`, "SNAPSHOT_CHECKSUM_MISMATCH");
    }
    try {
      validateHostState(state);
    } catch (error) {
      throw new PersistenceError(`Persisted ${source} snapshot failed domain-state validation.`, "SNAPSHOT_DOMAIN_INVALID", { cause: error });
    }

    return {
      state: clone(state),
      savedAt: parsed.savedAt,
      stateSha256: parsed.stateSha256,
      source,
      recovered: source !== "primary",
    };
  }

  async save(state: HostState, savedAt = nowIso()): Promise<PersistenceSaveResult> {
    const { raw, envelope } = await this.encode(state, savedAt);
    const primaryKey = this.keyFor(state.event.id, "primary");
    const backupKey = this.keyFor(state.event.id, "backup");
    const temporaryKey = this.keyFor(state.event.id, "temporary");
    const previousPrimary = this.storage.getItem(primaryKey);

    try {
      this.storage.setItem(temporaryKey, raw);
      const staged = this.storage.getItem(temporaryKey);
      if (staged === null) throw new PersistenceError("Temporary snapshot disappeared before verification.", "SNAPSHOT_STAGE_FAILED");
      await this.decode(staged, state.event.id, "temporary");

      if (previousPrimary !== null) {
        let previousPrimaryIsValid = false;
        try {
          await this.decode(previousPrimary, state.event.id, "primary");
          previousPrimaryIsValid = true;
        } catch {
          // Do not replace a known-good existing backup with a corrupt primary.
        }
        if (previousPrimaryIsValid) this.storage.setItem(backupKey, previousPrimary);
      }

      this.storage.setItem(primaryKey, raw);
      const committed = this.storage.getItem(primaryKey);
      if (committed === null) throw new PersistenceError("Primary snapshot disappeared after commit.", "SNAPSHOT_COMMIT_FAILED");
      await this.decode(committed, state.event.id, "primary");
      this.storage.removeItem(temporaryKey);
      return {
        eventId: state.event.id,
        revision: state.event.revision,
        savedAt: envelope.savedAt,
        stateSha256: envelope.stateSha256,
      };
    } catch (error) {
      if (previousPrimary !== null) {
        try {
          this.storage.setItem(primaryKey, previousPrimary);
        } catch {
          // Preserve the original failure; load() can still attempt backup recovery.
        }
      }
      throw error instanceof PersistenceError
        ? error
        : new PersistenceError("Snapshot save failed before a verified commit completed.", "SNAPSHOT_SAVE_FAILED", { cause: error });
    }
  }

  async load(eventId: string): Promise<PersistenceLoadResult | null> {
    const candidates: Array<{ source: PersistenceSource; raw: string | null }> = [
      { source: "primary", raw: this.storage.getItem(this.keyFor(eventId, "primary")) },
      { source: "backup", raw: this.storage.getItem(this.keyFor(eventId, "backup")) },
      { source: "temporary", raw: this.storage.getItem(this.keyFor(eventId, "temporary")) },
    ];
    const present = candidates.filter((candidate) => candidate.raw !== null);
    if (present.length === 0) return null;

    const failures: string[] = [];
    for (const candidate of present) {
      try {
        return await this.decode(candidate.raw as string, eventId, candidate.source);
      } catch (error) {
        failures.push(`${candidate.source}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    throw new PersistenceError(
      `No valid persisted snapshot could be loaded for ${eventId}. ${failures.join(" | ")}`,
      "SNAPSHOT_UNRECOVERABLE",
    );
  }

  async remove(eventId: string): Promise<void> {
    this.storage.removeItem(this.keyFor(eventId, "primary"));
    this.storage.removeItem(this.keyFor(eventId, "backup"));
    this.storage.removeItem(this.keyFor(eventId, "temporary"));
  }
}
