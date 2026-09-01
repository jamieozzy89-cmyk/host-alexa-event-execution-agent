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

- natural hosting requests can create structured events;
- missing event information is requested one question at a time;
- natural date/time handling for weekdays, today/tomorrow, named dates, ISO dates, and 12/24-hour times;
- guest-count numbers cannot be mistaken for clock times;
- deterministic local intent interpreter for a reliable offline/default path;
- validated model-backed interpreter contract and deterministic fallback;
- menu proposals shown as structured customer choices with working selection actions;
- menu commitment remains explicitly confirmation-gated;
- authoritative shopping quantities and demo product choices;
- simulated checkout requires explicit confirmation and preserves the simulation boundary;
- preparation plans return real task timing/dependency/status data plus executable task actions;
- late guest/constraint changes are analysed read-only before confirmation;
- action history and safe undo remain authoritative and confirmation-gated;
- persistent event state can be resumed without restoring stale pending confirmations;
- browser touch UI supports Plan, Live and Activity flows;
- browser voice routes recognized text through the same HostAgentOrchestrator path;
- spoken menu choice, yes/no confirmations and authoritative next-task completion are supported;
- responsive Echo Show-like and mobile layouts retain large touch controls and voice fallback;
- Stage 09 adds focus recovery, accessibility checks, storage/privacy controls, safe corrupt-state recovery and security boundary checks.

Stage 02–09 backend/application suite: **74 tests passed, 0 failed.**

Stage 06–09 browser suite: **26 tests passed, 0 failed.**

The 26 cases retain the Stage 06 touch and Stage 07 voice journeys and add Stage 09 accessibility, focus, recovery, privacy/storage and network-boundary checks across the Echo Show-like and mobile projects.

## Stage 09 hardening

The current product has been hardened without creating a second execution path. Verified additions include:

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
- zero production dependency vulnerabilities at the verified gate;
- provider-independent relative static asset paths;
- aligned package/lock version `0.9.0` and Node.js floor `>=22.12.0`.

The full Stage 09 browser suite passes **26/26** and the backend/application suite remains **74/74**.

Hosted deployment is not yet claimed. The Vercel chat deployment wrapper cannot currently accept the required target/name/file arguments through its exposed schema, and GitHub Pages is disabled and cannot be enabled with the repository workflow's normal `GITHUB_TOKEN`. The build is deployment-ready, but a public URL must not be listed until a supported deployment path is available and smoke-tested.

See `docs/HARDENING_STAGE09.md` and `reports/STAGE09_VERIFICATION.md`.

## User experience contract

Host separates concise spoken text from richer structured presentation data. Current presentation objects include:

- event summary;
- menu choices;
- shopping quantities and status;
- product candidates and selected demo products;
- preparation timeline/tasks;
- late-change impact preview;
- customer-safe action history;
- confirmation and error states.

Interaction controls include:

- one clarification question at a time;
- short normal spoken responses;
- structured detail instead of long spoken lists;
- plain-language failure messages;
- explicit simulation labels for product/checkout features;
- confirmation before menu commitment, late-plan mutation, simulated checkout, and undo;
- no false completion language after failed/pending actions;
- equivalent touch/action routes alongside natural-language and voice requests.

## Voice boundary

Browser speech recognition and synthesis are optional presentation/input capabilities. Recognized speech is routed through the same agent/orchestrator and controlled tool layer as typed interaction. Voice output does not create authoritative state.

The browser/platform may use a speech service to perform recognition. Host discloses that boundary in the Data & privacy view and does not claim to store speech audio recordings.

When voice is unsupported or fails, the full touch/keyboard path remains available.

## Competition mini-challenge status

- **Open Source:** selected for entry. Host is a new public MIT repository with substantive implementation and tests. Submission evidence is prepared in `submission/OPEN_SOURCE_MINI_EVIDENCE.md`.
- **AWS Builder:** not currently claimed. The user has an AWS account, but has chosen to defer connecting it for now. Bedrock + AgentCore Memory remains the selected future AWS architecture; no AWS runtime integration has yet been implemented or verified.

See `docs/COMPETITION_INTEGRATION_STAGE08.md` for the controlled AWS decision.

## Runtime/model boundary

The verified default runtime uses `HeuristicIntentInterpreter` behind `HostAgentOrchestrator`. This gives a reproducible local path and keeps the product usable without a live external model.

`ModelBackedIntentInterpreter`, `ResilientIntentInterpreter`, and `JsonModelProxyAdapter` provide a controlled integration point for a later live model provider. No live external LLM provider, API key, Amazon Bedrock integration, or AWS service is claimed in the current build. A model is never given a direct state-mutation route; model output still terminates at the validated tool layer.

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

Run the complete Stage 09 gate after browser dependencies are installed:

```bash
npm run verify:stage09
```

## Application-facing API

The package root exposes the controlled customer/application surface, including:

- `HostAgentOrchestrator`
- `HeuristicIntentInterpreter`
- `ModelBackedIntentInterpreter`
- `ResilientIntentInterpreter`
- `JsonModelProxyAdapter`
- `HostToolRuntime`
- agent/tool types and descriptors
- persistence adapter contract/JSON adapter
- deterministic simulation adapters

The package root deliberately does not export the domain engine or state validator. `package.json` exposes only the root application entry, so direct package subpath imports to the domain engine remain blocked.

## Tool surface

All authoritative mutations continue through the existing 17 tools:

`create_event`, `update_event_constraints`, `propose_menu`, `commit_menu`, `record_inventory`, `build_shopping_plan`, `prepare_cart`, `confirm_cart_action`, `build_preparation_plan`, `mark_task_complete`, `advance_event_status`, `get_next_action`, `get_event_status`, `analyse_change_impact`, `apply_confirmed_change`, `get_action_history`, `undo_reversible_action`.

## Simulation boundary

Menu proposals, product candidates, and checkout are deterministic simulations. They are explicitly adapters and are not represented as Amazon retail, grocery-provider, or real payment calls.

## Repository structure

- `src/application/` — supported public package entry
- `src/agent/` — conversation/orchestration and presentation contract
- `src/tools/` — validated intent tool descriptors/runtime
- `src/domain/` — authoritative state engine, internal to the public package
- `src/persistence/` — verified persistence/resume layer
- `src/simulated-services/` — clearly labelled deterministic demo adapters
- `web/` — simulated Alexa+ browser experience and optional browser voice adapter
- `tests/` — domain, persistence, scenario, tool, agent and browser verification
- `docs/` — public technical documentation
- `reports/` — public verification records
- `submission/` — prepared submission evidence
- `LICENSE` — MIT licence

## Current boundary

Host now has the authoritative execution engine, persistence, validated tools, controlled agent/orchestrator, polished simulated Alexa+ touch UI, browser voice path, and the verified Stage 09 accessibility/privacy/recovery/security hardening layer.

The remaining Stage 09 item is **hosted deployment and smoke testing**. The current code/build is ready for deployment, but no hosted URL is claimed while the connected deployment interfaces cannot accept the exact verified artifact or enable repository Pages.

AWS Builder remains deliberately deferred. Open Source remains selected.

After a real hosted deployment is verified—or if the final competition submission uses another permitted reproducible demo-access route—the next controlled stage is **Stage 10 — submission artifacts**.
