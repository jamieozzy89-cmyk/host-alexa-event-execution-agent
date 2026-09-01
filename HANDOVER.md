# Host — Controlled Project Handover

## Project identity

**Project:** Host: Alexa+ Event Execution Agent
**Competition:** Build, Ship, Shape: Amazon Developer Hackathon 2026
**Primary track:** Alexa+ — simulated Alexa+ web experience
**Current accepted product stage:** Stage 09 — hardened voice + touch product (deployment pending)
**Competition decision:** Open Source selected; AWS Builder deliberately deferred for now
**Next controlled action:** obtain a real hosted deployment and smoke-test it; then Stage 10 submission artifacts

This handover travels with the full repository source. It records the governing product design, verified stage history, current boundaries, test evidence, unresolved work, and exact continuation point required to continue without relying on chat memory.

## Product purpose

Host is not a generic event-planning chatbot. It is an execution agent for people hosting at home.

Core promise:

> From “people are coming over” to “everything is actually ready.”

The product is differentiated by authoritative execution state rather than conversational claims. It plans and executes hosting work across event constraints, menu commitment, inventory, shopping, preparation, late changes, and hands-busy live guidance.

The central integrity rule is permanent:

> Nothing becomes done because the language model, voice output, or UI says it is done. Only validated application/tool state can establish completion.

## Controlling architecture

Mutation path:

`user intent -> agent chooses controlled action/tool -> schema validation -> domain validation -> execution -> persistence -> audit/receipt -> customer response`

Voice adds only an input/output adapter:

`recognized speech -> same HostAgentOrchestrator -> same controlled tool path -> same AgentReply -> speech synthesis`

Forbidden path:

`user intent / recognized speech -> generated text says an action happened -> UI/state assumes completion`

Material and transaction-like actions remain confirmation-gated regardless of typed, touch or voice interaction.

## Completed stages

### Stage 02 — authoritative domain engine

Implemented and retained:

- typed event/state model;
- event revisions;
- confirmed constraints;
- menu commitment;
- inventory reconciliation;
- shopping deficit calculation;
- preparation dependency graph;
- action receipts and audit history;
- read-only change impact analysis;
- confirmed atomic change application;
- reversible action support;
- state invariants and transition tests.

Important invariant:

`toBuyQuantity = max(requiredQuantity - onHandQuantity, 0)` after unit reconciliation.

Preparation tasks use `blocked | ready | in_progress | done | cancelled`. Mandatory dependencies cannot be bypassed silently.

### Stage 03 — persistence

Implemented and retained:

- persistence adapter contract;
- JSON storage adapter;
- persisted authoritative events/tasks/receipts;
- resume behavior across runtime restart/reload;
- revision preservation;
- checksum/schema validation and recovery behavior;
- tests proving stored state survives reconstruction.

### Stage 04 — controlled tool layer

The authoritative application mutation/read surface is the following 17 tools:

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

The package/application boundary does not expose direct domain mutation to normal consumers.

### Stage 05 — agent/orchestrator

Implemented and retained:

- `HostAgentOrchestrator`;
- deterministic `HeuristicIntentInterpreter`;
- model-backed interpreter contract;
- resilient interpreter fallback;
- generic JSON model-proxy adapter;
- natural weekday/today/tomorrow/named/ISO date handling;
- 12/24-hour time parsing;
- one-question-at-a-time clarification;
- structured presentation cards/actions;
- confirmation lifecycle;
- safe checkout retry behavior;
- late-change analysis before mutation;
- authoritative status/next-action responses;
- customer-safe history;
- resume without stale conversational confirmation state.

No live LLM provider, AWS service, Bedrock integration, or API key is claimed.

### Stage 06 — simulated Alexa+ touch UI

Implemented and retained:

- Vite browser application;
- persistent browser runtime using the verified application layer;
- Plan / Live / Activity navigation;
- natural-language conversation composer;
- event summary;
- menu option cards and explicit confirmation;
- authoritative shopping quantities;
- deterministic demo products;
- explicitly simulated checkout;
- preparation timeline;
- late-change impact view;
- confirmation/error presentation;
- customer-safe receipts/history;
- reload/resume behavior;
- dark/light theme;
- responsive large-display/mobile layouts;
- 48 × 48 px touch-target floor;
- keyboard focus treatment;
- reduced-motion handling.

Stage 06 evidence: 72 backend tests and 8/8 browser tests.

### Stage 07 — voice interaction

Implemented and retained:

- browser voice controller in `web/voice.ts`;
- Web Speech recognition detection;
- speech synthesis;
- explicit Start/Stop Voice;
- session states: unavailable, idle, listening, processing, speaking, error;
- one activation followed by repeated conversational turns;
- recognised text routed through the same orchestrator path;
- spoken output from the same authoritative `AgentReply.speech`;
- touch/keyboard fallback;
- customer-safe voice errors;
- voice-only numbered menu selection;
- spoken confirmation/cancellation;
- generic “done” resolved against authoritative next action.

Final Stage 07 evidence:

- backend/application: 74/74;
- browser: 14/14;
- production build: passed;
- UI/domain boundary: passed.

### Stage 08 — competition integration decision

Open Source mini challenge is selected.

Prepared evidence: `submission/OPEN_SOURCE_MINI_EVIDENCE.md`.

AWS Builder is deliberately deferred for now. The user has an AWS account, but has chosen not to connect it yet. If resumed later, the selected product-native design is Bedrock behind the existing model-interpreter boundary plus AgentCore Memory for non-authoritative cross-event preferences. No AWS runtime integration is currently claimed.

See `docs/COMPETITION_INTEGRATION_STAGE08.md`.

### Stage 09 — competition hardening

Stage 09 hardening has been implemented and verified without changing the authoritative execution architecture.

Accessibility / UX controls:

- composer focus recovery;
- Live/Activity heading focus after mode change;
- meaningful focus after material-action rerenders;
- labelled modal detail dialog;
- initial dialog focus and return focus;
- keyboard-focusable scrollable transcript;
- dedicated latest-message status announcement rather than whole-transcript live region;
- keyboard-reachable voice-unavailable state;
- retained 48 × 48 touch floor and responsive behavior;
- Axe Playwright representative WCAG A/AA checks.

Privacy / storage controls:

- Data & privacy UI explaining browser-local event storage;
- browser/platform speech-recognition disclosure;
- no claim that Host stores speech audio;
- confirmed scoped event-data deletion;
- theme preference preserved by tested deletion;
- explicit in-memory fallback when browser persistence is blocked;
- corrupt snapshots preserved while active pointer is removed and a safe recovery notice returns the user to a usable planning state.

Security / boundary controls:

- no `.innerHTML`, `insertAdjacentHTML`, or `document.write` accepted in the web layer;
- no direct web access to `HostDomainEngine` or `validateHostState`;
- no direct web imports from domain/persistence/tools;
- production dependency audit at verified gate: zero vulnerabilities;
- deterministic core journey rejects unexpected cross-origin application requests.

Reproducibility:

- package/lock versions aligned at `0.9.0`;
- Node floor `>=22.12.0`;
- Vite assets use relative `./` base for provider-independent static hosting;
- `npm ci` is the controlled install path.

Verification evidence:

- hardening workflow `33557794389`;
- reproducibility workflow `33558676755`;
- portable-base requalification workflow `33559155046`;
- clean-release verification workflow `33560083418`;
- backend/application: **74/74**;
- complete browser suite: **26/26**;
- Axe representative A/AA surfaces: passed;
- production build: passed;
- production dependency audit: zero vulnerabilities;
- injection/direct-domain scans: passed.

See `docs/HARDENING_STAGE09.md` and `reports/STAGE09_VERIFICATION.md`.

## Current simulation and capability boundaries

Still simulated and must be described truthfully:

- menu proposal source;
- product catalogue/candidate selection;
- cart/checkout transaction.

Browser voice uses Web Speech capability where available. It is not physical Alexa device integration.

The application does not currently perform or claim:

- real grocery/payment transactions;
- real Amazon retail calls;
- real calendar mutation;
- real invitation sending;
- physical Alexa device certification/integration;
- Amazon partner-only Alexa/MCP tooling;
- AWS/Bedrock calls;
- live external LLM provider calls;
- live smart-home control;
- universal Web Speech browser/device support.

## Current repository/runtime structure

- `src/domain/` — authoritative domain engine and invariants;
- `src/persistence/` — persistence contract/adapter;
- `src/tools/` — validated tool descriptors/runtime;
- `src/agent/` — interpretation/orchestration/presentation;
- `src/application/` — supported public application surface;
- `src/simulated-services/` — deterministic demo adapters;
- `web/` — simulated Alexa+ browser experience and voice adapter;
- `tests/*.test.mjs` — backend/application regressions;
- `tests/web/` — touch, voice and hardening acceptance;
- `docs/` — permanent architecture records;
- `reports/` — permanent verification records;
- `submission/` — competition evidence;
- `HANDOVER.md` — this self-contained continuation state.

## Local verification commands

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

Full Stage 09 gate after browser dependencies are present:

```bash
npm run verify:stage09
```

## Deployment status — unresolved Stage 09 item

The build is deployment-ready but **no hosted URL is verified**.

Vercel is connected, but the chat deployment wrapper currently cannot accept the backend-required deployment target, project name and files through its exposed schema.

GitHub Pages is disabled. Initial enablement through GitHub Actions requires a token other than the normal repository `GITHUB_TOKEN` with administration/pages permissions, which is not available here.

Do not invent or list a deployment URL.

## Exact continuation point

Stage 09 hardening functionality is verified. The only unresolved Stage 09 item is **real hosted deployment plus smoke testing**.

Continue in this order:

1. use a hosting path that can receive the exact verified repository/build artifact;
2. deploy the Stage 09 release without rebuilding a different product;
3. smoke-test load, Plan, Live, Activity, local persistence/reload, touch actions and voice fallback on the hosted URL;
4. record the exact URL/provider/deployment evidence in the verification report and README;
5. only then call Stage 09 fully closed.

If hosting remains externally blocked, keep it explicit. Stage 10 submission drafting may proceed with deployment pending, but final submission must remain truthful to the actual demo-access route.

AWS Builder remains deferred unless the user later explicitly resumes the Bedrock + AgentCore Memory path.

## Remaining controlled work

### Stage 09 — deployment closure

- real hosted deployment;
- hosted smoke test;
- update deployment evidence.

### Stage 10 — submission artifacts

- Devpost project story;
- truthful Built With list;
- public repository/run/deployment links;
- product/API/SDK feedback;
- feature requests if warranted;
- friction logs;
- gallery/screenshots;
- under-three-minute demo script/video;
- final rule audit against the controlling competition page.
