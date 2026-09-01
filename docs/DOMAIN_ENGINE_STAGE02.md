# Domain Engine — Stage 02

## Purpose

The domain engine is the source of truth beneath Host's future conversational and Alexa-style interfaces. It prevents generated language from being mistaken for evidence that an action occurred.

## Mutation model

A committed mutation requires the caller's expected event revision. A stale expected revision fails rather than overwriting newer state. Material actions such as menu commitment and applying an analysed event change require an explicit confirmation timestamp.

Successful mutations:

1. clone committed state;
2. apply validated mutation to the clone;
3. increment the event revision;
4. create a success receipt;
5. append an audit event;
6. replace committed state atomically.

## Core invariants implemented

### Shopping

For matching units:

`toBuyQuantity = max(requiredQuantity - onHandQuantity, 0)`

The Stage 02 engine intentionally rejects incompatible units instead of guessing a conversion.

### Preparation dependencies

A task remains blocked until all declared dependencies are complete. Unknown dependencies and dependency cycles are rejected during menu validation.

### Menu constraints

The Stage 02 representation checks confirmed allergen constraints against `*-free` item tags and requires represented vegetarian/vegan compatibility. More sophisticated menu semantics can be added later without bypassing the engine.

### Replanning

Late changes are split into two operations:

1. `analyseChangeImpact` computes proposed event/menu/shopping/task state without mutating committed state.
2. `applyConfirmedChange` applies an engine-issued pending impact after explicit confirmation and only while its base revision remains current.

Completed tasks are preserved only when their relevant task definition remains unchanged.

## Verification

The Stage 02 test suite covers:

- initial authoritative state;
- confirmation requirements;
- stale revision rejection;
- shopping reconciliation;
- unit mismatch failure;
- dependency blocking/unlocking;
- invalid lifecycle transition;
- read-only impact analysis;
- atomic confirmed replan;
- stale impact rejection;
- unknown dependency rejection;
- allergen conflict rejection;
- cycle rejection;
- changed-task completion invalidation;
- forged impact rejection;
- conflicting post-menu constraint rejection;
- complete primary dinner/replan scenario.

Verified result on 1 September 2026: **17 passed, 0 failed**.
