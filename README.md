# Host: Alexa+ Event Execution Agent

**Competition:** Build, Ship, Shape: Amazon Developer Hackathon 2026  
**Primary track:** Alexa+ — simulated Alexa+ web experience  
**Current verified stage:** Stage 06 — Alexa+ simulation UI  
**Competition deadline:** 23 October 2026, 20:00 GMT+1 (entrant-supplied competition page)

## What Host is

Host is an execution agent for people hosting at home. It is deliberately not a generic event-planning chatbot. Its job is to turn an agreed hosting plan into authoritative, persistent execution state across menu commitment, inventory, shopping, preparation, late changes, and hands-busy live execution.

Core promise:

> From “people are coming over” to “everything is actually ready.”

A defining rule is that conversation never makes an action true. The agent interprets the request and selects controlled tools; only those validated tools can change authoritative state, persist the result, and create receipts/audit evidence.

## Current verified product

Stage 06 adds the competition-facing simulated Alexa+ browser experience on top of the already verified domain, persistence, tool and agent/orchestrator layers.

The application now provides three customer views:

- **Plan** — natural conversation plus structured current results;
- **Live** — one ready preparation task at a time with large hands-busy controls and visible authoritative next-step guidance;
- **Activity** — customer-safe receipts showing what actually succeeded, failed or was reversed.

Implemented product capabilities include:

- create a structured hosting event from natural language;
- ask for missing event information one question at a time;
- natural weekday/today/tomorrow/named/ISO date handling;
- 12/24-hour time handling without confusing guest counts for times;
- show structured menu choices;
- require explicit confirmation before committing a menu;
- calculate authoritative shopping deficits;
- show deterministic demo product candidates;
- clearly label checkout as simulation only;
- require confirmation before simulated checkout;
- build dependency-aware preparation tasks;
- surface the next ready task from authoritative state;
- mark preparation work complete through the controlled tool path;
- analyse late changes without mutation first;
- confirm and apply bounded replanning while preserving unaffected work;
- resume persisted event state after page reload without restoring stale confirmations;
- show customer-safe action history/receipts;
- preserve a working touch route for surfaced actions;
- support responsive large-display and mobile layouts;
- provide light/dark presentation and visible keyboard focus;
- maintain a 48 × 48 px tested minimum interactive-target floor.

## Verification status

### Stage 02–05 regression

**72 tests passed, 0 failed.**

### Stage 06 browser acceptance

**8 tests passed, 0 failed.**

The four Stage 06 browser scenarios each pass in both configured Playwright projects:

- `echo-show`: 1280 × 800, touch enabled;
- `mobile`: 390 × 844, touch/mobile enabled.

Verified browser scenarios:

1. complete visible-touch hosting journey from event creation through Live Mode and Activity receipts;
2. late vegan guest impact preview and confirmed update;
3. reload/resume of authoritative event state without stale confirmation UI;
4. interactive-target floor and no document-level horizontal overflow.

The final successful GitHub Actions Stage 06 verification run was `33501409738`.

See `reports/STAGE06_VERIFICATION.md` for the acceptance record and defect/fix history.

## User experience contract

The agent separates concise spoken text from richer structured presentation data so the same application response can support voice and glanceable screen presentation.

Current presentation objects include:

- event summary;
- menu choices;
- shopping quantities and status;
- product candidates and selected demo products;
- preparation timeline/tasks;
- late-change impact preview;
- customer-safe action history;
- confirmation and error states.

Interaction rules enforced by the application/tests include:

- ask one question at a time;
- keep normal spoken responses concise;
- give surfaced actions working routes;
- use plain language for failures;
- never claim a simulated purchase is real;
- never treat failed/pending work as completed;
- require confirmation for material or transaction-like actions;
- preserve equivalent controlled application routes across UI interaction methods.

## Runtime/model boundary

The verified default runtime uses `HeuristicIntentInterpreter` behind `HostAgentOrchestrator`. This gives a reproducible local path and keeps the product usable without a live external model.

`ModelBackedIntentInterpreter`, `ResilientIntentInterpreter`, and `JsonModelProxyAdapter` provide a controlled future integration point for a live model provider. **No live external LLM provider, API key, Amazon Bedrock integration, or AWS service is currently claimed.** A model never receives a direct state-mutation route; interpreted intent still terminates at the validated tool layer.

## Browser simulation boundary

The browser runtime uses supported application exports only. It does not import the authoritative domain engine directly.

Persistence uses `JsonStoragePersistenceAdapter` over browser `localStorage`. The active event id is remembered separately, then restored through the orchestrator on reload.

The product explicitly identifies itself as an **Alexa+ simulation**.

Menu proposals, product candidates, and checkout remain deterministic simulations. They are not represented as Amazon retail, grocery-provider, payment, AWS, or physical Alexa-device calls.

## Run locally

Requirements:

- Node.js 22+
- npm

Install dependencies and verify the authoritative/application layers:

```bash
npm ci
npm test
```

Run the browser application:

```bash
npm run dev
```

Build the browser application:

```bash
npm run build:web
```

For Stage 06 browser verification on a machine with Playwright system dependencies:

```bash
npx playwright install --with-deps chromium
npm run test:web
```

Or run the complete Stage 06 gate after the browser dependency install:

```bash
npm run verify:stage06
```

## Application-facing API

The package root exposes the controlled customer/application surface, including:

- `HostAgentOrchestrator`;
- `HeuristicIntentInterpreter`;
- `ModelBackedIntentInterpreter`;
- `ResilientIntentInterpreter`;
- `JsonModelProxyAdapter`;
- `HostToolRuntime`;
- agent/tool types and descriptors;
- persistence adapter contract/JSON adapter;
- deterministic simulation adapters.

The package root deliberately does **not** export the domain engine or state validator. `package.json` exposes only the root application entry, so direct package subpath imports to the domain engine remain blocked.

## Tool surface

All authoritative mutations continue through the existing 17 tools:

`create_event`, `update_event_constraints`, `propose_menu`, `commit_menu`, `record_inventory`, `build_shopping_plan`, `prepare_cart`, `confirm_cart_action`, `build_preparation_plan`, `mark_task_complete`, `advance_event_status`, `get_next_action`, `get_event_status`, `analyse_change_impact`, `apply_confirmed_change`, `get_action_history`, `undo_reversible_action`.

## Repository structure

- `src/application/` — supported public application entry;
- `src/agent/` — conversation/orchestration and presentation contract;
- `src/tools/` — validated intent tool descriptors/runtime;
- `src/domain/` — authoritative state engine, internal to the public package;
- `src/persistence/` — persistence/resume layer;
- `src/simulated-services/` — clearly labelled deterministic demo adapters;
- `web/` — Stage 06 simulated Alexa+ browser experience;
- `tests/` — backend/application plus browser acceptance verification;
- `docs/` — permanent architecture records;
- `reports/` — permanent verification records;
- `HANDOVER.md` — self-contained current continuation state;
- `LICENSE` — MIT licence.

See `docs/ALEXA_SIMULATION_UI_STAGE06.md` for the Stage 06 browser architecture and `HANDOVER.md` for the exact controlled continuation point.

## Current boundary

The project now has the authoritative execution engine, persistence, validated tools, controlled agent/orchestrator, and a verified touch-first simulated Alexa+ interface.

The next controlled stage is **Stage 07 — voice interaction**. Its exit condition is that the core Host journey can be driven and understood through voice without depending on visual information, while preserving the same authoritative state/tool boundaries and keeping touch as an equivalent route.
