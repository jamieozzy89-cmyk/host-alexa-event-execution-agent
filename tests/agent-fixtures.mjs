import {
  HostToolRuntime,
} from "../dist/src/tools/index.js";
import { JsonStoragePersistenceAdapter, MemoryStorage } from "../dist/src/persistence/index.js";
import {
  createDefaultMenuProposalAdapter,
  DemoProductCatalogueAdapter,
  DeterministicSimulatedCartAdapter,
} from "../dist/src/simulated-services/index.js";
import { HostAgentOrchestrator } from "../dist/src/agent/orchestrator.js";
import { HeuristicIntentInterpreter } from "../dist/src/agent/interpreter.js";

export function makeAgent(options = {}) {
  const storage = new MemoryStorage();
  const persistence = new JsonStoragePersistenceAdapter(storage);
  const cart = options.cart ?? new DeterministicSimulatedCartAdapter();
  const runtime = new HostToolRuntime(persistence, {
    menuProposals: createDefaultMenuProposalAdapter(),
    productCatalogue: new DemoProductCatalogueAdapter(),
    cartActions: cart,
  });
  const now = options.now ?? (() => new Date("2026-09-01T03:00:00.000Z"));
  const agent = new HostAgentOrchestrator(
    runtime,
    options.interpreter ?? new HeuristicIntentInterpreter(),
    {
      now,
      idFactory: options.idFactory ?? (() => options.eventId ?? "agent-dinner"),
      defaultTimezone: "Europe/London",
      defaultCurrency: "GBP",
    },
  );
  return { agent, runtime, storage, persistence, cart };
}

export async function createEvent(agent, conversation = "c1") {
  const result = await agent.handleText(
    conversation,
    "I'm hosting dinner for six people on Saturday at 7pm with a £120 budget, one vegetarian guest and a nut allergy, with limited same-day cooking",
  );
  if (result.status !== "ok") throw new Error(`event setup failed: ${result.speech}`);
  return result;
}

export async function chooseFirstMenu(agent, conversation = "c1") {
  const menuReply = await agent.handleText(conversation, "Show me menu ideas");
  const action = menuReply.actions.find((entry) => entry.type === "choose_menu");
  if (!action) throw new Error("no menu action");
  const confirmation = await agent.handleAction(conversation, action);
  if (confirmation.status !== "needs_confirmation") throw new Error("menu did not require confirmation");
  return agent.handleAction(conversation, { type: "confirm_pending", label: "Confirm" });
}

export async function prepareShopping(agent, conversation = "c1") {
  await createEvent(agent, conversation);
  await chooseFirstMenu(agent, conversation);
  const shopping = await agent.handleText(conversation, "Make my shopping list");
  if (shopping.status !== "ok") throw new Error(`shopping failed: ${shopping.speech}`);
  const products = await agent.handleText(conversation, "Find products");
  if (products.status !== "ok") throw new Error(`products failed: ${products.speech}`);
  return { shopping, products };
}
