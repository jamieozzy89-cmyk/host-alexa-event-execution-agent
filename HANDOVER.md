# Host — Controlled Project Handover

## Project identity

**Project:** Host: Alexa+ Event Execution Agent  
**Competition:** Build, Ship, Shape: Amazon Developer Hackathon 2026  
**Primary track:** Alexa+ — simulated Alexa+ web experience  
**Current accepted product stage:** Stage 06 — Alexa+ simulation UI  
**Next controlled stage:** Stage 07 — voice interaction

This handover travels with the full repository source. It records the governing product design, verified stage history, current boundaries, test evidence, unresolved work, and exact continuation point required to continue without relying on chat memory.

## Product purpose

Host is not a generic event-planning chatbot. It is an execution agent for people hosting at home.

Core promise:

> From “people are coming over” to “everything is actually ready.”

The product is differentiated by authoritative execution state rather than conversational claims. It plans and executes hosting work across event constraints, menu commitment, inventory, shopping, preparation, late changes, and hands-busy live guidance.

The central integrity rule is permanent:

> Nothing becomes done because the language model or UI says it is done. Only validated application/tool state can establish completion.

## Controlling architecture

The mutation path is:

`user intent -> agent chooses controlled action/tool -> schema validation -> domain validation -> execution -> persistence -> audit/receipt -> customer response`

Forbidden path:

`user intent -> generated text says an action happened -> UI/state assumes completion`

The agent/orchestrator may interpret intent and choose tools. It cannot directly rewrite authoritative domain state.

Material and transaction-like actions remain confirmation-gated.

## Completed stages

### Stage 02 — authoritative domain engine

Implemented and retained:

- typed event/state model;
- event revisions;
- confirmed constraints;
- menu commitment;
- inventory reconciliation;
- shopping deficit calculation;
- preparation dependency graph;
- action receipts and audit history;
- read-only change impact analysis;
- confirmed atomic change application;
- reversible action support;
- state invariants and transition tests.

Important invariant:

`toBuyQuantity = max(requiredQuantity - onHandQuantity, 0)` after unit reconciliation.

Preparation tasks use `blocked | ready | in_progress | done | cancelled`. Mandatory dependencies cannot be bypassed silently.

### Stage 03 — persistence

Implemented and retained:

- persistence adapter contract;
- JSON storage adapter;
- persisted authoritative events/tasks/receipts;
- resume behavior across runtime restart/reload;
- revision preservation;
- tests proving stored state survives reconstruction.

### Stage 04 — controlled tool layer

The authoritative application mutation surface is the following 17 tools:

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

The package/application boundary does not expose direct domain mutation to normal consumers.

### Stage 05 — agent/orchestrator

Implemented and retained:

- `HostAgentOrchestrator`;
- deterministic `HeuristicIntentInterpreter`;
- model-backed interpreter contract;
- resilient interpreter fallback;
- generic JSON model-proxy adapter;
- natural weekday/today/tomorrow/named/ISO date handling;
- 12/24-hour time parsing;
- one-question-at-a-time clarification;
- structured presentation cards/actions;
- confirmation lifecycle;
- safe checkout retry behavior;
- late-change analysis before mutation;
- authoritative status/next-action responses;
- customer-safe history;
- resume without stale conversational confirmation state.

No live LLM provider, AWS service, Bedrock integration, or API key is claimed at this stage.

Verified Stage 02–05 regression result: **72 passed, 0 failed**.

### Stage 06 — simulated Alexa+ touch UI

Implemented and accepted:

- Vite browser application;
- persistent browser runtime using the verified application layer;
- Plan / Live / Activity navigation;
- natural-language conversation composer;
- event summary;
- menu option cards and explicit confirmation;
- authoritative shopping quantities;
- deterministic demo products;
- explicitly simulated checkout;
- preparation timeline;
- late-change impact view;
- confirmation/error presentation;
- customer-safe receipts/history;
- reload/resume behavior;
- dark/light theme;
- responsive large-display/mobile layouts;
- 48 × 48 px touch-target floor;
- keyboard focus treatment;
- polite conversation live region;
- reduced-motion handling;
- no tested document-level horizontal overflow.

#### Live Mode

Live Mode deliberately presents one ready preparation task at a time with large controls. After a task completion it asks the orchestrator for the next authoritative action and visibly presents the returned guidance.

#### Activity

Activity requests history from the application layer and displays receipts so a user can distinguish what actually succeeded, failed, or was reversed.

#### Persistence

The browser stores authoritative application state through `JsonStoragePersistenceAdapter` over `localStorage`. The active event id is remembered separately. Reload resumes the event through the orchestrator and does not recreate stale pending confirmation UI.

## Stage 06 verification evidence

Final successful GitHub Actions workflow run: `33501409738`.

Final Stage 06 browser result:

- backend regression: **72 passed, 0 failed**;
- web TypeScript/build: **passed**;
- Playwright acceptance: **8 passed, 0 failed**;
- Echo Show-like project: 1280 × 800, touch enabled;
- mobile project: 390 × 844, touch/mobile enabled;
- UI boundary scan: **passed**.

The four browser scenarios were each executed in both viewports:

1. complete visible-touch hosting journey;
2. late vegan guest preview/confirmed change;
3. authoritative reload/resume without stale confirmation;
4. touch-target floor and overflow check.

See `reports/STAGE06_VERIFICATION.md` for the defect/fix history and exact acceptance record.

## Simulation boundaries

The following are currently simulations and must continue to be described truthfully:

- menu proposal source;
- product catalogue/candidate selection;
- cart/checkout transaction.

The application does **not** currently perform:

- real grocery/payment transactions;
- real Amazon retail calls;
- real calendar mutations;
- real invitation sending;
- physical Alexa device certification/integration;
- AWS/Bedrock calls;
- live smart-home control.

The Alexa+ competition route is the allowed simulated web experience route. Do not claim unavailable MCP/Alexa partner tooling is integrated.

## Current repository/runtime structure

- `src/domain/` — authoritative domain engine and invariants;
- `src/persistence/` — persistence contract/adapter;
- `src/tools/` — validated tool descriptors/runtime;
- `src/agent/` — interpretation/orchestration/presentation;
- `src/application/` — supported public application surface;
- `src/simulated-services/` — deterministic demo adapters;
- `web/` — Stage 06 simulated Alexa+ browser experience;
- `tests/*.test.mjs` — Stage 02–05 regression suites;
- `tests/web/` — Stage 06 Playwright acceptance suite;
- `docs/` — permanent architecture records;
- `reports/` — permanent verification records.

## Local verification commands

Requirements:

- Node.js 22+
- npm

Install and verify backend/application layers:

```bash
npm ci
npm test
```

Build the web application:

```bash
npm run build:web
```

Run the full Stage 06 browser suite on a machine with Playwright Chromium dependencies:

```bash
npx playwright install --with-deps chromium
npm run test:web
```

Full Stage 06 verification command after browser dependencies are present:

```bash
npm run verify:stage06
```

## Exact continuation point — Stage 07

Stage 07 must add **voice interaction without bypassing any Stage 02–06 control**.

Required outcome:

> The core Host journey can be driven and understood through the voice channel without depending on visual information, while touch remains an equivalent route.

The recommended controlled implementation boundary is a browser voice adapter around the existing `HostAgentOrchestrator`, not a second agent or second state engine.

Stage 07 work should include:

1. voice service/adapter contract separated from orchestration;
2. browser speech-recognition adapter when available;
3. browser speech-synthesis output when available;
4. deterministic fake voice adapter for automated tests;
5. voice-session state (`idle`, `listening`, `processing`, `speaking`, `unavailable/error`) that does not become authoritative event state;
6. concise spoken rendering of agent responses/actions;
7. confirmation handling that can be completed by spoken yes/no/cancel without screen dependence;
8. next-action/task completion flow by voice;
9. recovery when recognition is unavailable or fails;
10. automated voice-only journey proving the same authoritative state transitions as the touch journey;
11. retention of touch parity;
12. no direct domain imports from the voice/UI layer.

Do not add AWS merely to make Stage 07 work. AWS Builder mini-challenge integration remains a later explicit decision after the core Alexa+ experience is complete and only if it provides real product value.

## Unresolved later work

After Stage 07, the controlled plan still contains:

- Stage 08 — competition/AWS Builder integration decision;
- Stage 09 — hardening: accessibility, errors/recovery, demo regression, security/privacy, deployment/reproducibility, source/licence/provenance review;
- Stage 10 — final Devpost submission assets, product/tool feedback, friction logs, gallery, demo script/video, and final submission audit.

The Devpost `Built With` field, AWS claims, deployment links, screenshots and final submission prose must remain truthful to the actual verified build state.
