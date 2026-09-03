# Host — Current Controlled Handover

Updated: 3 September 2026

## Continuation rule

Continue only from repository `jamieozzy89-cmyk/host-alexa-event-execution-agent`, branch `host-competition-build`.

Git is the controlling source. Before changing product code:

1. fetch the current `host-competition-build` head;
2. fetch the newest `Competition build verification` run;
3. require its `head_sha` to equal the exact current branch head and require conclusion `success`;
4. read this handover;
5. read `docs/HOST_COMPETITION_PRODUCT_SPEC_V1.md`;
6. read `docs/HOST_COMPETITION_IMPLEMENTATION_MAP_V1.md`;
7. read the latest phase verification report;
8. verify `main` has not moved without explicit user approval.

`main` is the preserved accepted baseline. Do **not** merge, promote, rebase onto, or otherwise change `main` without an explicit current user instruction.

Permanent integrity rule:

> Nothing becomes done because model text, Alexa speech, UI copy or an external client says it happened. Only validated Host tool/domain state and verified external results establish completion.

Permanent execution path:

`customer goal -> interpretation/planning -> validated Host tool -> domain validation -> persistence/external result -> receipt/audit -> customer response`

There is one authoritative mutation path. Read models, model output and workflow planning may inform decisions; they do not create parallel truth.

---

# Current controlled state

Project:

**Host: Alexa+ Event Execution Agent**

Competition:

**Build, Ship, Shape: Amazon Developer Hackathon 2026**

Primary track:

**Alexa+**

Selected mini challenge:

**Open Source**

Current implementation route:

**simulated Alexa+ web experience**, with later live model/MCP/Alexa integration only when actually implemented and verified.

Core promise:

> From “people are coming over” to “everything is actually ready.”

Core product mission:

> Host is the execution agent responsible for carrying a home-hosting event from initial intent to verified readiness while the customer remains in control of consequential decisions.

Host should continuously answer:

1. What is happening?
2. What needs attention?
3. What should I do next?

Customer-facing target lifecycle:

`INTAKE -> PLAN -> SHOP -> PREP -> LIVE -> READY -> HOSTING -> COMPLETE`

Conversation is an input/explanation surface, not the final information architecture.

Completed controlled stages:

- **Phase A — product specification, source-control cleanup, architecture audit and implementation map:** complete.
- **Phase B — read-only OperatingProjection, derived lifecycle and deterministic Attention Engine:** complete and verified.
- **Phase C — bounded goal-directed workflow orchestration:** closed and verified.
- **Phase D1 — structured non-authoritative conversational-understanding boundary:** **closed and verified**.

Whole Phase D is **not complete**.

Next authorised substantive substage:

**Phase D2 — controlled orchestrator integration and inventory-coverage capability.**

D1 preservation is complete. Before changing D2 product code, the then-current closure-record head must still have its own successful exact-head competition-build run under the permanent rule below.

---

# Source-control state

Repository:

`jamieozzy89-cmyk/host-alexa-event-execution-agent`

Development branch:

`host-competition-build`

Protected accepted baseline branch:

`main`

Protected baseline commit:

`65a664ba60093991e47766c80cb5c365847f04a9`

No competition-build work has been merged to `main`.

Important verified historical heads:

- Phase B final preservation head: `14c93ebfc5e425db6ee970cf5a5b71d0fcd6c5da`
- Phase C final verified head before Phase D: `f007ef48e3f53bd2f26846692a2d511bd9fe2dd2`
- Phase D1 verified product-code head: `e5e0bd428af04c391907cc77ebe4b2db724495f8`
- Phase D1 verification-report commit: `c52997fd68397a5d87213480871ab39498b21372`
- Phase D1 report/handover preservation head: `49dc849d516f042fd5e42089934d17cfced9ced7`
- Phase D1 preservation run: `33814183151`
- Phase D1 preservation artifact: `9916037746`

The preservation head passed the full gate and its downloaded artifact was independently checksum/provenance verified. D1 is therefore closed. This closure-record update is documentation-only; the permanent exact-head rule still requires this new closure head to pass before D2 code changes begin.

## Redundant temporary branch created during D1

A source-control mistake occurred during D1 preparation: an unnecessary branch was created:

`host-d1-staging-temp`

It points to the historical verified Phase C head:

`f007ef48e3f53bd2f26846692a2d511bd9fe2dd2`

It contains no D1 product changes and is **not** an authorised continuation branch.

The available GitHub connector exposed file deletion but not branch-ref deletion, so it could not be removed from this environment. Do not use it. If branch deletion later becomes available, delete it only after re-verifying that it still points solely to the historical Phase C state.

The active development branch is only:

`host-competition-build`

---

# Protected authoritative engineering foundation

The existing domain/tool/persistence engine remains protected.

Retained authoritative capabilities include:

- typed event state and revisions;
- event start/timezone/guest count/budget/currency;
- confirmed constraints and preferences;
- confirmation-gated menu commitment;
- exact inventory quantities;
- authoritative shopping reconciliation;
- no guessed unit conversions;
- dependency-aware preparation graph;
- task readiness/completion validation;
- receipts and audit history;
- read-only late-change impact analysis;
- atomic confirmed late-change application;
- preservation of unaffected completed work where definitions remain unchanged;
- latest-safe reversible actions;
- version/checksum/domain-validated persistence;
- primary/backup/temporary recovery;
- uncommitted late-change impacts not persisted as committed truth;
- controlled `HostAgentOrchestrator`;
- deterministic `HeuristicIntentInterpreter`;
- goal-directed orchestration wrapper;
- touch and voice through the same application/tool path;
- voice-unavailable fallback;
- privacy/storage/recovery/focus/accessibility hardening.

Protected Host tool surface remains 17 tools:

1. `create_event`
2. `update_event_constraints`
3. `propose_menu`
4. `commit_menu`
5. `record_inventory`
6. `build_shopping_plan`
7. `prepare_cart`
8. `confirm_cart_action`
9. `build_preparation_plan`
10. `mark_task_complete`
11. `advance_event_status`
12. `get_next_action`
13. `get_event_status`
14. `analyse_change_impact`
15. `apply_confirmed_change`
16. `get_action_history`
17. `undo_reversible_action`

Do not add a tool for convenience. Any new authoritative capability requires deliberate design, strict schema, risk classification, revision/confirmation semantics where applicable, authoritative implementation and focused tests.

---

# Phase A — controlling product/architecture decisions

Controlling files:

- `docs/HOST_COMPETITION_PRODUCT_SPEC_V1.md`
- `docs/HOST_COMPETITION_IMPLEMENTATION_MAP_V1.md`

These remain active.

## Product architecture

The target product is not a generic AI chat application. The event operating state is primary; conversation supplies intent, clarification and explanation.

The final visual direction later in the roadmap is:

- Event Home centered on current event truth;
- one deterministic attention item;
- visible PLAN / SHOP / PREP / HOST progression;
- shopping reconciliation showing HAVE versus NEED;
- dependency-aware Run Sheet;
- extremely low-density hands-busy Live Mode;
- signature late-change impact surface showing what changes and what remains preserved;
- receipts showing what Host actually did;
- completion/ready state that closes the hosting loop.

Do not revert to cosmetic-only redesign work before the required capability phases are complete.

## Domain reuse

Lifecycle, attention, Event Home, Run Sheet, Ready, receipts and later timing presentation should be derived from authoritative state where possible rather than duplicated into competing persisted UI truth.

## Shopping truth

Authoritative calculation remains:

`required - confirmed on hand = to buy`

Unit mismatch fails. Host does not guess a conversion.

## Preparation truth

The current preparation graph:

- derives task `dueBy` from event time + offset;
- validates acyclic dependencies;
- blocks tasks whose dependencies are incomplete;
- preserves unchanged completed tasks during replanning;
- exposes earliest ready task by `dueBy`.

Full latest-start/slack/on-track/behind logic remains future timing work and must use an injected clock rather than scattered wall-clock logic.

## Late-change invariant

The signature late-change path remains:

1. clone current authoritative state;
2. apply proposed guest/constraint/menu change to proposal only;
3. validate compatibility/servings;
4. recalculate shopping;
5. rebuild preparation while preserving valid completed work;
6. calculate impact;
7. retain pending impact;
8. require explicit confirmation;
9. reject stale revisions;
10. apply atomically only after confirmation.

Neither Phase C nor D1 bypasses this path.

## Recipe/dietary safety gap

Current menu semantics are insufficient for final broad guest-specific dietary/allergen claims.

Later Phase E must introduce stronger structured menu/recipe coverage semantics before richer safety claims are exposed.

## Inventory truth

Authoritative inventory requires quantity and unit.

A vague phrase such as “I have rice, oil and lemons” must never silently become exact inventory quantities.

Phase D is responsible for richer candidate extraction and controlled coverage confirmation without fabricating what the customer said.

---

# Phase B — verified operating projection

Verification report:

`reports/PHASE_B_VERIFICATION.md`

Final verified preservation head:

`14c93ebfc5e425db6ee970cf5a5b71d0fcd6c5da`

Final run:

`33617645927`

Evidence:

- **87/87** backend/application tests;
- **26/26** browser tests;
- production build passed;
- production audit: **0 vulnerabilities**.

Phase B provides:

- `HostApplicationReadService`;
- sanitized `OperatingProjection`;
- inventory/shopping/preparation/readiness summaries;
- derived customer lifecycle;
- deterministic Attention Engine.

READY requires:

- an active preparation graph;
- required prep completed;
- shopping authoritatively evaluated;
- no unresolved shopping.

Prep completion alone cannot falsely declare READY.

Attention priority remains:

1. confirmation;
2. consequential failure;
3. pending change review;
4. missing material input;
5. menu decision;
6. inventory review;
7. shopping;
8. run-sheet construction;
9. current prep task;
10. ready;
99. no action.

An empty inventory map is not proof that inventory review happened.

---

# Phase C — verified bounded goal-directed orchestration

Verification report:

`reports/PHASE_C_VERIFICATION.md`

Final verified Phase C head before D1:

`f007ef48e3f53bd2f26846692a2d511bd9fe2dd2`

Phase C changed the normal customer sequence to:

`event request -> menu choices -> explicit menu confirmation -> inventory review -> authoritative shopping -> preparation run sheet -> next action`

Customers no longer need to know internal commands such as “build shopping plan” and “build prep plan” to progress a normal hosting workflow.

## Automatic-work boundary

Only these tools are eligible for automatic Phase C workflow execution:

1. `build_shopping_plan`
2. `build_preparation_plan`

Automatic execution still cannot choose menu commitment, cart preparation, checkout, lifecycle transition, late-change application, undo or payment/order actions.

## Stale revision rule

`STALE_REVISION` causes:

1. stale attempt recorded;
2. fresh OperatingProjection read;
3. deterministic replan from current state;
4. only still-justified permitted low-risk work may execute;
5. bounded stop if stale replans are exhausted.

No blind replay.

## Failure rule

A non-stale tool failure stops the workflow immediately. Later steps are not represented as completed. Earlier successful low-risk state remains authoritative.

## Inventory/restart invariant

Partial recorded inventory is not proof a complete inventory review happened.

Resume behavior:

- some inventory + no shopping -> inventory review still required;
- authoritative shopping exists -> reconciliation has advanced far enough;
- shopping exists + no prep -> missing prep may be built;
- stale pending confirmation is not restored as committed truth.

## Phase C verification baseline immediately before D1

Phase C reached:

- **99/99** backend/application tests;
- **26/26** browser tests;
- production build passing;
- production audit **0 vulnerabilities**;
- portable source artifact with relative self-verifying checksum and provenance.

The source-preservation workflow was corrected after a downloaded Phase C artifact exposed an absolute-path checksum defect. Current workflow writes a relative checksum and verifies it before artifact upload.

---

# Phase D1 — structured conversational understanding boundary

Permanent verification report:

`reports/PHASE_D1_VERIFICATION.md`

Controlling D1 contract:

`docs/PHASE_D_FACT_ACQUISITION_CONTRACT_V1.md`

Verified D1 product-code head:

`e5e0bd428af04c391907cc77ebe4b2db724495f8`

Code-head verification run:

`33813403037`

Job:

`100840137204`

Conclusion:

**success**

## D1 purpose

D1 establishes a richer **non-authoritative** customer-understanding boundary.

Meaning path:

`customer text -> CustomerUnderstanding candidates -> deterministic validation/resolution -> existing Host tool/domain path`

A model result may propose customer meaning. It may not become authoritative state merely because it is generated or schema-valid.

## `CustomerUnderstanding`

`src/model/types.ts` adds bounded candidate types for:

- one or more customer intents;
- event facts;
- constraints;
- soft preferences;
- inventory review and inventory items;
- conversational references;
- explicit ambiguities;
- confidence/evidence.

Allowed intent categories are customer-meaning categories only, including create event, status, next action, menu options/choice, shopping, products, checkout, preparation, history, change, task completion, undo, confirm, cancel, help, provide inventory, update preference and unknown.

The model-facing understanding object contains no arbitrary executable tool name and no trusted domain/event ID supplied by the model.

## Strict parser and schema

`src/model/schema.ts` provides:

1. strict Host-side parser/validation;
2. strict JSON Schema used for provider structured output.

Application limits:

- at most 8 intents;
- at most 16 constraints;
- at most 16 preferences;
- at most 64 inventory candidates;
- at most 16 references;
- at most 8 ambiguities;
- at most 500 characters per structured text field.

The parser rejects:

- non-object output;
- unsupported top-level/nested fields;
- unsupported enum values;
- invalid confidence;
- invalid numeric facts;
- contradictory inventory evidence;
- oversized arrays/text;
- arbitrary execution fields.

### Inventory candidate semantics

Inventory review mode:

- `none` — customer explicitly says none of the relevant items are on hand;
- `items` — customer supplied one or more inventory candidates;
- `unspecified` — no reliable answer established.

Inventory evidence class:

- `stated_quantity` — positive quantity and unit explicitly supplied;
- `enough` — customer says they have enough; no numeric amount/unit is invented;
- `identity_only` — item identity only; no numeric amount/unit is invented.

Rules:

- `none` requires customer evidence and zero items;
- `items` requires customer evidence and at least one item;
- `unspecified` carries no evidence/items;
- `enough`/`identity_only` cannot smuggle quantity/unit fields.

Identity-only input is still not authoritative inventory.

## Evidence grounding

`ModelCustomerUnderstandingInterpreter` validates model-provided evidence and reference text against the actual customer turn after normalization.

If evidence is not grounded in the customer's input, the provider result fails before application use.

Evidence is still only evidence for candidate understanding; it is not authoritative proof of execution/state.

## Deterministic fallback

`LegacyIntentUnderstandingInterpreter` adapts the existing `HeuristicIntentInterpreter` into the new non-authoritative understanding contract.

`ResilientUnderstandingInterpreter` uses the preferred result only when:

- provider path succeeds;
- schema/evidence validation succeeds;
- confidence meets the configured threshold;
- the result is semantically meaningful.

A high-confidence output containing only `unknown` and no useful candidate facts cannot suppress deterministic fallback.

## Server-only OpenAI Responses adapter

`server/openai-understanding-provider.ts` adds the first live-model adapter boundary using raw server-side `fetch`.

Controls:

- API key is supplied only through server configuration;
- model and endpoint are configuration;
- default timeout 12 seconds;
- default max customer input 8,000 characters;
- default max output 4,000 tokens;
- request uses `store: false`;
- request uses strict `text.format` JSON Schema;
- HTTP failure rejected;
- API error rejected;
- response must explicitly have `status: "completed"`;
- refusal rejected;
- missing structured output rejected;
- multiple structured output payloads rejected;
- invalid JSON rejected;
- successful provider output still passes Host parser/evidence validation.

`server/index.ts` composes:

`OpenAI Responses model -> model understanding interpreter -> resilient interpreter -> deterministic heuristic fallback`

`tsconfig.json` includes `server/**/*.ts`, so the server-only adapter participates in the normal TypeScript build.

No provider API-key path was added to `web/runtime.ts` or the browser runtime.

## D1 direct audit fixes before code-head acceptance

Source review found and corrected:

1. high-confidence empty `unknown` could otherwise suppress useful deterministic fallback;
2. structured output needed explicit size bounds;
3. incomplete/refusal/multiple-output provider responses needed explicit failure semantics;
4. schema-shaped evidence needed grounding to actual customer input;
5. inventory `none`/`items` modes needed direct customer evidence and stronger quantity discipline.

## D1 code-head verification evidence

Exact code head:

`e5e0bd428af04c391907cc77ebe4b2db724495f8`

Run:

`33813403037`

Backend/application:

- **118 tests**;
- **118 passed**;
- **0 failed**;
- **0 cancelled**;
- **0 skipped**;
- **0 todo**.

This is the prior 99-test suite plus 19 D1-focused tests.

D1-focused tests cover:

- multi-intent candidate parsing;
- arbitrary/unknown field rejection;
- structured output bounds;
- inventory evidence/quantity semantics;
- grounded/un-grounded model evidence;
- deterministic fallback;
- confidence fallback;
- empty-unknown fallback;
- strict Responses request shape;
- HTTP/incomplete/refusal/multiple-payload failures;
- network-free input-character bound.

Production dependency audit:

**0 vulnerabilities**

Production web build:

- TypeScript web typecheck passed;
- Vite 8.2.2 passed;
- 40 modules transformed.

Browser regression:

- **26/26 passed**;
- Echo-like and mobile projects;
- existing touch/voice, late-change, reload/recovery, WCAG automated checks, focus, privacy/storage and network-boundary controls remained passing.

## D1 code-head source artifact

Artifact name:

`host-competition-build-source`

Artifact ID:

`9915769333`

Size:

`804225` bytes

Outer SHA-256:

`59c6f1683a7e37d2c50d8cf945e7c3d822579af5c9f69a8d194f0137c4d7cc59`

Provenance:

- branch `host-competition-build`;
- commit `e5e0bd428af04c391907cc77ebe4b2db724495f8`;
- created UTC `2026-09-03T22:35:51Z`.

Inner source ZIP SHA-256:

`98e411be1bf1e7b1caa440a048f0b27db303afed2e84887e528087999167c59f`

The artifact was independently downloaded and extracted after CI. The downloaded outer SHA matched GitHub's digest and:

`sha256sum -c HOST_COMPETITION_BUILD_SOURCE.zip.sha256`

returned:

`HOST_COMPETITION_BUILD_SOURCE.zip: OK`

## D1 report/handover preservation evidence

Preservation head:

`49dc849d516f042fd5e42089934d17cfced9ced7`

Run:

`33814183151`

Conclusion:

**success**

The full gate remained passing on the report/handover preservation head.

Preservation artifact:

- ID `9916037746`;
- size `808759` bytes;
- outer SHA-256 `c45383a64cca2ba6bce14d13d6446dd61c25c4859564b30e8d1f8130f264039c`;
- provenance source commit `49dc849d516f042fd5e42089934d17cfced9ced7`;
- inner source ZIP SHA-256 `4bf468d08f800578cb15333a87190e3a5e3c96cbeb3581880e21e5a35e3f93c7`;
- downloaded independent checksum result `HOST_COMPETITION_BUILD_SOURCE.zip: OK`.

This preservation evidence closes D1.

## D1 is not the whole Phase D

Still required in later Phase D work:

- integrate `CustomerUnderstanding` into the controlled orchestrator;
- resolve multi-intent/correction/reference/ambiguity candidates safely against current state;
- add deliberate authoritative inventory-coverage capability if the current preferred `confirm_inventory_coverage` design survives D2 audit;
- enforce revision/confirmation/provenance/receipt semantics for inventory coverage;
- implement `WorkflowSuggestion` required by the controlling map;
- implement `ExplanationInput` / `ExplanationOutput` required by the controlling map;
- execute and preserve evidence of a real model call before any final live-model/Phase-D claim.

No real external model request has been executed or claimed in D1. Tests use controlled/mocked fetch responses to verify the provider boundary.

---

# Current verification/source-preservation workflow

Workflow:

`.github/workflows/competition-build-verify.yml`

For each `host-competition-build` push it performs:

1. checkout exact development branch;
2. Node 22.12.0;
3. `npm ci --ignore-scripts`;
4. Chromium install;
5. `npm test`;
6. `npm audit --omit=dev`;
7. `npm run build:web`;
8. `npx playwright test`;
9. tracked-source ZIP assembly;
10. relative source-ZIP SHA-256 generation;
11. in-workflow `sha256sum -c` verification;
12. source provenance assembly;
13. controlled artifact upload.

Concurrency cancellation prevents superseded branch pushes from becoming controlling evidence.

Permanent exact-head rule:

> An earlier green run is never proof of a later head. The current branch head must have its own successful matching-head run before product code changes continue.

Downloaded artifact verification also requires:

1. downloaded outer ZIP SHA-256 equals GitHub artifact digest;
2. extract artifact;
3. provenance names the expected branch/commit;
4. run `sha256sum -c HOST_COMPETITION_BUILD_SOURCE.zip.sha256`;
5. require `HOST_COMPETITION_BUILD_SOURCE.zip: OK`.

---

# External Alexa+/MCP/AWS state

Do not claim production Alexa/MCP/AWS integration yet.

Known later constraints include:

- the simulated Alexa+ competition route remains valid;
- a stronger real Agent Skill/MCP implementation remains desirable for competitiveness;
- self-hosted MCP requires a remotely reachable service;
- Alexa MCP onboarding requires applicable OAuth 2.1/PKCE/protected-resource authorization controls;
- remote latency/reliability must be measured on the actual path;
- AWS/Bedrock/AgentCore claims require real implemented and verified calls.

Do not fabricate:

- live URL;
- AWS implementation;
- hardware certification;
- real retailer/payment capability;
- public final competition video.

---

# Explicitly not complete

Do **not** claim any of the following are complete:

- whole Phase D;
- real live-model call evidence;
- D2 authoritative inventory coverage;
- WorkflowSuggestion/Explanation contracts;
- final recipe/dietary safety semantics;
- full dependency-aware timing/slack health;
- production AWS/Bedrock/AgentCore integration;
- production OAuth/MCP/Alexa deployment;
- real retailer ordering/payment;
- final competition visual rebuild;
- final public narrated demo;
- final Devpost submission.

---

# Exact current continuation point

D1 is **closed and verified** on its report/handover preservation head `49dc849d516f042fd5e42089934d17cfced9ced7`.

This closure-record edit is documentation-only. Before D2 product code changes:

1. fetch current `host-competition-build` head;
2. require newest competition-build run `head_sha` to match that exact closure head and conclusion `success`;
3. require the full backend/application, dependency-audit, production-build, browser and source-artifact steps to have passed;
4. re-fetch `main` and require it still equals `65a664ba60093991e47766c80cb5c365847f04a9` unless explicit current promotion was authorised;
5. then begin D2 by re-reading the Phase D sections of the controlling specification/map and auditing:
   - `GoalDirectedHostAgentOrchestrator`;
   - `HostAgentOrchestrator`;
   - current 17-tool descriptors/runtime/types;
   - authoritative inventory state and shopping requirement structures;
   - receipts/provenance/revision semantics;
   - D1 `CustomerUnderstanding` contracts/tests.

D2 must define the exact authoritative inventory-coverage contract before implementing any new tool. The preferred current design is `confirm_inventory_coverage`, but the name/schema/risk semantics remain subject to that source audit; do not add it mechanically.

D2 permanent controls:

- model output cannot mutate directly;
- identity-only inventory never becomes numeric automatically;
- customer-stated numeric quantity must remain distinguishable from “enough” derived against current menu requirement;
- no guessed units;
- current event revision must be checked;
- material ambiguity must stop or clarify;
- confirmation semantics must remain explicit where required;
- receipts must preserve provenance;
- late-change path must remain intact;
- deterministic fallback must remain usable.

Do not skip to Phase E/F/UI/AWS/submission work as a shortcut around Phase D.
