# Phase B Verification — Operating Projection, Lifecycle and Attention Engine

Date: 2 September 2026

Branch: `host-competition-build`

## Scope

Phase B adds a read-only customer/application operating projection over committed Host state. It does not change the authoritative mutation path, domain lifecycle, tool confirmation semantics, persistence schema, browser UI, or external-provider behavior.

Implemented Phase B surfaces:

- `src/application/event-operating-state.ts`
  - sanitized `EventOperatingSource`;
  - persistence-backed `HostApplicationReadService`;
  - `OperatingProjection`;
  - inventory, shopping and preparation summaries;
  - readiness projection;
  - deterministic current/next task projection;
  - explicit `not_evaluated` timing placeholder rather than premature timing claims.
- `src/application/lifecycle.ts`
  - derived customer lifecycle;
  - READY requires both resolved authoritative shopping and completed required preparation;
  - no new persisted `EventStatus` values.
- `src/application/attention.ts`
  - deterministic single attention item;
  - priority order: confirmation, failure, change review, missing input, menu, inventory, shopping, preparation/task, ready, none;
  - explicit `inventoryConfirmed` context so an empty inventory map is not misread as a customer-confirmed zero-inventory state.
- `src/application/index.ts`
  - public application exports for the read-only Phase B contracts.
- `tests/operating-projection.test.mjs`
  - 13 Phase B tests.

## Integrity checks covered by Phase B tests

The new tests directly verify:

1. no-event projection remains INTAKE;
2. the application read service returns sanitized clones rather than raw HostState;
3. `audit`, `undo`, the complete menus map and internal pending caches are not exposed;
4. modifying returned read data does not alter the persisted Host snapshot, revision or checksum;
5. an uncommitted event projects PLAN/menu attention;
6. a committed menu requests inventory review before shopping is treated as authoritative;
7. explicit inventory-review completion allows shopping calculation to become the low-risk next step;
8. shopping projection distinguishes covered and unresolved lines from authoritative shopping quantities;
9. resolved shopping with no prep graph projects PREP/run-sheet construction;
10. preparation projection exposes deterministic task counts and earliest ready action;
11. resolved shopping plus all required preparation derives READY while authoritative domain status remains unchanged;
12. completed prep cannot derive READY while authoritative shopping remains unresolved;
13. confirmation, failure and pending-change priorities deterministically outrank ordinary workflow work.

## Verified Actions run

Workflow: `Competition build verification`

Run: `33617232328`

Job: `100205776551`

Verified source head for this run:

`442c704e7e33e91071141e98a57de6dd0aa05422`

Run conclusion: **success**.

### Environment

- Ubuntu 24.04 runner;
- project Node runtime: **v22.12.0**;
- npm: **10.9.0**.

### Dependency install

`npm ci --ignore-scripts`

Result:

- 24 packages installed;
- 25 packages audited;
- **0 vulnerabilities found**.

### Backend/application gate

`npm test`

This performs `tsc -p tsconfig.json` followed by all `tests/*.test.mjs` suites.

Result:

- **87 tests**;
- **87 passed**;
- **0 failed**;
- 0 cancelled;
- 0 skipped;
- 0 todo.

This is the previous 74-test baseline plus 13 new Phase B operating-projection tests.

### Production dependency audit

`npm audit --omit=dev`

Result:

- **0 vulnerabilities found**.

### Production web build

`npm run build:web`

Result:

- web TypeScript typecheck passed;
- Vite 8.2.2 production build passed;
- 35 modules transformed;
- production assets generated successfully.

### Browser regression gate

`npx playwright test`

Result:

- **26 tests passed**;
- **0 failed**;
- duration 18.5 seconds.

Projects exercised:

- `echo-show`: 1280×800 + touch;
- `mobile`: 390×844 + touch/mobile.

Existing semantic protections remained active, including:

- complete visible touch journey;
- late-change preview before apply;
- reload/resume without stale confirmation;
- 48×48 target/no-overflow checks;
- deterministic voice-only core journey;
- spoken cancellation;
- voice-unavailable fallback;
- automated Axe WCAG A/AA checks;
- focus lifecycle;
- corrupt-state recovery;
- memory-storage fallback;
- scoped local-data deletion;
- deterministic zero-unexpected-cross-origin baseline network boundary.

## Visual gate

Phase B changed no browser rendering, CSS, navigation or customer-facing UI implementation. Therefore no new visual acceptance claim is made and no visual redesign audit was required for this phase. The existing browser regression suite was rerun to confirm that the unchanged baseline UI still operates correctly.

Any Phase I UI change remains subject to the much stronger canonical-state capture and direct visual examination requirements in the controlling product specification.

## Boundaries that remain deliberately incomplete

Phase B does **not** implement or claim:

- goal-directed automatic workflow execution;
- natural inventory extraction;
- live model reasoning;
- stronger recipe/dietary coverage semantics;
- persistence migration for future recipe semantics;
- dependency-aware timing/slack/on-track calculations;
- server-side shared Host runtime;
- MCP/Agent Skill implementation;
- AWS integration;
- final Event Home UI;
- final competition deployment/media/submission.

Timing remains explicitly `not_evaluated` in the Phase B projection until Phase F implements deterministic schedule reasoning.

## Phase B gate conclusion

For source head `442c704e7e33e91071141e98a57de6dd0aa05422`, the Phase B implementation passed the required technical gate:

- state truth preserved;
- no duplicate mutation path introduced;
- new read layer is sanitized and non-mutating;
- READY projection is bounded by shopping + preparation truth;
- deterministic attention priority is tested;
- full backend/application regression passed;
- production dependency audit passed;
- production web build passed;
- existing Echo/mobile browser regression passed.

A later documentation/preservation commit must not be confused with a different product implementation. The competition-build workflow is configured to rerun automatically on each branch push so the final preserved Phase B head can be independently reverified as well.
