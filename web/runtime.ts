import {
  createDefaultMenuProposalAdapter,
  DemoProductCatalogueAdapter,
  DeterministicSimulatedCartAdapter,
  HeuristicIntentInterpreter,
  HostAgentOrchestrator,
  HostToolRuntime,
  JsonStoragePersistenceAdapter,
} from "../src/application/index.js";
import type { BrowserStorageMode } from "./types.js";

const ACTIVE_EVENT_KEY = "host:ui:active-event";
const EVENT_STORAGE_PREFIX = "host:v1:event:";
const STORAGE_PROBE_KEY = "host:ui:storage-probe";

class MemoryBrowserStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, String(value)); }
}

export interface BrowserStorageResolution {
  storage: Storage;
  mode: BrowserStorageMode;
}

export function resolveBrowserStorage(): BrowserStorageResolution {
  try {
    const storage = window.localStorage;
    storage.setItem(STORAGE_PROBE_KEY, "1");
    storage.removeItem(STORAGE_PROBE_KEY);
    return { storage, mode: "persistent" };
  } catch {
    return { storage: new MemoryBrowserStorage(), mode: "memory" };
  }
}

export interface BrowserHostRuntime {
  agent: HostAgentOrchestrator;
  storageMode: BrowserStorageMode;
  activeEventId(): string | null;
  rememberEvent(eventId: string): void;
  forgetEvent(): void;
  clearHostEventData(): number;
}

export function createBrowserHostRuntime(storageResolution: BrowserStorageResolution = resolveBrowserStorage()): BrowserHostRuntime {
  const { storage, mode } = storageResolution;
  const persistence = new JsonStoragePersistenceAdapter(storage);
  const runtime = new HostToolRuntime(persistence, {
    menuProposals: createDefaultMenuProposalAdapter(),
    productCatalogue: new DemoProductCatalogueAdapter(),
    cartActions: new DeterministicSimulatedCartAdapter(),
  });
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/London";
  const agent = new HostAgentOrchestrator(runtime, new HeuristicIntentInterpreter(), {
    defaultTimezone: timezone,
    defaultCurrency: "GBP",
    idFactory: () => `host-${crypto.randomUUID()}`,
  });

  const clearHostEventData = (): number => {
    const keys: string[] = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key && (key === ACTIVE_EVENT_KEY || key.startsWith(EVENT_STORAGE_PREFIX))) keys.push(key);
    }
    for (const key of keys) storage.removeItem(key);
    return keys.length;
  };

  return {
    agent,
    storageMode: mode,
    activeEventId: () => storage.getItem(ACTIVE_EVENT_KEY),
    rememberEvent: (eventId) => storage.setItem(ACTIVE_EVENT_KEY, eventId),
    forgetEvent: () => storage.removeItem(ACTIVE_EVENT_KEY),
    clearHostEventData,
  };
}
