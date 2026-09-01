# Host: Alexa+ Event Execution Agent

**Competition:** Build, Ship, Shape: Amazon Developer Hackathon 2026  
**Primary track:** Alexa+ — simulated Alexa+ web experience  
**Current verified stage:** Stage 05 — agent/orchestrator  
**Competition deadline:** 23 October 2026, 20:00 GMT+1 (entrant-supplied competition page)

## What Host is

Host is an execution agent for people hosting at home. It is deliberately not a generic event-planning chatbot. Its job is to turn an agreed hosting plan into authoritative, persistent execution state across menu commitment, inventory, shopping, preparation, late changes, and eventually hands-free live execution.

Core promise:

> From “people are coming over” to “everything is actually ready.”

A defining rule is that conversation never makes an action true. The agent interprets the request and selects controlled tools; only those validated tools can change authoritative state, persist the result, and create receipts/audit evidence.

## Verified implementation state

Stage 05 adds the customer-facing orchestration layer on top of the verified domain, persistence, and tool layers.

Implemented and directly tested:

- natural hosting requests can create structured events;
- missing event information is requested **one question at a time**;
- natural date/time handling for weekdays, today/tomorrow, named dates, ISO dates, and 12/24-hour times;
- guest-count numbers cannot be mistaken for clock times;
- deterministic local intent interpreter for a reliable offline/default path;
- validated model-backed interpreter contract;
- resilient fallback when a model provider fails, returns an unknown intent, or gives a weaker low-confidence interpretation;
- generic JSON model-proxy adapter for later provider integration;
- menu proposals shown as structured customer choices with working selection actions;
- menu commitment remains explicitly confirmation-gated;
- authoritative shopping quantities are returned as structured presentation data;
- simulated product choices expose real candidates/selection state and clearly state that nothing has been purchased;
- simulated checkout requires explicit confirmation and preserves the simulation boundary;
- preparation plans return real task timing/dependency/status data plus executable task actions;
- status and next-action responses come from authoritative tool state;
- late guest/constraint changes are analysed read-only before confirmation;
- confirmed changes preserve unaffected work and use the existing atomic replan path;
- action history exposes customer-safe receipts/audit data without leaking provider internals;
- safe undo is confirmation-gated;
- checkout failure never claims success and offers a fresh confirmation-bound retry;
- a fresh agent session can explicitly resume an already persisted event without restoring stale confirmations;
- package-root API exposes the agent while continuing to block `HostDomainEngine` and direct domain subpaths;
- repository now pins TypeScript as a development dependency and includes a lockfile for reproducible clean-machine builds.

Current verification result: **72 tests passed, 0 failed**.

## User experience contract

Stage 05 deliberately separates concise spoken text from richer structured presentation data. A future Alexa-style screen can therefore remain glanceable while still showing useful detail.

Current presentation objects include:

- event summary;
- menu choices;
- shopping quantities and status;
- product candidates and selected demo products;
- preparation timeline/tasks;
- late-change impact preview;
- customer-safe action history;
- confirmation and error states.

Interaction rules already enforced by tests include:

- ask one question at a time;
- keep normal spoken responses short;
- give every surfaced action a working route;
- use plain language for failures;
- never claim a simulated purchase is real;
- never treat failed/pending work as completed;
- require confirmation for material or transaction-like actions;
- preserve a usable touch/action route alongside natural-language requests.

## Runtime/model boundary

The verified default runtime is the deterministic `HeuristicIntentInterpreter` behind `HostAgentOrchestrator`. This provides a reproducible fallback and makes the demo usable even if an external model is unavailable.

`ModelBackedIntentInterpreter`, `ResilientIntentInterpreter`, and `JsonModelProxyAdapter` provide a controlled integration point for a later live model provider. **No live external LLM provider, API key, Amazon Bedrock integration, or AWS service is claimed in Stage 05.** A model is never given a direct state-mutation route; model output still terminates at the same validated tool layer.

## Run locally

Requirements:

- Node.js 22+
- npm

```bash
npm ci
npm test
```

TypeScript is pinned in `devDependencies`; a machine-global `tsc` installation is not required.

The test command compiles the source and runs the domain, persistence, primary-scenario, tool-runtime, and agent conversation suites.

## Application-facing API

The package root now exposes the controlled customer/application surface, including:

- `HostAgentOrchestrator`
- `HeuristicIntentInterpreter`
- `ModelBackedIntentInterpreter`
- `ResilientIntentInterpreter`
- `JsonModelProxyAdapter`
- `HostToolRuntime`
- agent/tool types and descriptors
- persistence adapter contract/JSON adapter
- deterministic simulation adapters

The package root deliberately does **not** export the domain engine or state validator. `package.json` exposes only the root application entry, so direct package subpath imports to the domain engine remain blocked.

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
- `tests/` — domain, persistence, scenario, tool, and agent verification
- `docs/` — public technical documentation
- `LICENSE` — MIT licence

See `docs/AGENT_ORCHESTRATOR_STAGE05.md` for the Stage 05 architecture and verified boundary.

## Current boundary

The product now has an authoritative backend **and** a controlled conversational/customer interaction contract. What it does not yet have is the polished simulated Alexa+ screen itself.

The next controlled stage is **Stage 06 — Alexa+ simulation UI**. Its target is a complete, attractive, low-friction touch experience that renders the real Stage 05 cards/actions: conversation, event progress, menu choices, shopping, product choices, preparation timeline, change review, confirmations, recovery, and Live Mode. Voice interaction remains the separate Stage 07 gate.
