import {
  createDefaultMenuProposalAdapter,
  DemoProductCatalogueAdapter,
  DeterministicSimulatedCartAdapter,
  HeuristicIntentInterpreter,
  HostAgentOrchestrator,
  HostToolRuntime,
  JsonStoragePersistenceAdapter,
} from "../src/application/index.js";

const ACTIVE_EVENT_KEY = "host:ui:active-event";

export interface BrowserHostRuntime {
  agent: HostAgentOrchestrator;
  activeEventId(): string | null;
  rememberEvent(eventId: string): void;
  forgetEvent(): void;
}

export function createBrowserHostRuntime(storage: Storage = window.localStorage): BrowserHostRuntime {
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

  return {
    agent,
    activeEventId: () => storage.getItem(ACTIVE_EVENT_KEY),
    rememberEvent: (eventId) => storage.setItem(ACTIVE_EVENT_KEY, eventId),
    forgetEvent: () => storage.removeItem(ACTIVE_EVENT_KEY),
  };
}
