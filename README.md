# Host: Alexa+ Event Execution Agent

**Competition:** Build, Ship, Shape: Amazon Developer Hackathon 2026
**Primary track:** Alexa+ — simulated Alexa+ web experience
**Current verified stage:** Stage 09 — hardened voice + touch product; hosted deployment still pending
**Competition deadline:** 23 October 2026, 20:00 GMT+1 (entrant-supplied competition page)

## What Host is

Host is an execution agent for people hosting at home. It is deliberately not a generic event-planning chatbot. Its job is to turn an agreed hosting plan into authoritative, persistent execution state across menu commitment, inventory, shopping, preparation, late changes, and hands-free live execution.

Core promise:

> From “people are coming over” to “everything is actually ready.”

A defining rule is that conversation never makes an action true. The agent interprets the request and selects controlled tools; only those validated tools can change authoritative state, persist the result, and create receipts/audit evidence.

## Verified implementation state

Implemented and directly tested:

- natural hosting requests create structured events;
- missing event information is requested one question at a time;
- natural date/time handling and controlled constraint parsing;
- deterministic local intent interpreter plus validated model-backed boundary/fallback;
- structured menu, shopping, product, preparation, change, history, confirmation and error presentation;
- explicit confirmation for menu commitment, late changes, simulated checkout and undo;
- authoritative persistence, receipts, audit history and recovery;
- polished Plan / Live / Activity browser UI;
- browser voice routed through the same orchestrator/tool path;
- spoken menu choice, confirmation/cancellation and authoritative next-task completion;
- responsive Echo Show-like and mobile layouts;
- Stage 09 accessibility, focus, storage/privacy, corrupt-state recovery, security and reproducibility hardening.

Stage 02–09 backend/application suite: **74 tests passed, 0 failed.**

Stage 06–09 browser suite: **26 tests passed, 0 failed.**

The 26 cases retain the Stage 06 touch and Stage 07 voice journeys and add Stage 09 accessibility, focus, recovery, privacy/storage and network-boundary checks across the Echo Show-like and mobile projects.

## Stage 09 hardening

Verified additions include:

- keyboard focus continuity after async rerenders;
- labelled modal dialog with initial and return focus;
- keyboard-focusable scrollable conversation region;
- latest-message screen-reader status rather than whole-transcript reannouncement;
- keyboard-reachable voice-unavailable state;
- Data & privacy explanation for local storage and browser/platform speech recognition;
- confirmed scoped deletion of Host event data without clearing unrelated preferences;
- explicit in-memory mode when persistent browser storage is blocked;
- safe corrupt persisted-state recovery;
- no-referrer document policy;
- automated Axe WCAG A/AA checks on representative surfaces;
- automated rejection of unsafe HTML-injection primitives and direct web/domain access;
- zero production dependency vulnerabilities at the verified gate;
- provider-independent relative static asset paths;
- package/lock version `0.9.0` and Node.js floor `>=22.12.0`.

See `docs/HARDENING_STAGE09.md` and `reports/STAGE09_VERIFICATION.md`.

## User experience contract

Host separates concise spoken text from richer structured presentation data. Material actions remain confirmation-gated. Failed/pending work is not described as completed. Touch/keyboard remains a complete path when voice is unavailable.

## Voice boundary

Browser speech recognition and synthesis are optional presentation/input capabilities. Recognized speech is routed through the same agent/orchestrator and controlled tool layer as typed interaction. Voice output does not create authoritative state.

The browser/platform may use a speech service to perform recognition. Host discloses that boundary and does not claim to store speech audio recordings.

## Competition mini-challenge status

- **Open Source:** selected for entry. Evidence is prepared in `submission/OPEN_SOURCE_MINI_EVIDENCE.md`.
- **AWS Builder:** not currently claimed. The user has an AWS account but has chosen to defer integration for now. Bedrock + AgentCore Memory remains the selected future AWS architecture.

## Runtime/model boundary

The verified default runtime uses `HeuristicIntentInterpreter` behind `HostAgentOrchestrator`. Model-backed adapters exist but no live LLM/AWS provider is currently claimed. Model output never receives a direct state-mutation route.

## Run locally

Requirements:

- Node.js 22.12+
- npm

```bash
npm ci
npm test
npm run build:web
npx playwright install --with-deps chromium
npm run test:web
```

Full Stage 09 gate:

```bash
npm run verify:stage09
```

## Application-facing API

The package root exposes the controlled agent/tool/persistence/simulation surface. It deliberately does not export the internal domain engine/state validator.

## Tool surface

All authoritative mutations/reads continue through the existing 17 controlled tools:

`create_event`, `update_event_constraints`, `propose_menu`, `commit_menu`, `record_inventory`, `build_shopping_plan`, `prepare_cart`, `confirm_cart_action`, `build_preparation_plan`, `mark_task_complete`, `advance_event_status`, `get_next_action`, `get_event_status`, `analyse_change_impact`, `apply_confirmed_change`, `get_action_history`, `undo_reversible_action`.

## Simulation boundary

Menu proposals, product candidates, and checkout are deterministic simulations. They are not represented as Amazon retail, grocery-provider or real payment calls.

## Repository structure

- `src/application/` — supported application entry
- `src/agent/` — conversation/orchestration/presentation
- `src/tools/` — validated tool descriptors/runtime
- `src/domain/` — authoritative internal state engine
- `src/persistence/` — persistence/recovery
- `src/simulated-services/` — deterministic demo adapters
- `web/` — simulated Alexa+ UI and optional voice adapter
- `tests/` — backend/application/browser verification
- `docs/` — architecture records
- `reports/` — verification records
- `submission/` — competition evidence
- `LICENSE` — MIT

## Current boundary

Host has the authoritative execution engine, persistence, validated tools, controlled agent/orchestrator, polished simulated Alexa+ touch UI, browser voice path and verified Stage 09 hardening layer.

The remaining Stage 09 item is **hosted deployment and smoke testing**. No hosted URL is claimed while the connected deployment interfaces cannot accept the exact verified artifact or enable repository Pages.

AWS Builder remains deliberately deferred. Open Source remains selected.

After deployment closure, the next controlled stage is **Stage 10 — submission artifacts**.
