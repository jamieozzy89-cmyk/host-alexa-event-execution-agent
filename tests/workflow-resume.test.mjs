import assert from "node:assert/strict";
import test from "node:test";
import { createEvent, makeAgent } from "./agent-fixtures.mjs";

async function commitFirstMenu(agent, conversation) {
  const created = await createEvent(agent, conversation);
  const choose = created.actions.find((action) => action.type === "choose_menu");
  assert.ok(choose);
  const pending = await agent.handleAction(conversation, choose);
  assert.equal(pending.status, "needs_confirmation");
  const confirmed = await agent.handleAction(conversation, { type: "confirm_pending", label: "Confirm" });
  assert.equal(confirmed.status, "needs_input");
}

test("resume does not mistake partial recorded inventory for a completed inventory review", async () => {
  const first = makeAgent();
  await commitFirstMenu(first.agent, "partial-inventory-before-reload");

  let loaded = await first.persistence.load("agent-dinner");
  assert.ok(loaded);
  const selectedMenuId = loaded.state.event.selectedMenuId;
  assert.ok(selectedMenuId);
  const menu = loaded.state.menus[selectedMenuId];
  assert.ok(menu);
  const ingredient = menu.items.flatMap((item) => item.ingredients)[0];
  assert.ok(ingredient);

  const recorded = await first.runtime.execute({
    name: "record_inventory",
    input: {
      eventId: "agent-dinner",
      expectedRevision: loaded.state.event.revision,
      items: [{
        itemId: ingredient.itemId,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        confirmedAt: "2026-09-01T03:05:00.000Z",
        source: "user",
      }],
    },
  });
  assert.equal(recorded.ok, true);

  loaded = await first.persistence.load("agent-dinner");
  assert.ok(loaded);
  assert.equal(Object.keys(loaded.state.inventory).length, 1);
  assert.equal(loaded.state.shopping.length, 0);

  const second = makeAgent({ persistence: first.persistence, eventId: "agent-dinner" });
  const resumed = await second.agent.resumeConversation("partial-inventory-after-reload", "agent-dinner");
  assert.equal(resumed.status, "needs_input");
  assert.match(resumed.question, /ingredients do you already have/i);

  const after = await first.persistence.load("agent-dinner");
  assert.ok(after);
  assert.equal(after.state.shopping.length, 0);
  assert.equal(Object.keys(after.state.tasks).length, 0);
});

test("resume may continue preparation only when authoritative shopping already proves reconciliation occurred", async () => {
  const first = makeAgent();
  await commitFirstMenu(first.agent, "shopping-before-reload");

  let loaded = await first.persistence.load("agent-dinner");
  assert.ok(loaded);
  const shopping = await first.runtime.execute({
    name: "build_shopping_plan",
    input: {
      eventId: "agent-dinner",
      expectedRevision: loaded.state.event.revision,
    },
  });
  assert.equal(shopping.ok, true);

  loaded = await first.persistence.load("agent-dinner");
  assert.ok(loaded);
  assert.ok(loaded.state.shopping.length > 0);
  assert.equal(Object.keys(loaded.state.tasks).length, 0);

  const second = makeAgent({ persistence: first.persistence, eventId: "agent-dinner" });
  const resumed = await second.agent.resumeConversation("shopping-after-reload", "agent-dinner");
  assert.equal(resumed.status, "ok");
  assert.match(resumed.speech, /Welcome back/i);
  assert.match(resumed.speech, /built the run sheet/i);

  const after = await first.persistence.load("agent-dinner");
  assert.ok(after);
  assert.ok(Object.keys(after.state.tasks).length > 0);
});
