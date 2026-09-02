import assert from "node:assert/strict";
import test from "node:test";
import {
  HostApplicationReadService,
  deriveOperatingProjection,
} from "../dist/src/application/index.js";
import { HostDomainEngine } from "../dist/src/domain/index.js";
import { JsonStoragePersistenceAdapter, MemoryStorage } from "../dist/src/persistence/index.js";
import { baseMenu } from "./fixtures.mjs";

const START_AT = "2026-10-10T19:00:00.000Z";

function createEngine(id) {
  return new HostDomainEngine({
    id,
    name: "Saturday dinner",
    startAt: START_AT,
    timezone: "Europe/London",
    guestCount: 6,
    budget: 120,
    currency: "GBP",
    constraints: [],
    preferences: ["limited same-day cooking"],
  }, "2026-09-02T09:00:00.000Z");
}

function exactInventory() {
  return [
    { itemId: "pasta", name: "Pasta", quantity: 600, unit: "g", confirmedAt: "2026-09-02T09:10:00.000Z", source: "user" },
    { itemId: "tomatoes", name: "Tomatoes", quantity: 1500, unit: "g", confirmedAt: "2026-09-02T09:10:00.000Z", source: "user" },
    { itemId: "onion", name: "Onion", quantity: 2, unit: "each", confirmedAt: "2026-09-02T09:10:00.000Z", source: "user" },
    { itemId: "lettuce", name: "Lettuce", quantity: 1, unit: "each", confirmedAt: "2026-09-02T09:10:00.000Z", source: "user" },
  ];
}

async function savedService(state, savedAt = "2026-09-02T09:30:00.000Z") {
  const storage = new MemoryStorage();
  const persistence = new JsonStoragePersistenceAdapter(storage);
  await persistence.save(state, savedAt);
  return { storage, persistence, service: new HostApplicationReadService(persistence) };
}

async function projectionFor(state, context = {}) {
  const { service } = await savedService(state);
  const projection = await service.readProjection(state.event.id, context);
  assert.ok(projection);
  return projection;
}

test("empty operating projection stays in intake and asks for an event", () => {
  const projection = deriveOperatingProjection(null);
  assert.equal(projection.customerStage, "intake");
  assert.equal(projection.attention.kind, "missing_input");
  assert.equal(projection.attention.customerActionRequired, true);
  assert.equal(projection.event, undefined);
  assert.equal(projection.timing.health, "not_evaluated");
});

test("read service returns a sanitized clone and never mutates persisted Host state", async () => {
  const engine = createEngine("projection-sanitized");
  const committed = engine.commitMenu(baseMenu, 1, "2026-09-02T09:05:00.000Z");
  const { persistence, service } = await savedService(committed);
  const before = await persistence.load(committed.event.id);
  assert.ok(before);

  const source = await service.readSource(committed.event.id);
  assert.ok(source);
  assert.equal("audit" in source, false);
  assert.equal("undo" in source, false);
  assert.equal("menus" in source, false);
  assert.equal(source.selectedMenu?.id, baseMenu.id);
  assert.deepEqual(source.reversibleReceiptIds, [committed.receipts.at(-1).id]);

  source.event.name = "Tampered projection";
  source.shopping.push({
    itemId: "fake",
    name: "Fake",
    requiredQuantity: 1,
    onHandQuantity: 0,
    toBuyQuantity: 1,
    unit: "each",
    status: "needed",
    candidateProducts: [],
  });

  const after = await persistence.load(committed.event.id);
  assert.ok(after);
  assert.equal(after.state.event.name, "Saturday dinner");
  assert.equal(after.state.shopping.length, 0);
  assert.equal(after.state.event.revision, before.state.event.revision);
  assert.equal(after.stateSha256, before.stateSha256);
});

test("uncommitted event projects PLAN with menu as the deterministic attention item", async () => {
  const engine = createEngine("projection-plan");
  const projection = await projectionFor(engine.snapshot());
  assert.equal(projection.customerStage, "plan");
  assert.equal(projection.attention.kind, "menu");
  assert.match(projection.statusSentence, /menu still needs to be chosen/i);
});

test("committed menu asks for inventory review before shopping is treated as authoritative", async () => {
  const engine = createEngine("projection-inventory");
  const state = engine.commitMenu(baseMenu, 1, "2026-09-02T09:05:00.000Z");
  const projection = await projectionFor(state);
  assert.equal(projection.customerStage, "shop");
  assert.equal(projection.attention.kind, "inventory");
  assert.equal(projection.attention.customerActionRequired, true);
  assert.equal(projection.inventoryCoverage.requiredIngredientLines, 4);
  assert.equal(projection.inventoryCoverage.coverageEvaluated, false);
});

test("explicitly completed inventory review exposes shopping calculation as a low-risk next step", async () => {
  const engine = createEngine("projection-shopping-next");
  const state = engine.commitMenu(baseMenu, 1, "2026-09-02T09:05:00.000Z");
  const projection = await projectionFor(state, { inventoryConfirmed: true });
  assert.equal(projection.attention.kind, "shopping");
  assert.equal(projection.attention.customerActionRequired, false);
});

test("shopping projection distinguishes unresolved and covered lines from authoritative shopping state", async () => {
  const engine = createEngine("projection-shopping-summary");
  let state = engine.commitMenu(baseMenu, 1, "2026-09-02T09:05:00.000Z");
  state = engine.recordInventory([
    { itemId: "lettuce", name: "Lettuce", quantity: 1, unit: "each", confirmedAt: "2026-09-02T09:10:00.000Z", source: "user" },
  ], state.event.revision);
  state = engine.calculateShoppingPlan(state.event.revision);

  const projection = await projectionFor(state, { inventoryConfirmed: true });
  assert.equal(projection.shopping.totalLines, 4);
  assert.equal(projection.shopping.coveredLines, 1);
  assert.equal(projection.shopping.unresolvedLines, 3);
  assert.equal(projection.attention.kind, "shopping");
  assert.equal(projection.inventoryCoverage.coverageEvaluated, true);
});

test("resolved shopping with no prep graph projects PREP and requests run-sheet construction", async () => {
  const engine = createEngine("projection-prep-build");
  let state = engine.commitMenu(baseMenu, 1, "2026-09-02T09:05:00.000Z");
  state = engine.recordInventory(exactInventory(), state.event.revision);
  state = engine.calculateShoppingPlan(state.event.revision);

  const projection = await projectionFor(state, { inventoryConfirmed: true });
  assert.equal(projection.customerStage, "prep");
  assert.equal(projection.shopping.unresolvedLines, 0);
  assert.equal(projection.attention.kind, "preparation");
  assert.equal(projection.attention.customerActionRequired, false);
  assert.equal(projection.readiness.isReady, false);
});

test("built preparation graph exposes deterministic task counts and earliest ready action", async () => {
  const engine = createEngine("projection-prep-ready-task");
  let state = engine.commitMenu(baseMenu, 1, "2026-09-02T09:05:00.000Z");
  state = engine.recordInventory(exactInventory(), state.event.revision);
  state = engine.calculateShoppingPlan(state.event.revision);
  state = engine.buildPreparationPlan(state.event.revision);

  const projection = await projectionFor(state, { inventoryConfirmed: true });
  assert.equal(projection.preparation.totalTasks, 3);
  assert.equal(projection.preparation.readyTasks, 2);
  assert.equal(projection.preparation.blockedTasks, 1);
  assert.equal(projection.nextAction?.id, "make-sauce");
  assert.equal(projection.attention.kind, "task");
  assert.equal(projection.attention.relatedId, "make-sauce");
});

test("all required prep plus resolved shopping derives READY without changing domain EventStatus", async () => {
  const engine = createEngine("projection-ready");
  let state = engine.commitMenu(baseMenu, 1, "2026-09-02T09:05:00.000Z");
  state = engine.recordInventory(exactInventory(), state.event.revision);
  state = engine.calculateShoppingPlan(state.event.revision);
  state = engine.buildPreparationPlan(state.event.revision);
  state = engine.markTaskComplete("make-sauce", state.event.revision, "2026-10-10T18:00:00.000Z");
  state = engine.markTaskComplete("boil-pasta", state.event.revision, "2026-10-10T18:20:00.000Z");
  state = engine.markTaskComplete("prep-salad", state.event.revision, "2026-10-10T18:30:00.000Z");

  const projection = await projectionFor(state, { inventoryConfirmed: true });
  assert.equal(state.event.status, "planned");
  assert.equal(projection.customerStage, "ready");
  assert.equal(projection.readiness.isReady, true);
  assert.equal(projection.attention.kind, "ready");
  assert.equal(projection.attention.customerActionRequired, false);
});

test("completed prep cannot derive READY while authoritative shopping remains unresolved", async () => {
  const engine = createEngine("projection-not-ready-shopping");
  let state = engine.commitMenu(baseMenu, 1, "2026-09-02T09:05:00.000Z");
  state = engine.calculateShoppingPlan(state.event.revision);
  state = engine.buildPreparationPlan(state.event.revision);
  state = engine.markTaskComplete("make-sauce", state.event.revision, "2026-10-10T18:00:00.000Z");
  state = engine.markTaskComplete("boil-pasta", state.event.revision, "2026-10-10T18:20:00.000Z");
  state = engine.markTaskComplete("prep-salad", state.event.revision, "2026-10-10T18:30:00.000Z");

  const projection = await projectionFor(state, { inventoryConfirmed: true });
  assert.notEqual(projection.customerStage, "ready");
  assert.equal(projection.readiness.isReady, false);
  assert.equal(projection.attention.kind, "shopping");
});

test("pending confirmation deterministically outranks failure, change review and normal work", async () => {
  const engine = createEngine("projection-confirmation-priority");
  let state = engine.commitMenu(baseMenu, 1, "2026-09-02T09:05:00.000Z");
  state = engine.calculateShoppingPlan(state.event.revision);

  const projection = await projectionFor(state, {
    pendingConfirmation: { title: "Confirm menu change", detail: "Review the exact consequence first.", confirmationId: "confirm-1" },
    blockingFailure: { title: "Provider failed", detail: "Nothing was purchased.", receiptId: "receipt-fail" },
    pendingChange: { title: "Review guest update", detail: "Nothing has changed yet.", impactId: "impact-1" },
    inventoryConfirmed: true,
  });
  assert.equal(projection.attention.kind, "confirmation");
  assert.equal(projection.attention.priority, 1);
  assert.equal(projection.attention.relatedId, "confirm-1");
});

test("pending change review outranks ordinary shopping work", async () => {
  const engine = createEngine("projection-change-priority");
  let state = engine.commitMenu(baseMenu, 1, "2026-09-02T09:05:00.000Z");
  state = engine.calculateShoppingPlan(state.event.revision);

  const projection = await projectionFor(state, {
    pendingChange: { title: "Review guest update", detail: "Nothing has changed yet.", impactId: "impact-2" },
    inventoryConfirmed: true,
  });
  assert.equal(projection.attention.kind, "change_review");
  assert.equal(projection.attention.priority, 3);
  assert.equal(projection.attention.relatedId, "impact-2");
});

test("latest failed consequential receipt outranks ordinary work and remains visibly failed", async () => {
  const engine = createEngine("projection-failure-priority");
  let state = engine.commitMenu(baseMenu, 1, "2026-09-02T09:05:00.000Z");
  state = engine.recordFailedAction({
    actionType: "confirm_cart_action",
    expectedRevision: state.event.revision,
    errorCode: "PROVIDER_DOWN",
    summary: "Checkout provider failed. Nothing was marked as purchased.",
    confirmationRequired: true,
    confirmedAt: "2026-09-02T09:20:00.000Z",
    actor: "system",
  });

  const projection = await projectionFor(state, { inventoryConfirmed: true });
  assert.equal(projection.attention.kind, "failure");
  assert.equal(projection.attention.priority, 2);
  assert.match(projection.attention.detail, /Nothing was marked as purchased/i);
  assert.equal(projection.latestReceipt?.status, "failed");
});
