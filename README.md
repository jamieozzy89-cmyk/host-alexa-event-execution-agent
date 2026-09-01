# Host: Alexa+ Event Execution Agent

**Competition:** Build, Ship, Shape: Amazon Developer Hackathon 2026  
**Primary track:** Alexa+ — simulated Alexa+ web experience  
**Current verified stage:** Stage 02 — authoritative domain engine  
**Competition deadline:** 23 October 2026, 20:00 GMT+1 (entrant-supplied competition page)

## What Host is

Host is an execution agent for people hosting at home. It is deliberately not a generic event-planning chatbot. Its core job is to turn an agreed plan into authoritative, persistent execution state across menu commitment, inventory, shopping, preparation, late changes, and hands-free live execution.

Core promise:

> From “people are coming over” to “everything is actually ready.”

A defining rule is that conversational text can never make an action true. State changes must pass through explicit domain/tool actions and produce verifiable state and receipts.

## Verified implementation state

Stage 02 implements the domain engine only. No Alexa simulation UI, agent/model, persistence adapter, AWS service, deployment, or demo video is claimed yet.

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
- full six-person dinner → late seventh vegan guest controlled scenario.

Current verification result: **17 tests passed, 0 failed**.

## Run locally

Requirements:

- Node.js 22+
- TypeScript compiler (`tsc`)

```bash
npm test
```

The test command compiles the TypeScript domain engine and runs the Node test suite.

## Repository structure

- `src/domain/` — authoritative domain engine
- `tests/` — invariant, failure, state-transition, and primary-scenario tests
- `docs/` — public technical documentation
- `LICENSE` — MIT licence

## Current boundary

The current code proves the domain/state behaviour without any UI or language model. This is intentional: later agent and Alexa-simulation layers must consume these controlled operations rather than becoming an alternate path for state mutation.

The next controlled stage is persistence/resume behaviour.
