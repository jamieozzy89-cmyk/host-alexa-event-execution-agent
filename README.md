# Host: Alexa+ Event Execution Agent

**Competition:** Build, Ship, Shape: Amazon Developer Hackathon 2026  
**Primary track:** Alexa+ — simulated Alexa+ web experience  
**Current verified stage:** Stage 04 — controlled tool/action layer  
**Competition deadline:** 23 October 2026, 20:00 GMT+1 (entrant-supplied competition page)

## What Host is

Host is an execution agent for people hosting at home. It is deliberately not a generic event-planning chatbot. Its core job is to turn an agreed plan into authoritative, persistent execution state across menu commitment, inventory, shopping, preparation, late changes, and later hands-free live execution.

Core promise:

> From “people are coming over” to “everything is actually ready.”

A defining rule is that conversational text can never make an action true. Application-facing code must use validated intent tools; those tools invoke the authoritative domain engine, persist successful state changes, and return structured success/failure results.

## Verified implementation state

Stage 04 adds the controlled application/tool boundary on top of the verified Stage 02 domain engine and Stage 03 persistence layer. No language-model agent, Alexa simulation UI, voice layer, AWS service, deployment, or demo video is claimed yet.

Implemented and directly tested:

- authoritative TypeScript domain state and invariants;
- versioned persistence with SHA-256 integrity verification and restart recovery;
- **17 intent-oriented Host tools** covering current application mutations and reads;
- strict top-level tool input validation and structured unknown-tool failure;
- positive-integer guest-count enforcement at the tool boundary;
- parseable confirmation timestamps for confirmation-bound actions;
- tool descriptors with explicit risk and confirmation metadata;
- package-root exports that expose `HostToolRuntime` but not `HostDomainEngine`;
- package subpath blocking for direct domain-engine imports;
- automatic persistence checkpoints after committed tool mutations;
- live-session rollback when a persistence checkpoint fails;
- deterministic menu-proposal simulation behind an adapter;
- proposal-time dietary/allergen and guest-capacity validation;
- deterministic product-catalogue simulation behind an adapter;
- simulated cart/checkout with an idempotency key;
- reconciliation of checkout currency, reference and total before purchase state is committed;
- durable failed-action receipts when checkout returns failure, invalid data, or throws;
- persisted reversible-action metadata and safe latest-revision undo;
- read-only late-change impact analysis followed by explicit confirmed apply;
- deliberate invalidation of uncommitted proposals/impacts across restart;
- complete tool-only shopping, preparation, replanning, history and undo journeys.

Current verification result: **48 tests passed, 0 failed**.

## Run locally

Requirements:

- Node.js 22+
- TypeScript compiler (`tsc`)

```bash
npm test
```

The test command compiles the source and runs the domain, persistence, primary-scenario and tool-runtime suites.

## Application-facing API

The package root exports the controlled application surface, including:

- `HostToolRuntime`
- tool descriptors/types
- persistence adapter interface and JSON storage adapter
- simulated menu, catalogue and checkout adapters

The package root deliberately does **not** export the domain engine or state validator. `package.json` also exposes only the root application entry, so package subpath imports to the domain engine are rejected.

## Tool surface

Current tools:

`create_event`, `update_event_constraints`, `propose_menu`, `commit_menu`, `record_inventory`, `build_shopping_plan`, `prepare_cart`, `confirm_cart_action`, `build_preparation_plan`, `mark_task_complete`, `advance_event_status`, `get_next_action`, `get_event_status`, `analyse_change_impact`, `apply_confirmed_change`, `get_action_history`, `undo_reversible_action`.

`advance_event_status` was added at Stage 04 so the existing validated lifecycle mutation is not left as an application-facing bypass around the tool boundary.

## Simulation boundary

Menu proposals, product candidates and checkout are currently deterministic simulations. They are explicitly adapters and are not represented as calls to Amazon retail, grocery providers, or any external purchasing service.

## Repository structure

- `src/application/` — public package entry point
- `src/tools/` — validated intent tool descriptors/runtime
- `src/domain/` — authoritative state engine (internal to application package)
- `src/persistence/` — verified persistence/resume layer
- `src/simulated-services/` — clearly labelled deterministic demo adapters
- `tests/` — domain, persistence, scenario and tool-boundary verification
- `docs/` — public technical documentation
- `LICENSE` — MIT licence

See `docs/TOOL_LAYER_STAGE04.md` for the Stage 04 design and verified boundary.

## Current boundary

The application can now be driven completely through controlled tools, without exposing a supported direct mutation route to future application consumers. The next controlled stage is **Stage 05 — agent/orchestrator**: connect an agent behind an adapter and verify on controlled conversations that it chooses the correct tools, asks for missing information, respects confirmation boundaries, reports authoritative state, replans late changes and recovers from failures.
