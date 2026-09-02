# Host: Alexa+ Event Execution Agent

**Competition:** Build, Ship, Shape: Amazon Developer Hackathon 2026  
**Primary track:** Alexa+  
**Current accepted product baseline:** promoted second editorial refinement on `main`  
**Verified product-code commit:** `e80fc18517111e55f3813c4e4eddf1c7428769a2`  
**Competition deadline:** 23 October 2026, 12:00 PM PDT / 20:00 BST

## What Host is

Host is an execution agent for people hosting at home. It is deliberately not a generic event-planning chatbot. Its job is to turn an agreed hosting plan into authoritative, persistent execution state across menu commitment, inventory, shopping, preparation, late changes, and hands-busy live execution.

Core promise:

> From “people are coming over” to “everything is actually ready.”

A defining rule is that conversation, voice output, and presentation never make an action true. The agent interprets the request and selects controlled tools; only validated application/tool state can establish completion, persist the result, and create receipts/audit evidence.

## Current accepted product

The current promoted product combines:

- authoritative domain/state engine;
- persistence and restart/reload recovery;
- 17 validated execution tools;
- controlled agent/orchestrator;
- simulated Alexa+ web interface;
- browser voice recognition and speech output when supported;
- explicit voice-unavailable fallback to touch/keyboard;
- customer-safe receipt/history evidence;
- the verified second editorial UI refinement now promoted to `main`.

The current browser experience provides three customer views:

- **Plan** — natural conversation plus structured current results;
- **Live** — one ready preparation task at a time with large hands-busy controls and visible authoritative next-step guidance;
- **Activity** — customer-safe receipts showing what actually succeeded, failed or was reversed.

This is the accepted engineering baseline, not the final competition end-state. The next controlled product generation is defined separately in the current handover and product specification once that development branch is created.

## Voice interaction

The browser voice adapter wraps the existing `HostAgentOrchestrator`. It does not create a second agent or state engine.

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

The promoted second editorial refinement was reverified before promotion.

### Backend/application regression

**74 tests passed, 0 failed.**

### Production web build

TypeScript web typecheck and production Vite build passed.

### Browser acceptance

**26 tests passed, 0 failed.**

Configured Playwright projects:

- `echo-show`: 1280 × 800, touch enabled;
- `mobile`: 390 × 844, touch/mobile enabled.

The browser suite retains the touch and voice journeys plus accessibility, focus, recovery, privacy/storage and network-boundary checks. Existing Axe WCAG A/AA checks are included in that browser gate.

The refinement verification run was GitHub Actions run `33581353724`, job `100096132537`. The verified redesigned gallery screenshot commit is `46b537fc3b79fcae20ff59bb49d5d52ccf331ff9`.

### Automated voice-test boundary

Browser voice acceptance uses deterministic fake Web Speech recognition/synthesis objects injected into Chromium. This directly tests Host's browser voice-controller lifecycle, orchestration routing, confirmation behavior, spoken output, state effects and fallback behavior without depending on physical microphone acoustics or a remote speech service.

Physical microphone/acoustic behavior across every real browser/device remains outside deterministic automation. Host therefore retains explicit voice-unavailable/error fallbacks rather than claiming universal browser voice compatibility.

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

## Retained hardening

The current product retains the accepted hardening controls without creating a second execution path:

- keyboard focus continuity after async rerenders;
- labelled modal dialog with initial and return focus;
- focused scrollable conversation region;
- one latest-message screen-reader status announcement rather than replaying the full transcript;
- keyboard-reachable voice-unavailable state;
- Data & privacy explanation for browser storage and browser/platform speech recognition;
- confirmed, scoped deletion of Host event data without clearing unrelated preferences;
- explicit in-memory mode when persistent browser storage is blocked;
- safe recovery when persisted event snapshots cannot be restored;
- no-referrer document policy;
- automated Axe WCAG A/AA checks on representative surfaces;
- automated rejection of unsafe HTML-injection primitives and direct web/domain access;
- zero production dependency vulnerabilities at the verified refinement install/audit output;
- provider-independent relative static asset paths;
- aligned package/lock version `0.9.0` and Node.js floor `>=22.12.0`.

Historical Stage 07 and Stage 09 verification records remain under `reports/` and `docs/`. They are retained evidence, not claims that Stage 09 is still the current release.

## Competition route and current external-integration boundary

- **Alexa+ primary track:** active.
- **Current eligible implementation route:** simulated Alexa+ web experience.
- **Open Source mini challenge:** selected.
- **AWS Builder:** not currently claimed.
- **Hosted deployment:** not currently claimed.
- **Working Agent Skill / self-hosted MCP server:** not currently claimed.

The current official Alexa+ hackathon rules allow a simulated Alexa+ experience using the entrant's own AI or agentic tools. They also prioritize a working Agent Skill and accept a self-hosted MCP server implementing MCP specification version 2025-11-25 or later over Streamable HTTP. The next competition-grade product generation is intended to evaluate and, where verified feasible, add a standards-compliant MCP path without bypassing Host's authoritative tool/domain controls.

## Runtime/model boundary

The verified default runtime currently uses `HeuristicIntentInterpreter` behind `HostAgentOrchestrator`. This gives a reproducible local path and keeps the product usable without a live external model.

`ModelBackedIntentInterpreter`, `ResilientIntentInterpreter`, and `JsonModelProxyAdapter` provide a controlled integration point for a live model provider. **No live external LLM provider, API key, Amazon Bedrock integration, or AWS service is currently claimed.** A model never receives a direct state-mutation route; interpreted intent still terminates at the validated tool layer.

## Browser simulation boundary

The browser runtime uses supported application exports only. It does not import the authoritative domain engine directly.

Persistence uses `JsonStoragePersistenceAdapter` over browser `localStorage`. The active event id is remembered separately, then restored through the orchestrator on reload.

The product explicitly identifies itself as an **Alexa+ simulation** where that disclosure is required.

Menu proposals, product candidates, and checkout remain deterministic simulations. They are not represented as Amazon retail, grocery-provider, payment, AWS, or physical Alexa-device calls.

Voice uses browser Web Speech capability where available. It is not represented as physical Alexa-device integration or certification.

## Run locally

Requirements:

- Node.js 22.12+
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

Run the retained complete application/browser gate after browser dependencies are installed:

```bash
npm run verify:stage09
```

The script name is retained for compatibility with the historical hardening stage; it is not a statement that Stage 09 remains the current accepted product.

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
- `docs/` — permanent architecture, product and control records;
- `reports/` — permanent verification records;
- `submission/` — competition evidence and submission material;
- `HANDOVER.md` — self-contained current continuation state;
- `LICENSE` — MIT licence.

## Current boundary

The current accepted `main` product is a verified, stateful simulated Alexa+ execution-agent foundation with authoritative state, persistence, 17 validated tools, controlled orchestration, browser voice, touch UI, accessibility/privacy/recovery/security controls and the promoted editorial redesign.

It is **not** the final competition-grade product. In particular, a live model-backed reasoning path, standards-compliant MCP server/Agent Skill path, deeper temporal orchestration, richer end-state UI, external service integration, hosted deployment, final public video and final Devpost submission are not yet claimed.

`HANDOVER.md` is the controlling continuation source for the current development stage.