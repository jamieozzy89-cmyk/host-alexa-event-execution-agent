# Host Competition Implementation Map v1

**Status:** ACTIVE PHASE A ARCHITECTURE MAP  
**Branch:** `host-competition-build`  
**Product specification:** `docs/HOST_COMPETITION_PRODUCT_SPEC_V1.md`  
**Baseline branch:** `main`  
**Clean baseline commit:** `65a664ba60093991e47766c80cb5c365847f04a9`  
**Verified baseline product-code commit:** `e80fc18517111e55f3813c4e4eddf1c7428769a2`

This document maps the competition-grade product specification onto the current repository after direct source examination. It distinguishes what can be reused unchanged, what should be derived without changing authoritative state, what genuinely requires authoritative schema/capability changes, what belongs in the agent/application/server layers, and what must not be implemented merely to preserve obsolete UI/test assumptions.

---

# 1. Phase A conclusion

The current Host architecture is strong enough to remain the foundation. A full domain rewrite is neither required nor desirable.

The new generation should be built by adding four major layers/capabilities around the existing core:

1. **read-only operating projection + attention/timing derivation** over authoritative Host state;
2. **goal-directed workflow orchestration + richer structured model interpretation** above the existing tool runtime;
3. **server/API/MCP execution surface** so web and Alexa/MCP can use the same authoritative runtime without browser secrets or duplicate state engines;
4. **new event-centered UI architecture** consuming authoritative operating state instead of rendering only the most recent response cards.

The main authoritative domain remains responsible for:

- event revision truth;
- menu commitment;
- inventory quantities;
- shopping reconciliation;
- task graph truth;
- action receipts/audit;
- change-impact analysis/application;
- undo safety;
- confirmation enforcement;
- state validation.

Do not move these responsibilities into the model, MCP adapter or UI.

---

# 2. Direct source findings that control implementation

## 2.1 Domain already contains most execution truth

Current `src/domain/types.ts`, `calculations.ts` and `engine.ts` already model:

- event time/timezone;
- guest count/budget/currency;
- constraints/preferences;
- committed menu;
- inventory;
- shopping required/on-hand/to-buy quantities;
- preparation durations, due times and dependencies;
- receipts/audit/undo;
- revision checks;
- pending change impacts;
- preserved completed tasks after replanning.

Therefore Event Home, Run Sheet, Receipts and most late-change presentation can be **derived** from current authoritative state instead of adding duplicate persistent fields.

## 2.2 Current workflow is customer-command driven

`HostAgentOrchestrator` currently asks the customer to trigger internal stages manually:

- `Show menu ideas`;
- `Build shopping list`;
- `Find demo products`;
- `Build prep plan`;
- `What's next`;
- `View history`.

This is the primary workflow gap. The new goal-directed layer belongs here/adjacent to the orchestrator, not in the domain engine.

## 2.3 Current browser UI is response-card driven

`web/types.ts` explicitly defines `conversation | live | activity` and stores `latest` response cards, `liveReply` and `activityReply`.

`web/main.ts` forces normal text/voice input into conversation mode and obtains Live/Activity by issuing synthetic agent requests for `next` and `history`.

The competition UI therefore requires a state-architecture change, not a CSS pass.

## 2.4 Current live model seam is usable but narrow

`src/agent/model.ts` already gives:

- model-backed structured interpretation;
- bounded intent names;
- slot parsing;
- confidence;
- deterministic fallback;
- HTTP JSON model proxy.

But `HostIntentSlots` is too narrow for the competition target. It lacks structured inventory facts, equipment constraints, generalized preferences, multi-intent plans and richer conversational references.

## 2.5 Current dietary semantics are not sufficient for final claims

Current `assertMenuSatisfiesConstraints`:

- allergen constraint: every menu item must carry the relevant `<allergen>-free` tag;
- vegan/vegetarian constraint: only requires at least one suitable menu item.

That is a real current semantic limitation. The final system must not imply that an entire vegan guest's meal is covered merely because one item is tagged vegan unless the structured menu model explicitly represents coverage/serving roles sufficient for that guest.

## 2.6 Recipe/menu structure is useful but too small

Current deterministic menu templates already contain:

- item IDs/names;
- serving counts;
- prep/cook estimates;
- constraint tags;
- ingredients;
- preparation templates/dependencies/due offsets.

This pattern should be expanded, not discarded.

Missing final-product structure includes:

- explicit dietary coverage semantics;
- explicit allergen model rather than relying only on free tags;
- equipment requirements;
- make-ahead suitability;
- approximate/structured cost evidence;
- richer variants/substitutions;
- larger recipe/menu set.

## 2.7 Persistence is strict and integrity-protected

Current JSON persistence:

- validates complete HostState;
- hashes snapshots;
- uses temporary/primary/backup recovery;
- rejects unsupported schema versions;
- currently reports schema version 2 even though the interface type is historically named `PersistedHostEnvelopeV1`.

Any authoritative recipe/schema change must be treated as a persistence compatibility change, not a TypeScript-only edit.

## 2.8 Pending proposals/impacts are intentionally live-session state

`HostToolRuntime` caches:

- active menu proposals;
- pending impacts;

in memory.

Committed HostState is persisted; unconfirmed impact state is intentionally not.

A hosted MCP/server architecture therefore needs explicit request/session continuity. Do **not** solve this by persisting unconfirmed impacts as committed event state.

## 2.9 Current tests protect useful semantics but obsolete UX labels

Current Playwright tests verify valuable contracts:

- complete touch route;
- confirmation gates;
- late-change preview before apply;
- persisted reload without stale confirmation;
- 48×48 controls/no overflow;
- voice-only execution;
- spoken cancellation;
- voice-unavailable fallback;
- WCAG A/AA automated scans;
- focus lifecycle;
- corrupt-state recovery;
- memory fallback;
- scoped data deletion;
- no unexpected cross-origin requests.

But they also literally require obsolete controls and navigation such as `Build shopping list`, `Build prep plan`, `Live` and `Activity`.

Preserve the **behavioral contract**, not the obsolete UI implementation.

---

# 3. Normative Phase A audit clarifications to the product specification

These clarifications are controlling where the initial product specification was broader than the directly inspected architecture/current Alexa+ requirements.

## 3.1 READY and HOSTING are initially derived customer stages

Do not immediately add `ready` or `hosting` to authoritative `EventStatus`.

Current domain transition chain is:

`draft -> planned -> sourcing -> preparing -> live -> complete`

The customer lifecycle in the product specification maps onto this plus current state facts.

Initial derived mapping target:

- INTAKE = domain `draft` with material event facts still missing/unresolved in workflow;
- PLAN = `draft`/`planned` around menu commitment;
- SHOP = `planned`/`sourcing` with shopping unresolved;
- PREP = committed menu + preparation graph before hands-busy execution;
- LIVE = domain `preparing`/`live` while active execution is underway;
- READY = all required preparation tasks done for the current confirmed event while event is not complete;
- HOSTING = domain `live` after readiness / event-time transition where product behavior requires it;
- COMPLETE = domain `complete`.

Only add new domain status values later if a real invariant/action cannot be represented by the current lifecycle plus derived projection.

## 3.2 Timing health is derived first

Do not persist `on_track`, `behind` or task slack as authoritative mutable fields in Phase F unless a later invariant requires it.

Derive timing from:

- event startAt;
- task duration;
- dueBy;
- dependencies;
- completion state;
- injected clock.

This avoids stale timing state and preserves deterministic testing.

## 3.3 OperatingProjection is not HostState

Create a sanitized read model. Do not add Event Home display fields to `HostState`.

## 3.4 Recipe compatibility requires authoritative schema work

Unlike Event Home/attention/timing, recipe compatibility is not merely presentation.

Because hard constraint validation depends on Menu/MenuItem data, the final structured compatibility expansion belongs in the domain/menu schema and validation layer.

## 3.5 Recipe schema change requires persistence compatibility work

Do not silently add required semantics while keeping existing persisted snapshots under the same interpretation.

Preferred path:

- define a new persistence schema version when new authoritative compatibility semantics become required;
- implement explicit migration for known version-2 menu data where safe;
- reject rather than guess where migration cannot establish the new invariant;
- retain backup/recovery behavior;
- add migration tests.

An alternative backward-compatible optional-field approach may only be used if the new validator can prove safety without interpreting absent fields optimistically.

## 3.6 Final hosted web product must not embed provider secrets

Current browser-only runtime is suitable for the deterministic baseline, not for a live model/MCP/external-provider final product.

Final competition architecture should use a server-side Host service for secrets/provider calls and shared authoritative execution.

## 3.7 Web and MCP/Alexa should converge on one authoritative backend

Do not build:

- one browser-local Host event;
- a separate MCP Host event;
- a third server model state.

The competition route should converge on one Host service/runtime/persistence boundary so the same event can be acted on through the web simulation and MCP/Alexa path.

## 3.8 MCP requirements are stronger than the first spec draft stated

Current Alexa+ QuickStart (checked 2 September 2026) requires/targets:

- remote MCP URL;
- Streamable HTTP;
- Alexa+ support for MCP 2025-11-25;
- OAuth 2.1 authorization-code flow;
- PKCE S256;
- Protected Resource Metadata document;
- authorization-server metadata;
- bearer token on authenticated requests;
- `resource` parameter behavior;
- round-trip query latency under 500 ms;
- MCP Apps standard when providing custom visuals.

Current MCP Streamable HTTP specification also requires Origin validation when Origin is present to mitigate DNS rebinding.

These requirements must be part of Phase G acceptance.

## 3.9 Do not confuse the Alexa onboarding “Add-on Agent Skill” with proof of the competition’s working Agent Skill route

Current Alexa documentation calls the AI coding/onboarding helper an **Add-on Agent Skill**. The competition separately prioritizes a **working Agent Skill** as an Alexa+ project route.

Using the onboarding helper does not by itself prove the competition runtime requirement. Final claims must identify the actual runtime route implemented.

## 3.10 Alexa+ MCP availability is currently US-focused

Current Alexa+ MCP Toolkit documentation states availability in the United States.

Treat this as a deployment/onboarding constraint to verify with the user's developer account during Phase G. Do not assume UK residence automatically prevents development/testing, but do not promise physical/production availability until actually verified.

## 3.11 Current MCP SDK protocol support is newer than Alexa's required target

The public TypeScript MCP SDK has newer protocol support as of this audit. Implementation should use a maintained SDK/configuration that still interoperates with Alexa's supported 2025-11-25 protocol rather than selecting a protocol version solely because it is newest.

---

# 4. Target final architecture

```text
Web Event UI / Voice
        |
        | HTTPS application API
        v
+----------------------------------+
| Host Application Service         |
|                                  |
| Conversation / Goal Orchestrator |
| Structured Model Adapter         |
| Workflow Planner                 |
| Operating Projection             |
| Attention Engine                 |
| Timing Engine                    |
+----------------+-----------------+
                 |
                 | controlled calls
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
+---------+-------------+----------+
          |             |
          |             +--> provider adapters
          |                  menu/product/cart/
          |                  future calendar/etc.
          v
 durable HostPersistenceAdapter

Alexa+ / MCP Client
        |
        | Streamable HTTP + OAuth
        v
+----------------------------------+
| Host MCP Gateway                 |
| customer-facing MCP tools        |
+----------------+-----------------+
                 |
                 v
        Host Application Service
        / HostToolRuntime
```

Key rule: Web and MCP converge before the authoritative mutation boundary.

---

# 5. Proposed module map

Paths are targets, not permission to create implementation before the applicable phase begins.

## 5.1 Reuse substantially unchanged

### `src/domain/engine.ts`

Retain:

- `commitMutation` revision/receipt/audit behavior;
- menu commitment confirmation;
- inventory mutation;
- shopping calculation;
- provider-result validation path;
- task completion dependency enforcement;
- late-change analysis/apply;
- undo safety.

Expected later edits:

- structured recipe/menu compatibility changes;
- any genuine new domain invariant found during phases E/F/H.

Do not turn the domain engine into the workflow planner.

### `src/tools/runtime.ts`

Retain:

- validation boundary;
- checkpoint/rollback;
- structured success/failure;
- provider adapter boundary;
- idempotency key behavior for cart;
- pending-impact protections.

Expected extensions:

- richer safe read view or read-only application access;
- any new justified tools;
- server-session handling support via surrounding service, not arbitrary global state.

### `src/persistence/*`

Retain interface and checkpoint semantics.

Expected extensions:

- schema migration when authoritative menu schema changes;
- server-side durable adapter selected during deployment/integration phase.

### `web/voice.ts`

Retain current browser Web Speech controller concepts for the simulation route, subject to UI integration changes.

Do not represent it as physical Alexa voice.

---

# 6. Phase B — operating state/projection

## New target type

Create a sanitized read model, for example:

`src/application/event-operating-state.ts`

Possible structures:

```ts
interface EventOperatingSource {
  event: EventRecord;
  selectedMenu?: Menu;
  inventory: InventoryItem[];
  shopping: ShoppingItem[];
  tasks: PreparationTask[];
  recentReceipts: ActionReceipt[];
  reversibleReceiptIds: string[];
}

interface OperatingProjection {
  event: ...;
  customerStage: ...;
  statusSentence: string;
  inventoryCoverage: ...;
  shoppingSummary: ...;
  prepSummary: ...;
  nextAction?: ...;
  timing: ...;
  attention: AttentionItem;
  readiness: ...;
}
```

Exact field names should be finalized during implementation and tests.

## Source access

Current `get_event_status` is too shallow for Event Home/Run Sheet because it exposes counts and one next task but not full selected menu, inventory or task detail.

Recommended implementation:

- add **one deliberate read-only customer/application view** rather than exposing raw `HostState`;
- either extend the tool runtime with `get_event_operating_state` or add a read-only `HostApplicationReadService` that internally reads through the controlled runtime/session without exporting `HostDomainEngine`.

Decision for Phase B:

**Preferred:** `HostApplicationReadService` + sanitized `EventOperatingSource`, because mutations already remain tool-only and an internal read service avoids inflating the MCP/customer tool set merely for UI rendering.

Constraints:

- it must return clones/sanitized values;
- it must not expose undo snapshots or internal pending caches;
- it must not mutate;
- it must not make browser code import the domain engine directly;
- any MCP customer status tool should be separately designed in Phase G from this safe view.

## Attention engine

New pure module target:

`src/application/attention.ts`

Input:

- EventOperatingSource/Projection;
- ephemeral workflow state (pending confirmation/missing input/pending impact/failure needing action);
- timing status.

Output:

- exactly one primary customer attention item;
- reason/source;
- allowed actions.

Do not let the LLM determine priority.

## Customer lifecycle projection

New pure module target:

`src/application/lifecycle.ts`

Maps domain status + state facts into INTAKE/PLAN/SHOP/PREP/LIVE/READY/HOSTING/COMPLETE without persisting duplicate lifecycle state.

## Phase B tests

New target:

`tests/operating-projection.test.mjs`

Cover:

- empty/uncommitted menu;
- menu committed;
- inventory needed;
- shopping unresolved/covered;
- prep unbuilt/built;
- ready tasks;
- all prep done -> derived READY;
- pending confirmation outranks lower-priority work;
- late-change impact outranks normal next work;
- failed consequential action needing input outranks normal work;
- no duplicate mutation occurs during projection.

---

# 7. Phase C — goal-directed orchestration

## New module target

`src/agent/workflow.ts`

Types:

```ts
interface WorkflowPlan {
  goal: string;
  baseRevision?: number;
  steps: WorkflowStep[];
  stopReason?: WorkflowStopReason;
  receipts: WorkflowStepReceipt[];
}
```

This is ephemeral workflow state, not HostState.

## Orchestrator integration

Refactor `HostAgentOrchestrator` so `handleText()` remains a stable customer entry point but can delegate to:

- structured interpretation;
- workflow planner;
- workflow executor;
- response composer.

Low-risk automatic sequences can use existing `HostToolRuntime.execute()`.

Example after menu confirmation:

Current:

`commit_menu -> reply with Build shopping list / Build prep plan buttons`

Target:

`commit_menu -> determine inventory coverage missing -> ask customer about inventory`

After confirmed inventory:

`record_inventory -> build_shopping_plan -> (where allowed) build_preparation_plan -> return coherent Event Home update`

Do not automatically prepare/checkout products merely because shopping exists; that crosses into acquisition/provider/customer-choice behavior.

## Confirmation behavior

Retain `PendingConfirmation` concept initially, but separate:

- confirmation for one specific tool action;
- workflow plan waiting at a confirmation boundary.

Confirmation must bind to:

- exact action/tool;
- event ID;
- expected revision;
- consequence;
- timestamp only when actual customer confirms.

## Revision conflicts

Workflow executor rule:

- if a low-risk step returns stale revision, refresh operating state;
- recompute the workflow plan;
- never retry a material action blindly;
- never replay a confirmed transaction-like action on a new revision without a new valid confirmation if its consequence changed.

## Tests

Add:

- `tests/workflow-orchestrator.test.mjs`;
- extend `tests/primary-scenario.test.mjs`.

Verify:

- automatic low-risk chaining;
- missing data stop;
- confirmation stop;
- failure stop;
- stale revision replan;
- no duplicate provider/transaction action;
- receipts/tool order;
- user can interrupt workflow with a late change.

---

# 8. Phase D — structured live model

## Server-only live model adapter

Do not put provider credentials in `web/runtime.ts`.

New target families:

- `src/model/types.ts`
- `src/model/schema.ts`
- `src/model/provider.ts`
- `src/model/fallback.ts` or integrate existing resilient interpreter cleanly.

Existing `ModelBackedIntentInterpreter` may be retained/adapted for simple intent classification, but the competition path needs additional structured output types rather than forcing everything into `HostIntentSlots`.

## Structured outputs

Define independently validated schemas for:

### CustomerUnderstanding

- one or more intents;
- event facts;
- constraints;
- soft preferences;
- inventory candidates;
- references;
- ambiguity flags;
- confidence/evidence text spans where useful.

### WorkflowSuggestion

- goal classification;
- candidate safe next operation categories;
- missing inputs;
- no executable arbitrary tool name.

### ExplanationInput/Output

Model receives only structured state needed for the explanation.

Do not use model prose as evidence.

## Inventory extraction design

Current authoritative `InventoryItem` requires exact quantity/unit.

Natural statement “I have rice, oil and lemons” is insufficient to claim exact coverage.

Target interaction:

1. model extracts candidate item identities;
2. Host matches them against current menu requirements;
3. where customer did not state quantity, Host asks a grouped bounded clarification such as whether they have enough for the required amount;
4. only after confirmation may Host translate “enough” into the exact current required quantity for that item;
5. that translation must be explicit in the workflow/tool input and receipted as customer-confirmed coverage.

Implementation options to resolve during Phase D/C integration:

- extend `record_inventory` with a validated coverage mode; or
- add a purpose-built `confirm_inventory_coverage` tool that derives required quantities from the current committed menu.

Preferred direction: **new purpose-built coverage tool**, because it avoids pretending the customer stated a numeric quantity they did not provide.

This is a genuinely new authoritative capability and therefore requires domain/tool tests if selected.

## Provider fallback

Retain heuristic interpreter for:

- deterministic commands;
- confirmation/cancel;
- core demo fallback.

Do not let model outage make authoritative state unusable.

---

# 9. Phase E — recipe/menu model

## Domain changes required

Target changes in `src/domain/types.ts` / `validation.ts`:

Replace/augment generic `constraintTags` with structured compatibility metadata such as:

```ts
interface MenuItemCompatibility {
  dietaryProfiles: string[];
  allergenFreeFrom: string[];
  guestCoverage: "shared" | "alternative" | "optional";
}
```

Exact schema needs a dedicated Phase E design before coding.

Also add structured fields where needed:

- equipment requirements;
- make-ahead characteristics;
- structured cost estimate/source;
- variant/substitution relations.

## Compatibility semantics

Define what it means for an entire menu to satisfy:

- one vegan guest among omnivores;
- one vegetarian guest;
- allergy that applies to all food served;
- multiple dietary guests;
- event-wide dietary constraint.

The current “one suitable item exists” rule is not sufficient as the final semantic model.

## Persistence migration

If new fields become required to establish authoritative compatibility:

- bump `HOST_PERSISTENCE_SCHEMA_VERSION`;
- define v2 input envelope type separately;
- migrate known legacy MenuItem `constraintTags` only where mapping is deterministic;
- rerun full `validateHostState` after migration;
- preserve checksum behavior;
- add migration/recovery tests;
- never silently label an unknown legacy tag safe.

## Knowledge repository

Move static demo menu knowledge toward a dedicated data module, e.g.:

- `src/knowledge/recipes.ts`
- `src/knowledge/menus.ts`
- `src/knowledge/validation.ts`

The existing `StaticMenuProposalAdapter` can continue to implement `MenuProposalAdapter`, but proposal ranking should be separated from hard compatibility validation.

---

# 10. Phase F — temporal engine

## Derived timing module

Target:

`src/application/timing.ts` or `src/domain/timing.ts`

Preferred location: `src/application/timing.ts` initially because timing health is derived guidance over authoritative task data rather than committed mutable state.

Inputs:

- event start;
- tasks;
- injected now;
- dependencies/completion.

Derive:

- earliest feasible start;
- latest safe start;
- slack;
- ready/due/late classification;
- event timing health;
- critical next action.

## Scheduling algorithm

Do not simply compare `now` with each task's `dueBy` independently.

Use dependency-aware reverse/forward reasoning so a downstream task's duration/dependency chain affects upstream latest-start calculations.

Treat the task graph as a DAG (already validated as acyclic).

## Clock injection

Existing `HostAgentDependencies.now` is a useful seam. Extend this principle to timing projection/tests.

## Domain change threshold

Only add persisted schedule fields if required for:

- an external scheduled reminder whose exact committed schedule must be receipted;
- a user-confirmed rescheduling decision;
- another genuine invariant.

Ordinary `on track/behind/slack` remains derived.

---

# 11. Final server/application service architecture

## Why a server is required

The current browser runtime directly instantiates:

- localStorage persistence;
- deterministic menu/product/cart adapters;
- heuristic interpreter.

This cannot safely host provider credentials and cannot provide a shared MCP/Alexa runtime.

## New service target

Create a server-side application entry, e.g.:

- `server/index.ts`
- `server/host-service.ts`
- `server/http-api.ts`

The exact framework should be selected based on deployment/MCP SDK compatibility, with minimal unnecessary framework surface.

`HostService` should own or resolve per-session/per-user:

- `HostToolRuntime`;
- `HostAgentOrchestrator`;
- persistence adapter;
- model adapter;
- workflow state/session cache.

## Browser API

Target endpoints may include:

- create/resume anonymous/authenticated Host session;
- submit customer text;
- submit customer action/confirmation;
- fetch current `OperatingProjection`;
- optional event stream only if materially useful.

Do not expose raw domain mutation endpoints.

## Session continuity

Need two distinct identifiers:

- customer/session principal;
- event ID.

Pending proposal/confirmation/change state must remain scoped to the same logical session and cannot leak across users.

For horizontally scaled hosting, in-memory pending state may require sticky session or ephemeral shared session storage. Do not make that decision implicitly.

---

# 12. Server persistence

Current `HostPersistenceAdapter` should remain the interface.

A final hosted adapter is required because browser localStorage cannot be the shared Alexa/web backend.

Selection is deferred to deployment/AWS research, but required properties are fixed:

- per-user/event isolation;
- durable enough for reload/cross-session judging;
- atomic/verified save semantics equivalent to current adapter expectations;
- no secret exposure;
- test adapter for deterministic CI;
- explicit cleanup/retention policy.

Possible implementations may include a managed datastore or carefully controlled server persistence. Do not select a database solely because it is fashionable.

---

# 13. Phase G — MCP implementation map

## Protocol target

Alexa compatibility target:

- MCP 2025-11-25;
- Streamable HTTP;
- remote HTTPS endpoint.

If the chosen maintained SDK serves newer protocol traffic as well, it must still pass Alexa-required 2025-11-25 interoperability tests.

## SDK target

Use the maintained official/public Model Context Protocol TypeScript SDK unless direct testing identifies a blocker.

Do not hand-roll JSON-RPC/MCP parsing unless required.

## MCP server modules

Targets:

- `server/mcp/server.ts`
- `server/mcp/tools.ts`
- `server/mcp/auth.ts`
- `server/mcp/session.ts`
- `server/mcp/validation.ts`

## Security requirements

Implement/test:

- allowed Origin validation where Origin present;
- HTTPS at remote deployment;
- OAuth 2.1 authorization code + PKCE S256 for Alexa onboarding;
- PRM well-known document;
- authorization-server metadata;
- bearer tokens in Authorization header, never query string;
- `resource` parameter behavior;
- scope definition;
- no arbitrary tool execution;
- principal/session isolation;
- input limits/rate protection suitable to demo endpoint;
- sanitized error messages.

## Performance

Current Alexa documentation target: MCP round-trip query latency <500 ms.

Measure real deployed tool latency and record evidence. Long provider operations need deliberate design; do not assume every external workflow can fit under that target.

## MCP tool design

Do not expose all 17 internal tools mechanically.

Candidate customer-level MCP surface to design later could include:

- `start_hosting_event`;
- `get_hosting_status`;
- `choose_menu`;
- `confirm_inventory`;
- `get_shopping_state`;
- `get_run_sheet`;
- `complete_current_task`;
- `preview_event_change`;
- `apply_confirmed_event_change`;
- `get_receipts`.

These names are placeholders pending tool-design audit.

Each customer MCP tool may orchestrate one or more internal Host tools but must preserve all current confirmation/revision rules.

## MCP Apps

Evaluate only after server/tool path works.

Best candidate custom visuals:

- menu comparison;
- late-change impact;
- Live current task;
- Receipts.

The existing web UI should not simply be embedded unchanged as an MCP App.

## Alexa onboarding

Current public Alexa docs provide Alexa AI CLI onboarding and development-stage web simulator flow for MCP add-ons. They also state current MCP Toolkit availability is US-focused.

During Phase G:

- attempt actual developer-account CLI configuration/onboarding;
- document success or exact blocker;
- do not treat the coding-agent onboarding helper itself as proof of a working competition Agent Skill.

---

# 14. Phase H — external integrations

## Model integration is mandatory target

The live structured model path is the first external integration to implement/test.

## Calendar/reminders

Potentially valuable because Host is temporal.

Only add after timing engine exists and define explicit customer permission/confirmation boundaries.

A scheduled reminder must be receipted as an external result.

## Product/commerce

Research before selection.

Current `ProductCatalogueAdapter` and `CartActionAdapter` are good provider seams.

A real provider adapter can replace deterministic adapters if:

- authorized terms/API access;
- stable judge/test route;
- UK or chosen demo geography supported;
- deterministic enough test mode;
- clear authentication/failure behavior.

If these are not met, keep checkout explicitly simulated rather than faking integration depth.

## Smart home

Only include if a real supported API creates a meaningful hosting action and can be reliably demonstrated.

---

# 15. AWS implementation decision map

AWS is not required for the Alexa+ track itself.

If activated for AWS Builder, use it where it strengthens the same architecture.

Candidate mappings:

- Bedrock -> server-side structured model provider;
- AgentCore Memory/current appropriate service -> separate non-authoritative preference store;
- DynamoDB/current appropriate store -> HostPersistenceAdapter if it improves durable server execution;
- EventBridge Scheduler/current scheduling service -> confirmed external reminder/schedule actions;
- Lambda/API Gateway/container service -> Host server/MCP hosting if latency/auth/toolkit compatibility is satisfactory.

Do not commit to these services until current AWS access, pricing/credits and exact service suitability are researched and tested.

---

# 16. Phase I — web UI rebuild map

## Current files to replace/refactor substantially

- `web/types.ts`
- `web/main.ts`
- `web/render.ts`
- `web/styles.css`
- `web/editorial-refinement.css`

The editorial refinement layer should not remain as an accumulating patch stack in the final UI. Once the new design is implemented, consolidate the final design system deliberately.

## New UI state model

Replace `ViewMode = conversation | live | activity` as the core state model with something closer to:

- current operating projection;
- current route/surface: home/run-sheet/receipts;
- Live takeover state;
- Ask Host sheet state;
- pending decision/change detail state;
- voice state;
- recovery/privacy state.

## Event Home

Consumes OperatingProjection, not latest response card.

## Ask Host

Retain conversation transcript but make it a secondary sheet/surface.

The agent reply can still carry `speech` and contextual cards/actions for conversation, but Event Home must refresh from authoritative projection after actions.

## Run Sheet

Reads the current authoritative task set through operating read state. It must never invoke `build_preparation_plan` simply to display tasks.

## Receipts

Reads current customer-safe receipts. It must never rely on whichever history reply happened to be fetched last.

## Live

Reads authoritative next/timing projection and uses existing controlled completion action.

## Change impact

Uses pending structured impact data with changed-vs-preserved presentation. Do not reduce the underlying `ChangeImpact` to six counts before UI rendering.

This likely requires a richer presentation DTO that includes before/after summaries from `proposedEvent`, `proposedShopping` and `proposedTasks`.

---

# 17. Agent presentation contract changes

`AgentReply` should remain useful for speech/conversation, but current `AgentCard` union should stop carrying the entire application UI architecture.

Recommended separation:

1. **Conversation response contract** — speech/display text, contextual decision card/action where useful.
2. **Operating projection contract** — durable event state for Event Home/Run Sheet/Live/Receipts.
3. **Pending decision contract** — exact confirmation/change consequence.

This prevents “last message wins the screen” behavior.

---

# 18. Test architecture map

## Preserve current files initially

Existing tests stay until corresponding replacement behavior is covered.

Do not delete old tests first and promise to restore coverage later.

## Rewrite browser tests by semantic contract

### `tests/web/host-ui.spec.ts`

Replace manual-command journey with final autonomous customer journey.

Preserve checks for:

- complete touch route;
- confirmation before material state changes;
- late-change preview before apply;
- reload/resume;
- touch target floor;
- no horizontal overflow.

### `tests/web/voice-ui.spec.ts`

Preserve deterministic fake-Web-Speech boundary test, but update voice journey so customer does not have to speak internal software commands such as “shopping list” and “prep plan” unless those are natural optional queries.

Add late-change voice-only impact/confirmation.

### `tests/web/hardening-ui.spec.ts`

Preserve:

- Axe A/AA;
- keyboard/focus lifecycle;
- corrupt-state recovery;
- memory fallback where local mode retained;
- scoped deletion/privacy;
- network-boundary assertions.

Network-boundary test must change once a deliberate Host backend/model endpoint is introduced: it should allow only explicitly configured trusted Host origins rather than require zero external requests.

## Playwright projects

Retain:

- 1280×800 Echo-like;
- 390×844 mobile.

Add browser/device coverage only where it materially improves final confidence; do not replace these two canonical competition surfaces.

## MCP tests

New independent protocol suite separate from Playwright.

Use real HTTP server/client interaction where practical, not only direct function calls.

## Full release gate

Final gate sequence should eventually include:

1. clean dependency install;
2. domain/tool/agent/application tests;
3. model schema/fallback tests;
4. persistence/migration tests;
5. temporal tests;
6. MCP protocol/security tests;
7. production server build;
8. production web build;
9. Playwright Echo + mobile;
10. Axe scope;
11. real canonical-state capture;
12. direct visual audit;
13. hosted smoke test where applicable;
14. final package provenance/hash.

---

# 19. Source files likely to change by phase

| Phase | Existing files | New likely files |
|---|---|---|
| B projection | `src/tools/types.ts` only if read DTO needed; `src/application/index.ts` | `src/application/event-operating-state.ts`, `src/application/lifecycle.ts`, `src/application/attention.ts`, tests |
| C workflow | `src/agent/orchestrator.ts`, `src/agent/types.ts` | `src/agent/workflow.ts`, workflow tests |
| D model | `src/agent/model.ts`, `src/agent/types.ts`, runtime wiring | `src/model/*`, server model adapter, tests |
| E recipes | `src/domain/types.ts`, `validation.ts`, `state-validation.ts`, menu adapters, persistence schema/types | `src/knowledge/*`, migration code/tests |
| F time | possibly no domain mutation files | `src/application/timing.ts`, timing tests |
| G MCP | tool exposure review, server wiring | `server/mcp/*`, auth/session/protocol tests, add-on manifest later |
| H integration | current adapter types/runtime where suitable | real provider adapters, server config/tests |
| I UI | `web/main.ts`, `render.ts`, `types.ts`, styles, browser runtime | optional component/render modules, API client |
| J usability | no product source unless fixes | usability protocol/results reports |
| K release | README/submission/workflows/HANDOVER | final reports/package/media manifests |

---

# 20. Explicit non-requirements / avoided architecture mistakes

Do **not**:

- add READY/HOSTING domain statuses merely because the UI uses those words;
- persist attention state;
- persist timing health on every clock tick;
- let model output become HostState;
- expose HostDomainEngine from the public package;
- make MCP a second mutation implementation;
- expose all internal Host tools one-for-one to Alexa without customer-intent review;
- move confirmation into the UI alone;
- store unconfirmed change impacts as committed event state merely for server convenience;
- keep browser localStorage as the only final authoritative store if MCP/Alexa is implemented;
- put model/provider secrets in Vite/browser environment variables;
- preserve obsolete Plan/Live/Activity buttons solely because existing tests name them;
- leave `editorial-refinement.css` as an endless override layer after the full UI rebuild;
- claim real food safety beyond the structured compatibility semantics actually implemented;
- infer inventory quantity from a bare item-name statement without confirmation;
- select a database/framework/AWS service before its role and failure semantics are justified.

---

# 21. Phase-by-phase dependency order after audit

The original high-level phase sequence remains valid with one refinement: server foundations required by the live model can be introduced as part of Phase D, and the full shared server/MCP convergence must be completed before Phase G acceptance.

Controlled order:

1. **Phase B:** OperatingProjection + lifecycle + attention using current deterministic runtime.
2. **Phase C:** Goal-directed workflow orchestration using current deterministic interpreter/providers first.
3. **Phase D:** Server-side structured live-model path + richer understanding.
4. **Phase E:** Structured recipe/menu semantics + persistence migration.
5. **Phase F:** Temporal execution engine.
6. **Phase G:** Shared server runtime + self-hosted MCP + Alexa onboarding attempt; MCP auth/performance/security gates.
7. **Phase H:** Selected real external integration(s)/optional AWS after research.
8. **Phase I:** Full UI rebuild on the now-stable operating contracts.
9. **Phase J:** Human usability testing and correction.
10. **Phase K:** final release, deployment evidence, gallery/video/Devpost.

UI visual concept work may occur earlier as design documentation, but do not lock production UI contracts before OperatingProjection/workflow/timing information needs are known.

---

# 22. Phase A specification audit result

The product specification is **directionally valid** and can control implementation, subject to the normative clarifications in section 3 of this map.

No requirement was found that forces Host to abandon the current authoritative execution engine.

The following requirements are now categorized:

## Reuse with little/no authoritative change

- revisions;
- confirmation enforcement;
- receipts/audit;
- undo;
- persistence checkpoint/rollback pattern;
- shopping reconciliation mathematics;
- task dependency graph;
- late-change analyse/apply mechanism;
- provider adapter pattern;
- browser voice controller concept;
- deterministic fallback interpreter concept.

## New derived/non-authoritative capability

- OperatingProjection;
- customer lifecycle mapping;
- attention priority;
- timing health/slack;
- Event Home state;
- Run Sheet presentation;
- Ready projection;
- Receipts presentation;
- workflow plan object;
- human-friendly late-change before/after DTO.

## New agent/application capability

- goal-directed workflow planner/executor;
- multi-intent understanding;
- inventory candidate extraction;
- contextual reference handling;
- live structured model integration;
- server-side application service;
- shared session continuity.

## New authoritative/domain/tool capability likely required

- structured menu compatibility semantics;
- persistence migration/version handling for those semantics;
- explicit inventory-coverage confirmation tool if the preferred design is accepted;
- any real external action that must become a committed/receipted event fact.

## New infrastructure/integration capability

- durable server persistence;
- hosted HTTPS API;
- MCP Streamable HTTP endpoint;
- OAuth 2.1/PKCE/PRM auth path for Alexa MCP onboarding;
- model provider;
- optional real service adapters;
- deployment.

## New UI capability

- Event Home;
- Ask Host sheet;
- menu decision/confirmation redesign;
- inventory/shopping reconciliation;
- Run Sheet;
- Live takeover;
- change impact;
- Receipts;
- Ready/Complete;
- responsive Echo/mobile architecture.

---

# 23. Phase A gate status

Phase A architecture/source audit is considered complete only when this map is committed together with an updated branch handover and the branch relationship is verified.

The Phase A gate does **not** claim:

- any Phase B code exists;
- the final product is implemented;
- MCP is implemented;
- live model is implemented;
- recipe safety semantics are fixed;
- server deployment exists;
- final UI exists;
- final tests have been run for unimplemented phases.

The next implementation stage after Phase A is:

> **Phase B — build the read-only Event Operating Projection, derived lifecycle and deterministic Attention Engine over the existing accepted domain/tool foundation, with tests, without changing authoritative mutation semantics.**
