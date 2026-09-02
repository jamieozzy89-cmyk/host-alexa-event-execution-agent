# Host — Current Controlled Handover

## One-line continuation rule

Continue only from repository `jamieozzy89-cmyk/host-alexa-event-execution-agent`, branch `host-competition-build`. Read this handover, `docs/HOST_COMPETITION_PRODUCT_SPEC_V1.md`, and `docs/HOST_COMPETITION_IMPLEMENTATION_MAP_V1.md` before changing product code. `main` is the preserved accepted baseline and must not be changed or merged into automatically. Git is the controlling source; do not reconstruct project state from chat memory.

## Current controlled continuation point

The user rejected the previously promoted editorial redesign as insufficient for a serious first-place Alexa+ attempt and authorised a full competition-grade rebuild around the existing Host execution engine.

The rebuild is **not** another CSS pass and is **not** permission to shrink the product into a prototype. The target is a complete stateful execution agent that carries a hosting event from natural intent to verified readiness while preserving the permanent rule:

> Nothing becomes done because model text, Alexa speech, UI copy or an external client says it happened. Only validated Host tool/domain state and verified external results establish completion.

Phase A — source-control cleanup, product specification, direct source-architecture audit and implementation mapping — is now complete and preserved on `host-competition-build`.

No Phase B product implementation has begun yet.

---

# Preserved baseline and branch state

Repository:

`jamieozzy89-cmyk/host-alexa-event-execution-agent`

Preserved accepted baseline branch:

`main`

Clean baseline commit from which the competition branch was created:

`65a664ba60093991e47766c80cb5c365847f04a9`

Verified accepted product-code commit underneath the later documentation/control commits:

`e80fc18517111e55f3813c4e4eddf1c7428769a2`

Competition development branch:

`host-competition-build`

Product specification creation commit:

`47bce0b5760383e2ad4fb12928f61276cfbec038`

Phase A implementation-map commit:

`1bfc5411067ea6b72f50f24b9343d64e56c711c3`

This handover commit records completion of the Phase A gate after those artifacts were created.

No automatic merge back to `main` is authorised. A future promotion requires an explicit current user instruction after the new product generation has passed its complete gates.

---

# Baseline cleanup completed before branch creation

The repository had contradictory current-state documentation after the second editorial redesign was promoted. The following cleanup was completed on `main` before `host-competition-build` was created:

- README no longer describes Stage 09 as current;
- Stage 10 submission checklist distinguishes accepted baseline evidence from the future competition-final product;
- stale detailed Devpost draft is deliberately invalidated as a final source until the new product actually exists;
- old Stage 10 handover files are marked historical/superseded;
- Stage 10 capture/demo/gallery/package workflows now target `main` instead of obsolete `ui-redesign-editorial` / `stage10-submission` branches;
- Stage 10 package provenance now records `source_branch=main`;
- Stage 10 capture workflow exits safely when regenerated screenshots are byte-identical rather than failing on an empty commit.

Those workflow changes have not yet been exercised in a new Actions run in this rebuild stage. Do not describe them as runtime-verified merely because the YAML was updated.

No accepted product implementation source was altered by that cleanup.

---

# Accepted baseline engineering state

The current baseline remains a real, tested stateful execution foundation, not a scripted mock.

Retained architecture includes:

- typed authoritative event state with revisions;
- confirmed constraints/preferences;
- confirmation-gated menu commitment;
- inventory recording;
- authoritative shopping reconciliation;
- no guessed unit conversions;
- dependency-aware preparation graph;
- task completion validation;
- action receipts and audit trail;
- read-only late-change impact analysis;
- atomic confirmed impact application;
- preservation of unaffected completed work;
- reversible latest-safe actions;
- checksum/schema-validated persistence with primary/backup/temporary recovery;
- pending uncommitted impacts intentionally excluded from committed persistence;
- `HostAgentOrchestrator`;
- deterministic heuristic interpreter;
- model-backed structured interpreter seam and resilient fallback;
- browser voice/touch through the same orchestrator/tool route;
- explicit voice-unavailable fallback;
- privacy/storage/recovery/focus/accessibility hardening.

Current protected tool surface remains 17 tools until a later phase deliberately adds a justified authoritative capability:

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

Baseline refinement verification already established:

- backend/application: **74 passed, 0 failed**;
- production TypeScript/Vite build: passed;
- Playwright: **26 passed, 0 failed** across 1280×800 Echo-like and 390×844 mobile projects;
- existing Axe WCAG A/AA checks included and passed;
- seven real product states captured and directly visually examined.

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
- silent captioned source evidence only, not the final competition video.

---

# Active controlling product target

`docs/HOST_COMPETITION_PRODUCT_SPEC_V1.md` defines the full competition end state.

The product mission is:

> Host is the execution agent responsible for carrying a home-hosting event from initial intent to verified readiness while the customer remains in control of consequential decisions.

The customer experience must continuously answer:

1. What is happening?
2. What needs attention?
3. What should I do next?

Conversation is an input/explanation mechanism, not the primary information architecture.

Target customer lifecycle:

`INTAKE -> PLAN -> SHOP -> PREP -> LIVE -> READY -> HOSTING -> COMPLETE`

Phase A clarified that `READY` and `HOSTING` are initially **derived customer stages**, not new persisted `EventStatus` values. Current authoritative domain transitions remain intact unless a later real invariant proves a domain-status change necessary.

Target product surfaces:

- Event Home;
- menu decision/confirmation;
- natural inventory reconciliation;
- shopping;
- Run Sheet;
- Live hands-busy execution;
- late-change impact as the signature capability;
- Receipts;
- Ready/Complete closure;
- ambient Ask Host conversation;
- voice-only and touch-only complete journeys;
- Echo landscape and mobile-specific layouts.

---

# Phase A direct source findings

The implementation map was produced only after direct examination of current domain, runtime, persistence, agent, browser, simulated-service and test code.

## Domain

Current domain already contains most execution truth:

- event start/timezone;
- guest/budget/constraints/preferences;
- menu commitment;
- inventory;
- required/on-hand/to-buy shopping quantities;
- preparation durations/due times/dependencies;
- revision checks;
- receipts/audit/undo;
- change-impact proposed event/menu/shopping/tasks;
- preservation of completed tasks when definitions remain unchanged.

Conclusion:

Event Home, lifecycle display, attention, Run Sheet, Ready projection, Receipts and most timing health should be **derived over authoritative state**, not added as duplicate persisted state.

## Domain lifecycle

Current authoritative status chain:

`draft -> planned -> sourcing -> preparing -> live -> complete`

plus cancellation.

Do not add `ready`/`hosting` to the domain merely because those words are useful in customer presentation.

## Shopping

Current calculation already implements the authoritative equation:

`required - confirmed on hand = to buy`

and rejects unit mismatch.

Do not create a second shopping truth model for the UI.

## Preparation

Current preparation graph already:

- derives `dueBy` from event time + due offsets;
- validates dependency DAG;
- blocks tasks whose dependencies are incomplete;
- preserves completed unchanged tasks during rebuilding;
- exposes the earliest ready task by `dueBy`.

Current system does **not** yet calculate full dependency-aware latest-start/slack/on-track/behind timing health. That belongs in a new deterministic derived timing engine with an injected clock.

## Late changes

Current domain already performs the core signature architecture correctly:

1. clone current state;
2. apply proposed guest/constraint/menu change to the proposal only;
3. validate menu constraints/servings;
4. recalculate shopping;
5. rebuild prep while preserving valid completed tasks;
6. calculate changed shopping / added tasks / removed tasks / preserved completed tasks;
7. store a pending impact;
8. require explicit confirmation;
9. reject stale revision;
10. apply atomically only after confirmation.

The new product should expose this intelligence rather than rewrite it.

## Recipe/menu safety gap

Current menu compatibility semantics are insufficient for final competition claims:

- allergen constraints require every menu item to carry the corresponding `*-free` tag;
- vegan/vegetarian constraints only require at least one compatible menu item.

Therefore the final recipe/menu model needs explicit structured dietary coverage/allergen semantics before Host claims richer guest-specific menu safety.

The current static menu structure is still useful and already contains servings, prep/cook time, ingredients, constraint tags and task templates. Expand that pattern instead of replacing it with unconstrained LLM menu generation.

## Persistence consequence

Persisted HostState is strictly validated and schema-version checked. If richer recipe compatibility fields become required authoritative semantics, Phase E must include a persistence-version/migration decision and tests. Do not silently make old saved snapshots optimistic under new safety rules.

## Tool/runtime layer

`HostToolRuntime` already gives the correct protected integration seam:

- structured tool validation;
- persistence checkpoint + rollback;
- menu proposal validation;
- provider adapters;
- deterministic cart idempotency key;
- provider-result validation;
- failed-action receipts;
- pending impact protections;
- safe undo read behavior.

MCP, the final web API and external integrations should converge on this runtime, not the domain engine directly.

## Pending state/server concern

Menu proposals and change impacts currently live in runtime memory while committed HostState is persisted. This is deliberate.

The hosted server/MCP design must preserve logical session continuity without turning unconfirmed proposals/impacts into committed event state. For horizontal scaling, sticky/shared ephemeral session storage may eventually be required; do not solve this implicitly.

## Agent gap

The current orchestrator is mostly request/command driven. It asks the customer to invoke internal stages such as shopping and prep.

This is the correct location for the new goal-directed workflow planner/executor.

The final user should state goals and facts; Host should safely determine low-risk internal continuation and stop at:

- missing information;
- ambiguity;
- explicit confirmation;
- provider permission/auth;
- revision conflict;
- operation failure;
- insufficient compatibility evidence.

## Model gap

The current live-model seam is viable but the current intent/slot model is too narrow.

The competition path needs structured outputs for:

- richer event facts/preferences;
- arbitrary inventory candidates;
- equipment/prep constraints;
- corrections;
- multi-intent input;
- conversational references;
- ambiguity;
- bounded workflow suggestions.

Model output must remain schema-validated and may not mutate state.

## Inventory semantic decision

Current authoritative `InventoryItem` requires a quantity and unit.

A statement such as “I have rice, oil and lemons” must not be converted silently into exact quantities.

Preferred later authoritative solution:

- model extracts candidate item identities;
- Host matches them to current requirements;
- Host asks whether the customer has enough where quantity is unstated;
- after explicit confirmation, a purpose-built coverage tool may derive the current required quantity rather than pretending the customer supplied a number.

This is a likely justified new authoritative/tool capability, to be designed/tested in Phase D/E rather than improvised in the model.

## Browser/UI gap

Current web state is explicitly `conversation | live | activity` and stores latest response cards. Normal text/voice forces conversation mode; Live/Activity issue synthetic `next`/`history` requests.

This proves the final UI requires a real state-model rebuild.

The final UI should consume a durable read-only OperatingProjection rather than whichever `AgentReply` happened most recently.

## Current browser test architecture

Retain semantic protections from current Playwright tests:

- complete touch path;
- material confirmation;
- late-change preview before apply;
- reload without stale confirmation;
- 48×48 control floor;
- no overflow;
- voice-only journey;
- spoken cancellation;
- voice-unavailable fallback;
- Axe A/AA scans;
- focus lifecycle;
- corrupt-state recovery;
- memory-storage fallback where relevant;
- scoped data deletion;
- explicit network-boundary checks.

Do **not** retain obsolete UI labels/routes merely because existing tests name `Build shopping list`, `Build prep plan`, `Live` and `Activity`. Rewrite those tests around the new semantic behavior once replacement coverage exists.

Canonical Playwright projects remain:

- `echo-show`: 1280×800 + touch;
- `mobile`: 390×844 + touch/mobile.

---

# Current external Alexa+/MCP requirements checked in Phase A

Official Devpost rules currently require/allow for Alexa+:

- working Agent Skill (prioritized), or
- self-hosted MCP server at minimum MCP 2025-11-25 over Streamable HTTP, or
- explicitly valid simulated Alexa+ web experience using the entrant's own agentic tools.

The final repository/runtime must actually demonstrate the selected required technology route; simulation remains exempt from the normal runtime-hook rule.

Current Alexa+ MCP QuickStart/Toolkit documentation checked during Phase A adds these practical requirements for actual Alexa onboarding:

- remotely reachable MCP URL;
- Streamable HTTP;
- Alexa+ support for MCP 2025-11-25;
- OAuth 2.1 authorization-code flow;
- PKCE S256;
- Protected Resource Metadata document;
- authorization-server metadata;
- bearer token in the Authorization header;
- `resource` parameter behavior;
- sub-500 ms round-trip query-response target;
- MCP Apps standard for custom interactive visuals;
- Alexa+ MCP Toolkit currently described as US-available.

Current MCP Streamable HTTP specification also requires Origin validation when an Origin header is present to mitigate DNS rebinding.

The public MCP TypeScript SDK now supports a newer protocol era as well as 2025-era interoperability. Phase G must target Alexa's supported 2025-11-25 behavior even if a maintained SDK also serves newer MCP clients.

Do not confuse Amazon's **Add-on Agent Skill** onboarding helper for AI coding agents with proof that Host itself is a working competition Agent Skill runtime.

These are time-sensitive facts and must be rechecked when Phase G begins and again before submission.

---

# Target final architecture after Phase A

```text
Web Event UI / Browser Voice
        |
        | HTTPS app API
        v
+----------------------------------+
| Host Application Service         |
| - goal orchestrator              |
| - structured model adapter       |
| - workflow planner               |
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
| customer-facing MCP tools        |
+----------------+-----------------+
                 |
                 v
          same Host service/runtime
```

Final web and MCP/Alexa routes must not maintain separate authoritative Host events.

---

# Phase map now locked

## Phase B — OperatingProjection / lifecycle / Attention Engine

New derived capability over the existing deterministic runtime.

Preferred modules:

- `src/application/event-operating-state.ts`;
- `src/application/lifecycle.ts`;
- `src/application/attention.ts`;
- tests.

Preferred read architecture:

- a sanitized read-only `HostApplicationReadService` rather than exposing raw `HostState` or importing `HostDomainEngine` into the browser;
- mutation remains tool-only;
- read service must clone/sanitize and expose no undo snapshots/internal pending caches.

Phase B must not change authoritative mutation semantics.

## Phase C — goal-directed workflow orchestration

Target:

- `src/agent/workflow.ts`;
- refactor orchestrator to plan/execute safe low-risk internal steps;
- stop at confirmation/missing information/ambiguity/failure/revision conflict;
- recompute rather than blindly retry on stale revision;
- preserve existing `handleText` / action customer entry points where practical.

## Phase D — live structured model + server foundation

Provider secrets cannot live in Vite/browser runtime.

Introduce server-side model/provider path and richer schemas. Retain deterministic fallback.

## Phase E — recipe/menu semantics + migration

Strengthen structured compatibility, equipment/make-ahead/cost/variant data and persistence migration where authoritative semantics require it.

## Phase F — deterministic temporal execution

Dependency-aware earliest/latest start, slack and event timing health with injected clock. Derived initially; do not persist clock-sensitive status by default.

## Phase G — shared server + MCP/Alexa route

Implement remote HTTPS Streamable HTTP MCP, actual 2025-11-25 Alexa interoperability, OAuth/PKCE/PRM auth requirements, security/session isolation, tool-design audit, deployed latency measurement, and real Alexa developer-account onboarding attempt.

A basic one-to-one wrapper of all internal tools is explicitly not the target.

## Phase H — real external integrations / optional AWS

Research and select only deep, reliable integrations with clear failure semantics. Live model is the first required external integration target. Real commerce remains optional unless a credible provider exists.

## Phase I — full UI rebuild

Event Home / Ask Host / menu / inventory-shopping / Run Sheet / Live / change impact / Receipts / Ready. Retire current permanent chat rail and equal Plan/Live/Activity architecture.

## Phase J — human usability

Scenario test with uninvolved users, including late guest/new dietary requirement. Repeated confusion becomes correction work.

## Phase K — competition release

Final full gate, hosted judge route where implemented, final gallery/video, rebuilt Devpost narrative, refreshed Open Source evidence, final rules/integrity audit, then explicit user-authorised promotion/submission only.

---

# Active Phase B entry condition

Phase A is now closed. The next controlled implementation stage is exactly:

> **Phase B — build the read-only Event Operating Projection, derived customer lifecycle and deterministic Attention Engine over the existing accepted domain/tool foundation, with tests, without changing authoritative mutation semantics.**

Phase B acceptance must establish at minimum:

- sanitized event operating source/read service;
- derived lifecycle mapping;
- inventory coverage summary;
- shopping summary;
- prep summary;
- derived Ready state;
- deterministic exactly-one Attention item;
- confirmation/change/failure priorities outrank normal workflow suggestions;
- no projection call mutates HostState or advances revision;
- baseline regression suite remains passing;
- source-controlled evidence and updated handover.

Do not begin Phase C until Phase B gate is actually passed.

---

# Current completion boundaries

Completed now:

- baseline source-control cleanup;
- preserved `main` baseline;
- competition branch creation;
- full product specification;
- direct Phase A source audit;
- direct current browser-test audit;
- direct persistence/schema compatibility audit;
- current Alexa+/MCP implementation-requirement research;
- source-controlled implementation map;
- Phase A handover update.

Not implemented or claimed yet:

- OperatingProjection / attention engine;
- goal-directed workflow execution;
- live model calls;
- strengthened recipe safety semantics;
- timing engine;
- shared server backend;
- MCP server;
- Alexa add-on/Agent Skill runtime;
- AWS runtime;
- real commerce/calendar/smart-home integration;
- final Event Home UI;
- final Run Sheet/Receipts/Live/change UI;
- human usability study;
- hosted final product;
- final competition package/gallery/video/Devpost submission.

Do not call any of these complete until directly produced and verified.
