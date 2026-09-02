import assert from "node:assert/strict";
import test from "node:test";
import { planLowRiskWorkflow, runLowRiskWorkflow } from "../dist/src/agent/workflow.js";
import { createEvent, makeAgent } from "./agent-fixtures.mjs";

async function commitFirstSurfacedMenu(agent, conversation = "workflow") {
  const created = await createEvent(agent, conversation);
  const choose = created.actions.find((action) => action.type === "choose_menu");
  assert.ok(choose, "event creation should surface menu choices without another request");
  const pending = await agent.handleAction(conversation, choose);
  assert.equal(pending.status, "needs_confirmation");
  const confirmed = await agent.handleAction(conversation, { type: "confirm_pending", label: "Confirm" });
  return { created, confirmed };
}

test("Phase C event creation automatically surfaces menu choices", async () => {
  const { agent } = makeAgent();
  const result = await createEvent(agent, "auto-menu");
  assert.equal(result.status, "ok");
  assert.ok(result.cards.some((card) => card.type === "event_summary"));
  assert.ok(result.cards.some((card) => card.type === "menu_options"));
  assert.equal(result.actions.filter((action) => action.type === "choose_menu").length, 3);
  assert.match(result.speech, /Option 1:/);
});

test("confirmed menu stops at inventory review instead of running shopping prematurely", async () => {
  const { agent, persistence } = makeAgent();
  const { confirmed } = await commitFirstSurfacedMenu(agent, "inventory-stop");
  assert.equal(confirmed.status, "needs_input");
  assert.match(confirmed.question, /ingredients do you already have/i);

  const loaded = await persistence.load("agent-dinner");
  assert.ok(loaded?.state.event.selectedMenuId);
  assert.equal(loaded?.state.shopping.length, 0);
  assert.equal(Object.keys(loaded?.state.tasks ?? {}).length, 0);
});

test("unclear pantry language is not converted into authoritative quantities", async () => {
  const { agent, persistence } = makeAgent();
  await commitFirstSurfacedMenu(agent, "inventory-unclear");
  const result = await agent.handleText("inventory-unclear", "I've probably got some pasta and a bit of tomato");
  assert.equal(result.status, "needs_input");
  assert.match(result.speech, /does not yet extract exact pantry quantities/i);
  assert.match(result.speech, /won't guess/i);

  const loaded = await persistence.load("agent-dinner");
  assert.equal(Object.keys(loaded?.state.inventory ?? {}).length, 0);
  assert.equal(loaded?.state.shopping.length, 0);
});

test("explicit zero-inventory review chains shopping then preparation through low-risk tools", async () => {
  const { agent, persistence } = makeAgent();
  await commitFirstSurfacedMenu(agent, "workflow-chain");
  const result = await agent.handleText("workflow-chain", "I don't have any of them");
  assert.equal(result.status, "ok");
  assert.match(result.speech, /reconciled shopping/i);
  assert.match(result.speech, /built the run sheet/i);
  assert.ok(result.cards.some((card) => card.type === "shopping_list"));
  assert.ok(result.cards.some((card) => card.type === "prep_timeline"));

  const loaded = await persistence.load("agent-dinner");
  assert.ok(loaded);
  assert.ok(loaded.state.shopping.length > 0);
  assert.ok(Object.keys(loaded.state.tasks).length > 0);
  const actions = loaded.state.audit.map((entry) => entry.action);
  const shoppingIndex = actions.lastIndexOf("build_shopping_plan");
  const prepIndex = actions.lastIndexOf("build_preparation_plan");
  assert.ok(shoppingIndex >= 0);
  assert.ok(prepIndex > shoppingIndex);
  assert.equal(actions.includes("prepare_cart"), false);
  assert.equal(actions.includes("confirm_cart_action"), false);
});

test("shopping and prep requests cannot bypass an outstanding inventory review", async () => {
  const { agent, persistence } = makeAgent();
  await commitFirstSurfacedMenu(agent, "no-bypass");
  const shopping = await agent.handleText("no-bypass", "shopping list");
  assert.equal(shopping.status, "needs_input");
  assert.match(shopping.question, /ingredients do you already have/i);
  const prep = await agent.handleAction("no-bypass", { type: "request", label: "Prep", request: "prep" });
  assert.equal(prep.status, "needs_input");

  const loaded = await persistence.load("agent-dinner");
  assert.equal(loaded?.state.shopping.length, 0);
  assert.equal(Object.keys(loaded?.state.tasks ?? {}).length, 0);
});

test("a late change can interrupt inventory review without being misrecorded as pantry data", async () => {
  const { agent, persistence } = makeAgent();
  await commitFirstSurfacedMenu(agent, "interrupt-change");
  const impact = await agent.handleText("interrupt-change", "We have another guest and they're vegan");
  assert.equal(impact.status, "needs_confirmation");
  assert.equal(impact.cards[0]?.type, "change_impact");
  let loaded = await persistence.load("agent-dinner");
  assert.equal(loaded?.state.event.guestCount, 6);

  const applied = await agent.handleText("interrupt-change", "yes");
  assert.equal(applied.status, "ok");
  loaded = await persistence.load("agent-dinner");
  assert.equal(loaded?.state.event.guestCount, 7);

  const resumedInventory = await agent.handleText("interrupt-change", "I don't have any of them");
  assert.equal(resumedInventory.status, "ok");
  loaded = await persistence.load("agent-dinner");
  assert.ok((loaded?.state.shopping.length ?? 0) > 0);
});

function fakeProjection(revision, options = {}) {
  return {
    event: {
      id: "fake-event",
      name: "Fake event",
      startAt: "2026-10-10T19:00:00.000Z",
      timezone: "Europe/London",
      status: "planned",
      guestCount: 6,
      budget: 100,
      currency: "GBP",
      constraints: [],
      preferences: [],
      selectedMenuId: "menu-1",
      createdAt: "2026-09-02T09:00:00.000Z",
      updatedAt: "2026-09-02T09:00:00.000Z",
      revision,
    },
    customerStage: options.prepBuilt ? "prep" : "shop",
    statusSentence: "controlled fake projection",
    menu: { id: "menu-1", name: "Menu", itemCount: 1, itemNames: ["Dish"] },
    inventoryCoverage: { requiredIngredientLines: 1, confirmedItemCount: 0, confirmedPositiveItemCount: 0, coverageEvaluated: options.shoppingBuilt ?? false, coveredRequirementLines: 0 },
    shopping: options.shoppingBuilt
      ? { totalLines: 1, coveredLines: 0, unresolvedLines: 1, selectedLines: 0, purchasedLines: 0 }
      : { totalLines: 0, coveredLines: 0, unresolvedLines: 0, selectedLines: 0, purchasedLines: 0 },
    preparation: options.prepBuilt
      ? { totalTasks: 1, readyTasks: 1, blockedTasks: 0, inProgressTasks: 0, doneTasks: 0, cancelledTasks: 0 }
      : { totalTasks: 0, readyTasks: 0, blockedTasks: 0, inProgressTasks: 0, doneTasks: 0, cancelledTasks: 0 },
    timing: { health: "not_evaluated", detail: "fake" },
    attention: options.attention ?? { kind: options.prepBuilt ? "task" : "shopping", priority: options.prepBuilt ? 9 : 7, title: "fake", detail: "fake", customerActionRequired: false },
    readiness: { isReady: false, shoppingEvaluated: options.shoppingBuilt ?? false, shoppingResolved: false, preparationExists: options.prepBuilt ?? false, preparationComplete: false },
    reversibleReceiptIds: [],
  };
}

test("workflow plan exposes completed trace and an explicit confirmation boundary without an executable step", () => {
  const completed = [{
    tool: "build_shopping_plan",
    attemptedRevision: 1,
    resultingRevision: 2,
    reason: "controlled prior low-risk step",
    status: "succeeded",
    data: { shopping: [] },
  }];
  const projection = fakeProjection(2, {
    shoppingBuilt: true,
    attention: {
      kind: "confirmation",
      priority: 1,
      title: "Confirm the material action",
      detail: "Customer confirmation is required before this action can run.",
      customerActionRequired: true,
      relatedId: "confirm-1",
    },
  });

  const plan = planLowRiskWorkflow(projection, { inventoryReviewConfirmed: true }, completed);
  assert.equal(plan.stopReason, "confirmation_required");
  assert.deepEqual(plan.candidateSteps, []);
  assert.equal(plan.completedSteps.length, 1);
  assert.equal(plan.completedSteps[0].tool, "build_shopping_plan");
  assert.deepEqual(plan.confirmationBoundary, {
    kind: "explicit_customer_confirmation",
    title: "Confirm the material action",
    detail: "Customer confirmation is required before this action can run.",
    relatedId: "confirm-1",
  });
});

test("stale low-risk revision is refreshed and replanned instead of blindly replayed", async () => {
  let read = 0;
  const projections = [
    fakeProjection(1),
    fakeProjection(2),
    fakeProjection(3, { shoppingBuilt: true }),
    fakeProjection(4, { shoppingBuilt: true, prepBuilt: true }),
  ];
  const projectionReader = {
    async readProjection() {
      const value = projections[Math.min(read, projections.length - 1)];
      read += 1;
      return structuredClone(value);
    },
  };
  const calls = [];
  let shoppingAttempts = 0;
  const tools = {
    async execute(call) {
      calls.push(structuredClone(call));
      if (call.name === "build_shopping_plan") {
        shoppingAttempts += 1;
        if (shoppingAttempts === 1) {
          return { ok: false, tool: call.name, status: "needs_attention", stateChanged: false, eventId: "fake-event", revision: 2, error: { code: "STALE_REVISION", message: "stale", retryable: true } };
        }
        return { ok: true, tool: call.name, status: "succeeded", stateChanged: true, eventId: "fake-event", revision: 3, data: { shopping: [] } };
      }
      return { ok: true, tool: call.name, status: "succeeded", stateChanged: true, eventId: "fake-event", revision: 4, data: { tasks: {} } };
    },
  };

  const run = await runLowRiskWorkflow({
    eventId: "fake-event",
    tools,
    projectionReader,
    policy: { inventoryReviewConfirmed: true },
  });

  assert.deepEqual(calls.map((call) => [call.name, call.input.expectedRevision]), [
    ["build_shopping_plan", 1],
    ["build_shopping_plan", 2],
    ["build_preparation_plan", 3],
  ]);
  assert.deepEqual(run.records.map((record) => record.status), ["stale_replanned", "succeeded", "succeeded"]);
  assert.ok(run.records.every((record) => record.reason.length > 0));
  assert.equal(run.finalRevision, 4);
  assert.equal(run.stopReason, "no_low_risk_work");
  assert.equal(run.finalPlan.completedSteps.length, 3);
  assert.deepEqual(run.finalPlan.candidateSteps, []);
});

test("non-stale low-risk failure stops the workflow before later steps", async () => {
  const projectionReader = { async readProjection() { return fakeProjection(5); } };
  const calls = [];
  const tools = {
    async execute(call) {
      calls.push(call.name);
      return { ok: false, tool: call.name, status: "failed", stateChanged: false, eventId: "fake-event", revision: 5, error: { code: "PERSISTENCE_CHECKPOINT_FAILED", message: "failed", retryable: true } };
    },
  };

  const run = await runLowRiskWorkflow({
    eventId: "fake-event",
    tools,
    projectionReader,
    policy: { inventoryReviewConfirmed: true },
  });

  assert.deepEqual(calls, ["build_shopping_plan"]);
  assert.equal(run.stopReason, "failure");
  assert.equal(run.records.length, 1);
  assert.equal(run.records[0].status, "failed");
  assert.equal(run.finalPlan.completedSteps.length, 1);
});

test("bounded workflow reports step_limit rather than falsely claiming there is no remaining low-risk work", async () => {
  let read = 0;
  const projections = [
    fakeProjection(7),
    fakeProjection(8, { shoppingBuilt: true }),
    fakeProjection(8, { shoppingBuilt: true }),
  ];
  const projectionReader = {
    async readProjection() {
      const value = projections[Math.min(read, projections.length - 1)];
      read += 1;
      return structuredClone(value);
    },
  };
  const calls = [];
  const tools = {
    async execute(call) {
      calls.push(call.name);
      return { ok: true, tool: call.name, status: "succeeded", stateChanged: true, eventId: "fake-event", revision: 8, data: { shopping: [] } };
    },
  };

  const run = await runLowRiskWorkflow({
    eventId: "fake-event",
    tools,
    projectionReader,
    policy: { inventoryReviewConfirmed: true },
    options: { maxSuccessfulSteps: 1 },
  });

  assert.deepEqual(calls, ["build_shopping_plan"]);
  assert.equal(run.stopReason, "step_limit");
  assert.equal(run.finalPlan.stopReason, "step_limit");
  assert.equal(run.finalPlan.completedSteps.length, 1);
});
