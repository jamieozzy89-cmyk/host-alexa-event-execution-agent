import assert from "node:assert/strict";
import test from "node:test";
import {
  HostToolRuntime,
  HOST_TOOL_DESCRIPTORS,
  HOST_TOOL_NAMES,
} from "../dist/src/tools/index.js";
import { DomainError } from "../dist/src/domain/errors.js";
import { JsonStoragePersistenceAdapter, MemoryStorage } from "../dist/src/persistence/index.js";
import {
  createDefaultMenuProposalAdapter,
  DemoProductCatalogueAdapter,
  DeterministicSimulatedCartAdapter,
} from "../dist/src/simulated-services/index.js";

const nutAllergy = {
  id: "allergen-nuts",
  type: "allergen",
  value: "nuts",
  scope: "all guests",
  source: "user",
  confirmed: true,
};

const vegetarian = {
  id: "diet-vegetarian",
  type: "dietary",
  value: "one vegetarian guest",
  scope: "guest",
  source: "user",
  confirmed: true,
};

const vegan = {
  id: "diet-vegan",
  type: "dietary",
  value: "one vegan guest",
  scope: "guest",
  source: "user",
  confirmed: true,
};

function dependencies(cart = new DeterministicSimulatedCartAdapter()) {
  return {
    menuProposals: createDefaultMenuProposalAdapter(),
    productCatalogue: new DemoProductCatalogueAdapter(),
    cartActions: cart,
  };
}

function createInput(id = "tool-dinner") {
  return {
    id,
    name: "Saturday dinner",
    startAt: "2026-10-10T19:00:00.000Z",
    timezone: "Europe/London",
    guestCount: 6,
    budget: 120,
    currency: "GBP",
    constraints: [vegetarian, nutAllergy],
    preferences: ["limited same-day cooking"],
  };
}

async function expectSuccess(result, tool) {
  assert.equal(result.ok, true, result.ok ? undefined : `${tool}: ${result.error?.code} ${result.error?.message}`);
  assert.equal(result.tool, tool);
  return result;
}

async function setupThroughCart(id = "tool-dinner", cart = new DeterministicSimulatedCartAdapter()) {
  const storage = new MemoryStorage();
  const adapter = new JsonStoragePersistenceAdapter(storage);
  const runtime = new HostToolRuntime(adapter, dependencies(cart));

  let result = await runtime.execute({ name: "create_event", input: createInput(id) });
  await expectSuccess(result, "create_event");
  assert.equal(result.revision, 1);

  const proposed = await runtime.execute({ name: "propose_menu", input: { eventId: id, maxOptions: 3 } });
  await expectSuccess(proposed, "propose_menu");
  assert.equal(proposed.stateChanged, false);
  assert.equal(proposed.data.menus.length, 3);
  const menuId = proposed.data.menus[0].id;
  assert.ok(proposed.data.menus.every((menu) => menu.items.every((item) => item.servings >= 6)));

  result = await runtime.execute({
    name: "commit_menu",
    input: { eventId: id, expectedRevision: 1, menuId, confirmedAt: "2026-09-01T01:01:00.000Z" },
  });
  await expectSuccess(result, "commit_menu");
  assert.equal(result.revision, 2);

  result = await runtime.execute({
    name: "record_inventory",
    input: {
      eventId: id,
      expectedRevision: 2,
      items: [
        { itemId: "pasta", name: "Pasta", quantity: 200, unit: "g", confirmedAt: "2026-09-01T01:02:00.000Z", source: "user" },
        { itemId: "lettuce", name: "Lettuce", quantity: 1, unit: "each", confirmedAt: "2026-09-01T01:02:00.000Z", source: "user" },
      ],
    },
  });
  await expectSuccess(result, "record_inventory");
  assert.equal(result.revision, 3);

  result = await runtime.execute({ name: "build_shopping_plan", input: { eventId: id, expectedRevision: 3 } });
  await expectSuccess(result, "build_shopping_plan");
  assert.equal(result.revision, 4);
  assert.ok(result.data.shopping.some((item) => item.toBuyQuantity > 0));

  result = await runtime.execute({ name: "prepare_cart", input: { eventId: id, expectedRevision: 4 } });
  await expectSuccess(result, "prepare_cart");
  assert.equal(result.revision, 5);
  assert.ok(result.data.shopping.filter((item) => item.toBuyQuantity > 0).every((item) => item.status === "selected" && item.selectedProductId));

  return { runtime, storage, adapter, cart, menuId };
}

test("Stage 04 publishes the complete controlled tool surface", () => {
  const expected = [
    "create_event",
    "update_event_constraints",
    "propose_menu",
    "commit_menu",
    "record_inventory",
    "build_shopping_plan",
    "prepare_cart",
    "confirm_cart_action",
    "build_preparation_plan",
    "mark_task_complete",
    "advance_event_status",
    "get_next_action",
    "get_event_status",
    "analyse_change_impact",
    "apply_confirmed_change",
    "get_action_history",
    "undo_reversible_action",
  ];
  assert.deepEqual(HOST_TOOL_NAMES, expected);
  assert.equal(HOST_TOOL_DESCRIPTORS.length, expected.length);
  for (const descriptor of HOST_TOOL_DESCRIPTORS) {
    assert.equal(descriptor.inputSchema.additionalProperties, false);
    assert.ok(descriptor.description.length > 20);
  }
  for (const name of ["commit_menu", "confirm_cart_action", "advance_event_status", "apply_confirmed_change", "undo_reversible_action"]) {
    assert.equal(HOST_TOOL_DESCRIPTORS.find((tool) => tool.name === name)?.requiresExplicitConfirmation, true);
  }
});

test("package application API exposes the tool boundary but not HostDomainEngine", async () => {
  const publicApi = await import("host-alexa-event-execution-agent");
  assert.equal(typeof publicApi.HostToolRuntime, "function");
  assert.equal(typeof publicApi.JsonStoragePersistenceAdapter, "function");
  assert.equal("HostDomainEngine" in publicApi, false);
  assert.equal("validateHostState" in publicApi, false);
});

test("complete shopping and preparation journey is executable through tools only", async () => {
  const { runtime } = await setupThroughCart("tool-full-flow");

  let result = await runtime.execute({
    name: "confirm_cart_action",
    input: { eventId: "tool-full-flow", expectedRevision: 5, confirmedAt: "2026-09-01T01:05:00.000Z" },
  });
  await expectSuccess(result, "confirm_cart_action");
  assert.equal(result.revision, 6);
  assert.ok(result.data.shopping.filter((item) => item.toBuyQuantity > 0).every((item) => item.status === "simulated_purchased"));

  result = await runtime.execute({ name: "build_preparation_plan", input: { eventId: "tool-full-flow", expectedRevision: 6 } });
  await expectSuccess(result, "build_preparation_plan");
  assert.equal(result.revision, 7);
  assert.ok(Object.keys(result.data.tasks).length >= 3);

  const next = await runtime.execute({ name: "get_next_action", input: { eventId: "tool-full-flow" } });
  await expectSuccess(next, "get_next_action");
  assert.ok(next.data.nextAction);
  assert.equal(next.stateChanged, false);

  result = await runtime.execute({
    name: "mark_task_complete",
    input: {
      eventId: "tool-full-flow",
      expectedRevision: 7,
      taskId: next.data.nextAction.id,
      completedAt: "2026-10-10T17:40:00.000Z",
    },
  });
  await expectSuccess(result, "mark_task_complete");
  assert.equal(result.revision, 8);

  const status = await runtime.execute({ name: "get_event_status", input: { eventId: "tool-full-flow" } });
  await expectSuccess(status, "get_event_status");
  assert.equal(status.data.event.status, "sourcing");
  assert.equal(status.data.tasks.done, 1);
  assert.equal(status.data.shopping.unresolvedLines, 0);

  const history = await runtime.execute({ name: "get_action_history", input: { eventId: "tool-full-flow", limit: 100 } });
  await expectSuccess(history, "get_action_history");
  assert.ok(history.data.receipts.some((receipt) => receipt.actionType === "confirm_cart_action" && receipt.status === "succeeded"));
  assert.ok(history.data.receipts.some((receipt) => receipt.actionType === "mark_task_complete"));
});

test("late guest change previews a correctly scaled menu, analyses read-only, applies and can be safely undone", async () => {
  const { runtime } = await setupThroughCart("tool-replan");
  let result = await runtime.execute({
    name: "build_preparation_plan",
    input: { eventId: "tool-replan", expectedRevision: 5 },
  });
  await expectSuccess(result, "build_preparation_plan");
  assert.equal(result.revision, 6);

  const preview = await runtime.execute({
    name: "propose_menu",
    input: { eventId: "tool-replan", guestCount: 7, additionalConstraints: [vegan], maxOptions: 3 },
  });
  await expectSuccess(preview, "propose_menu");
  assert.ok(preview.data.menus.every((menu) => menu.items.every((item) => item.servings >= 7)));
  const replacementMenuId = preview.data.menus[0].id;

  const impactResult = await runtime.execute({
    name: "analyse_change_impact",
    input: {
      eventId: "tool-replan",
      expectedRevision: 6,
      guestCount: 7,
      addConstraints: [vegan],
      replacementMenuId,
    },
  });
  await expectSuccess(impactResult, "analyse_change_impact");
  assert.equal(impactResult.stateChanged, false);
  assert.equal(impactResult.revision, 6);
  assert.equal(impactResult.data.impact.proposedEvent.guestCount, 7);
  assert.equal(impactResult.data.impact.proposedMenus[replacementMenuId].items.every((item) => item.servings >= 7), true);

  const impactId = impactResult.data.impact.id;
  result = await runtime.execute({
    name: "apply_confirmed_change",
    input: {
      eventId: "tool-replan",
      expectedRevision: 6,
      impactId,
      confirmedAt: "2026-09-01T01:10:00.000Z",
    },
  });
  await expectSuccess(result, "apply_confirmed_change");
  assert.equal(result.revision, 7);
  assert.equal(result.data.event.guestCount, 7);
  assert.equal(result.data.event.constraints.some((constraint) => constraint.id === vegan.id), true);

  const history = await runtime.execute({ name: "get_action_history", input: { eventId: "tool-replan", limit: 100 } });
  await expectSuccess(history, "get_action_history");
  assert.equal(history.data.reversibleReceiptIds.length, 1);
  const receiptId = history.data.reversibleReceiptIds[0];

  result = await runtime.execute({
    name: "undo_reversible_action",
    input: {
      eventId: "tool-replan",
      expectedRevision: 7,
      receiptId,
      confirmedAt: "2026-09-01T01:11:00.000Z",
    },
  });
  await expectSuccess(result, "undo_reversible_action");
  assert.equal(result.revision, 8);
  assert.equal(result.data.event.guestCount, 6);
  assert.equal(result.data.event.constraints.some((constraint) => constraint.id === vegan.id), false);

  const afterHistory = await runtime.execute({ name: "get_action_history", input: { eventId: "tool-replan", limit: 100 } });
  await expectSuccess(afterHistory, "get_action_history");
  const reversed = afterHistory.data.receipts.find((receipt) => receipt.id === receiptId);
  assert.equal(reversed.status, "reversed");
  assert.ok(afterHistory.data.receipts.some((receipt) => receipt.actionType === "undo_reversible_action" && receipt.status === "succeeded"));
});

test("undo refuses an older reversible action after a later revision", async () => {
  const storage = new MemoryStorage();
  const runtime = new HostToolRuntime(new JsonStoragePersistenceAdapter(storage), dependencies());
  await expectSuccess(await runtime.execute({ name: "create_event", input: createInput("undo-order") }), "create_event");
  const proposals = await runtime.execute({ name: "propose_menu", input: { eventId: "undo-order" } });
  await expectSuccess(proposals, "propose_menu");
  await expectSuccess(await runtime.execute({
    name: "commit_menu",
    input: { eventId: "undo-order", expectedRevision: 1, menuId: proposals.data.menus[0].id, confirmedAt: "2026-09-01T01:01:00.000Z" },
  }), "commit_menu");

  const historyAtTwo = await runtime.execute({ name: "get_action_history", input: { eventId: "undo-order", limit: 20 } });
  const commitReceiptId = historyAtTwo.data.reversibleReceiptIds[0];
  await expectSuccess(await runtime.execute({ name: "build_shopping_plan", input: { eventId: "undo-order", expectedRevision: 2 } }), "build_shopping_plan");

  const undo = await runtime.execute({
    name: "undo_reversible_action",
    input: { eventId: "undo-order", expectedRevision: 3, receiptId: commitReceiptId, confirmedAt: "2026-09-01T01:03:00.000Z" },
  });
  assert.equal(undo.ok, false);
  assert.equal(undo.error.code, "UNDO_NOT_LATEST_REVISION");
  assert.equal(undo.stateChanged, false);
});

test("simulated checkout failure is persisted as failed history and never claimed as purchase", async () => {
  const cart = new DeterministicSimulatedCartAdapter();
  const { runtime } = await setupThroughCart("cart-failure", cart);
  cart.failNext("SIMULATED_PROVIDER_DOWN", "The simulated grocery provider is unavailable.");

  let result = await runtime.execute({
    name: "confirm_cart_action",
    input: { eventId: "cart-failure", expectedRevision: 5, confirmedAt: "2026-09-01T01:05:00.000Z" },
  });
  assert.equal(result.ok, false);
  assert.equal(result.stateChanged, true);
  assert.equal(result.revision, 5);
  assert.equal(result.error.code, "SIMULATED_PROVIDER_DOWN");

  const status = await runtime.execute({ name: "get_event_status", input: { eventId: "cart-failure" } });
  await expectSuccess(status, "get_event_status");
  assert.ok(status.data.shopping.selectedLines > 0);
  assert.equal(status.data.shopping.purchasedLines, 0);

  const history = await runtime.execute({ name: "get_action_history", input: { eventId: "cart-failure", limit: 100 } });
  await expectSuccess(history, "get_action_history");
  assert.ok(history.data.receipts.some((receipt) => receipt.actionType === "confirm_cart_action" && receipt.status === "failed" && receipt.errorCode === "SIMULATED_PROVIDER_DOWN"));

  result = await runtime.execute({
    name: "confirm_cart_action",
    input: { eventId: "cart-failure", expectedRevision: 5, confirmedAt: "2026-09-01T01:06:00.000Z" },
  });
  await expectSuccess(result, "confirm_cart_action");
  assert.equal(result.revision, 6);
});

test("strict tool input validation rejects unsupported fields without touching state", async () => {
  const storage = new MemoryStorage();
  const runtime = new HostToolRuntime(new JsonStoragePersistenceAdapter(storage), dependencies());
  await expectSuccess(await runtime.execute({ name: "create_event", input: createInput("input-guard") }), "create_event");

  const result = await runtime.execute({
    name: "get_event_status",
    input: { eventId: "input-guard", pretendCompleted: true },
  });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "TOOL_INPUT_INVALID");
  assert.equal(result.stateChanged, false);

  const status = await runtime.execute({ name: "get_event_status", input: { eventId: "input-guard" } });
  assert.equal(status.revision, 1);
});

test("pending change impacts do not become executable after a fresh runtime restart", async () => {
  const storage = new MemoryStorage();
  const adapter = new JsonStoragePersistenceAdapter(storage);
  const runtime = new HostToolRuntime(adapter, dependencies());
  await expectSuccess(await runtime.execute({ name: "create_event", input: createInput("runtime-restart") }), "create_event");
  const proposal = await runtime.execute({ name: "propose_menu", input: { eventId: "runtime-restart" } });
  await expectSuccess(proposal, "propose_menu");
  await expectSuccess(await runtime.execute({
    name: "commit_menu",
    input: { eventId: "runtime-restart", expectedRevision: 1, menuId: proposal.data.menus[0].id, confirmedAt: "2026-09-01T01:01:00.000Z" },
  }), "commit_menu");
  const future = await runtime.execute({ name: "propose_menu", input: { eventId: "runtime-restart", guestCount: 7, additionalConstraints: [vegan] } });
  await expectSuccess(future, "propose_menu");
  const impact = await runtime.execute({
    name: "analyse_change_impact",
    input: { eventId: "runtime-restart", expectedRevision: 2, guestCount: 7, addConstraints: [vegan], replacementMenuId: future.data.menus[0].id },
  });
  await expectSuccess(impact, "analyse_change_impact");

  const freshRuntime = new HostToolRuntime(new JsonStoragePersistenceAdapter(storage), dependencies());
  const apply = await freshRuntime.execute({
    name: "apply_confirmed_change",
    input: { eventId: "runtime-restart", expectedRevision: 2, impactId: impact.data.impact.id, confirmedAt: "2026-09-01T01:02:00.000Z" },
  });
  assert.equal(apply.ok, false);
  assert.equal(apply.error.code, "UNKNOWN_CHANGE_IMPACT");
  assert.equal(apply.stateChanged, false);
});

test("menu commitment rejects a proposal that cannot serve the current guest count", async () => {
  const undersized = {
    id: "undersized",
    name: "Undersized",
    items: [{
      id: "small",
      name: "Small dish",
      servings: 2,
      estimatedPrepMinutes: 5,
      estimatedCookMinutes: 5,
      constraintTags: ["vegetarian", "nut-free"],
      ingredients: [{ itemId: "small-item", name: "Small item", quantity: 1, unit: "each" }],
      taskTemplates: [{ id: "small-task", title: "Prepare small dish", category: "prep", durationMinutes: 5, dependencies: [], dueOffsetMinutes: 10 }],
    }],
  };
  const menuAdapter = { async proposeMenus() { return [undersized]; } };
  const storage = new MemoryStorage();
  const runtime = new HostToolRuntime(new JsonStoragePersistenceAdapter(storage), {
    ...dependencies(),
    menuProposals: menuAdapter,
  });
  await expectSuccess(await runtime.execute({ name: "create_event", input: createInput("serving-guard") }), "create_event");
  const proposal = await runtime.execute({ name: "propose_menu", input: { eventId: "serving-guard" } });
  assert.equal(proposal.ok, false);
  assert.equal(proposal.error.code, "MENU_INSUFFICIENT_SERVINGS");
  assert.equal(proposal.stateChanged, false);
  assert.equal(proposal.revision, 1);
});

class FailAfterInitialSaveAdapter {
  constructor(inner) {
    this.inner = inner;
    this.saveCount = 0;
  }
  async save(state, savedAt) {
    this.saveCount += 1;
    if (this.saveCount === 2) throw new Error("Injected checkpoint failure");
    return this.inner.save(state, savedAt);
  }
  load(eventId) { return this.inner.load(eventId); }
  remove(eventId) { return this.inner.remove(eventId); }
}

test("tool mutation rolls live state back when persistence checkpoint fails", async () => {
  const storage = new MemoryStorage();
  const baseAdapter = new JsonStoragePersistenceAdapter(storage);
  const failingAdapter = new FailAfterInitialSaveAdapter(baseAdapter);
  const runtime = new HostToolRuntime(failingAdapter, dependencies());
  await expectSuccess(await runtime.execute({ name: "create_event", input: createInput("checkpoint-rollback") }), "create_event");
  const proposal = await runtime.execute({ name: "propose_menu", input: { eventId: "checkpoint-rollback" } });
  await expectSuccess(proposal, "propose_menu");

  const commit = await runtime.execute({
    name: "commit_menu",
    input: { eventId: "checkpoint-rollback", expectedRevision: 1, menuId: proposal.data.menus[0].id, confirmedAt: "2026-09-01T01:01:00.000Z" },
  });
  assert.equal(commit.ok, false);
  assert.equal(commit.error.code, "PERSISTENCE_CHECKPOINT_FAILED");
  assert.equal(commit.stateChanged, false);

  const status = await runtime.execute({ name: "get_event_status", input: { eventId: "checkpoint-rollback" } });
  await expectSuccess(status, "get_event_status");
  assert.equal(status.revision, 1);
  assert.equal(status.data.event.status, "draft");
  assert.equal(status.data.event.selectedMenuId, undefined);

  const loaded = await baseAdapter.load("checkpoint-rollback");
  assert.equal(loaded.state.event.revision, 1);
});


test("unknown tool names fail structurally instead of falling through", async () => {
  const runtime = new HostToolRuntime(new JsonStoragePersistenceAdapter(new MemoryStorage()), dependencies());
  const result = await runtime.execute({ name: "not_a_host_tool", input: {} });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "TOOL_NOT_FOUND");
  assert.equal(result.stateChanged, false);
});

test("application package blocks direct domain-engine subpath import", async () => {
  await assert.rejects(
    import("host-alexa-event-execution-agent/dist/src/domain/engine.js"),
    (error) => error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED",
  );
});

test("guest counts are integer-valued at the tool boundary", async () => {
  const runtime = new HostToolRuntime(new JsonStoragePersistenceAdapter(new MemoryStorage()), dependencies());
  const fractional = createInput("fractional-guests");
  fractional.guestCount = 6.5;
  const result = await runtime.execute({ name: "create_event", input: fractional });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "TOOL_INPUT_INVALID");
  assert.equal(result.stateChanged, false);
});

test("confirmation timestamps must be parseable at the tool boundary", async () => {
  const runtime = new HostToolRuntime(new JsonStoragePersistenceAdapter(new MemoryStorage()), dependencies());
  await expectSuccess(await runtime.execute({ name: "create_event", input: createInput("bad-confirmation-time") }), "create_event");
  const proposals = await runtime.execute({ name: "propose_menu", input: { eventId: "bad-confirmation-time" } });
  await expectSuccess(proposals, "propose_menu");
  const result = await runtime.execute({
    name: "commit_menu",
    input: { eventId: "bad-confirmation-time", expectedRevision: 1, menuId: proposals.data.menus[0].id, confirmedAt: "not-a-date" },
  });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "TOOL_INPUT_INVALID");
  assert.equal(result.revision, 1);
});

test("material lifecycle transitions require explicit confirmation at the tool boundary", async () => {
  const runtime = new HostToolRuntime(new JsonStoragePersistenceAdapter(new MemoryStorage()), dependencies());
  await expectSuccess(await runtime.execute({ name: "create_event", input: createInput("status-confirmation") }), "create_event");
  const proposals = await runtime.execute({ name: "propose_menu", input: { eventId: "status-confirmation" } });
  await expectSuccess(proposals, "propose_menu");
  await expectSuccess(await runtime.execute({
    name: "commit_menu",
    input: { eventId: "status-confirmation", expectedRevision: 1, menuId: proposals.data.menus[0].id, confirmedAt: "2026-09-01T01:01:00.000Z" },
  }), "commit_menu");

  const missing = await runtime.execute({
    name: "advance_event_status",
    input: { eventId: "status-confirmation", expectedRevision: 2, nextStatus: "sourcing" },
  });
  assert.equal(missing.ok, false);
  assert.equal(missing.error.code, "TOOL_INPUT_INVALID");
  assert.equal(missing.revision, 2);

  const confirmed = await runtime.execute({
    name: "advance_event_status",
    input: { eventId: "status-confirmation", expectedRevision: 2, nextStatus: "sourcing", confirmedAt: "2026-09-01T01:02:00.000Z" },
  });
  await expectSuccess(confirmed, "advance_event_status");
  assert.equal(confirmed.revision, 3);
  assert.equal(confirmed.data.event.status, "sourcing");
});

class WrongTotalCartAdapter {
  async checkout(params) {
    return { ok: true, reference: `WRONG-${params.eventId}`, total: 0.01, currency: params.currency };
  }
}

test("checkout success is rejected when adapter total does not reconcile to selected lines", async () => {
  const { runtime } = await setupThroughCart("wrong-cart-total", new WrongTotalCartAdapter());
  const result = await runtime.execute({
    name: "confirm_cart_action",
    input: { eventId: "wrong-cart-total", expectedRevision: 5, confirmedAt: "2026-09-01T01:05:00.000Z" },
  });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "CART_RESULT_INVALID");
  assert.equal(result.stateChanged, true);
  assert.equal(result.revision, 5);
  assert.equal(result.data.receipt.status, "failed");
  assert.equal(result.data.receipt.errorCode, "CART_RESULT_INVALID");

  const status = await runtime.execute({ name: "get_event_status", input: { eventId: "wrong-cart-total" } });
  await expectSuccess(status, "get_event_status");
  assert.equal(status.data.shopping.purchasedLines, 0);
  assert.ok(status.data.shopping.selectedLines > 0);
});


class ThrowingCartAdapter {
  async checkout() {
    throw new Error("Injected provider exception");
  }
}

test("checkout adapter exceptions create durable failed-action history", async () => {
  const { runtime } = await setupThroughCart("throwing-cart", new ThrowingCartAdapter());
  const result = await runtime.execute({
    name: "confirm_cart_action",
    input: { eventId: "throwing-cart", expectedRevision: 5, confirmedAt: "2026-09-01T01:05:00.000Z" },
  });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "SIMULATED_CHECKOUT_ADAPTER_ERROR");
  assert.equal(result.stateChanged, true);
  assert.equal(result.revision, 5);
  assert.equal(result.data.receipt.status, "failed");

  const history = await runtime.execute({ name: "get_action_history", input: { eventId: "throwing-cart", limit: 100 } });
  await expectSuccess(history, "get_action_history");
  assert.ok(history.data.receipts.some((receipt) => receipt.errorCode === "SIMULATED_CHECKOUT_ADAPTER_ERROR" && receipt.status === "failed"));
});

test("constraint updates mutate authoritative state only through the tool boundary", async () => {
  const runtime = new HostToolRuntime(new JsonStoragePersistenceAdapter(new MemoryStorage()), dependencies());
  await expectSuccess(await runtime.execute({ name: "create_event", input: createInput("constraint-tool") }), "create_event");
  const result = await runtime.execute({
    name: "update_event_constraints",
    input: { eventId: "constraint-tool", expectedRevision: 1, constraints: [vegan] },
  });
  await expectSuccess(result, "update_event_constraints");
  assert.equal(result.revision, 2);
  assert.equal(result.data.event.constraints.some((constraint) => constraint.id === vegan.id), true);

  const resumed = await runtime.execute({ name: "get_event_status", input: { eventId: "constraint-tool" } });
  await expectSuccess(resumed, "get_event_status");
  assert.equal(resumed.data.event.constraints.some((constraint) => constraint.id === vegan.id), true);
});
