# Host — Current Controlled Handover

Updated: 2 September 2026

## Continuation rule

Continue only from repository `jamieozzy89-cmyk/host-alexa-event-execution-agent`, branch `host-competition-build`. Git is the controlling source. Before changing product code, read this handover, `docs/HOST_COMPETITION_PRODUCT_SPEC_V1.md`, `docs/HOST_COMPETITION_IMPLEMENTATION_MAP_V1.md`, and the latest phase verification report.

`main` is the preserved accepted baseline. Do **not** merge, promote, rebase onto, or otherwise change `main` without an explicit current user instruction.

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

Completed rebuild stages:

- **Phase A — product specification, source-control cleanup, architecture audit and implementation map:** complete.
- **Phase B — read-only OperatingProjection, derived lifecycle and deterministic Attention Engine:** complete and verified.
- **Phase C — bounded goal-directed workflow orchestration:** **closed and verified**.

Next development stage:

**Phase D — conversational fact acquisition.**

Do not skip or collapse later phases from the controlling implementation map.

Permanent integrity rule:

> Nothing becomes done because model text, Alexa speech, UI copy or an external client says it happened. Only validated Host tool/domain state and verified external results establish completion.

Controlled execution path:

`customer goal -> interpretation/planning -> validated Host tool -> domain validation -> persistence/external result -> receipt/audit -> customer response`

There is one authoritative mutation path. The read model and workflow planner do not create parallel truth.

---

# Source-control state

Repository:

`jamieozzy89-cmyk/host-alexa-event-execution-agent`

Development branch:

`host-competition-build`

Protected baseline branch:

`main`

Protected baseline commit:

`65a664ba60093991e47766c80cb5c365847f04a9`

Phase B final verified preservation head:

`14c93ebfc5e425db6ee970cf5a5b71d0fcd6c5da`

Phase C verified product-code head:

`01f6a02ba58d033855445421dc390d8d275486b6`

Phase C report commit:

`1f426892c25abe7cad4e5f5fc9d15a51516a66f0`

Phase C report + self-contained handover preservation head:

`5c3ff6478a3605798bad3e8808cdca7e9421b2ab`

Phase C closure-record head:

`7a3a3acaae1d9bfa847af5567f43b92bd8408cfa`

Source-artifact portability hardening commit:

`ddcc0c542a6f89f71818ff0f64dcabe61da5d986`

No Phase C work was merged to `main`.

Permanent exact-head rule:

> Before changing product code, fetch the current development head and require the newest successful competition-build workflow to have that exact `head_sha`. An earlier green run is not proof of a later head.

---

# Product mission

Core mission:

> Host is the execution agent responsible for carrying a home-hosting event from initial intent to verified readiness while the customer remains in control of consequential decisions.

Core promise:

> From “people are coming over” to “everything is actually ready.”

Host should continuously answer:

1. What is happening?
2. What needs attention?
3. What should I do next?

Conversation is an input/explanation surface, not the final information architecture.

Target customer lifecycle:

`INTAKE -> PLAN -> SHOP -> PREP -> LIVE -> READY -> HOSTING -> COMPLETE`

READY/HOSTING remain derived customer stages where appropriate rather than invented persisted domain statuses.

AWS Builder is **not currently claimed**. There is no verified AWS runtime integration yet.

---

# Protected authoritative engineering foundation

The current domain/tool/persistence engine remains the execution foundation.

Protected capabilities include:

- typed event state and revisions;
- event start/timezone/guest count/budget/currency;
- confirmed constraints/preferences;
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
- pending uncommitted impacts deliberately not persisted as committed truth;
- controlled `HostAgentOrchestrator`;
- deterministic `HeuristicIntentInterpreter`;
- structured model interpreter seam and resilient deterministic fallback;
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

Do not add a tool for convenience. A new tool requires a deliberate capability decision, strict schema, risk classification, authoritative implementation and matching tests.

---

# Baseline evidence retained

Before the competition rebuild, the promoted editorial product passed:

- **74/74** backend/application tests;
- production TypeScript/Vite build;
- **26/26** Playwright tests across Echo-like and mobile projects;
- automated Axe WCAG A/AA scope;
- privacy/storage/recovery/focus/network-boundary checks;
- seven real product-state captures and direct visual examination.

Baseline refinement run:

`33581353724`

Baseline gallery artifact:

- ID `9828517705`;
- SHA-256 `3ebba29dfab769fd46f2bb3f975434498b30d327afb0df42ad726015599fc648`.

Baseline demo-source artifact:

- ID `9828582371`;
- SHA-256 `b27c910ecec716437e8a935b0c51b0121395d79588364fe0e1d2ff9312fdee02`.

The old demo source is not the final public competition video.

---

# Phase A — controlling design conclusions

Controlling documents:

- `docs/HOST_COMPETITION_PRODUCT_SPEC_V1.md`
- `docs/HOST_COMPETITION_IMPLEMENTATION_MAP_V1.md`

These conclusions continue to govern later work.

## Domain reuse

Lifecycle, attention, Event Home, Run Sheet, Ready, receipts and later timing presentation should be derived over authoritative state where possible rather than duplicated into competing persisted UI truth.

## Shopping truth

Authoritative calculation:

`required - confirmed on hand = to buy`

Unit mismatch fails rather than guessing conversion.

## Preparation truth

Current preparation graph:

- derives task `dueBy` from event time + offset;
- validates an acyclic dependency graph;
- blocks tasks whose dependencies are incomplete;
- preserves unchanged completed tasks during replanning;
- exposes earliest ready task by `dueBy`.

Full latest-start/slack/on-track/behind reasoning is future Phase F work and must use an injected clock.

## Late-change invariant

Current late-change path remains:

1. clone current state;
2. apply proposed change to proposal only;
3. validate compatibility/servings;
4. recalculate shopping;
5. rebuild prep while preserving valid completed work;
6. calculate impact;
7. hold a pending impact;
8. require explicit confirmation;
9. reject stale revisions;
10. apply atomically after confirmation.

Phase C did not bypass this path.

## Recipe/dietary safety gap

Current semantics are insufficient for final broad guest-specific dietary/allergen claims.

Phase E must add stronger structured compatibility/coverage semantics before richer safety claims are exposed.

## Inventory semantic rule

Authoritative `InventoryItem` requires quantity + unit.

Vague free text such as “I have rice, oil and lemons” must not silently become exact quantities.

Phase C therefore supports a deterministic explicit zero-inventory answer but does not fabricate exact pantry quantities. Richer fact/coverage acquisition belongs in Phase D/E.

---

# Phase B — verified operating projection

Verification report:

`reports/PHASE_B_VERIFICATION.md`

Final Phase B preservation head:

`14c93ebfc5e425db6ee970cf5a5b71d0fcd6c5da`

Final run:

`33617645927`

Evidence:

- **87/87** backend/application tests;
- **26/26** browser tests;
- production build passed;
- production audit: **0 vulnerabilities**.

Phase B final source artifact:

- name `host-competition-build-source`;
- ID `9841617376`;
- SHA-256 `3dcb7744d05163a123c2e0c0eca4a97f4da850f1829e6d71bd658d24bd7b8c8a`.

## OperatingProjection

`src/application/event-operating-state.ts` provides:

- sanitized read-only event operating source;
- selected-menu summary;
- inventory coverage summary;
- shopping summary;
- preparation summary;
- current/next action;
- readiness summary;
- latest receipt/safe reversible IDs;
- deterministic attention;
- explicit timing placeholder.

It depends on validated persistence rather than direct domain mutation and does not expose raw HostState/undo snapshots/pending caches as a customer mutation API.

Timing remains:

`health: "not_evaluated"`

until the timing phase.

## Derived lifecycle

READY requires all of:

- active preparation graph exists;
- active prep tasks are complete;
- shopping was authoritatively evaluated;
- no unresolved shopping remains.

Prep completion alone cannot falsely declare READY.

## Attention priority

Deterministic priority:

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

# Phase C — verified goal-directed workflow orchestration

Verification report:

`reports/PHASE_C_VERIFICATION.md`

## Goal

Phase C removes the requirement for customers to know internal commands such as “build shopping plan” and “build prep plan” during a normal workflow.

Controlled customer sequence is now:

`event request -> menu choices -> explicit menu confirmation -> inventory review -> authoritative shopping -> preparation run sheet -> next action`

The planner is not authoritative. It may only select specifically permitted low-risk work.

## Automatic-work boundary

The restricted `AutomaticWorkflowTool` type allows only:

1. `build_shopping_plan`
2. `build_preparation_plan`

The Phase C runner cannot automatically execute:

- `commit_menu`;
- `prepare_cart`;
- `confirm_cart_action`;
- `advance_event_status`;
- `apply_confirmed_change`;
- `undo_reversible_action`;
- real payment/order actions.

## Workflow plan and runner

`src/agent/workflow.ts` provides:

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

The plan is ephemeral and is not persisted as HostState.

It records:

- goal;
- base revision;
- candidate low-risk steps;
- completed attempt/replan/result trace;
- required input;
- explicit confirmation boundary;
- stop reason.

Each execution record includes:

- tool;
- attempted revision;
- reason;
- status (`succeeded`, `failed`, `stale_replanned`);
- resulting revision when available;
- error code when applicable;
- low-risk returned result data when applicable.

Default bounds:

- max successful automatic steps: `4`;
- max stale replans: `2`.

Reaching the successful-step bound stops as:

`step_limit`

It is not mislabeled as “no work remains.”

### Stale revision

`STALE_REVISION` causes:

1. stale attempt recorded;
2. current OperatingProjection re-read;
3. deterministic replan;
4. only newly justified low-risk step may execute;
5. stop if stale-replan limit is exceeded.

No blind replay.

### Failure

A non-stale failure stops immediately. Later steps do not execute and are not represented as completed. Earlier successful low-risk state remains authoritative.

## GoalDirectedHostAgentOrchestrator

`src/agent/goal-orchestrator.ts` wraps the proven `HostAgentOrchestrator` rather than replacing it.

The base orchestrator keeps responsibility for:

- interpretation;
- event creation;
- menu proposals/selection;
- confirmations;
- late changes;
- checkout confirmation;
- task completion;
- history/undo;
- customer-safe errors.

The wrapper adds bounded continuation only.

### Event creation

A complete event request now surfaces menu choices automatically in the same customer turn.

No menu is committed automatically.

### Menu confirmation

Menu choice still enters the existing explicit `commit_menu` confirmation path.

Before confirmation, authoritative selected menu does not change.

After confirmation, Host stops for inventory review.

### Inventory review

Host asks what required ingredients the customer already has.

Vague pantry language is rejected rather than converted into invented quantities.

Explicit zero-inventory language such as:

> I don't have any of them.

is the deterministic completion route implemented in Phase C.

After explicit review Host automatically runs the allowed shopping→prep sequence, re-reading authoritative projection between mutations.

### Interruptions

Late guest/dietary changes may interrupt inventory review and continue through the existing impact-preview + explicit-confirmation path.

They are not misrecorded as pantry data.

### Restart/resume invariant

Partial recorded inventory is **not** proof the whole review is complete.

Resume behavior:

- some inventory + no shopping -> inventory review still required;
- authoritative shopping exists -> reconciliation has advanced far enough;
- shopping exists + no prep -> missing prep may be auto-built;
- stale pending confirmation is not restored as committed truth.

Dedicated restart tests protect this rule.

## Browser path

`web/runtime.ts` constructs the goal-directed orchestrator with:

- the same `HostToolRuntime`;
- same persistence adapter;
- `HostApplicationReadService` projection reader;
- same deterministic demo providers.

Touch and voice therefore exercise the same controlled Phase C route.

---

# Phase C audit findings fixed before closure

Phase C was not accepted merely because the first implementation compiled or looked plausible.

## Obsolete menu-confirmation test

Old expectation: `ok` immediately after menu confirmation.

Correct Phase C expectation:

- authoritative menu commits;
- response becomes `needs_input`;
- inventory review is required.

The test was corrected; product control was not weakened.

## Thin workflow-plan contract

Initial plan object did not explicitly expose all trace/confirmation data required by the implementation map.

Added:

- `candidateSteps`;
- `completedSteps`;
- `WorkflowConfirmationBoundary`;
- `step_limit`;
- reason/revision/result trace.

## Partial-inventory restart inference

Initial resume logic incorrectly treated any positive inventory-item count as proof inventory review was complete.

Fixed so partial inventory alone never advances the review. Existing authoritative shopping is the evidence that reconciliation already occurred.

## Optional event narrowing

The richer plan exposed a compiler error because `OperatingProjection.event` is optional by type.

Fixed by narrowing once and passing the verified revision explicitly. No guessed revision and no non-null shortcut was introduced.

## Source-artifact checksum portability

After Phase C closure was otherwise green, the downloaded workflow artifact was audited outside GitHub Actions.

The source bytes were intact, but the generated `.sha256` file contained the runner's absolute path:

`/tmp/host-competition-safe/HOST_COMPETITION_BUILD_SOURCE.zip`

That made a normal downloaded `sha256sum -c HOST_COMPETITION_BUILD_SOURCE.zip.sha256` fail because the original runner path no longer existed.

This was treated as a preservation-control defect rather than ignored.

Commit:

`ddcc0c542a6f89f71818ff0f64dcabe61da5d986`

changed the workflow so snapshot assembly now:

1. creates the source ZIP;
2. changes into the artifact directory;
3. writes a checksum against relative filename `HOST_COMPETITION_BUILD_SOURCE.zip`;
4. runs `sha256sum -c` inside the workflow before upload;
5. only then uploads the artifact.

Verification run for that hardening commit:

`33673679637`

Result:

**success**

Downloaded artifact from that run:

- artifact ID `9863528435`;
- outer SHA-256 `c6e0f05ba06e865e4b959cec35c094d5b603ffa4d5635a9051495e2565c6baf4`;
- source commit in provenance `ddcc0c542a6f89f71818ff0f64dcabe61da5d986`;
- inner source ZIP SHA-256 `b408a1bf40e99001c1beb65e91d7b03bbcfe0014ba6b9390beec3cd3a04f17ce`.

The downloaded corrected artifact was independently extracted and checked. Its checksum file contains only the relative source-ZIP filename and:

`sha256sum -c HOST_COMPETITION_BUILD_SOURCE.zip.sha256`

returned:

`HOST_COMPETITION_BUILD_SOURCE.zip: OK`

This portable self-verification behavior is now part of the preservation workflow control.

---

# Phase C verification evidence

## Successful product-code head

Head:

`01f6a02ba58d033855445421dc390d8d275486b6`

Run:

`33672701928`

Job:

`100389922753`

Passed:

- **99/99** backend/application tests;
- production dependency audit: **0 vulnerabilities**;
- production web typecheck/build;
- **26/26** Echo/mobile Playwright tests;
- controlled source snapshot upload.

## Successful report/handover preservation head

Head:

`5c3ff6478a3605798bad3e8808cdca7e9421b2ab`

Run:

`33673183155`

Job:

`100391477786`

Passed:

- `npm test`: **99 tests, 99 passed, 0 failed, 0 skipped**;
- `npm audit --omit=dev`: **0 vulnerabilities**;
- web TypeScript typecheck;
- Vite 8.2.2 production build, 37 modules transformed;
- Playwright: **26/26 passed** across Echo-like and mobile;
- automated WCAG A/AA coverage remained passing;
- controlled source snapshot assembly;
- controlled source artifact upload.

## Successful Phase C closure-record head

Head:

`7a3a3acaae1d9bfa847af5567f43b92bd8408cfa`

Run:

`33673476047`

Passed every workflow stage:

- backend/application tests;
- production dependency audit;
- production web build;
- Echo/mobile browser gate;
- source snapshot assembly/upload.

## Phase C-specific application coverage

Tests 88–99 cover:

88. automatic menu surfacing;
89. inventory stop after confirmed menu;
90. vague pantry no-guess rule;
91. zero-inventory shopping→prep chain;
92. no shopping/prep bypass around review;
93. late-change interruption;
94. completed trace + explicit confirmation boundary;
95. stale refresh/replan;
96. non-stale failure stop;
97. bounded `step_limit`;
98. partial-inventory restart invariant;
99. shopping-proves-reconciliation resume continuation.

Browser coverage includes:

- goal-directed touch journey;
- late vegan guest interrupt/preview/confirm;
- reload/resume;
- touch targets/no overflow;
- WCAG A/AA checks;
- keyboard/dialog focus;
- one-activation voice-only Phase C journey;
- voice late change + receipts;
- spoken `no` cancellation;
- voice-unavailable touch fallback;
- corrupt persistence handling;
- memory fallback;
- local-data deletion/privacy behavior;
- no unexpected cross-origin deterministic application requests.

---

# Verification and source-preservation workflow

Workflow file:

`.github/workflows/competition-build-verify.yml`

Required stages:

1. checkout `host-competition-build`;
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

Concurrency cancellation is enabled so obsolete superseded pushes do not become the controlling verification result.

Permanent rule:

> Never treat an earlier green run as proof of a later branch head. Match the claimed commit to its own successful workflow run.

For a downloaded artifact, also require:

1. outer downloaded ZIP SHA-256 equals GitHub artifact digest;
2. extract the three artifact files;
3. `SOURCE_PROVENANCE.txt` identifies the expected source branch/commit;
4. run `sha256sum -c HOST_COMPETITION_BUILD_SOURCE.zip.sha256` in the extracted directory;
5. require `HOST_COMPETITION_BUILD_SOURCE.zip: OK`.

---

# External Alexa+/MCP/AWS state

Do not claim production Alexa/MCP deployment yet.

Retained later-stage requirements include:

- simulated Alexa+ competition route remains valid;
- working Agent Skill quality remains the priority;
- real self-hosted MCP requires a remotely reachable endpoint;
- real Alexa MCP onboarding requires the applicable OAuth/PKCE/protected-resource flow;
- latency/reliability must be measured on the actual remote path;
- AWS/Bedrock/AgentCore claims require real implemented and verified calls.

Do not fabricate:

- live URL;
- AWS implementation;
- hardware certification;
- payment/order capability;
- public competition video.

---

# Explicitly not complete

Do **not** claim any of these are implemented/final:

- production AWS/Bedrock integration;
- AgentCore integration;
- Alexa hardware certification;
- real retailer ordering/payment;
- production OAuth/MCP deployment;
- final recipe-safety semantics;
- exact free-text pantry quantity extraction;
- full dependency-aware timing/slack health;
- final competition visual rebuild;
- final public narrated demo;
- final Devpost submission.

---

# Next phase — Phase D

Next substantive development phase after exact-head re-verification is:

**Phase D — conversational fact acquisition**

The goal is to improve how Host gathers, corrects and resolves facts without allowing model output to become authoritative state.

Phase D should address, in the order defined by the controlling implementation map:

- richer event facts;
- corrections;
- conversational references;
- multi-intent input;
- ambiguity control;
- inventory candidate extraction without invented quantities;
- deterministic confirmation/validation before authoritative mutation.

Before editing Phase D code:

1. fetch current development head;
2. verify newest matching-head competition-build run is successful;
3. re-read the Phase D sections of both controlling design documents;
4. audit current interpreter/model/orchestrator/fact schemas and tests;
5. define the exact fact-acquisition contract before implementation;
6. retain all existing confirmation/revision/persistence controls;
7. add focused tests before claiming new conversational behavior;
8. run the full competition-build gate after substantive changes;
9. update verification/handover and preserve a new controlled source artifact.

Do not start Phase E/F/UI/AWS/submission work as a shortcut around Phase D.

---

# Handover safety check for every future continuation

Before relying on this file:

- fetch `host-competition-build` head;
- fetch the latest competition-build workflow run;
- require `head_sha` to match the current branch head;
- require successful backend/application tests, dependency audit, production build, browser gate, self-verified checksum assembly and source artifact upload;
- fetch `main` and confirm no unauthorised promotion occurred.

If any check fails or points at a different head, do not assume the current branch is verified. Re-establish the last matching verified state first.

Phase C is **closed and verified**. The next substantive product work is Phase D.
