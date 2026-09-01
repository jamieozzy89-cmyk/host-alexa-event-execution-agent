import assert from "node:assert/strict";
import test from "node:test";
import { HostDomainEngine } from "../dist/src/domain/index.js";
import { baseMenu, nutAllergy, vegan, veganAdjustedMenu, vegetarian } from "./fixtures.mjs";

test("controlled primary dinner scenario passes without UI or language model", () => {
  const engine = new HostDomainEngine({
    id: "demo-dinner",
    name: "Saturday dinner",
    startAt: "2026-10-10T19:00:00.000Z",
    timezone: "Europe/London",
    guestCount: 6,
    budget: 120,
    currency: "GBP",
    constraints: [vegetarian, nutAllergy],
    preferences: ["limited same-day cooking"],
  });

  let state = engine.commitMenu(baseMenu, 1, "2026-09-01T03:00:00.000Z");
  state = engine.recordInventory(
    [
      { itemId: "pasta", name: "Pasta", quantity: 200, unit: "g", confirmedAt: "2026-09-01T03:01:00.000Z", source: "user" },
      { itemId: "lettuce", name: "Lettuce", quantity: 1, unit: "each", confirmedAt: "2026-09-01T03:01:00.000Z", source: "user" },
    ],
    state.event.revision,
  );
  state = engine.calculateShoppingPlan(state.event.revision);
  state = engine.buildPreparationPlan(state.event.revision);

  state = engine.markTaskComplete("prep-salad", state.event.revision, "2026-10-10T17:45:00.000Z");
  assert.equal(state.tasks["prep-salad"]?.status, "done");

  const impact = engine.analyseChangeImpact(
    { guestCount: 7, addConstraints: [vegan], replacementMenu: veganAdjustedMenu },
    state.event.revision,
    "2026-10-10T17:50:00.000Z",
  );
  assert.equal(engine.snapshot().event.guestCount, 6, "analysis must not mutate committed state");
  assert.ok(impact.delta.addedTaskIds.includes("prep-vegan-dessert"));
  assert.ok(impact.delta.preservedCompletedTaskIds.includes("prep-salad"));

  state = engine.applyConfirmedChange(impact, "2026-10-10T17:51:00.000Z");
  assert.equal(state.event.guestCount, 7);
  assert.equal(state.tasks["prep-salad"]?.status, "done");
  assert.equal(state.tasks["prep-vegan-dessert"]?.status, "ready");
  assert.equal(state.shopping.find((item) => item.itemId === "pasta")?.toBuyQuantity, 500);
  assert.equal(state.shopping.find((item) => item.itemId === "berries")?.toBuyQuantity, 700);

  const next = engine.getNextAction();
  assert.ok(next, "a next ready action must exist");
  assert.equal(next.status, "ready");
  assert.ok(state.audit.length >= 6);
  assert.equal(state.audit.at(-1)?.afterRevision, state.event.revision);
});
