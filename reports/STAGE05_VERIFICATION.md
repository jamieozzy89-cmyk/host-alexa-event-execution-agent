# Stage 05 Verification Report

Date: 1 September 2026

## Scope

This report records the verified Stage 05 agent/orchestrator state for Host.

The controlling Stage 05 objective was to add a customer-facing agent that selects the existing controlled tools, asks for missing information, respects confirmation boundaries, reports authoritative state, handles late changes, and recovers from failures without creating a direct mutation route around the Stage 04 tool layer.

## Verified base

Stage 05 was rebuilt from the verified public Stage 04 commit:

`26129f149c6b63658251068885a6f3226b38d8e9`

The rebuild did not replace the Stage 04 domain/persistence/tool implementation. Stage 05 layers on top of `HostToolRuntime`.

## Reproducible-build correction

A clean build workspace exposed that Stage 04's `npm test` script invoked `tsc` without declaring TypeScript as a dependency.

Stage 05 corrects that public packaging defect by:

- pinning `typescript` to `7.0.2` in `devDependencies`;
- generating/committing `package-lock.json`;
- verifying the repository with the declared dependency rather than relying on a machine-global compiler.

## Stage 05 files reviewed

The Stage 05 source/test/public-package set was read line by line during final audit:

- `src/agent/date.ts`
- `src/agent/friendly-errors.ts`
- `src/agent/index.ts`
- `src/agent/interpreter.ts`
- `src/agent/model.ts`
- `src/agent/orchestrator.ts`
- `src/agent/presentation.ts`
- `src/agent/types.ts`
- `tests/agent-fixtures.mjs`
- `tests/agent-orchestrator.test.mjs`
- `src/application/index.ts`
- `package.json`

The audit also checked Stage 05 source for unresolved TODO/FIXME/HACK markers and direct `HostDomainEngine` / `validateHostState` use. None was accepted in the agent source.

## Audit corrections made before acceptance

Passing tests were not treated as sufficient. The source review identified and corrected additional issues:

1. Guest-count numbers could be read as clock times by the natural-date parser. Time parsing now requires an explicit time signal (`at`, am/pm, or `HH:MM`).
2. Weak but valid-shaped model guesses could override a stronger deterministic interpretation. `ResilientIntentInterpreter` now falls back/comparatively selects when the preferred interpretation is unknown or below the confidence threshold.
3. Fresh agent sessions lacked an explicit way to bind back to already persisted authoritative state. `resumeConversation()` now verifies the event through `get_event_status`, binds the new conversation, and clears stale transient confirmation/cache state.
4. Raw failed receipt/provider text could be surfaced in customer history. Failed receipt/audit presentation is now normalised to customer-safe language.
5. Stage 05 agent exports were not yet part of the supported package root. The public entry now exposes the orchestrator/interpreter contract while the domain engine remains hidden.
6. The Stage 04 compiler assumption was corrected with an explicit pinned compiler dependency/lockfile.

## Test result

Final clean Stage 02–05 suite:

- Tests: **72**
- Passed: **72**
- Failed: **0**
- Skipped: **0**
- Todo: **0**

Stage 05 contributes 24 agent/customer interaction tests on top of the previous domain/persistence/tool suites.

## Independent GitHub verification

The audited local recovery was frozen into a patch with SHA-256:

`93cb0392371d03b09c3ca3623d83ad53b64a4de87735b26f868787981b01f6ce`

The isolated `stage05-rebuild` GitHub workflow:

- verified that exact patch hash;
- ran `git apply --check`;
- applied the patch;
- installed the declared dependency;
- ran the complete test suite successfully;
- ran the Stage 05 boundary marker/import audit successfully;
- committed the verified result.

Verified rebuild commit:

`5c0e20116fd409f0b9ca6e7461b696217054a4ed`

After that run, every audited Stage 05 source/test/package file was compared by Git blob identity between the verified build workspace and the GitHub rebuild branch. All compared identities matched.

## Verified customer interaction families

The final Stage 05 suite directly verifies:

- one-shot natural event creation;
- one-question-at-a-time clarification;
- invalid date recovery;
- menu proposal and touch selection;
- menu confirmation/cancellation;
- authoritative shopping quantities;
- structured demo product choices;
- confirmation-gated simulated checkout;
- real preparation task/timeline data;
- touch task completion;
- concise state-driven status;
- read-only late change analysis;
- confirmed late replan;
- action history;
- confirmation-gated undo;
- checkout failure/no false purchase claim;
- explicit retry confirmation;
- provider failure fallback;
- low-confidence model fallback;
- public agent API / hidden domain engine;
- guest-count/time parsing regression;
- persisted-event resume in a fresh agent session;
- customer-safe history after provider failure.

## Completion boundary

Stage 05 is accepted only as the **agent/orchestrator layer**.

It does not claim:

- a polished Alexa+ web UI;
- voice input/output;
- a live external LLM provider;
- AWS integration;
- real commerce calls;
- deployment;
- submission media.

Those remain later controlled stages.