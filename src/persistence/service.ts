import { HostDomainEngine } from "../domain/engine.js";
import type { EventCreateInput } from "../domain/types.js";
import { PersistenceError } from "./errors.js";
import type { HostPersistenceAdapter, PersistenceLoadResult, PersistenceSaveResult } from "./types.js";

export interface ResumedHostSession {
  engine: HostDomainEngine;
  persistence: Omit<PersistenceLoadResult, "state">;
}

export class HostPersistenceService {
  constructor(private readonly adapter: HostPersistenceAdapter) {}

  async create(input: EventCreateInput, createdAt?: string): Promise<HostDomainEngine> {
    const engine = new HostDomainEngine(input, createdAt);
    await this.adapter.save(engine.snapshot(), createdAt);
    return engine;
  }

  async checkpoint(engine: HostDomainEngine, savedAt?: string): Promise<PersistenceSaveResult> {
    return this.adapter.save(engine.snapshot(), savedAt);
  }

  async resume(eventId: string): Promise<ResumedHostSession> {
    const loaded = await this.adapter.load(eventId);
    if (!loaded) throw new PersistenceError(`No persisted Host event exists for ${eventId}.`, "SNAPSHOT_NOT_FOUND");
    const { state, ...persistence } = loaded;
    return {
      engine: HostDomainEngine.restore(state),
      persistence,
    };
  }

  async remove(eventId: string): Promise<void> {
    await this.adapter.remove(eventId);
  }
}
