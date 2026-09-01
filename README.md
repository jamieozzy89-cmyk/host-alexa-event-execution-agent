# Host: Alexa+ Event Execution Agent

**Competition:** Build, Ship, Shape: Amazon Developer Hackathon 2026  
**Primary track:** Alexa+ — simulated Alexa+ web experience  
**Current verified stage:** Stage 03 — persistence/resume foundation  
**Competition deadline:** 23 October 2026, 20:00 GMT+1 (entrant-supplied competition page)

## What Host is

Host is an execution agent for people hosting at home. It is deliberately not a generic event-planning chatbot. Its core job is to turn an agreed plan into authoritative, persistent execution state across menu commitment, inventory, shopping, preparation, late changes, and later hands-free live execution.

Core promise:

> From “people are coming over” to “everything is actually ready.”

A defining rule is that conversational text can never make an action true. State changes must pass through explicit domain/tool actions and produce verifiable state and receipts.

## Verified implementation state

Stage 03 adds persistence/resume integrity to the verified Stage 02 domain engine. No Alexa simulation UI, agent/model, voice layer, AWS service, deployment, or demo video is claimed yet.

Implemented and directly tested:

- strict TypeScript domain types and runtime validation;
- monotonically increasing event revisions and stale-write rejection;
- validated event lifecycle transitions;
- confirmed menu commitment;
- dietary/allergen compatibility checks for represented constraints;
- confirmed inventory recording;
- shopping deficit calculation (`required - confirmed on hand`);
- refusal to guess incompatible unit conversions;
- preparation dependency graph with cycle/unknown-dependency rejection;
- blocked/ready/done task transitions;
- two-phase, read-only change-impact analysis followed by confirmed atomic apply;
- preservation of completed tasks only when their task definition is unchanged;
- engine-issued pending impact identity so forged impact objects cannot be applied;
- action receipts and append-only audit events;
- full six-person dinner → late seventh vegan guest controlled scenario;
- comprehensive restore-time state revalidation;
- versioned persistence snapshots with SHA-256 integrity checks;
- browser/localStorage-compatible persistence adapter;
- staged primary/backup/temporary recovery behaviour;
- restart/reload reconstruction without generating false new domain history;
- deliberate invalidation of uncommitted change analyses after restart.

Current verification result: **30 tests passed, 0 failed**.

## Run locally

Requirements:

- Node.js 22+
- TypeScript compiler (`tsc`)

```bash
npm test
```

The test command compiles the TypeScript source and runs the domain, primary-scenario, and persistence/restart suites.

## Repository structure

- `src/domain/` — authoritative domain engine and restore-time state validation
- `src/persistence/` — persistence contract, staged JSON storage adapter, resume service
- `tests/` — invariant, failure, state-transition, scenario, persistence and recovery tests
- `docs/` — public technical documentation
- `LICENSE` — MIT licence

## Persistence model

The persistence adapter uses a `StorageLike` contract compatible with browser `localStorage`. Snapshots are versioned and SHA-256 protected, but checksum verification is not treated as sufficient: restored state must also pass the domain-state validator.

A save stages and verifies data before primary replacement and preserves a verified backup. Loading can report whether it recovered from backup/temporary storage.

Uncommitted change-impact proposals are intentionally not restored. After reload they must be recalculated against the current authoritative revision before they can be confirmed.

See `docs/PERSISTENCE_STAGE03.md` for the complete verified behaviour.

## Current boundary

The current code proves domain and persistence behaviour without any UI or language model. This is intentional: the next tool/action layer must consume these controlled operations rather than create an alternate path for state mutation.

The next controlled stage is **Stage 04 — tool/action layer**.
