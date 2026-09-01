# Stage 04 — Controlled Tool/Action Layer

## Purpose

Stage 04 creates the application-facing boundary between future conversational/visual layers and Host's authoritative domain state.

The controlling rule is:

`User/agent intent -> validated Host tool -> domain validation/mutation -> persistence checkpoint -> structured result`

The unsupported route is:

`application/agent -> direct domain mutation`

The package root exposes the tool runtime rather than the domain engine, and package exports block direct domain-engine subpath imports.

## Tool surface

The verified Stage 04 surface contains 17 tools:

1. `create_event`
2. `update_event_constraints`
3. `propose_menu`
4. `commit_menu`
5. `record_inventory`
6. `build_shopping_plan`
7. `prepare_cart`
8. `confirm_cart_action`
9. `build_preparation_plan`
10. `mark_task_complete`
11. `advance_event_status`
12. `get_next_action`
13. `get_event_status`
14. `analyse_change_impact`
15. `apply_confirmed_change`
16. `get_action_history`
17. `undo_reversible_action`

The Stage 01 architecture listed 16 initial tools. Stage 04 added `advance_event_status` because the domain engine already contained a validated lifecycle mutation and the Stage 04 exit gate requires current application mutations to be reachable through tools rather than leaving a direct-mutation exception.

## Validation boundary

Tool calls are treated as untrusted runtime input even when TypeScript types exist.

Verified controls include:

- object input required;
- unsupported top-level fields rejected;
- required strings must be non-empty;
- guest counts are positive integers;
- numeric values must be finite and respect required minima;
- event/status enum values are checked;
- confirmation/completion timestamps must parse as date/time strings;
- constraint and inventory structures are reconstructed from recognised fields;
- unknown tool names return `TOOL_NOT_FOUND` rather than falling through.

Domain validation remains the second control layer and retains responsibility for state-dependent invariants.

## Confirmation model

The tool descriptors classify calls as:

- `read_only`
- `low_risk_mutation`
- `material_mutation`
- `transaction_like`

Material/transaction-like operations exposed at Stage 04 require explicit confirmation. This includes:

- menu commitment;
- simulated checkout;
- event lifecycle transition;
- application of a late-change impact;
- undo.

The tool layer validates the supplied confirmation timestamp before calling the domain engine.

## Mutation/persistence transaction

For ordinary state-changing tools:

1. load/resume the event engine;
2. capture the pre-mutation committed snapshot;
3. execute the validated domain mutation;
4. checkpoint the resulting authoritative state;
5. return success only after persistence succeeds.

If checkpointing fails, the live session is reconstructed from the pre-mutation snapshot and the tool returns `PERSISTENCE_CHECKPOINT_FAILED` rather than leaving live memory ahead of storage.

## Menu proposals

Menu generation is behind `MenuProposalAdapter`.

The current deterministic demo adapter scales templates to the requested guest count. The tool boundary revalidates each returned proposal for:

- menu structure;
- current/preview confirmed dietary and allergen constraints;
- sufficient servings for the current/preview guest count;
- duplicate proposal IDs.

Proposals are uncommitted session data. Commitment requires `commit_menu` and explicit confirmation.

## Product/cart simulation

Product discovery and checkout are explicitly simulated adapters. No external purchase is claimed.

`prepare_cart` obtains candidates for every unresolved shopping line and selects a deterministic lowest-priced candidate. Candidate currency and selection membership are revalidated by the domain engine before state is committed.

`confirm_cart_action` creates a deterministic SHA-256 idempotency key from event ID, revision and selected lines. A success response is accepted only if:

- all unresolved lines are selected;
- returned currency matches event currency;
- returned reference is non-empty;
- returned total reconciles exactly (within floating-point tolerance) to selected line prices.

A provider-declared failure, invalid success response, or thrown adapter exception creates a durable failed action receipt/audit record while leaving shopping items unpurchased. Failed attempts do not advance event revision.

## Replanning

`analyse_change_impact` is read-only. It may use a current or live proposed replacement menu and caches the resulting engine-issued impact only for the live session.

`apply_confirmed_change` requires:

- a currently pending impact;
- matching expected/base revision;
- explicit confirmation.

Uncommitted impacts are deliberately invalid after restart and must be recalculated against resumed authoritative state.

## Undo

Reversible domain actions store bounded pre-action snapshots in authoritative state. `get_action_history` exposes only receipt IDs that are currently safe to reverse at the latest committed revision.

`undo_reversible_action` requires explicit confirmation and refuses:

- non-reversible receipts;
- already reversed receipts;
- a reversible action that is no longer the latest committed revision.

Undo restores the bounded saved state surfaces, advances revision, retains the original receipt as `reversed`, and appends a new successful undo receipt/audit event.

## Application export boundary

`package.json` exports only `dist/src/application/index.js` for the package root. The root exports:

- tool runtime/descriptors/types;
- persistence adapter contract/JSON adapter;
- deterministic simulation adapters.

It does not export `HostDomainEngine` or `validateHostState`. A direct package subpath import of the domain engine is verified to fail with `ERR_PACKAGE_PATH_NOT_EXPORTED`.

## Verified Stage 04 gate

The Stage 04 gate is:

> all mutations can be completed through tools; direct mutation paths are blocked from application-facing code.

The final Stage 04 test suite verifies this boundary plus the prior domain/persistence gates.

Final verified result on 1 September 2026: **48 passed, 0 failed**.
