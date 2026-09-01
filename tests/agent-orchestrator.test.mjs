import assert from "node:assert/strict";
import test from "node:test";
import { DeterministicSimulatedCartAdapter } from "../dist/src/simulated-services/index.js";
import { HeuristicIntentInterpreter } from "../dist/src/agent/interpreter.js";
import { ModelBackedIntentInterpreter, ResilientIntentInterpreter } from "../dist/src/agent/model.js";
import { makeAgent, createEvent, chooseFirstMenu, prepareShopping } from "./agent-fixtures.mjs";

function questionMarks(value) { return (value.match(/\?/g) ?? []).length; }

async function setupCommitted(agent, conversation = "c1") {
  await createEvent(agent, conversation);
  return chooseFirstMenu(agent, conversation);
}

test("Stage 05 creates a complete event from one natural hosting request", async () => {
  const { agent } = makeAgent();
  const result = await createEvent(agent);
  assert.equal(result.status, "ok");
  assert.equal(result.eventId, "agent-dinner");
  assert.match(result.speech, /set up/i);
  assert.equal(result.cards[0]?.type, "event_summary");
  assert.equal(result.cards[0]?.guestCount, 6);
  assert.equal(result.cards[0]?.budget, 120);
  assert.equal(result.cards[0]?.currency, "GBP");
  assert.equal(result.cards[0]?.startAt, "2026-09-05T18:00:00.000Z");
});

test("missing event details are requested one question at a time", async () => {
  const { agent } = makeAgent();
  let result = await agent.handleText("clarify", "I'm hosting dinner");
  assert.equal(result.status, "needs_input");
  assert.match(result.question, /how many/i);
  assert.equal(questionMarks(result.speech), 1);

  result = await agent.handleText("clarify", "6");
  assert.match(result.question, /day and time/i);
  assert.equal(questionMarks(result.speech), 1);

  result = await agent.handleText("clarify", "Saturday at 7pm");
  assert.match(result.question, /budget/i);
  assert.equal(questionMarks(result.speech), 1);

  result = await agent.handleText("clarify", "£120");
  assert.equal(result.status, "ok");
  assert.equal(result.cards[0]?.guestCount, 6);
});

test("invalid clarification date remains inside the conversation instead of throwing", async () => {
  const { agent } = makeAgent();
  await agent.handleText("date", "I'm hosting dinner");
  await agent.handleText("date", "6");
  const result = await agent.handleText("date", "sometime-ish");
  assert.equal(result.status, "needs_input");
  assert.match(result.question, /day and time/i);
});

test("menu request returns real proposals and working selection actions", async () => {
  const { agent } = makeAgent();
  await createEvent(agent);
  const result = await agent.handleText("c1", "Show me menu ideas");
  assert.equal(result.status, "ok");
  assert.equal(result.cards[0]?.type, "menu_options");
  assert.equal(result.cards[0]?.menus.length, 3);
  assert.equal(result.actions.filter((action) => action.type === "choose_menu").length, 3);
});

test("spoken menu option choice uses the existing confirmation-gated commit path", async () => {
  const { agent, persistence } = makeAgent();
  await createEvent(agent, "voice-menu");
  const menus = await agent.handleText("voice-menu", "menu ideas");
  assert.match(menus.speech, /Option 1:/);
  assert.match(menus.speech, /choose option one/i);
  const confirmation = await agent.handleText("voice-menu", "choose option one");
  assert.equal(confirmation.status, "needs_confirmation");
  let loaded = await persistence.load("agent-dinner");
  assert.equal(loaded?.state.event.selectedMenuId, undefined);
  const confirmed = await agent.handleText("voice-menu", "yes");
  assert.equal(confirmed.status, "ok");
  loaded = await persistence.load("agent-dinner");
  assert.ok(loaded?.state.event.selectedMenuId);
});

test("menu selection is confirmation-gated before committed state changes", async () => {
  const { agent, persistence } = makeAgent();
  await createEvent(agent);
  const menus = await agent.handleText("c1", "menu ideas");
  const action = menus.actions.find((entry) => entry.type === "choose_menu");
  assert.ok(action);
  const confirmation = await agent.handleAction("c1", action);
  assert.equal(confirmation.status, "needs_confirmation");
  let loaded = await persistence.load("agent-dinner");
  assert.equal(loaded?.state.event.selectedMenuId, undefined);
  await agent.handleAction("c1", { type: "confirm_pending", label: "Confirm" });
  loaded = await persistence.load("agent-dinner");
  assert.ok(loaded?.state.event.selectedMenuId);
});

test("cancelling a pending menu leaves authoritative state unchanged", async () => {
  const { agent, persistence } = makeAgent();
  await createEvent(agent);
  const menus = await agent.handleText("c1", "menu ideas");
  const action = menus.actions.find((entry) => entry.type === "choose_menu");
  assert.ok(action);
  await agent.handleAction("c1", action);
  const cancelled = await agent.handleAction("c1", { type: "cancel_pending", label: "Cancel" });
  assert.match(cancelled.speech, /haven't changed/i);
  const loaded = await persistence.load("agent-dinner");
  assert.equal(loaded?.state.event.selectedMenuId, undefined);
});

test("shopping request returns authoritative quantities rather than summary counts only", async () => {
  const { agent } = makeAgent();
  await setupCommitted(agent);
  const result = await agent.handleText("c1", "Make my shopping list");
  assert.equal(result.status, "ok");
  assert.equal(result.cards[0]?.type, "shopping_list");
  assert.ok(result.cards[0]?.items.length > 3);
  assert.ok(result.cards[0]?.items.some((item) => item.toBuyQuantity > 0 && item.unit));
});

test("product request exposes real candidate choices and clearly labels the demo boundary", async () => {
  const { agent } = makeAgent();
  await setupCommitted(agent);
  await agent.handleText("c1", "shopping list");
  const result = await agent.handleText("c1", "Find products");
  assert.equal(result.cards[0]?.type, "product_choices");
  assert.ok(result.cards[0]?.items.every((item) => item.candidates.length === 3));
  assert.ok(result.cards[0]?.items.every((item) => item.selectedProductId));
  assert.match(result.speech, /demo/i);
  assert.match(result.speech, /nothing has been purchased/i);
});

test("simulated checkout requires explicit confirmation and then records success", async () => {
  const { agent, persistence } = makeAgent();
  await prepareShopping(agent);
  const confirmation = await agent.handleText("c1", "checkout");
  assert.equal(confirmation.status, "needs_confirmation");
  const before = await persistence.load("agent-dinner");
  assert.ok(before?.state.shopping.some((item) => item.status === "selected"));
  const result = await agent.handleText("c1", "yes");
  assert.equal(result.status, "ok");
  assert.match(result.speech, /simulated checkout complete/i);
  const after = await persistence.load("agent-dinner");
  assert.ok(after?.state.shopping.filter((item) => item.toBuyQuantity > 0).every((item) => item.status === "simulated_purchased"));
});

test("preparation request returns a real timeline and executable ready-task actions", async () => {
  const { agent } = makeAgent();
  await setupCommitted(agent);
  const result = await agent.handleText("c1", "Plan my prep");
  assert.equal(result.status, "ok");
  assert.equal(result.cards[0]?.type, "prep_timeline");
  assert.ok(result.cards[0]?.tasks.length >= 3);
  assert.ok(result.actions.some((action) => action.type === "complete_task"));
});

test("touch action can complete a real prep task and advance next-action guidance", async () => {
  const { agent, persistence } = makeAgent();
  await setupCommitted(agent);
  const prep = await agent.handleText("c1", "prep plan");
  const action = prep.actions.find((entry) => entry.type === "complete_task");
  assert.ok(action);
  const result = await agent.handleAction("c1", action);
  assert.equal(result.status, "ok");
  const loaded = await persistence.load("agent-dinner");
  assert.equal(loaded?.state.tasks[action.taskId]?.status, "done");
});

test("spoken done completes the authoritative next preparation task", async () => {
  const { agent, persistence } = makeAgent();
  await setupCommitted(agent, "voice-done");
  await agent.handleText("voice-done", "prep plan");
  const next = await agent.handleText("voice-done", "what's next");
  assert.match(next.speech, /Next:/);
  const nextTaskId = next.actions.find((action) => action.type === "complete_task")?.taskId;
  assert.ok(nextTaskId);
  const completed = await agent.handleText("voice-done", "done");
  assert.equal(completed.status, "ok");
  const loaded = await persistence.load("agent-dinner");
  assert.equal(loaded?.state.tasks[nextTaskId]?.status, "done");
});

test("status response is derived from authoritative tool state and stays concise", async () => {
  const { agent } = makeAgent();
  await setupCommitted(agent);
  await agent.handleText("c1", "prep plan");
  const result = await agent.handleText("c1", "What's the status?");
  assert.equal(result.status, "ok");
  assert.equal(result.cards[0]?.type, "event_summary");
  assert.ok(result.speech.length < 220);
  assert.doesNotMatch(result.speech, /revision|schema|tool|domain engine/i);
});

test("late seventh vegan guest is analysed before any committed change", async () => {
  const { agent, persistence } = makeAgent();
  await setupCommitted(agent);
  await agent.handleText("c1", "prep plan");
  const before = await persistence.load("agent-dinner");
  const result = await agent.handleText("c1", "We have another guest and they're vegan");
  assert.equal(result.status, "needs_confirmation");
  assert.equal(result.cards[0]?.type, "change_impact");
  assert.equal(result.cards[0]?.guestCountChanged, true);
  const unchanged = await persistence.load("agent-dinner");
  assert.equal(unchanged?.state.event.guestCount, before?.state.event.guestCount);
});

test("confirmed late change updates guest count and preserves a visible audit trail", async () => {
  const { agent, persistence } = makeAgent();
  await setupCommitted(agent);
  await agent.handleText("c1", "prep plan");
  await agent.handleText("c1", "We have another guest and they're vegan");
  const applied = await agent.handleText("c1", "yes");
  assert.equal(applied.status, "ok");
  const loaded = await persistence.load("agent-dinner");
  assert.equal(loaded?.state.event.guestCount, 7);
  assert.ok(loaded?.state.event.constraints.some((constraint) => constraint.type === "dietary" && /vegan/i.test(constraint.value)));
  assert.ok(loaded?.state.audit.some((event) => /change/i.test(event.action)));
});

test("activity request returns structured receipts and audit data with safe undo action", async () => {
  const { agent } = makeAgent();
  await setupCommitted(agent);
  await agent.handleText("c1", "We have another guest and they're vegan");
  await agent.handleText("c1", "yes");
  const history = await agent.handleText("c1", "What changed?");
  assert.equal(history.cards[0]?.type, "history");
  assert.ok(history.cards[0]?.receipts.length > 0);
  assert.ok(history.cards[0]?.audit.length > 0);
  assert.ok(history.actions.some((action) => action.type === "request" && action.request === "undo"));
});

test("safe undo is confirmation-gated and reverses the latest reversible late change", async () => {
  const { agent, persistence } = makeAgent();
  await setupCommitted(agent);
  await agent.handleText("c1", "We have another guest and they're vegan");
  await agent.handleText("c1", "yes");
  let request = await agent.handleText("c1", "undo that");
  assert.equal(request.status, "needs_confirmation");
  const result = await agent.handleText("c1", "yes");
  assert.equal(result.status, "ok");
  const loaded = await persistence.load("agent-dinner");
  assert.equal(loaded?.state.event.guestCount, 6);
  assert.ok(loaded?.state.receipts.some((receipt) => receipt.status === "reversed"));
});

test("checkout failure is translated to plain language and never claims purchase success", async () => {
  const cart = new DeterministicSimulatedCartAdapter();
  const { agent, persistence } = makeAgent({ cart });
  await prepareShopping(agent);
  cart.failNext("SIMULATED_CHECKOUT_FAILED", "temporary demo provider failure");
  await agent.handleText("c1", "checkout");
  const result = await agent.handleText("c1", "yes");
  assert.equal(result.status, "error");
  assert.doesNotMatch(result.speech, /adapter|domain|schema|stack/i);
  assert.ok(result.actions.some((action) => action.type === "retry_checkout"));
  const loaded = await persistence.load("agent-dinner");
  assert.ok(loaded?.state.shopping.filter((item) => item.toBuyQuantity > 0).every((item) => item.status !== "simulated_purchased"));
});

test("retry after checkout failure succeeds only after a new explicit confirmation", async () => {
  const cart = new DeterministicSimulatedCartAdapter({ failNext: { errorCode: "SIMULATED_CHECKOUT_FAILED", message: "temporary" } });
  const { agent } = makeAgent({ cart });
  await prepareShopping(agent);
  await agent.handleText("c1", "checkout");
  const failed = await agent.handleText("c1", "yes");
  const retry = failed.actions.find((action) => action.type === "retry_checkout");
  assert.ok(retry);
  const reconfirm = await agent.handleAction("c1", retry);
  assert.equal(reconfirm.status, "needs_confirmation");
  const success = await agent.handleAction("c1", { type: "confirm_pending", label: "Confirm" });
  assert.equal(success.status, "ok");
  assert.match(success.speech, /simulated checkout complete/i);
});

test("resilient interpreter falls back deterministically when a model interpreter fails", async () => {
  const failingModel = { async infer() { throw new Error("provider unavailable"); } };
  const interpreter = new ResilientIntentInterpreter(new ModelBackedIntentInterpreter(failingModel), new HeuristicIntentInterpreter());
  const { agent } = makeAgent({ interpreter });
  const result = await createEvent(agent);
  assert.equal(result.status, "ok");
  assert.equal(result.cards[0]?.guestCount, 6);
});

test("package root exposes the Stage 05 agent without exposing the domain engine", async () => {
  const api = await import("host-alexa-event-execution-agent");
  assert.equal(typeof api.HostAgentOrchestrator, "function");
  assert.equal(typeof api.HeuristicIntentInterpreter, "function");
  assert.equal(typeof api.ResilientIntentInterpreter, "function");
  assert.equal("HostDomainEngine" in api, false);
});

test("guest-count numbers are never interpreted as event clock times", async () => {
  const { agent } = makeAgent();
  const result = await agent.handleText("numeric-time", "I'm hosting dinner for 6 people on Saturday with a £120 budget");
  assert.equal(result.status, "ok");
  assert.equal(result.cards[0]?.startAt, "2026-09-05T18:00:00.000Z");
});

test("low-confidence model guesses fall back to the stronger deterministic interpretation", async () => {
  const weakModel = { async infer() { return { kind: "undo", confidence: 0.2, slots: {} }; } };
  const interpreter = new ResilientIntentInterpreter(new ModelBackedIntentInterpreter(weakModel), new HeuristicIntentInterpreter());
  const { agent } = makeAgent({ interpreter });
  const result = await createEvent(agent, "weak-model");
  assert.equal(result.status, "ok");
  assert.equal(result.cards[0]?.guestCount, 6);
});

test("a fresh agent can safely resume persisted event state without restoring stale confirmation state", async () => {
  const first = makeAgent();
  await createEvent(first.agent, "before-reload");
  await chooseFirstMenu(first.agent, "before-reload");
  const second = makeAgent({ persistence: first.persistence, eventId: "agent-dinner" });
  const beforeResume = await second.agent.handleText("after-reload", "status");
  assert.equal(beforeResume.status, "needs_input");
  const resumed = await second.agent.resumeConversation("after-reload", "agent-dinner");
  assert.equal(resumed.status, "ok");
  assert.equal(resumed.cards[0]?.type, "event_summary");
  assert.ok(resumed.cards[0]?.revision >= 2);
  assert.equal(second.agent.getConversationState("after-reload").pending, undefined);
  const status = await second.agent.handleText("after-reload", "status");
  assert.equal(status.status, "ok");
});

test("failed checkout history stays customer-safe and does not expose provider internals", async () => {
  const cart = new DeterministicSimulatedCartAdapter();
  const { agent } = makeAgent({ cart });
  await prepareShopping(agent, "safe-history");
  cart.failNext("SIMULATED_CHECKOUT_ADAPTER_ERROR", "adapter stack provider secret-ish detail");
  await agent.handleText("safe-history", "checkout");
  await agent.handleText("safe-history", "yes");
  const history = await agent.handleText("safe-history", "history");
  const visible = JSON.stringify({ speech: history.speech, cards: history.cards });
  assert.doesNotMatch(visible, /adapter stack|provider secret|schema|idempotency/i);
  assert.match(visible, /nothing was marked as purchased|did not complete/i);
});
