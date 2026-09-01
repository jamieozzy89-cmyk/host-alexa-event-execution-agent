# Domain Engine — Stage 02

## Purpose

The domain engine is the source of truth beneath Host's future conversational and Alexa-style interfaces. It prevents generated language from being mistaken for evidence that an action occurred.

## Mutation model

A committed mutation requires the caller's expected event revision. A stale expected revision fails rather than overwriting newer state. Material actions such as menu commitment and applying an analysed event change require explicit confirmation.

Successful mutations clone committed state, apply validated changes, increment the event revision, create a receipt, append an audit event, and replace committed state atomically.

## Core invariants implemented

- Shopping deficit is `max(requiredQuantity - onHandQuantity, 0)` for matching units.
- Incompatible units are rejected rather than guessed.
- Preparation tasks remain blocked until dependencies are complete.
- Unknown task dependencies and dependency cycles are rejected.
- Represented confirmed dietary/allergen constraints are checked before menu commitment and replanning.
- Late changes use read-only impact analysis followed by explicit confirmed apply.
- Completed tasks survive replanning only when their relevant task definition is unchanged.
- Only engine-issued pending impact objects can be applied.

## Verification

The Stage 02 test suite verifies the domain engine and the complete six-person dinner → seventh vegan guest controlled scenario without any UI or language model.

Verified result on 1 September 2026: **17 passed, 0 failed**.
