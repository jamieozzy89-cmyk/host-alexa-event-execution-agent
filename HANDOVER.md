# Host — Current Controlled Handover

Updated: 2 September 2026

## One-line continuation rule

Continue only from repository `jamieozzy89-cmyk/host-alexa-event-execution-agent`, branch `host-competition-build`. Git is the controlling source. Before changing product code, read this handover plus `docs/HOST_COMPETITION_PRODUCT_SPEC_V1.md`, `docs/HOST_COMPETITION_IMPLEMENTATION_MAP_V1.md`, and the current phase verification report. `main` is the preserved accepted baseline and must not be changed, merged or promoted automatically.

---

# Current controlled state

The project is a competition-grade rebuild of **Host: Alexa+ Event Execution Agent** around the already-proven authoritative execution engine.

Completed development stages:

- **Phase A — product specification, source-control cleanup, direct architecture audit and implementation map:** complete.
- **Phase B — read-only OperatingProjection, derived customer lifecycle and deterministic Attention Engine:** complete and verified.
- **Phase C — bounded goal-directed workflow orchestration:** product code complete and full code-head gate passed. This handover/documentation preservation head must still pass the same full gate before Phase C is finally closed.

The next product stage after final Phase C preservation verification is:

**Phase D — conversational fact acquisition.**

Do not begin Phase D until the exact final Phase C preservation head has passed the full branch gate and a new controlled source artifact has been preserved.

Permanent integrity rule:

> Nothing becomes done because model text, Alexa speech, UI copy or an external client says it happened. Only validated Host tool/domain state and verified external results establish completion.

Controlled execution path:

`customer goal -> interpretation/planning -> validated Host tool -> domain validation -> persistence/external result -> receipt/audit -> customer response`

There is still one authoritative mutation path. The Phase B read model and Phase C planner/orchestrator do not create alternate domain mutation routes.

---

# Repository and source-control state

Repository:

`jamieozzy89-cmyk/host-alexa-event-execution-agent`

Preserved accepted baseline branch:

`main`

Preserved accepted baseline commit:

`65a664ba60093991e47766c80cb5c365847f04a9`

Competition development branch:

`host-competition-build`

Phase B final verified preservation head:

`14c93ebfc5e425db6ee970cf5a5b71d0fcd6c5da`

Phase C successfully verified **code head**:

`01f6a02ba58d033855445421dc390d8d275486b6`

Phase C verification-report commit:

`1f426892c25abe7cad4e5f5fc9d15a51516a66f0`

This handover commit is later than the successful Phase C code-head run and therefore requires its own full preservation gate before Phase C is called closed.

No automatic merge to `main` is authorised. Future promotion requires an explicit current user instruction after the competition build passes its later release gates.

---

# Product and competition target

Project:

**Host: Alexa+ Event Execution Agent**

Competition:

**Build, Ship, Shape: Amazon Developer Hackathon 2026**

Primary track:

**Alexa+**

Selected mini challenge:

**Open Source**

AWS Builder:

**not currently claimed**. No verified AWS runtime integration exists yet.

Core product mission:

> Host is the execution agent responsible for carrying a home-hosting event from initial intent to verified readiness while the customer remains in control of consequential decisions.

Core promise:

> From “people are coming over” to “everything is actually ready.”

The product should continuously answer:

1. What is happening?
2. What needs attention?
3. What should I do next?

Conversation is an input/explanation surface, not the final information architecture.

Customer-facing target lifecycle:

`INTAKE -> PLAN -> SHOP -> PREP -> LIVE -> READY -> HOSTING -> COMPLETE`

READY/HOSTING are currently derived customer stages where appropriate, not invented persisted domain statuses.

---

# Protected authoritative engineering foundation

The existing domain/tool/persistence engine remains the protected execution foundation.

Retained capabilities include:

- typed event state and revisions;
- event start/timezone/guest count/budget/currency;
- confirmed constraints/preferences;
- confirmation-gated menu commitment;
- inventory quantities;
- authoritative shopping reconciliation;
- no guessed unit conversions;
- dependency-aware preparation graph;
- task readiness/completion validation;
- action receipts and audit history;
- read-only late-change impact analysis;
- atomic confirmed change application;
- preservation of unaffected completed work where definitions remain unchanged;
- reversible latest-safe actions;
- version/checksum/domain-validated persistence;
- primary/backup/temporary recovery;
- pending uncommitted impacts intentionally not persisted as committed Host state;
- controlled `HostAgentOrchestrator`;
- deterministic `HeuristicIntentInterpreter`;
- structured model-backed interpreter seam and resilient fallback;
- browser touch/voice routed through the same application/tool path;
- explicit voice-unavailable fallback;
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

A later phase may add a tool only if the capability is deliberately designed, justified, schema-controlled and tested. Do not grow the tool surface by convenience.

---

# Baseline accepted product evidence

Before the competition rebuild, the promoted editorial baseline passed:

- backend/application: **74 passed, 0 failed**;
- production TypeScript/Vite build;
- Playwright: **26 passed, 0 failed** across Echo-like 1280×800 and mobile 390×844;
- Axe WCAG A/AA scope;
- privacy/storage/recovery/focus/network-boundary checks;
- seven real product-state captures and direct visual examination.

Baseline refinement run:

- run `33581353724`;
- job `100096132537`.

Baseline screenshot commit:

`46b537fc3b79fcae20ff59bb49d5d52ccf331ff9`

Baseline gallery artifact:

- ID `9828517705`;
- SHA-256 `3ebba29dfab769fd46f2bb3f975434498b30d327afb0df42ad726015599fc648`.

Baseline demo-source artifact:

- ID `9828582371`;
- SHA-256 `b27c910ecec716437e8a935b0c51b0121395d79588364fe0e1d2ff9312fdee02`.

That demo artifact is a silent captioned working-app source recording, not a final public competition video.

---

# Phase A — controlling design conclusions

Phase A established the full competition product specification and implementation map.

Controlling documents:

- `docs/HOST_COMPETITION_PRODUCT_SPEC_V1.md`
- `docs/HOST_COMPETITION_IMPLEMENTATION_MAP_V1.md`

Key conclusions still control later work.

## Domain reuse

Event Home, lifecycle, attention, Run Sheet, Ready, receipts and much timing-health presentation should be derived over authoritative state rather than duplicated into competing persisted UI state.

## Shopping truth

Current authoritative calculation remains:

`required - confirmed on hand = to buy`

Unit mismatch fails rather than guessing a conversion.

## Preparation truth

The existing preparation graph:

- derives task `dueBy` from event time + task offset;
- validates an acyclic dependency graph;
- blocks tasks whose dependencies are incomplete;
- preserves completed unchanged tasks during replanning;
- exposes the earliest ready task by `dueBy`.

Full dependency-aware latest-start/slack/on-track/behind reasoning remains future Phase F work and must use an injected clock.

## Late-change signature capability

Current late-change architecture remains:

1. clone current state;
2. apply proposed guest/constraint/menu change to proposal only;
3. validate compatibility/servings;
4. recalculate shopping;
5. rebuild prep while preserving valid completed tasks;
6. calculate changed shopping, added/removed tasks and preserved completed tasks;
7. retain a pending impact;
8. require explicit confirmation;
9. reject stale revisions;
10. apply atomically only after confirmation.

Phase C preserves this path.

## Recipe/dietary safety gap

Current semantics are not sufficient for final broad dietary-safety claims.

Phase E must add stronger structured menu coverage semantics before richer guest-specific compatibility claims are made.

## Inventory semantic rule

Authoritative `InventoryItem` requires quantity + unit.

A vague statement such as “I have rice, oil and lemons” must not silently become exact quantities.

Phase C therefore deliberately supports explicit zero-inventory review but does not pretend to extract exact free-text pantry quantities.

Phase D/E must design the richer fact/coverage route rather than improvising it.

---

# Phase B — read-only operating model

Permanent verification report:

`reports/PHASE_B_VERIFICATION.md`

Phase B final preservation head:

`14c93ebfc5e425db6ee970cf5a5b71d0fcd6c5da`

Final Phase B run:

`33617645927`

Final Phase B source artifact:

- name `host-competition-build-source`;
- ID `9841617376`;
- SHA-256 `3dcb7744d05163a123c2e0c0eca4a97f4da850f1829e6d71bd658d24bd7b8c8a`.

Phase B evidence:

- **87/87** backend/application tests;
- **26/26** browser tests;
- production build passed;
- production audit reported **0 vulnerabilities**.

## `src/application/event-operating-state.ts`

Provides:

- `EventOperatingSource`;
- `OperatingProjection`;
- `HostApplicationReadService`;
- inventory/shopping/preparation/readiness summaries.

The read service:

- depends on persistence, not direct domain mutation;
- loads validated committed state;
- clones/sanitizes before returning values;
- exposes only necessary operating data;
- does not expose raw HostState, undo snapshots, all menus or live pending-impact caches;
- performs no mutation.

Timing remains explicitly:

`health: "not_evaluated"`

until the later timing phase.

## `src/application/lifecycle.ts`

Customer lifecycle is derived rather than persisted.

READY requires:

- preparation graph exists;
- active preparation tasks are complete;
- shopping has been authoritatively evaluated;
- no unresolved shopping remains.

Prep completion alone cannot falsely declare READY while acquisition remains unresolved.

## `src/application/attention.ts`

Deterministically chooses exactly one primary attention item.

Priority order:

1. explicit confirmation;
2. blocking/latest consequential failure;
3. pending change review;
4. missing material input;
5. menu decision;
6. inventory review;
7. shopping;
8. preparation/run-sheet construction;
9. current preparation task;
10. ready;
99. no customer action.

`AttentionContext.inventoryConfirmed` exists because an empty inventory map cannot distinguish “customer confirmed nothing is on hand” from “inventory has not been reviewed.”

---

# Phase C — bounded goal-directed workflow orchestration

Permanent verification report:

`reports/PHASE_C_VERIFICATION.md`

Successful Phase C code-head run:

- head `01f6a02ba58d033855445421dc390d8d275486b6`;
- run `33672701928`;
- job `100389922753`;
- conclusion **success**.

The exact handover/report preservation head still requires a new full run before Phase C is finally closed.

## Phase C purpose

The old orchestrator was too command/request driven: customers had to know to ask for internal stages such as shopping and prep.

Phase C adds bounded goal-directed continuation without allowing the planner to become an authority.

Normal controlled flow is now:

`event request -> menu choices -> explicit menu confirmation -> inventory review -> shopping reconciliation -> preparation run sheet -> next action`

## Automatic-work boundary

Only these tools may be automatically selected by the Phase C workflow runner:

1. `build_shopping_plan`
2. `build_preparation_plan`

They are encoded in the restricted `AutomaticWorkflowTool` type.

The runner cannot automatically choose:

- menu commitment;
- cart preparation;
- checkout;
- late-change application;
- undo;
- lifecycle transition;
- real payment/order actions.

## `src/agent/workflow.ts`

Provides:

- `WorkflowGoal`;
- `WorkflowStep`;
- `WorkflowExecutionRecord`;
- `WorkflowRequiredInput`;
- `WorkflowConfirmationBoundary`;
- `WorkflowStopReason`;
- `WorkflowPlan`;
- `WorkflowRunResult`;
- `planLowRiskWorkflow()`;
- `runLowRiskWorkflow()`.

The plan is ephemeral, not HostState.

It records:

- goal;
- base revision;
- candidate steps;
- completed execution/replan trace;
- required input;
- confirmation boundary;
- stop reason.

Each execution record includes:

- tool;
- attempted revision;
- reason;
- success/failure/stale-replan status;
- resulting revision where available;
- error code where applicable;
- returned low-risk result data where applicable.

### Bounds

Default maximum successful automatic steps per run:

`4`

Default maximum stale replans:

`2`

If the successful-step bound is reached, stop reason is explicitly:

`step_limit`

It is not falsely reported as “no low-risk work remains.”

### Stale revision control

`STALE_REVISION` causes:

1. stale attempt record;
2. fresh OperatingProjection read;
3. deterministic replan from current state;
4. execution only if the new plan still selects an allowed low-risk tool;
5. stop if the stale-replan bound is exceeded.

No blind replay is permitted.

### Failure control

A non-stale tool failure stops the workflow immediately.

No later step is executed or represented as complete.

Earlier successful low-risk state remains authoritative and may still be shown to the customer.

## `src/agent/goal-orchestrator.ts`

`GoalDirectedHostAgentOrchestrator` wraps, rather than replaces, the proven `HostAgentOrchestrator`.

The base orchestrator remains responsible for:

- interpretation;
- event creation;
- menu proposals/selections;
- confirmation handling;
- late changes;
- checkout confirmation;
- task completion;
- history/undo;
- friendly errors.

The wrapper adds only controlled workflow continuation.

### Event creation

After a complete event request is successfully committed, Host automatically surfaces menu choices in the same customer turn.

No menu is committed automatically.

### Menu confirmation

Customer selection enters the existing `commit_menu` confirmation path.

Before confirmation, authoritative selected menu remains unchanged.

After confirmation, the menu is committed and Host stops for inventory review.

### Inventory review

Host asks:

> What required ingredients do you already have? If you have none of them, say “I don't have any of them.”

Vague pantry language is not converted into authoritative quantities.

Explicit zero-inventory language is accepted as the deterministic completion route for this phase.

After explicit review Host automatically runs the permitted shopping/prep sequence.

### Interruptions

Late guest/dietary changes, status/history/help can interrupt the inventory-review turn through the controlled base orchestrator.

A late change still uses:

- read-only impact analysis;
- visible impact;
- explicit confirmation;
- atomic confirmed update.

### Restart/resume invariant

Partial recorded inventory is **not** proof the complete inventory review occurred.

Correct resume rule:

- some inventory + no shopping -> still ask for inventory review;
- authoritative shopping exists -> reconciliation has advanced enough;
- shopping exists + no prep -> resume may safely auto-build prep;
- no stale pending confirmation is restored as committed truth.

This invariant has dedicated restart tests.

## Browser path

`web/runtime.ts` constructs `GoalDirectedHostAgentOrchestrator` with:

- the same `HostToolRuntime`;
- same persistence adapter;
- `HostApplicationReadService` projection reader;
- same deterministic demo providers.

Voice and touch therefore exercise the same goal-directed application path.

---

# Phase C direct source-audit findings and fixes

Phase C was not accepted merely because the first implementation looked plausible.

## 1. Old test expected the wrong post-confirmation status

An old test expected `ok` immediately after menu confirmation.

Phase C intentionally requires an inventory stop.

The test now verifies:

- `needs_input`;
- inventory question;
- authoritative menu already committed.

## 2. Workflow plan contract was too thin

Initial runner behavior was bounded, but the plan did not explicitly carry the complete trace/confirmation boundary required by the implementation map.

Fixed by adding:

- `candidateSteps`;
- `completedSteps`;
- `WorkflowConfirmationBoundary`;
- `step_limit`;
- explicit reason/revision/result trace.

## 3. Partial inventory was incorrectly treated as completed review after restart

Initial resume logic used positive inventory-item count as proof review was complete.

That violated the controlling inventory semantics.

Fixed so only existing authoritative shopping proves reconciliation has already occurred. Dedicated restart tests prevent regression.

## 4. Optional OperatingProjection event assumption

The enriched plan exposed a TypeScript narrowing error because `OperatingProjection.event` is optional in the declared projection type.

Fixed by narrowing once and passing the verified revision explicitly into the candidate-plan helper. No non-null assertion or guessed revision was used.

---

# Phase C code-head verification evidence

Permanent report:

`reports/PHASE_C_VERIFICATION.md`

Successful code head:

`01f6a02ba58d033855445421dc390d8d275486b6`

Run:

`33672701928`

Job:

`100389922753`

Environment:

- Ubuntu 24.04;
- Node 22.12.0;
- npm 10.9.0.

## Application/backend

`npm test`

- **99 tests**;
- **99 passed**;
- **0 failed**;
- **0 skipped**.

Phase C-specific successful tests cover:

- automatic menu surfacing;
- inventory stop after confirmed menu;
- vague pantry no-guess rule;
- explicit zero-inventory shopping→prep chain;
- shopping/prep no-bypass rule;
- late-change interruption;
- plan trace + explicit confirmation boundary;
- stale-revision refresh/replan;
- non-stale failure stop;
- explicit bounded `step_limit`;
- partial-inventory restart invariant;
- shopping-proves-reconciliation resume continuation.

## Production dependency audit

`npm audit --omit=dev`

**0 vulnerabilities**

## Production web build

`npm run build:web`

- web TypeScript typecheck passed;
- Vite 8.2.2 production build passed;
- 37 modules transformed.

## Browser

`npx playwright test`

- **26/26 passed**;
- Echo-like project;
- mobile project.

Coverage includes:

- Phase C touch journey;
- late vegan guest interruption/preview/confirmed update;
- reload/resume;
- touch targets/no overflow;
- WCAG A/AA automated checks;
- keyboard/dialog focus;
- voice-only Phase C journey with one activation;
- voice late change and receipts;
- spoken no cancellation;
- voice-unavailable touch fallback;
- corrupt persistence handling;
- memory fallback;
- local-data deletion/privacy behavior;
- no unexpected cross-origin deterministic application requests.

## Code-head source artifact

Artifact name:

`host-competition-build-source`

Artifact ID:

`9863157836`

Size:

`784598` bytes

Outer artifact SHA-256:

`6cd94fc7e22415c6d253c59c66cafecc5d4463a5adf388af10c9f23d17e7cb57`

Contents:

1. tracked-source ZIP from `git archive HEAD`;
2. source ZIP SHA-256 file;
3. source provenance file.

This preserves the successful **code head**, not the later report/handover preservation head.

---

# Competition-build verification workflow

Workflow:

`.github/workflows/competition-build-verify.yml`

For each current development-branch push it performs:

1. checkout `host-competition-build`;
2. Node 22.12.0;
3. `npm ci --ignore-scripts`;
4. Chromium install;
5. `npm test`;
6. `npm audit --omit=dev`;
7. `npm run build:web`;
8. `npx playwright test`;
9. tracked-source ZIP assembly;
10. source SHA-256/provenance assembly;
11. controlled artifact upload.

Concurrency cancellation prevents obsolete superseded branch runs from becoming the controlling result.

Do not treat an earlier green run as proof of a later head. Always match workflow `head_sha` to the exact branch head being claimed.

---

# Current external Alexa+/MCP constraints retained

The competition build still does not claim production Alexa MCP deployment.

Current later-stage constraints retained from research/specification include:

- simulated Alexa+ route remains valid for the competition path;
- working Agent Skill quality is the priority;
- self-hosted MCP requires a remotely reachable service;
- OAuth/PKCE/protected-resource authorization requirements must be followed when real Alexa MCP onboarding begins;
- latency/reliability must be measured against the actual remote path;
- AWS/Bedrock/AgentCore claims must not be made until real integration is implemented and verified.

Do not fabricate a live URL, AWS implementation, hardware certification or public video.

---

# Remaining product roadmap after Phase C

The controlling implementation map defines later stages. Do not skip ahead or collapse them.

## Phase D — conversational fact acquisition

Next authorised development stage **only after final Phase C preservation passes**.

Purpose:

- richer event facts and corrections;
- conversational references;
- multi-intent handling;
- ambiguity control;
- inventory candidate extraction without inventing quantities;
- preserve deterministic authoritative boundary.

## Phase E — richer menu/recipe/guest compatibility semantics

Must fix the current dietary/allergen coverage limitations before stronger safety claims.

## Phase F — timing intelligence

Must add injected-clock, dependency-aware latest-start/slack/on-track/behind reasoning. Do not use raw wall-clock logic scattered through UI/model code.

## Later phases

Still include, as specified in the implementation map:

- richer Event Home / Run Sheet / Ready views;
- multi-event/multi-user scope if justified by the map;
- external Alexa/MCP/AWS integration where actually needed;
- full competition visual rebuild and direct visual audit;
- final demo capture/video;
- submission packaging and Devpost completion.

---

# What is still explicitly NOT implemented/claimed

Do not claim any of these as complete:

- production AWS/Bedrock integration;
- AgentCore integration;
- Alexa hardware certification;
- real retailer ordering/payment;
- production OAuth/MCP deployment;
- final recipe-safety semantics;
- exact free-text pantry quantity extraction;
- full dependency-aware timing/slack health;
- final competition UI redesign;
- final public narrated demo;
- final Devpost submission.

---

# Exact continuation procedure

Before the next product phase:

1. Fetch current `host-competition-build` head.
2. Verify the newest `Competition build verification` run has `head_sha` equal to that exact head.
3. Require all of:
   - application/backend tests passing;
   - production dependency audit passing with no vulnerabilities;
   - production web build passing;
   - full Echo/mobile Playwright suite passing;
   - controlled source artifact uploaded.
4. Fetch final artifact metadata and preserve/download the final Phase C safe source package.
5. Re-fetch `main` and confirm it remains unchanged at the protected baseline unless the user explicitly authorised promotion.
6. Only then call Phase C closed.
7. On the next user `continue`, begin **Phase D** by reading the controlling Phase D sections of the product specification/implementation map and auditing the existing interpreter/orchestrator/fact surfaces before editing code.

Do not merge to `main` as part of Phase C closure.

---

# Phase C closure condition

Phase C is finally closed only when the exact current preservation head containing:

- the Phase C code;
- `reports/PHASE_C_VERIFICATION.md`;
- this self-contained handover;

passes the full competition-build gate and produces its own controlled source artifact.

Until that exact run succeeds, describe Phase C as **code-complete and code-head verified, preservation verification pending**.
