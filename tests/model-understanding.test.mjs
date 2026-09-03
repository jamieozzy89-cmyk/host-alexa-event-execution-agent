import test from "node:test";
import assert from "node:assert/strict";

import {
  HeuristicIntentInterpreter,
  LegacyIntentUnderstandingInterpreter,
  ModelCustomerUnderstandingInterpreter,
  ResilientUnderstandingInterpreter,
  parseCustomerUnderstanding,
} from "../dist/src/application/index.js";
import { OpenAIResponsesUnderstandingModel } from "../dist/server/openai-understanding-provider.js";

const context = { hasEvent: true, eventName: "Dinner", guestCount: 6, hasPendingConfirmation: false };

function validUnderstanding(overrides = {}) {
  return {
    intents: [{ kind: "provide_inventory", confidence: 0.94, evidence: "I have 2 lemons and enough rice" }],
    eventFacts: { name: null, guestCount: null, guestDelta: null, budget: null, currency: null, startText: null, timezone: null },
    constraints: [],
    preferences: [],
    inventory: {
      mode: "items",
      evidence: "I have 2 lemons and enough rice",
      items: [
        { name: "lemons", evidenceKind: "stated_quantity", quantity: 2, unit: "whole", confidence: 0.96, evidence: "2 lemons" },
        { name: "rice", evidenceKind: "enough", quantity: null, unit: null, confidence: 0.91, evidence: "enough rice" },
      ],
    },
    references: [],
    ambiguities: [],
    overallConfidence: 0.93,
    ...overrides,
  };
}

function completedResponse(payload) {
  return {
    status: "completed",
    output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(payload) }] }],
  };
}

function responseJson(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

test("Phase D parser accepts bounded multi-intent understanding and preserves non-authoritative candidates", () => {
  const parsed = parseCustomerUnderstanding(validUnderstanding({
    intents: [
      { kind: "change", confidence: 0.91, evidence: "add one guest" },
      { kind: "update_preference", confidence: 0.82, evidence: "keep it cheap" },
    ],
    eventFacts: { name: null, guestCount: null, guestDelta: 1, budget: null, currency: null, startText: null, timezone: null },
    preferences: [{ value: "low cost", confidence: 0.82, evidence: "keep it cheap" }],
    inventory: { mode: "unspecified", evidence: null, items: [] },
  }));
  assert.deepEqual(parsed.intents.map((item) => item.kind), ["change", "update_preference"]);
  assert.equal(parsed.eventFacts.guestDelta, 1);
  assert.equal(parsed.preferences[0].value, "low cost");
  assert.equal("tool" in parsed, false);
});

test("strict parser rejects arbitrary execution fields", () => {
  assert.throws(() => parseCustomerUnderstanding({ ...validUnderstanding(), tool: "confirm_cart_action" }), /unsupported field tool/);
});

test("strict parser rejects unknown nested fields", () => {
  const value = validUnderstanding();
  value.inventory.items[0] = { ...value.inventory.items[0], confirmed: true };
  assert.throws(() => parseCustomerUnderstanding(value), /unsupported field confirmed/);
});

test("strict parser enforces bounded arrays and structured text", () => {
  const tooMany = validUnderstanding({ intents: Array.from({ length: 9 }, () => ({ kind: "status", confidence: 0.8, evidence: "status" })) });
  assert.throws(() => parseCustomerUnderstanding(tooMany), /exceeds 8 items/);
  const tooLong = validUnderstanding({ preferences: [{ value: "x".repeat(501), confidence: 0.8, evidence: "cheap" }] });
  assert.throws(() => parseCustomerUnderstanding(tooLong), /exceeds 500 characters/);
});

test("inventory none requires direct review evidence and zero items", () => {
  const value = validUnderstanding({ inventory: { mode: "none", evidence: null, items: [] } });
  assert.throws(() => parseCustomerUnderstanding(value), /none mode requires evidence/);
});

test("stated quantity requires both positive quantity and unit", () => {
  const value = validUnderstanding();
  value.inventory.items[0] = { name: "lemons", evidenceKind: "stated_quantity", quantity: null, unit: null, confidence: 0.9, evidence: "lemons" };
  assert.throws(() => parseCustomerUnderstanding(value), /requires positive quantity and unit/);
});

test("identity-only inventory cannot smuggle a quantity", () => {
  const value = validUnderstanding();
  value.inventory.items[0] = { name: "lemons", evidenceKind: "identity_only", quantity: 2, unit: "whole", confidence: 0.9, evidence: "lemons" };
  assert.throws(() => parseCustomerUnderstanding(value), /must not invent quantity or unit/);
});

test("model interpreter rejects evidence not grounded in the customer turn", async () => {
  const model = { async infer() { return validUnderstanding(); } };
  const interpreter = new ModelCustomerUnderstandingInterpreter(model);
  await assert.rejects(() => interpreter.understand("I have rice", context), /not grounded/);
});

test("model interpreter accepts grounded evidence with normalization", async () => {
  const payload = validUnderstanding({
    intents: [{ kind: "provide_inventory", confidence: 0.9, evidence: "I HAVE 2 LEMONS" }],
    inventory: {
      mode: "items", evidence: "I HAVE 2 LEMONS",
      items: [{ name: "lemons", evidenceKind: "stated_quantity", quantity: 2, unit: "whole", confidence: 0.9, evidence: "2 LEMONS" }],
    },
  });
  const interpreter = new ModelCustomerUnderstandingInterpreter({ async infer() { return payload; } });
  const result = await interpreter.understand("I have 2 lemons", context);
  assert.equal(result.inventory.items[0].quantity, 2);
});

test("legacy adapter preserves deterministic core fallback", async () => {
  const interpreter = new LegacyIntentUnderstandingInterpreter(new HeuristicIntentInterpreter());
  const result = await interpreter.understand("show status", context);
  assert.equal(result.intents[0].kind, "status");
  assert.equal(result.inventory.mode, "unspecified");
});

test("resilient understanding falls back when preferred provider throws", async () => {
  const fallback = new LegacyIntentUnderstandingInterpreter(new HeuristicIntentInterpreter());
  const resilient = new ResilientUnderstandingInterpreter({ async understand() { throw new Error("provider down"); } }, fallback);
  const result = await resilient.understand("show status", context);
  assert.equal(result.intents[0].kind, "status");
});

test("resilient understanding falls back below confidence threshold", async () => {
  const fallback = new LegacyIntentUnderstandingInterpreter(new HeuristicIntentInterpreter());
  const resilient = new ResilientUnderstandingInterpreter({ async understand() { return parseCustomerUnderstanding(validUnderstanding({ overallConfidence: 0.2 })); } }, fallback);
  const result = await resilient.understand("show status", context);
  assert.equal(result.intents[0].kind, "status");
});

test("high-confidence semantically empty unknown output cannot suppress useful deterministic fallback", async () => {
  const empty = parseCustomerUnderstanding({
    intents: [{ kind: "unknown", confidence: 0.99, evidence: "show status" }],
    eventFacts: {}, constraints: [], preferences: [], inventory: { mode: "unspecified", items: [] }, references: [], ambiguities: [], overallConfidence: 0.99,
  });
  const fallback = new LegacyIntentUnderstandingInterpreter(new HeuristicIntentInterpreter());
  const resilient = new ResilientUnderstandingInterpreter({ async understand() { return empty; } }, fallback);
  const result = await resilient.understand("show status", context);
  assert.equal(result.intents[0].kind, "status");
});

test("Responses adapter sends bounded server-side strict structured-output request", async () => {
  let captured;
  const model = new OpenAIResponsesUnderstandingModel({
    apiKey: "server-secret", model: "configured-model",
    fetchImpl: async (url, init) => {
      captured = { url, init, body: JSON.parse(init.body) };
      return responseJson(completedResponse(validUnderstanding()));
    },
  });
  const result = await model.infer({ text: "I have 2 lemons and enough rice", context });
  assert.equal(result.overallConfidence, 0.93);
  assert.equal(captured.url, "https://api.openai.com/v1/responses");
  assert.equal(captured.init.headers.authorization, "Bearer server-secret");
  assert.equal(captured.body.store, false);
  assert.equal(captured.body.max_output_tokens, 4000);
  assert.equal(captured.body.text.format.type, "json_schema");
  assert.equal(captured.body.text.format.strict, true);
  assert.equal(captured.body.text.format.schema.additionalProperties, false);
});

test("Responses adapter rejects non-success HTTP status", async () => {
  const model = new OpenAIResponsesUnderstandingModel({ apiKey: "x", model: "m", fetchImpl: async () => responseJson({ error: "bad" }, 500) });
  await assert.rejects(() => model.infer({ text: "status", context }), /HTTP 500/);
});

test("Responses adapter rejects incomplete response even when output text is parseable", async () => {
  const body = completedResponse(validUnderstanding());
  body.status = "incomplete";
  const model = new OpenAIResponsesUnderstandingModel({ apiKey: "x", model: "m", fetchImpl: async () => responseJson(body) });
  await assert.rejects(() => model.infer({ text: "status", context }), /did not complete successfully/);
});

test("Responses adapter rejects model refusal", async () => {
  const body = { status: "completed", output: [{ type: "message", content: [{ type: "refusal", refusal: "no" }] }] };
  const model = new OpenAIResponsesUnderstandingModel({ apiKey: "x", model: "m", fetchImpl: async () => responseJson(body) });
  await assert.rejects(() => model.infer({ text: "status", context }), /refused/);
});

test("Responses adapter rejects multiple structured output payloads", async () => {
  const encoded = JSON.stringify(validUnderstanding());
  const body = { status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: encoded }, { type: "output_text", text: encoded }] }] };
  const model = new OpenAIResponsesUnderstandingModel({ apiKey: "x", model: "m", fetchImpl: async () => responseJson(body) });
  await assert.rejects(() => model.infer({ text: "status", context }), /multiple structured output/);
});

test("Responses adapter rejects customer text above configured input bound before network call", async () => {
  let called = false;
  const model = new OpenAIResponsesUnderstandingModel({ apiKey: "x", model: "m", maxInputCharacters: 10, fetchImpl: async () => { called = true; return responseJson({}); } });
  await assert.rejects(() => model.infer({ text: "12345678901", context }), /exceeds the 10-character/);
  assert.equal(called, false);
});
