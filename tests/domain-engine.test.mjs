import assert from "node:assert/strict";
import test from "node:test";
import { DomainError, HostDomainEngine, StaleRevisionError } from "../dist/src/domain/index.js";
import { baseMenu, nutAllergy, vegan, veganAdjustedMenu, vegetarian } from "./fixtures.mjs";

function newEngine() {
  return new HostDomainEngine(
    {
      id: "event-1",
      name: "Saturday dinner",
      startAt: "2026-10-10T19:00:00.000Z",
      timezone: "Europe/London",
      guestCount: 6,
      budget: 120,
      currency: "GBP",
      constraints: [vegetarian, nutAllergy],
      preferences: ["limited same-day cooking"],
    },
    "2026-09-01T02:00:00.000Z",
  );
}

test("creates authoritative event state at revision 1", () => {
  const engine = newEngine();
  const state = engine.snapshot();
  assert.equal(state.event.revision, 1);
  assert.equal(state.event.status, "draft");
  assert.equal(state.receipts.at(-1)?.actionType, "create_event");
  assert.equal(state.audit.at(-1)?.afterRevision, 1);
});

test("menu commitment requires confirmation and advances revision/state", () => {
  const engine = newEngine();
  assert.throws(() => engine.commitMenu(baseMenu, 1), (error) => {
    assert.ok(error instanceof DomainError);
    assert.equal(error.code, "CONFIRMATION_REQUIRED");
    return true;
  });
  const state = engine.commitMenu(baseMenu, 1, "2026-09-01T02:01:00.000Z");
  assert.equal(state.event.revision, 2);
  assert.equal(state.event.status, "planned");
  assert.equal(state.event.selectedMenuId, baseMenu.id);
  assert.equal(state.receipts.at(-1)?.confirmationRequired, true);
});

test("rejects stale revisions instead of overwriting newer state", () => {
  const engine = newEngine();
  engine.commitMenu(baseMenu, 1, "2026-09-01T02:01:00.000Z");
  assert.throws(() => engine.addConstraints([vegan], 1), (error) => {
    assert.ok(error instanceof StaleRevisionError);
    assert.equal(error.code, "STALE_REVISION");
    return true;
  });
  assert.equal(engine.snapshot().event.constraints.some((c) => c.id === vegan.id), false);
});

test("shopping deficit equals required minus confirmed inventory", () => {
  const engine = newEngine();
  let state = engine.commitMenu(baseMenu, 1, "2026-09-01T02:01:00.000Z");
  const inventory = [
    { itemId: "pasta", name: "Pasta", quantity: 200, unit: "g", confirmedAt: "2026-09-01T02:02:00.000Z", source: "user" },
    { itemId: "tomatoes", name: "Tomatoes", quantity: 500, unit: "g", confirmedAt: "2026-09-01T02:02:00.000Z", source: "user" },
    { itemId: "lettuce", name: "Lettuce", quantity: 1, unit: "each", confirmedAt: "2026-09-01T02:02:00.000Z", source: "user" },
  ];
  state = engine.recordInventory(inventory, state.event.revision);
  state = engine.calculateShoppingPlan(state.event.revision);
  const byId = new Map(state.shopping.map((item) => [item.itemId, item]));
  assert.equal(byId.get("pasta")?.requiredQuantity, 600);
  assert.equal(byId.get("pasta")?.toBuyQuantity, 400);
  assert.equal(byId.get("tomatoes")?.requiredQuantity, 1500);
  assert.equal(byId.get("tomatoes")?.toBuyQuantity, 1000);
  assert.equal(byId.get("lettuce")?.toBuyQuantity, 0);
  assert.equal(byId.get("lettuce")?.status, "covered");
});

test("unit mismatch fails rather than guessing a conversion", () => {
  const engine = newEngine();
  let state = engine.commitMenu(baseMenu, 1, "2026-09-01T02:01:00.000Z");
  state = engine.recordInventory(
    [{ itemId: "pasta", name: "Pasta", quantity: 1, unit: "kg", confirmedAt: "2026-09-01T02:02:00.000Z", source: "user" }],
    state.event.revision,
  );
  assert.throws(() => engine.calculateShoppingPlan(state.event.revision), (error) => {
    assert.ok(error instanceof DomainError);
    assert.equal(error.code, "UNIT_MISMATCH");
    return true;
  });
});

test("preparation graph blocks dependent tasks and unlocks them after completion", () => {
  const engine = newEngine();
  let state = engine.commitMenu(baseMenu, 1, "2026-09-01T02:01:00.000Z");
  state = engine.buildPreparationPlan(state.event.revision);
  assert.equal(state.tasks["make-sauce"]?.status, "ready");
  assert.equal(state.tasks["boil-pasta"]?.status, "blocked");
  assert.throws(() => engine.markTaskComplete("boil-pasta", state.event.revision), (error) => {
    assert.ok(error instanceof DomainError);
    assert.equal(error.code, "TASK_DEPENDENCY_BLOCKED");
    return true;
  });
  state = engine.markTaskComplete("make-sauce", state.event.revision, "2026-10-10T18:10:00.000Z");
  assert.equal(state.tasks["make-sauce"]?.status, "done");
  assert.equal(state.tasks["boil-pasta"]?.status, "ready");
});

test("event lifecycle rejects invalid transitions", () => {
  const engine = newEngine();
  assert.throws(() => engine.advanceEventStatus("live", 1), (error) => {
    assert.ok(error instanceof DomainError);
    assert.equal(error.code, "INVALID_STATE_TRANSITION");
    return true;
  });
});

test("impact analysis is read-only and reports bounded change", () => {
  const engine = newEngine();
  let state = engine.commitMenu(baseMenu, 1, "2026-09-01T02:01:00.000Z");
  state = engine.recordInventory(
    [{ itemId: "pasta", name: "Pasta", quantity: 200, unit: "g", confirmedAt: "2026-09-01T02:02:00.000Z", source: "user" }],
    state.event.revision,
  );
  state = engine.calculateShoppingPlan(state.event.revision);
  state = engine.buildPreparationPlan(state.event.revision);
  const before = engine.snapshot();
  const impact = engine.analyseChangeImpact(
    { guestCount: 7, addConstraints: [vegan], replacementMenu: veganAdjustedMenu },
    before.event.revision,
    "2026-09-01T02:10:00.000Z",
  );
  const after = engine.snapshot();
  assert.deepEqual(after, before);
  assert.equal(impact.delta.guestCountChanged, true);
  assert.deepEqual(impact.delta.constraintsAdded, ["diet-vegan"]);
  assert.equal(impact.delta.menuChanged, true);
  assert.ok(impact.delta.addedTaskIds.includes("prep-vegan-dessert"));
  assert.ok(impact.delta.shoppingChangedItemIds.includes("berries"));
});

test("confirmed change applies atomically and preserves completed unaffected tasks", () => {
  const engine = newEngine();
  let state = engine.commitMenu(baseMenu, 1, "2026-09-01T02:01:00.000Z");
  state = engine.recordInventory(
    [{ itemId: "pasta", name: "Pasta", quantity: 200, unit: "g", confirmedAt: "2026-09-01T02:02:00.000Z", source: "user" }],
    state.event.revision,
  );
  state = engine.calculateShoppingPlan(state.event.revision);
  state = engine.buildPreparationPlan(state.event.revision);
  state = engine.markTaskComplete("prep-salad", state.event.revision, "2026-10-10T18:00:00.000Z");

  const impact = engine.analyseChangeImpact(
    { guestCount: 7, addConstraints: [vegan], replacementMenu: veganAdjustedMenu },
    state.event.revision,
    "2026-09-01T02:10:00.000Z",
  );
  assert.ok(impact.delta.preservedCompletedTaskIds.includes("prep-salad"));
  assert.throws(() => engine.applyConfirmedChange(impact), (error) => {
    assert.ok(error instanceof DomainError);
    assert.equal(error.code, "CONFIRMATION_REQUIRED");
    return true;
  });

  const applied = engine.applyConfirmedChange(impact, "2026-09-01T02:11:00.000Z");
  assert.equal(applied.event.guestCount, 7);
  assert.equal(applied.event.selectedMenuId, veganAdjustedMenu.id);
  assert.equal(applied.event.constraints.some((c) => c.id === vegan.id), true);
  assert.equal(applied.tasks["prep-salad"]?.status, "done");
  assert.ok(applied.tasks["prep-vegan-dessert"]);
  assert.ok(applied.shopping.some((item) => item.itemId === "berries" && item.toBuyQuantity === 700));
  assert.equal(applied.receipts.at(-1)?.actionType, "apply_confirmed_change");
  assert.equal(applied.audit.at(-1)?.afterRevision, applied.event.revision);
});

test("change impact cannot be applied after state has moved", () => {
  const engine = newEngine();
  let state = engine.commitMenu(baseMenu, 1, "2026-09-01T02:01:00.000Z");
  state = engine.buildPreparationPlan(state.event.revision);
  const impact = engine.analyseChangeImpact(
    { guestCount: 7, addConstraints: [vegan], replacementMenu: veganAdjustedMenu },
    state.event.revision,
  );
  state = engine.markTaskComplete("prep-salad", state.event.revision);
  assert.throws(() => engine.applyConfirmedChange(impact, "2026-09-01T02:11:00.000Z"), (error) => {
    assert.ok(error instanceof StaleRevisionError);
    return true;
  });
});

test("menu validation rejects broken task dependency graphs", () => {
  const brokenMenu = structuredClone(baseMenu);
  brokenMenu.id = "broken";
  brokenMenu.items[0].taskTemplates[1].dependencies = ["missing-task"];
  const engine = newEngine();
  assert.throws(() => engine.commitMenu(brokenMenu, 1, "2026-09-01T02:01:00.000Z"), (error) => {
    assert.ok(error instanceof DomainError);
    assert.equal(error.code, "UNKNOWN_TASK_DEPENDENCY");
    return true;
  });
});

test("menu commitment rejects confirmed allergen conflicts", () => {
  const conflicting = structuredClone(baseMenu);
  conflicting.id = "conflicting-menu";
  conflicting.items[0].constraintTags = ["vegetarian"];
  const engine = newEngine();
  assert.throws(() => engine.commitMenu(conflicting, 1, "2026-09-01T02:01:00.000Z"), (error) => {
    assert.ok(error instanceof DomainError);
    assert.equal(error.code, "MENU_CONSTRAINT_CONFLICT");
    return true;
  });
  assert.equal(engine.snapshot().event.revision, 1);
});

test("preparation dependency cycles are rejected", () => {
  const cyclic = structuredClone(baseMenu);
  cyclic.id = "cyclic-menu";
  cyclic.items[0].taskTemplates[0].dependencies = ["boil-pasta"];
  const engine = newEngine();
  assert.throws(() => engine.commitMenu(cyclic, 1, "2026-09-01T02:01:00.000Z"), (error) => {
    assert.ok(error instanceof DomainError);
    assert.equal(error.code, "TASK_DEPENDENCY_CYCLE");
    return true;
  });
});

test("changed task definition is not falsely preserved as completed", () => {
  const engine = newEngine();
  let state = engine.commitMenu(baseMenu, 1, "2026-09-01T02:01:00.000Z");
  state = engine.buildPreparationPlan(state.event.revision);
  state = engine.markTaskComplete("prep-salad", state.event.revision, "2026-10-10T18:00:00.000Z");
  const changedMenu = structuredClone(veganAdjustedMenu);
  changedMenu.id = "changed-task-menu";
  changedMenu.items.find((item) => item.id === "salad").taskTemplates[0].durationMinutes = 20;
  const impact = engine.analyseChangeImpact({ replacementMenu: changedMenu }, state.event.revision);
  assert.equal(impact.proposedTasks["prep-salad"].status, "ready");
  assert.equal(impact.delta.preservedCompletedTaskIds.includes("prep-salad"), false);
});

test("only engine-produced pending impacts can be applied", () => {
  const engine = newEngine();
  let state = engine.commitMenu(baseMenu, 1, "2026-09-01T02:01:00.000Z");
  state = engine.buildPreparationPlan(state.event.revision);
  const impact = engine.analyseChangeImpact({ replacementMenu: veganAdjustedMenu, addConstraints: [vegan], guestCount: 7 }, state.event.revision);
  const forged = structuredClone(impact);
  forged.id = "forged-impact";
  assert.throws(() => engine.applyConfirmedChange(forged, "2026-09-01T02:11:00.000Z"), (error) => {
    assert.ok(error instanceof DomainError);
    assert.equal(error.code, "UNKNOWN_CHANGE_IMPACT");
    return true;
  });
});

test("adding a conflicting confirmed constraint cannot leave a committed menu invalid", () => {
  const engine = newEngine();
  const state = engine.commitMenu(baseMenu, 1, "2026-09-01T02:01:00.000Z");
  const impossible = {
    id: "allergen-tomato",
    type: "allergen",
    value: "tomatoes",
    scope: "all guests",
    source: "user",
    confirmed: true,
  };
  assert.throws(() => engine.addConstraints([impossible], state.event.revision), (error) => {
    assert.ok(error instanceof DomainError);
    assert.equal(error.code, "MENU_CONSTRAINT_CONFLICT");
    return true;
  });
  assert.equal(engine.snapshot().event.revision, state.event.revision);
  assert.equal(engine.snapshot().event.constraints.some((constraint) => constraint.id === impossible.id), false);
});
