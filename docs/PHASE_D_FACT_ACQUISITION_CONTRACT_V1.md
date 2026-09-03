# Phase D Fact Acquisition Contract v1

**Status:** ACTIVE PHASE D IMPLEMENTATION CONTRACT  
**Branch:** `host-competition-build`  
**Parent verified head:** `f007ef48e3f53bd2f26846692a2d511bd9fe2dd2`  
**Controlling sources:** `HANDOVER.md`, `docs/HOST_COMPETITION_PRODUCT_SPEC_V1.md`, `docs/HOST_COMPETITION_IMPLEMENTATION_MAP_V1.md`

## 1. Purpose

Phase D adds richer conversational understanding without making model output authoritative.

The permanent path remains:

`customer text -> non-authoritative understanding -> deterministic validation/resolution -> Host tool -> domain validation -> persistence/receipt -> customer response`

A model result may propose facts. It does not confirm, persist, execute or prove them.

## 2. CustomerUnderstanding

The new non-authoritative `CustomerUnderstanding` object contains:

- one or more bounded customer intent candidates;
- candidate event facts;
- candidate constraints;
- candidate soft preferences;
- candidate inventory facts;
- conversational-reference candidates;
- explicit ambiguities/clarification questions;
- overall confidence.

It contains no executable tool name and no arbitrary code.

## 3. Intent boundary

Allowed understanding intents are customer-meaning categories only:

- create event;
- status;
- next action;
- menu options;
- choose menu;
- shopping;
- products;
- checkout;
- preparation;
- history;
- change;
- task completion;
- undo;
- confirm;
- cancel;
- help;
- provide inventory;
- update preference;
- unknown.

Multiple intents may be returned for one customer turn. Execution order remains an application/orchestrator decision.

## 4. Fact candidates

Event facts may include:

- name;
- guest count;
- guest delta;
- budget;
- currency;
- start-text expression;
- timezone.

These are candidates only until normal application/tool validation accepts them.

## 5. Constraint candidates

A model may return a bounded constraint candidate with:

- type;
- value;
- scope;
- confidence;
- evidence text.

It may **not** output authoritative domain fields such as:

- `confirmed`;
- domain constraint ID;
- trusted source classification.

Those are assigned only by controlled application/domain logic after the customer meaning is resolved.

## 6. Inventory candidates

Inventory review has an explicit mode:

- `none` — customer explicitly states none of the required items are on hand and supporting customer-text evidence is required;
- `items` — one or more inventory candidates were stated and supporting customer-text evidence is required;
- `unspecified` — no reliable inventory answer was established.

Each item candidate has one of these evidence classes:

- `stated_quantity` — candidate includes quantity and unit extracted from the customer turn;
- `enough` — customer states they have enough of the named item for the current requirement;
- `identity_only` — item identity is present but quantity/coverage is not established.

`identity_only` never becomes an exact inventory quantity automatically.

The preferred authoritative Phase D integration is a purpose-built inventory-coverage confirmation tool. It may translate an explicit customer statement that they have “enough” into the exact **current committed-menu requirement**, while recording that the amount was derived from current requirements rather than stated numerically by the customer.

## 7. Evidence and ambiguity

Candidate intents/preferences/constraints/inventory/references carry concise evidence text where applicable. Provider-backed evidence fields and reference text must be grounded as normalized spans of the actual customer input; paraphrased or invented evidence is rejected before the understanding object is accepted.

Event facts remain non-authoritative candidates in D1 and are **not** authorised for direct mutation merely because the model supplied a type-valid value. Later orchestrator integration must resolve them against customer text/current context or obtain clarification/confirmation before an authoritative Host tool call.

The parser validates structure and the model interpreter validates evidence grounding. Evidence is still non-authoritative and cannot prove a fact by itself.

Ambiguity is represented explicitly with:

- field/topic;
- reason;
- one bounded clarification question;
- optional evidence.

A material ambiguity blocks the affected mutation until resolved.

## 8. Conversational references

Reference candidates may identify customer-language references to:

- current event;
- menu option;
- current task;
- previous change;
- inventory requirement.

The model may provide an ordinal or name candidate. It may not provide a trusted domain/event ID that bypasses deterministic application resolution.

## 9. Strict schema rule

The Phase D parser rejects:

- non-object output;
- unknown top-level fields;
- unknown nested fields;
- unsupported intent/reference/inventory/constraint categories;
- invalid confidence values;
- invalid numeric facts;
- contradictory inventory evidence classes;
- arbitrary extra execution fields.

Malformed model output falls back or stops safely; it does not become a partially trusted object.

D1 also bounds model output size. Current parser/schema limits are:

- at most 8 intents;
- at most 16 constraints;
- at most 16 preferences;
- at most 64 inventory candidates;
- at most 16 conversational references;
- at most 8 ambiguities;
- at most 500 characters per structured text field.

These limits are application controls as well as provider-schema hints; an oversized response is rejected even if a provider returns it.

## 10. Provider boundary

Live provider credentials are server-only.

The first live adapter uses the OpenAI Responses API through raw server-side `fetch` and requests strict JSON-schema output. This does **not** authorise browser credential storage and does not make OpenAI output authoritative.

Provider/model identifiers are configuration, not hard-coded product truth.

The server adapter additionally bounds a customer text input to 8,000 characters and requests at most 4,000 output tokens by default. Both values are configurable server-side and validated before use.

The browser runtime is not changed to contain an API key.

Provider research was re-checked on 2 September 2026 against the current OpenAI Responses API reference. The API supports structured text output using `text.format` with `type: "json_schema"`, `strict: true`, and request-level `store: false` / `max_output_tokens`. The adapter still performs its own strict parser validation after the provider returns data; provider-side schema conformance is not treated as application authority.

## 11. Fallback

`ResilientUnderstandingInterpreter` retains deterministic functionality when the preferred live understanding path:

- throws;
- times out;
- returns invalid schema;
- returns unusable confidence.

Fallback may be less capable but must leave Host's authoritative state usable.

## 12. D1 acceptance

D1 is accepted only when:

- understanding types exist;
- strict parser/schema exists;
- deterministic legacy fallback adapter exists;
- resilient preferred/fallback interpreter exists;
- server-only live Responses adapter exists;
- provider errors/refusals/incomplete or ambiguous responses/invalid outputs cannot become CustomerUnderstanding;
- provider-backed evidence that is not grounded in the actual customer text is rejected;
- high-confidence but content-empty `unknown` output cannot suppress a useful deterministic fallback;
- structured output and provider request sizes are bounded;
- browser runtime contains no provider credential path;
- tests cover valid, invalid, multi-intent, inventory, ambiguity, reference, provider failure and fallback cases;
- existing 99 application/backend tests and 26 browser tests remain passing;
- production audit/build remain passing.

D1 does **not** claim a real external model call has been executed. That requires a real provider credential/runtime and separate evidence before Phase D can be finally closed.

## 13. D2 acceptance direction

After D1 passes, D2 may integrate the new understanding contract into the controlled orchestrator and add the purpose-built inventory-coverage capability.

D2 must preserve:

- exact-revision checks;
- explicit customer confirmation semantics;
- no guessed units;
- no model direct mutation;
- no automatic material action;
- existing late-change confirmation path;
- deterministic fallback.
