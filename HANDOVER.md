# Host — Current Controlled Handover

Updated: 2 September 2026

## One-line continuation rule

Continue only from repository `jamieozzy89-cmyk/host-alexa-event-execution-agent`, branch `host-competition-build`. Git is the controlling source. Read this handover plus `docs/HOST_COMPETITION_PRODUCT_SPEC_V1.md` and `docs/HOST_COMPETITION_IMPLEMENTATION_MAP_V1.md` before changing product code. `main` is the preserved accepted baseline and must not be changed, merged or promoted automatically.

---

# Current controlled state

The previously promoted editorial redesign was judged insufficient as the final form of a serious Alexa+ first-place attempt. The authorised direction is a full competition-grade Host rebuild around the existing authoritative execution engine, not another visual polish pass and not a reduced prototype.

Phase A — source-control cleanup, full product specification, direct source-architecture audit and implementation mapping — is complete.

Phase B — read-only OperatingProjection, derived customer lifecycle and deterministic Attention Engine — is now implemented and technically verified. The exact final preservation/head verification run for this updated handover must be checked before a future session relies on the final Phase B head; the earlier code gate is already recorded below and in `reports/PHASE_B_VERIFICATION.md`.

The next product stage after Phase B preservation is **Phase C — goal-directed workflow orchestration**.

Permanent integrity rule:

> Nothing becomes done because model text, Alexa speech, UI copy or an external client says it happened. Only validated Host tool/domain state and verified external results establish completion.

Controlled execution path remains:

`customer goal -> interpretation/planning -> validated Host tool -> domain validation -> persistence/external result -> receipt/audit -> customer response`

No model, MCP client, web UI, voice layer or future provider may introduce a second authoritative mutation path.

---

# Repository and source-control state

Repository:

`jamieozzy89-cmyk/host-alexa-event-execution-agent`

Preserved accepted baseline branch:

`main`

Clean baseline commit from which the competition build was created:

`65a664ba60093991e47766c80cb5c365847f04a9`

Verified accepted product-code commit beneath later control/documentation commits:

`e80fc18517111e55f3813c4e4eddf1c7428769a2`

Competition development branch:

`host-competition-build`

Phase A product specification commit:

`47bce0b5760383e2ad4fb12928f61276cfbec038`

Phase A implementation-map commit:

`1bfc5411067ea6b72f50f24b9343d64e56c711c3`

Phase A handover commit:

`bca1949f2e9df8d2b18b47116a7056aca4c7ab27`

Phase B implementation commits include:

- lifecycle start: `b6d5a6a2bce26f9e1f31bb94ecbd80a96a92113a`;
- attention engine: `d792a9ba4f27ce1159326857229705ba45262ef3`;
- read-only operating state/service: `90e459ef5879e14c895bb0c00410a86b5a1b94ae`;
- READY correction: `e8829fe8600c6eeb6897ffe403c39d5412e3916b`;
- application exports: `0b353b50fcc194645361235bf689d1c5aed7c347`;
- Phase B tests: `f75215a056df4013bfae61cba76834f4466d9e27`;
- reusable verification gate: `442c704e7e33e91071141e98a57de6dd0aa05422`;
- Phase B verification report: `1f978294d9b353e42c928052c55007fa17d1e069`;
- source-artifact preservation workflow update: `dce117359af01bde766cf04277eebfc73300c03b`.

No automatic merge to `main` is authorised. Future promotion requires explicit current user instruction after the new product generation passes its complete gates.

---

# Product and competition target

Project: **Host: Alexa+ Event Execution Agent**

Competition: **Build, Ship, Shape: Amazon Developer Hackathon 2026**

Primary track: **Alexa+**

Selected mini challenge: **Open Source**

AWS Builder: **not currently claimed**. No AWS runtime integration exists yet.

Core product mission:

> Host is the execution agent responsible for carrying a home-hosting event from initial intent to verified readiness while the customer remains in control of consequential decisions.

Core promise:

> From “people are coming over” to “everything is actually ready.”

The product must continuously answer:

1. What is happening?
2. What needs attention?
3. What should I do next?

Conversation is an input/explanation surface, not the final information architecture.

Customer-facing target lifecycle:

`INTAKE -> PLAN -> SHOP -> PREP -> LIVE -> READY -> HOSTING -> COMPLETE`

Phase A clarified that READY and HOSTING are initially **derived customer stages**, not new persisted domain `EventStatus` values.

---

# Accepted engineering foundation retained

The existing Host architecture remains the protected foundation and is not to be replaced by model reasoning.

Retained authoritative capabilities include:

- typed event state and revision truth;
- event start/timezone/guest count/budget/currency;
- confirmed constraints and preferences;
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
- browser touch/voice routed through the same orchestrator/tool path;
- explicit voice-unavailable fallback;
- privacy/storage/recovery/focus/accessibility hardening.

Current protected tool surface remains 17 tools until a later phase deliberately adds a justified capability with matching tests:

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

---

# Baseline evidence retained

Before the competition rebuild, the promoted editorial baseline passed:

- backend/application: **74 passed, 0 failed**;
- production TypeScript/Vite build;
- Playwright: **26 passed, 0 failed** across Echo-like 1280×800 and mobile 390×844;
- existing Axe WCAG A/AA scope;
- privacy/storage/recovery/focus/security boundary checks;
- seven real product-state captures and direct visual examination.

Baseline refinement run:

- run `33581353724`;
- job `100096132537`;
- refined screenshot commit `46b537fc3b79fcae20ff59bb49d5d52ccf331ff9`.

Baseline gallery artifact:

- ID `9828517705`;
- SHA-256 `3ebba29dfab769fd46f2bb3f975434498b30d327afb0df42ad726015599fc648`.

Baseline demo-source artifact:

- ID `9828582371`;
- SHA-256 `b27c910ecec716437e8a935b0c51b0121395d79588364fe0e1d2ff9312fdee02`;
- this was a silent captioned working-app source recording, not the final public competition video.

---

# Phase A findings that still control all later work

## Domain reuse

The current domain already contains most execution truth. Event Home, lifecycle, attention, Run Sheet, Ready, Receipts and most timing-health presentation should be derived over authoritative state rather than duplicated as persisted UI state.

## Shopping truth

Current calculation already implements:

`required - confirmed on hand = to buy`

Unit mismatch is rejected rather than guessed.

## Preparation truth

Current preparation graph:

- derives task `dueBy` from event time + task offset;
- validates an acyclic dependency graph;
- blocks tasks whose dependencies are incomplete;
- preserves completed unchanged tasks during replanning;
- exposes the earliest ready task by `dueBy`.

Full dependency-aware latest-start/slack/on-track/behind reasoning is not implemented yet. That is Phase F and must use an injected clock.

## Late-change signature capability

Current late-change architecture is already strong and must be exposed rather than rewritten:

1. clone current state;
2. apply proposed guest/constraint/menu change to proposal only;
3. validate compatibility/servings;
4. recalculate shopping;
5. rebuild prep while preserving valid completed tasks;
6. calculate changed shopping, added/removed tasks and preserved completed tasks;
7. retain a pending impact;
8. require explicit confirmation;
9. reject stale revisions;
10. apply atomically after confirmation.

## Recipe/dietary safety gap

Current hard semantics are insufficient for final broad safety claims:

- allergen constraints require every menu item to carry the relevant `*-free` tag;
- vegan/vegetarian constraints currently require only at least one compatible menu item.

Phase E must replace/augment this with structured menu coverage semantics before Host makes richer guest-specific compatibility claims.

## Persistence consequence

Committed Host snapshots are schema-versioned, hashed and strictly domain-validated. Any authoritative recipe/menu compatibility schema change requires a deliberate persistence compatibility/migration decision. Do not add required safety fields while silently interpreting old snapshots optimistically.

## Agent gap

The current orchestrator is still largely command/request driven. It asks customers to invoke internal stages such as shopping and prep. Phase C is specifically authorised to remove that burden through bounded low-risk workflow continuation while preserving all confirmation/revision/tool boundaries.

## Model gap

The existing structured model seam is viable but too narrow. Later model work needs richer event facts/preferences, inventory candidates, equipment/prep constraints, corrections, multi-intent input, conversational references and ambiguity handling. Model output remains non-authoritative.

## Inventory semantic rule

Current authoritative `InventoryItem` requires quantity + unit. A statement such as “I have rice, oil and lemons” cannot silently become exact quantities.

Later preferred path:

- extract item identities;
- match against required ingredients;
- ask whether the customer has enough when quantity is unstated;
- after explicit confirmation, use a purpose-built coverage action/tool to derive the current required amount rather than pretending the customer supplied a number.

Do not improvise this in Phase C.

---

# Phase B — implemented capability

Phase B adds a read-only operating model without changing authoritative mutation semantics.

## `src/application/event-operating-state.ts`

Adds `EventOperatingSource`, `OperatingProjection` and `HostApplicationReadService`.

The read service:

- depends on `HostPersistenceAdapter`, not `HostDomainEngine`;
- loads only validated committed persistence;
- clones/sanitizes values before returning them;
- exposes event, selected menu, inventory, shopping, tasks, recent receipts, safe reversible receipt IDs and limited persistence metadata;
- does **not** expose raw HostState, audit arrays, undo snapshots, all menus, runtime proposal caches or pending-impact caches;
- performs no mutation;
- does not create a new customer/MCP mutation API.

Projection summaries include:

- event identity/state;
- selected menu summary;
- inventory requirement/coverage summary;
- shopping line/covered/unresolved/selected/purchased counts;
- preparation ready/blocked/in-progress/done/cancelled counts;
- deterministic current/next task;
- readiness;
- latest receipt;
- exactly one attention item;
- explicit timing placeholder.

Timing is intentionally:

`health: "not_evaluated"`

until Phase F. Phase B must not invent wall-clock schedule claims.

## `src/application/lifecycle.ts`

Customer lifecycle is derived, not persisted.

Key READY invariant after Phase B correction:

- required preparation graph exists;
- every active preparation task is done;
- shopping has been authoritatively evaluated;
- no unresolved shopping item remains.

Therefore “prep done” alone cannot declare READY while acquisition work is still unresolved.

Domain EventStatus is unchanged by this projection.

## `src/application/attention.ts`

Exactly one primary attention item is chosen deterministically.

Priority:

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

The model may later explain this attention item. It does not choose a lower-priority action over a higher-priority authoritative requirement.

`AttentionContext.inventoryConfirmed` exists because an empty inventory map cannot distinguish:

- customer confirmed nothing is on hand; from
- inventory has never been reviewed.

This context is currently ephemeral and not authoritative Host state.

## Phase B tests

`tests/operating-projection.test.mjs` adds 13 tests covering:

- no-event INTAKE;
- sanitized clone/no mutation;
- no audit/undo/raw menus exposure;
- PLAN/menu attention;
- inventory attention after menu commit;
- explicit inventory-review completion;
- shopping covered/unresolved summaries;
- PREP/run-sheet construction state;
- deterministic earliest ready task;
- READY with resolved shopping + completed prep while domain status remains unchanged;
- no READY with unresolved shopping;
- confirmation priority;
- change-review priority;
- failed consequential receipt priority.

---

# Phase B technical verification

Permanent report:

`reports/PHASE_B_VERIFICATION.md`

First complete Phase B code gate:

- workflow: `Competition build verification`;
- run: `33617232328`;
- job: `100205776551`;
- verified source head: `442c704e7e33e91071141e98a57de6dd0aa05422`;
- conclusion: **success**.

Environment:

- Ubuntu 24.04;
- project Node runtime: **22.12.0**;
- npm: **10.9.0**.

Dependency install:

- `npm ci --ignore-scripts` passed;
- **0 vulnerabilities** reported.

Backend/application:

- TypeScript build passed;
- **87 tests passed, 0 failed**;
- 13 Phase B tests were added to the previous 74-test baseline.

Production audit:

- `npm audit --omit=dev` -> **0 vulnerabilities**.

Production web:

- web typecheck passed;
- Vite production build passed;
- 35 modules transformed.

Browser regression:

- **26/26 Playwright passed**;
- Echo-like 1280×800;
- mobile 390×844;
- Axe WCAG A/AA coverage remained active;
- touch/voice/confirmation/change-preview/reload/focus/storage/recovery/privacy/network-boundary semantics remained passing.

Phase B made no browser rendering or CSS changes, so no new visual-redesign claim is made and no new direct visual audit was necessary for this phase. Phase I still requires direct visual examination of all material new UI states.

A reusable branch workflow now performs the full competition-build gate on each push and, after successful verification, creates a controlled tracked-source artifact containing:

- `HOST_COMPETITION_BUILD_SOURCE.zip` from `git archive HEAD`;
- SHA-256 file;
- `SOURCE_PROVENANCE.txt` with branch, commit and creation timestamp.

Artifact name:

`host-competition-build-source`

Retention currently configured to 30 days.

A future continuation must verify the latest workflow run associated with the final current branch head before quoting that final head as passed.

---

# Current external Alexa+/MCP requirements retained from Phase A

Current official/currently checked implementation requirements include:

- simulated Alexa+ route remains valid;
- competition prioritises a working Agent Skill;
- self-hosted MCP route can use minimum MCP 2025-11-25 over Streamable HTTP;
- actual Alexa MCP onboarding requires a remote reachable endpoint;
- OAuth 2.1 authorisation-code flow;
- PKCE S256;
- Protected Resource Metadata;
- authorisation-server metadata;
- bearer token in Authorization header;
- resource parameter behavior;
- Origin validation where Origin is supplied by Streamable HTTP clients;
- Alexa MCP query-response latency target under 500 ms;
- MCP Apps are relevant for custom interactive visuals;
- current toolkit availability is US-focused and must be tested against the actual developer account rather than assumed.

These facts are time-sensitive. Recheck them at Phase G and immediately before final competition claims/submission.

Do not confuse Amazon's coding/onboarding “Add-on Agent Skill” helper with proof that Host itself is a working competition Agent Skill runtime.

---

# Target final architecture

```text
Web Event UI / Browser Voice
        |
        | HTTPS application API
        v
+----------------------------------+
| Host Application Service         |
| - goal orchestrator              |
| - structured model adapter       |
| - workflow planner/executor      |
| - OperatingProjection            |
| - attention engine               |
| - timing engine                  |
+----------------+-----------------+
                 |
                 v
+----------------------------------+
| HostToolRuntime                  |
| validated tools + revisions      |
+----------------+-----------------+
                 |
                 v
+----------------------------------+
| HostDomainEngine                 |
| authoritative HostState          |
+-----------+----------------------+
            |
            +--> durable HostPersistenceAdapter
            +--> validated provider adapters

Alexa+ / MCP client
        |
        | Streamable HTTP + OAuth
        v
+----------------------------------+
| Host MCP Gateway                 |
| reviewed customer-facing tools   |
+----------------+-----------------+
                 |
                 v
          same Host service/runtime
```

Web and MCP/Alexa must not maintain separate authoritative events.

---

# Phase C — exact next controlled stage

Phase C goal:

> Evolve Host from customer-command-driven internal workflow steps into a bounded goal-directed execution agent while preserving the current tool/domain/confirmation/revision truth model.

Preferred new module:

`src/agent/workflow.ts`

Required workflow-plan concept remains ephemeral, not HostState. It should contain at minimum:

- goal;
- base authoritative revision;
- candidate/completed low-risk steps;
- required input;
- confirmation boundary;
- stop reason;
- tool receipts/results needed for traceability.

Phase C implementation must begin using the existing deterministic interpreter/providers. Do not combine Phase C with live-model work merely because the later architecture will use a model.

## Required automatic behavior

The customer should no longer have to know software commands such as:

- build shopping plan;
- build prep plan;
- analyse impact.

Example after menu confirmation:

Current old behavior:

`commit_menu -> show Build shopping list / Build prep plan buttons`

Phase C target:

`commit_menu -> inspect authoritative operating state -> determine inventory review is missing -> ask customer what they already have / whether required inventory has been reviewed`

After properly confirmed/recorded inventory data:

`record_inventory -> build_shopping_plan -> where policy/preconditions allow, build_preparation_plan -> return one coherent customer response`

Do **not** automatically prepare or execute checkout simply because shopping exists. Product acquisition crosses customer/provider-choice and confirmation boundaries.

## Phase C hard stop conditions

Workflow continuation stops on:

- explicit confirmation required;
- missing material information;
- ambiguity;
- multiple materially different choices;
- provider permission/authentication need;
- stale revision;
- tool/provider failure;
- insufficient compatibility evidence.

On stale revision:

- refresh current operating state;
- recompute the workflow plan;
- never blindly replay a material action;
- never replay transaction-like behavior on a changed revision without a new valid confirmation if consequence changed.

## Phase C tests required

Add focused workflow tests, preferably `tests/workflow-orchestrator.test.mjs`, and extend the controlled primary scenario where appropriate.

Required coverage:

- safe automatic low-risk chaining;
- stop at missing input;
- stop at confirmation;
- stop on failure;
- stale-revision replan behavior;
- no duplicate irreversible/provider action;
- correct tool/receipt order;
- customer can interrupt a workflow with a late change;
- old authoritative confirmation semantics still pass;
- full regression gate remains green.

Do not delete old tests until replacement semantic coverage exists.

---

# Later phase map — still controlling

## Phase D — live structured model + server foundation

- server-side model/provider path only;
- richer structured customer understanding;
- inventory candidates/preferences/multi-intent/corrections/references;
- schema validation;
- deterministic fallback;
- no browser secrets.

## Phase E — structured recipe/menu semantics + migration

- explicit dietary/allergen coverage semantics;
- equipment/make-ahead/cost/variant data where justified;
- persistence version/migration where authoritative semantics require it;
- hard constraints remain deterministic/structured, not LLM-only.

## Phase F — temporal engine

- dependency-aware earliest/latest start;
- slack;
- on-track/needs-attention/behind/ready;
- injected deterministic clock;
- timing remains derived unless a genuinely committed schedule action requires persistence.

## Phase G — shared server + MCP/Alexa path

- remote HTTPS Streamable HTTP MCP;
- actual Alexa 2025-11-25 interoperability;
- OAuth/PKCE/PRM/security/session isolation;
- reviewed customer-level MCP tools, not a mechanical 17-tool wrapper;
- deployed latency evidence;
- actual developer-account onboarding attempt;
- document exact success/blocker.

## Phase H — selected real integrations / optional AWS

- research first;
- one or two deep reliable integrations preferred over shallow API collecting;
- live model is the first required external target;
- real commerce remains optional unless a credible provider exists;
- external failure cannot falsify Host state.

## Phase I — full UI rebuild

- Event Home;
- menu decision;
- inventory/shopping reconciliation;
- Run Sheet;
- Live takeover;
- late-change impact;
- Receipts;
- Ready/Complete;
- Ask Host ambient sheet;
- Echo/mobile variants;
- browser state must consume durable OperatingProjection, not last AgentReply card.

## Phase J — human usability + corrections

- scenario-based testing with people uninvolved in development;
- target 8–12 where practical;
- repeated confusion becomes product defects to correct;
- reverify after fixes.

## Phase K — competition release

- final release candidate;
- clean package/provenance;
- hosted judge route where implemented;
- final real gallery;
- public under-three-minute video;
- rebuilt Devpost narrative from actual final evidence;
- refreshed Open Source evidence;
- final integrity audit;
- explicit user authorisation before promotion/submission.

---

# Final competition UI target retained

The current Plan/Live/Activity composition is not the final architecture.

Target top-level customer structure:

- Event Home;
- Run Sheet;
- Receipts;
- ambient Ask Host;
- Live as deliberate hands-busy takeover state.

Final gallery target, subject to actual built quality:

1. Event Home;
2. Late-change impact;
3. Live;
4. inventory -> shopping reconciliation;
5. Run Sheet;
6. Receipts.

Final video target remains under three minutes with strongest differentiation early, especially late-change safe replanning and preserved work.

---

# No-shortcut / no-false-claim controls

Do not:

- collapse the rebuild back into a CSS/UI-only pass;
- remove/merge/skimp required gates;
- make model output authoritative;
- add READY/HOSTING persisted states merely for presentation;
- persist attention/timing health as convenience state without a real invariant;
- infer exact inventory quantities from item-name-only statements;
- claim broad dietary/allergen safety beyond structured semantics actually implemented;
- expose `HostDomainEngine` directly to browser/MCP clients;
- create a separate MCP mutation implementation;
- expose all 17 internal tools mechanically and call it an agentic MCP design;
- put provider secrets in Vite/client code;
- fake real checkout, AWS, Agent Skill, hosted deployment or external integration;
- write final submission copy as though later phases already exist;
- keep obsolete UI buttons solely because old tests name them;
- delete old semantic coverage before replacement tests exist;
- treat test counts, screenshots existing or build success as proof of untested product qualities;
- merge the competition branch to `main` without explicit user instruction.

---

# Completion boundary

Host is not competition-grade complete until the complete end-to-end target is implemented and directly verified, including applicable model, structured recipe safety, temporal execution, MCP/Alexa route, final UI, voice/touch parity, recovery/security/accessibility, usability testing, judge access, real final gallery/video/submission claims and explicit user promotion/submission authorisation.

Phase B being passed does not imply the final product is close to submission-ready. It establishes the durable state/attention read architecture on which Phase C and the later product can be built without weakening the existing authoritative core.

Exact next work after confirming the final Phase B preservation run:

> **Phase C — implement and test bounded goal-directed workflow planning/execution over the current verified OperatingProjection and existing HostToolRuntime, beginning with deterministic providers/interpreter and preserving every existing confirmation, revision and receipt boundary.**
