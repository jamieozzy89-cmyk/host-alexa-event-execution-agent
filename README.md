# Host: Alexa+ Event Execution Agent

**Competition:** Build, Ship, Shape: Amazon Developer Hackathon 2026  
**Primary track:** Alexa+ — simulated Alexa+ web experience  
**Current verified stage:** Stage 07 — voice + touch interaction  
**Competition deadline:** 23 October 2026, 20:00 GMT+1 (entrant-supplied competition page)

## What Host is

Host is an execution agent for people hosting at home. It is deliberately not a generic event-planning chatbot. Its job is to turn an agreed hosting plan into authoritative, persistent execution state across menu commitment, inventory, shopping, preparation, late changes, and hands-busy live execution.

Core promise:

> From “people are coming over” to “everything is actually ready.”

A defining rule is that conversation, voice output, and presentation never make an action true. The agent interprets the request and selects controlled tools; only validated application/tool state can establish completion, persist the result, and create receipts/audit evidence.

## Current verified product

Host now combines:

- authoritative domain/state engine;
- persistence and restart/reload recovery;
- 17 validated execution tools;
- controlled agent/orchestrator;
- touch-first simulated Alexa+ web interface;
- browser voice recognition and speech output when supported;
- explicit voice-unavailable fallback to touch/keyboard;
- customer-safe receipt/history evidence.

The browser experience provides three customer views:

- **Plan** — natural conversation plus structured current results;
- **Live** — one ready preparation task at a time with large hands-busy controls and visible authoritative next-step guidance;
- **Activity** — customer-safe receipts showing what actually succeeded, failed or was reversed.

## Voice interaction

Stage 07 adds a browser voice adapter around the existing `HostAgentOrchestrator`. It does not create a second agent or state engine.

When the browser provides the required Web Speech capabilities, a user can activate Voice once and continue through conversational turns using speech recognition and speech synthesis. Recognised text is routed through the same `handleText()` path as typed conversation, and Host speaks the same authoritative `AgentReply.speech` returned by the application.

Verified voice behavior includes:

- start/stop voice control;
- listening, processing, speaking, idle, unavailable and error states;
- continuous turn-taking after the initial user activation;
- spoken event creation;
- spoken numbered menu choices;
- `choose option one/two/three` routed through the existing confirmation-gated menu path;
- spoken `yes`/`no` confirmation and cancellation;
- spoken shopping/product/prep/status/history requests;
- spoken simulated-checkout request and confirmation;
- spoken `what's next` guidance;
- spoken `done` resolved against the **authoritative current next task**, not visual context or guesswork;
- customer-safe voice failure messages;
- explicit touch/keyboard fallback when recognition/output is unavailable.

Browser voice support varies by browser/device/permission state. Host therefore never treats voice availability as required for the complete touch path.

## Core product capabilities

Implemented and verified capabilities include:

- create a structured hosting event from natural language;
- ask for missing event information one question at a time;
- natural weekday/today/tomorrow/named/ISO date handling;
- 12/24-hour time handling without confusing guest counts for times;
- show and speak menu choices;
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
- preserve touch/keyboard routes for surfaced actions;
- support responsive large-display and mobile layouts;
- provide light/dark presentation and visible keyboard focus;
- maintain a tested 48 × 48 px minimum interactive-target floor.

## Verification status

### Backend/application regression

Stage 02–07 suite: **74 tests passed, 0 failed.**

### Browser acceptance

Stage 06 + Stage 07 browser suite: **14 tests passed, 0 failed.**

Configured Playwright projects:

- `echo-show`: 1280 × 800, touch enabled;
- `mobile`: 390 × 844, touch/mobile enabled.

The 14 cases consist of:

- eight retained Stage 06 touch cases;
- six Stage 07 voice cases (three voice scenarios in each viewport).

Voice scenarios verify:

1. complete voice-only core execution journey after one activation, including receipts;
2. spoken cancellation of a pending material action and correct recovery guidance;
3. explicit voice-unavailable fallback with touch path retained.

Final successful Stage 07 GitHub Actions run: `33552445789`.

See `reports/STAGE07_VERIFICATION.md` for the complete acceptance record and `docs/VOICE_INTERACTION_STAGE07.md` for the voice architecture.

### Automated voice-test boundary

Browser voice acceptance uses deterministic fake Web Speech recognition/synthesis objects injected into Chromium. This directly tests Host's browser voice-controller lifecycle, orchestration routing, confirmation behavior, spoken output, state effects and fallback behavior without depending on physical microphone acoustics or a remote speech service.

Physical microphone/browser compatibility is therefore a later Stage 09 manual hardening check, not a claim made by the automated suite.

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
- preserve equivalent controlled routes across voice and touch where the current journey exposes them;
- explicitly retain touch/keyboard fallback if browser voice fails or is unavailable.

## Competition mini-challenge status

- **Open Source:** selected for entry. Host is a new public MIT repository with substantive implementation and tests. Submission evidence is prepared in `submission/OPEN_SOURCE_MINI_EVIDENCE.md`.
- **AWS Builder:** not currently claimed. Current research selects Bedrock + AgentCore Memory as the only AWS architecture worth pursuing, but no real AWS account/credential connection is available in this environment, so no AWS runtime integration has been implemented or verified.

See `docs/COMPETITION_INTEGRATION_STAGE08.md` for the controlled decision and AWS integration boundary.

## Runtime/model boundary

The verified default runtime uses `HeuristicIntentInterpreter` behind `HostAgentOrchestrator`. This gives a reproducible local path and keeps the product usable without a live external model.

`ModelBackedIntentInterpreter`, `ResilientIntentInterpreter`, and `JsonModelProxyAdapter` provide a controlled future integration point for a live model provider. **No live external LLM provider, API key, Amazon Bedrock integration, or AWS service is currently claimed.** A model never receives a direct state-mutation route; interpreted intent still terminates at the validated tool layer.

## Browser simulation boundary

The browser runtime uses supported application exports only. It does not import the authoritative domain engine directly.

Persistence uses `JsonStoragePersistenceAdapter` over browser `localStorage`. The active event id is remembered separately, then restored through the orchestrator on reload.

The product explicitly identifies itself as an **Alexa+ simulation**.

Menu proposals, product candidates, and checkout remain deterministic simulations. They are not represented as Amazon retail, grocery-provider, payment, AWS, or physical Alexa-device calls.

Voice uses browser Web Speech capability where available. It is not represented as physical Alexa-device integration or certification.

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

Install the Playwright Chromium runtime/dependencies and run browser acceptance:

```bash
npx playwright install --with-deps chromium
npm run test:web
```

Run the complete Stage 07 gate after browser dependencies are installed:

```bash
npm run verify:stage07
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
- `web/` — simulated Alexa+ web experience and browser voice adapter;
- `tests/` — backend/application and browser touch/voice verification;
- `docs/` — permanent architecture records;
- `reports/` — permanent verification records;
- `HANDOVER.md` — self-contained current continuation state;
- `LICENSE` — MIT licence.

## Current boundary

The project now has the authoritative execution engine, persistence, validated tools, controlled agent/orchestrator, verified touch-first simulated Alexa+ interface, and a verified browser voice-only route for the core journey.

The next controlled stage is **Stage 08 — competition integration decision**. The next decision is whether an AWS Builder mini-challenge integration adds genuine product/judging value without weakening or complicating the primary Alexa+ experience. AWS is not required for the primary simulated Alexa+ route and must not be added merely to claim another technology.