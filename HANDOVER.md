# Host — Current Controlled Handover

## One-line continuation rule

A new chat should continue from branch `ui-redesign-editorial` in repository `jamieozzy89-cmyk/host-alexa-event-execution-agent`, read this file first, and treat Git as the source of truth. Do not continue from chat memory alone.

## Project identity

**Project:** Host: Alexa+ Event Execution Agent
**Competition:** Build, Ship, Shape: Amazon Developer Hackathon 2026
**Primary track:** Alexa+
**Implementation route:** simulated Alexa+ web experience
**Public repository:** https://github.com/jamieozzy89-cmyk/host-alexa-event-execution-agent
**Current accepted public release:** Stage 09 hardened product on `main`
**Accepted Stage 09 public commit:** `7498cbe7e10fbe6df068d7eb91e9793c06284c79`
**Current continuation branch:** `ui-redesign-editorial`
**Stage 10 branch before redesign:** `stage10-submission`
**Stage 10 commit used as redesign base:** `2bd5ee716fb14882c58abf759a75815a4eb5bc8c`

## Governing execution standard

This is controlled serious work. Do not take shortcuts, infer missing state, or treat successful-looking output as proof. Verify every gate. If a verification step fails, preserve the failure and fix the cause rather than weakening the test.

Permanent integrity rule:

> Nothing becomes done because model text, voice output or UI language says it happened. Only validated application/tool/domain state and receipts establish completion.

Do not add AWS claims, deployment claims, real-purchase claims or Alexa hardware claims unless they are real and verified.

## Product purpose

Host is an execution agent for people hosting at home, not a generic event-planning chatbot.

Core promise:

> From “people are coming over” to “everything is actually ready.”

Host maintains authoritative state across event constraints, menu commitment, inventory, shopping deficits, preparation dependencies, late changes, confirmations, execution receipts and hands-busy Live Mode.

Controlled path:

`user intent -> HostAgentOrchestrator -> validated tool -> domain validation -> persistence -> receipt/audit -> customer response`

Voice path:

`recognized speech -> HostAgentOrchestrator.handleText() -> same tools/domain/persistence -> same AgentReply -> speech output`

## Accepted engineering state

### Stage 02 — authoritative domain engine

Retained and verified:

- typed event state and revisions;
- confirmed constraints;
- confirmation-gated menu commitment;
- inventory reconciliation;
- shopping deficit calculation;
- no guessed unit conversion;
- preparation dependency graph;
- action receipts/audit history;
- read-only late-change impact analysis;
- atomic confirmed change application;
- preservation of completed unaffected work;
- reversible actions and concurrency/revision controls.

### Stage 03 — persistence

Retained and verified:

- versioned JSON persistence envelope;
- checksum/integrity validation;
- primary/backup/temp recovery behavior;
- persisted event/tasks/receipts;
- safe restart/reload continuation;
- pending uncommitted impacts intentionally not persisted.

### Stage 04 — controlled tool/action layer

Authoritative application surface remains 17 tools:

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

Direct browser/application mutation through `HostDomainEngine` is forbidden.

### Stage 05 — agent/orchestrator

Retained and verified:

- `HostAgentOrchestrator`;
- deterministic heuristic interpreter;
- structured model-backed interpreter interface;
- resilient fallback when model output fails or is low-confidence;
- natural date/time parsing;
- one-question-at-a-time clarification;
- structured presentation cards/actions;
- explicit confirmation lifecycle;
- late-change analysis before mutation;
- authoritative status/next-action answers;
- customer-safe history and failure wording;
- fresh-session resume without stale confirmation state.

### Stage 06 — touch UI

Accepted before redesign:

- Vite browser application;
- Plan / Live / Activity modes;
- event/menu/shopping/products/prep/change/history/confirmation presentation;
- responsive Echo Show-like and mobile layouts;
- touch-only complete journey;
- reload/resume;
- minimum touch-target checks;
- dark/light theme.

### Stage 07 — voice

Accepted before redesign:

- browser Web Speech adapter;
- recognition + speech synthesis;
- explicit voice states;
- same orchestrator/tool path as typed input;
- spoken menu choice remains confirmation-gated;
- spoken `done` resolves against authoritative `nextAction`;
- spoken confirmation/cancellation;
- explicit fallback when browser voice is unavailable.

### Stage 08 — competition integration decision

- Open Source mini challenge selected.
- AWS Builder deliberately deferred for now.
- User has an AWS account, but current work proceeds without connecting AWS.
- If AWS is later resumed, only the already-selected controlled design is authorised: Bedrock behind the existing structured intent boundary plus AgentCore Memory for non-authoritative cross-event preferences.
- Do not list Bedrock/AgentCore in `Built With` unless real calls are implemented and verified.

### Stage 09 — hardened accepted release

The accepted public Stage 09 product on `main` includes:

- **74/74 backend/application tests**;
- **26/26 browser tests** on the accepted Stage 09 UI;
- Axe WCAG A/AA representative-state scans;
- keyboard focus continuity;
- modal focus return;
- browser-local Data & privacy controls;
- scoped deletion of Host event data;
- explicit memory fallback when persistent browser storage is unavailable;
- corrupt-storage recovery;
- browser/runtime boundary scans;
- zero production dependency vulnerabilities at release gate;
- package/lock root version `0.9.0`;
- Node floor `>=22.12.0`;
- portable relative Vite asset paths.

Stage 09 public `main` is the last accepted product release. The redesign branch is not accepted yet.

## Stage 10 submission work already in Git

The redesign branch descends from the Stage 10 submission branch and carries the substantive Stage 10 work already produced.

Under `submission/` Git contains:

- `DEVPOST_STAGE10_DRAFT.md` — full Devpost narrative draft;
- `DEVPOST_FIELD_MAP_STAGE10.md` — prepared-content to Devpost-field mapping;
- `PRODUCT_FEEDBACK_STAGE10.md` — product/tool feedback draft;
- `FRICTION_LOG_STAGE10.md` — four substantive friction entries;
- `DEMO_VIDEO_SCRIPT_STAGE10.md` — demo run sheet/script;
- `DEMO_NARRATION_60SEC_STAGE10.md` — ~60-second narration;
- `SCREENSHOT_SHOTLIST_STAGE10.md`;
- `GALLERY_INDEX_STAGE10.md`;
- `OPEN_SOURCE_MINI_EVIDENCE.md`;
- Stage 10 handovers;
- real application gallery screenshots and submission assets already committed to the repository.

Previously established submission decisions:

- tagline: `An Alexa+ hosting agent that executes menu, shopping and prep while tracking what actually happened.`
- strongest gallery lead: Live Mode;
- locked six-image gallery order before redesign: Live Mode -> late-change impact -> Activity receipts -> authoritative shopping -> event-created -> mobile Live;
- menu-confirmation image retained only as reserve;
- final public demo video must remain under three minutes.

A real source recording and ~60-second visual candidate were also produced in the prior sandbox, but those exact MP4 binaries are not guaranteed to exist in Git. The repository contains the journey/scripts needed to regenerate the demonstration. Do not claim those exact sandbox video binaries are in Git unless later uploaded/committed.

Hosted deployment remains unresolved/optional for the simulated Alexa+ route. Do not fabricate a live URL.

## Current authorised task: non-generic UI redesign

The user rejected the existing interface as too generic/AI-designed and rejected further brainstorming without implementation. The current authorised work is therefore a real UI redesign, not more concept discussion.

Redesign intent:

- purpose-built hosting instrument rather than chatbot/dashboard;
- workspace/result first, conversation secondary;
- warm editorial Plan experience;
- instrument-like high-focus Live Mode;
- receipt/evidence-like Activity mode;
- fewer rounded SaaS cards and pills;
- more typography hierarchy, dividers, lists and explicit event structure;
- preserve every action route, accessibility control and authoritative-state boundary;
- do not rebuild the underlying architecture merely to change appearance.

### Redesign files

The candidate changes only:

- `web/main.ts`
- `web/render.ts`
- `web/styles.css`

Locked redesign Git hashes from the locally compiled candidate:

- `web/main.ts`: `6415e826d0d6fa9f67f9c47a6d5cb414c5e26fe7`
- `web/render.ts`: `abb9a7aee41551407b88bc25ad49f7f8b64d2d8b`
- intended `web/styles.css`: `e72283db6e46984f746e6eaa680cf7d206dc3ae2`

`web/main.ts` and `web/render.ts` are materialised on `ui-redesign-editorial`.

The intended stylesheet is also preserved in Git as a compressed binary object under `.ui-redesign/styles.css.gz`. A first text-API transfer of that gzip was truncated; that failed materialisation run is historical and must not be mistaken for the corrected state. The correct binary Git blob is `6be278d4ec3180f1fb2d011ea810ec2ed7e0b490`, attached to the branch by commit `9a51d11cd10f8902f81b845a78abe404943bfeff`. When decompressed, it must hash as Git object `e72283db6e46984f746e6eaa680cf7d206dc3ae2` before use. If `web/styles.css` has not yet been materialised at the current branch head, reconstruct it from that exact Git-controlled gzip and verify the hash; do not regenerate the CSS from memory.

## First redesign verification result — NOT ACCEPTED

Workflow run: `33572073754`

The run successfully:

- reconstructed the intended candidate CSS used by that run;
- verified the three intended redesign file hashes during the run;
- installed dependencies and Chromium;
- ran **74/74 backend/application tests successfully**;
- ran the production web build successfully.

The unchanged 26-case browser gate then failed: **16 passed, 10 failed**.

The failures reduce to two known classes.

### 1. Genuine accessibility contrast defect

Axe found insufficient light-theme contrast. Exact examples from the run:

- `#7b7d74` on `#f4efe6` = **3.64:1**, below the required 4.5:1 for the tested small text;
- affected examples include `.brand-subtitle`, inactive `.nav-button`, `#host-voice-state`, `.section-kicker`, `.message-role`;
- light-theme eyebrow tomato `#b94e3b` on `#f4efe6` measured **4.34:1** for small text and also needs correction.

This is a real product defect. Fix the palette; do not weaken Axe.

### 2. Old browser tests coupled to removed presentation wording/structure

Several `tests/web/host-ui.spec.ts` cases still locate:

`.surface-card` containing `Current plan`

The redesign deliberately changed the event-summary hierarchy and removed that old cosmetic label. The behavioral assertion must remain: after event creation the visible authoritative summary must show the expected guest count/state.

Controlled resolution:

- prefer a stable semantic/data/ARIA hook in the redesigned event summary; or
- update the test to target that stable semantic contract rather than the old cosmetic wording.

Do not restore generic UI purely to satisfy an obsolete selector, and do not weaken the assertion that the event summary visibly reflects authoritative state.

Other voice and hardening/recovery browser cases continued to pass during the failed run.

No redesigned gallery screenshots were captured because the browser acceptance step failed before capture. Therefore the redesign has not been visually approved.

## Exact next actions for a new chat

1. Open repository `jamieozzy89-cmyk/host-alexa-event-execution-agent` and branch `ui-redesign-editorial`.
2. Read this `HANDOVER.md` before editing anything.
3. Verify current branch head and the three redesign file hashes.
4. Ensure `web/styles.css` is the intended redesign stylesheet with Git hash `e72283db6e46984f746e6eaa680cf7d206dc3ae2`; if not yet materialised, decompress the corrected `.ui-redesign/styles.css.gz` object and verify the hash.
5. Fix the light-theme WCAG contrast defects while preserving the editorial palette.
6. Establish a stable semantic event-summary hook and adjust only the obsolete cosmetic test coupling if required. Preserve the behavioral assertion.
7. Run `npm ci`.
8. Run `npm test` and require **74/74**.
9. Run `npm run build:web`.
10. Run the full unchanged functional browser scope in both projects:
   `npx playwright test tests/web/host-ui.spec.ts tests/web/hardening-ui.spec.ts tests/web/voice-ui.spec.ts --project=echo-show --project=mobile`
11. Require **26/26 browser tests** including Axe. Do not accept partial success.
12. Only after the gate is fully green, capture redesigned states from the real application.
13. Visually audit those captures against the actual user goal: materially less generic/AI-designed and more purpose-built for hosting.
14. If visually better and technically green, regenerate/update Stage 10 gallery/video materials to the redesigned UI.
15. Remove temporary `.ui-redesign` and redesign-verification workflow scaffolding from the final release candidate only after it is no longer needed for recovery/verification.
16. Update this handover again before any merge/promotion.

## Current acceptance boundaries

Do not claim yet:

- redesigned UI accepted;
- redesign browser suite 26/26;
- redesigned screenshots approved;
- redesign promoted to Stage 10/main;
- hosted deployment live;
- AWS Builder integration implemented;
- real checkout/payment;
- Alexa hardware certification;
- final Devpost submission completed.

Verified accepted public state remains Stage 09 on `main`. Stage 10 submission content is substantially prepared. The active engineering task is to finish and verify the editorial UI redesign without breaking the product.

## Git-only continuation statement

This branch plus this handover contains the source-controlled state needed for a new chat to continue the product/redesign work without this conversation. A new chat needs GitHub access to the repository, must use `ui-redesign-editorial`, and must follow the exact continuation sequence above.

Binary media that existed only in the previous sandbox is not guaranteed to be recoverable from Git; it can be regenerated after the redesign from the repository-controlled application journey. That does not block engineering continuation from Git alone.
