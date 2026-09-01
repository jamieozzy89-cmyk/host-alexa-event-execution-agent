# Stage 06 — Alexa+ Simulation UI

## Purpose

Stage 06 turns the verified Stage 05 agent/orchestrator into the competition-facing simulated Alexa+ web experience. It does not create a second source of truth. The browser renders and invokes the same controlled application/agent surface already verified in Stages 02–05.

The governing product rule remains:

> Conversation and presentation never make an action true. Authoritative state changes only through the validated tool/runtime path, followed by persistence and receipts/audit evidence.

## Implemented browser experience

The application now exposes three customer views:

1. **Plan** — natural-language conversation beside the current structured result.
2. **Live** — hands-busy preparation view with one ready action at a time and large completion controls.
3. **Activity** — customer-safe receipts showing what actually succeeded, failed, or was reversed.

The Plan workspace renders the existing Stage 05 presentation contract rather than re-implementing domain logic in the browser:

- event summary;
- menu choices and menu commitment confirmation;
- authoritative shopping quantities;
- deterministic demo product candidates;
- explicitly simulated checkout;
- preparation timeline and task status;
- late-change impact preview;
- confirmation states;
- errors that do not mark failed work complete;
- action history.

## Browser/runtime boundary

`web/runtime.ts` constructs the browser-facing application stack from supported public application exports:

- `HostToolRuntime`;
- JSON/local-storage persistence;
- deterministic menu proposal adapter;
- deterministic demo product catalogue;
- deterministic simulated checkout adapter;
- `HostAgentOrchestrator`;
- `HeuristicIntentInterpreter`.

The UI does not import `HostDomainEngine` or `validateHostState` directly. All state mutation still terminates at the controlled tool layer.

The active event id is remembered separately from the persisted event payload so a browser reload can resume the authoritative event through the orchestrator. Pending conversational confirmations are deliberately not restored across reloads.

## Touch interaction

All customer actions surfaced by the current reply have executable touch routes. Important actions embedded directly in cards include menu selection, confirmation/cancellation, and preparation-task completion. Other available actions are exposed in an action strip.

The current end-to-end touch journey covers:

1. create a six-person dinner from natural language;
2. review and commit a menu;
3. build authoritative shopping quantities;
4. inspect demo product candidates;
5. confirm simulated checkout;
6. build the preparation plan;
7. enter Live Mode;
8. mark a ready task complete;
9. receive the authoritative next action;
10. inspect Activity receipts.

A separate late-change journey adds a seventh vegan guest, previews impact without mutation, then applies the confirmed change while preserving unaffected work.

## Live Mode

Live Mode is deliberately sparse. It presents:

- the latest authoritative spoken guidance;
- one currently ready preparation task;
- timing/category metadata;
- a large `Mark complete` action.

After a completion, Host immediately asks the application layer for the next action and visibly presents that guidance. Completion is therefore driven by the tool result, not by UI optimism.

## Activity

Activity requests current history from the orchestrator and renders customer-safe receipts. The view distinguishes succeeded, failed, pending/reversed states using the Stage 05 presentation model.

## Persistence and recovery

The browser uses `JsonStoragePersistenceAdapter` over `localStorage`.

Verified behavior:

- an active event survives page reload;
- the event is resumed through `resumeConversation`;
- stale pending confirmation UI is not recreated after reload;
- the restored event summary remains authoritative;
- Activity remains available after resume.

## Accessibility and responsive behavior

Stage 06 implements the Stage 01 accessibility targets that can be verified in the simulated web route:

- minimum 48 × 48 px visible interactive target floor;
- semantic buttons and form controls;
- explicit ARIA labels on conversation, navigation, composer and theme control;
- polite live region for conversation output;
- keyboard-visible focus treatment;
- responsive layout for large Alexa-style displays and narrow mobile screens;
- reduced-motion handling;
- no document-level horizontal overflow in the tested viewports;
- light and dark themes.

## Simulation disclosure

The interface explicitly identifies itself as an **Alexa+ simulation**. Product candidates and checkout are clearly labelled as simulation only; no Amazon retail, grocery provider, payment processor, live Alexa device integration, AWS service, or external LLM provider is claimed in Stage 06.

## Verification

The final Stage 06 browser gate ran against the current product code in GitHub Actions with Chromium and required system libraries installed.

Results:

- Stage 02–05 regression suite: **72 passed, 0 failed**;
- web TypeScript check/build: **passed**;
- Playwright touch acceptance suite: **8 passed, 0 failed**;
- tested projects: `echo-show` (1280 × 800, touch enabled) and `mobile` (390 × 844, touch/mobile enabled);
- UI boundary scan: **passed** — no direct domain-engine/validator import and no TODO/FIXME/HACK markers in the verified web/test boundary.

The eight browser cases are the four acceptance scenarios above executed in both configured viewports.

## Stage boundary

Stage 06 establishes the complete touch-first simulated Alexa+ product surface. It does **not** establish voice interaction.

The next controlled stage is **Stage 07 — voice interaction**. Its exit condition is that the core journey can be driven and understood through the voice channel without depending on visual information, while preserving the same authoritative tool/state boundaries and keeping touch as an equivalent route.
