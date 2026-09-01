# Host — Controlled Project Handover

## Project identity

**Project:** Host: Alexa+ Event Execution Agent
**Competition:** Build, Ship, Shape: Amazon Developer Hackathon 2026
**Primary track:** Alexa+ — simulated Alexa+ web experience
**Current accepted product stage:** Stage 09 — hardened voice + touch product (deployment pending)
**Competition decision:** Open Source selected; AWS Builder deliberately deferred for now
**Next controlled action:** real hosted deployment + smoke test, then Stage 10 submission artifacts

This handover travels with the repository and is sufficient to continue without relying on chat memory.

## Product purpose

Host is an execution agent for people hosting at home.

Core promise:

> From “people are coming over” to “everything is actually ready.”

Permanent integrity rule:

> Nothing becomes done because the language model, voice output, or UI says it is done. Only validated application/tool state can establish completion.

Mutation path:

`intent -> HostAgentOrchestrator -> validated HostToolRuntime tool -> domain validation -> persistence -> audit/receipt -> response`

Voice is only an input/output adapter around that same path.

## Verified product stages

### Stage 02 — domain engine

Typed authoritative state, revisions, confirmed constraints, menu commitment, inventory/shopping reconciliation, prep dependency graph, receipts/audit, change impact, confirmed atomic replan and reversible actions.

### Stage 03 — persistence

Versioned persistent state, checksum/schema validation, staged save/recovery, restart resume and revision preservation.

### Stage 04 — controlled tools

17 authoritative tools:

`create_event`, `update_event_constraints`, `propose_menu`, `commit_menu`, `record_inventory`, `build_shopping_plan`, `prepare_cart`, `confirm_cart_action`, `build_preparation_plan`, `mark_task_complete`, `advance_event_status`, `get_next_action`, `get_event_status`, `analyse_change_impact`, `apply_confirmed_change`, `get_action_history`, `undo_reversible_action`.

### Stage 05 — agent/orchestrator

Deterministic and model-backed interpretation boundaries, one-question clarification, structured presentation, confirmation lifecycle, late-change handling, customer-safe recovery/history and persisted-event resume. No live LLM/AWS claim.

### Stage 06 — touch UI

Vite Plan / Live / Activity interface, event/menu/shopping/products/prep/change/history presentation, large touch controls, responsive Echo Show/mobile layouts, theme, reload/resume and simulated transaction labelling.

Verified Stage 06 browser gate: **8/8**.

### Stage 07 — voice

Web Speech recognition/synthesis adapter; same orchestrator/tool path; numbered spoken menu selection; spoken yes/no; generic “done” resolved from authoritative next action; explicit unsupported/error fallback.

Stage 07 evidence:

- backend/application: **74/74**;
- browser touch+voice: **14/14**.

### Stage 08 — competition decision

- Open Source mini challenge: **enter**.
- Evidence: `submission/OPEN_SOURCE_MINI_EVIDENCE.md`.
- AWS account exists but integration is deliberately deferred for now.
- If resumed later: Bedrock behind the existing model interpreter + AgentCore Memory for non-authoritative preferences.
- No AWS Builder claim yet.

### Stage 09 — hardening

Implemented and verified:

- keyboard focus continuity;
- modal labelling, initial focus and return focus;
- focusable scrollable transcript;
- dedicated latest-message screen-reader status instead of whole transcript replay;
- keyboard-reachable unavailable-voice state;
- Data & privacy UI;
- scoped confirmed Host event-data deletion;
- in-memory fallback when local storage is blocked;
- corrupt stored-state recovery without silent snapshot deletion;
- no-referrer metadata;
- Axe representative WCAG A/AA checks;
- web injection/direct-domain scans;
- deterministic core network-boundary test;
- package/lock version `0.9.0`;
- Node floor `>=22.12.0`;
- portable Vite `base: "./"` static build.

Stage 09 evidence:

- hardening workflow `33557794389`;
- reproducibility workflow `33558676755`;
- portable-build requalification `33559155046`;
- clean release verification `33560083418`;
- backend/application: **74/74**;
- browser suite: **26/26**;
- production build: passed;
- production dependency audit: zero vulnerabilities;
- security/application-boundary scans: passed.

Permanent detail:

- `docs/HARDENING_STAGE09.md`
- `reports/STAGE09_VERIFICATION.md`

## Current simulation / truth boundaries

Still simulated:

- menu proposal source;
- product catalogue/candidate selection;
- cart/checkout.

Not currently claimed:

- real payment/grocery order;
- Amazon retail API;
- real calendar/invitation mutation;
- physical Alexa certification/device runtime;
- Alexa partner-only MCP tooling;
- AWS/Bedrock runtime;
- live external LLM;
- smart-home control;
- universal Web Speech support.

## Local verification

Requirements:

- Node.js 22.12+
- npm

```bash
npm ci
npm test
npm run build:web
npx playwright install --with-deps chromium
npm run test:web
```

Full Stage 09 gate:

```bash
npm run verify:stage09
```

## Deployment status — unresolved

The Stage 09 static build is verified and path-portable, but no hosted URL is currently verified.

Vercel is connected, but the exposed chat deployment wrapper cannot accept the backend-required target/name/files arguments. GitHub Pages is disabled and first-time Actions enablement requires a higher-permission token not available here.

Do not invent a deployment URL.

## Exact continuation

1. obtain a hosting path that can accept the exact verified repository/build artifact;
2. deploy the Stage 09 release without rebuilding a different product;
3. smoke-test Plan, Live, Activity, local persistence/reload, touch controls and voice fallback;
4. record URL/provider/deployment evidence;
5. close Stage 09 deployment;
6. proceed to Stage 10 submission story, Built With, screenshots/gallery, feedback/friction logs and under-three-minute demo.

AWS Builder remains deferred unless explicitly resumed later.
