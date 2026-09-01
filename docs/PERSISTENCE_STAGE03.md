# Stage 03 — Persistence and Resume Integrity

## Objective

Stage 03 implements the persistence boundary required by `IMPLEMENTATION_SEQUENCE_v1.md` without introducing the application-facing tool layer, language model, Alexa simulation UI, AWS integration, or deployment.

The exit gate is that committed Host state survives a fresh application/service instance and remains valid and usable after reload.

## Implemented persistence design

### Storage contract

`HostPersistenceAdapter` is the application-independent persistence interface.

The implemented `JsonStoragePersistenceAdapter` works against a small `StorageLike` contract matching browser `localStorage` semantics:

- `getItem(key)`
- `setItem(key, value)`
- `removeItem(key)`

This keeps Stage 03 directly reusable by the later browser simulation. Tests use `MemoryStorage`, but the production-facing adapter is not tied to the test store.

### Versioned envelope

Every persisted snapshot includes:

- persistence schema version;
- event id;
- save timestamp;
- SHA-256 of the serialized authoritative state;
- the complete committed `HostState`.

Unknown schema versions are rejected. They are not guessed or silently migrated.

### Domain-state revalidation

A checksum-valid snapshot is still not trusted automatically. `validateHostState()` revalidates the restored state before `HostDomainEngine.restore()` accepts it.

Checks include:

- event field/status/revision validity;
- confirmed constraint structure;
- menu structure and dependency graph validity;
- selected-menu constraint compatibility;
- inventory quantities and units;
- shopping deficit invariant and committed-menu consistency;
- task ids, revisions, dependency existence/cycles/readiness consistency;
- completed-task timestamp consistency;
- receipt structure and unique ids;
- audit structure, unique ids and revision-chain continuity;
- final audit revision matching the authoritative event revision.

### Staged commit / recovery behaviour

A save is staged before replacing the primary snapshot:

1. serialize and validate state;
2. calculate SHA-256;
3. write a temporary snapshot;
4. read and verify the temporary snapshot;
5. verify and preserve the previous primary as backup;
6. write the new primary;
7. read and verify the new primary;
8. remove the temporary snapshot.

A backup-write failure aborts the update rather than continuing without recovery protection.

If loading the primary fails, load attempts:

1. verified backup;
2. verified temporary snapshot.

The load result explicitly reports its source and whether recovery occurred.

### Restore semantics

`HostDomainEngine.restore()` reconstructs an engine from validated committed state without generating a new event, receipt, audit record, or revision.

`HostPersistenceService.resume()` returns a fresh engine instance plus persistence-recovery metadata.

### Uncommitted change analyses

`pendingImpacts` are deliberately **not persisted**.

A change impact is an uncommitted, confirmation-bound proposal. After restart it must be analysed again against the current committed revision before it can be applied. This prevents stale or previously displayed proposals from becoming executable after reload.

## Concurrency correction discovered during Stage 03

Restart testing exposed that `markTaskComplete()` could inspect task dependency state before rejecting a stale expected revision. No stale write could succeed, but error precedence was inconsistent with the optimistic-concurrency contract.

The correction applies the revision guard at the start of all existing public mutation methods, with the existing guard inside `commitMutation()` retained as a second defensive check.

## Verified Stage 03 behaviours

The Stage 03 suite directly verifies:

- initial event survives fresh service/engine reconstruction;
- complete event/menu/inventory/shopping/task/receipt/audit state survives reload exactly;
- resumed engine can continue mutating from the restored revision;
- stale mutation is rejected after resume;
- uncommitted impacts do not survive reload;
- corrupt primary falls back to last verified backup;
- checksum tampering is rejected;
- unknown persistence schema is rejected;
- invalid state cannot be saved;
- checksum-valid but domain-invalid state cannot be loaded;
- interrupted update preserves previous verified primary;
- interrupted first save can recover verified temporary state;
- backup-write failure aborts update and preserves previous primary;
- removal clears primary/backup/temporary records.

Final verified suite after audit corrections: **30 tests passed, 0 failed**.

## Boundary after Stage 03

Implemented and verified:

- authoritative domain engine;
- restore-time domain validation;
- local/browser-compatible persistence adapter;
- staged persistence with integrity hash and recovery snapshots;
- restart/reload reconstruction service;
- persistence/concurrency regression suite.

Not yet implemented or claimed:

- application-facing tool/action API;
- automatic persistence orchestration around every future tool call;
- language model/agent;
- Alexa+ simulation UI;
- voice interaction;
- AWS integration;
- deployment;
- submission media.

The next authorised stage is **Stage 04 — Tool/action layer**.
