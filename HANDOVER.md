# Host — Controlled Project Handover

## Project identity

**Project:** Host: Alexa+ Event Execution Agent  
**Competition:** Build, Ship, Shape: Amazon Developer Hackathon 2026  
**Primary track:** Alexa+ — simulated Alexa+ web experience  
**Current accepted product stage:** Stage 07 — voice + touch interaction  
**Current competition decision stage:** Stage 08 — Open Source locked; AWS Builder conditional on verified AWS access
**Next executable product stage if AWS access remains unavailable:** Stage 09 — hardening

This handover travels with the full repository source. It records the governing product design, verified stage history, current boundaries, test evidence, unresolved work, and exact continuation point required to continue without relying on chat memory.

## Product purpose

Host is not a generic event-planning chatbot. It is an execution agent for people hosting at home.

Core promise:

> From “people are coming over” to “everything is actually ready.”

The product is differentiated by authoritative execution state rather than conversational claims. It plans and executes hosting work across event constraints, menu commitment, inventory, shopping, preparation, late changes, and hands-busy live guidance.

The central integrity rule is permanent:

> Nothing becomes done because the language model, voice output, or UI says it is done. Only validated application/tool state can establish completion.

## Competition controls relevant to continuation

The entrant-supplied Devpost competition page is the controlling competition source for this project.

Current route:

- primary track: **Alexa+**;
- allowed implementation route selected: **simulated Alexa+ experience in a web app**;
- this route does not require a specific Alexa SDK/framework or AWS service;
- public GitHub source, assets, run instructions and visible open-source licence are required for submission;
- working simulation must be demonstrated in the final demo;
- final public demo video must be under three minutes;
- product/tool feedback and friction reporting are required/valuable submission assets;
- one project may win one primary-track prize plus one mini-challenge prize.

AWS Builder is optional and remains a Stage 08 decision. Do not add AWS merely to increase the technology list. Any AWS claim must correspond to a real, documented, verified integration that materially helps the product.

The public MIT repository itself also leaves the project potentially eligible for the Open Source mini challenge, subject to the competition's final contribution/repository/description fields and final rules audit.

## Controlling architecture

The mutation path is:

`user intent -> agent chooses controlled action/tool -> schema validation -> domain validation -> execution -> persistence -> audit/receipt -> customer response`

Voice adds only a presentation/input adapter around that path:

`recognized speech -> same HostAgentOrchestrator -> same controlled tool path -> same AgentReply -> speech synthesis`

Forbidden path:

`user intent / recognized speech -> generated text says an action happened -> UI/state assumes completion`

The agent/orchestrator may interpret intent and choose tools. It cannot directly rewrite authoritative domain state.

Material and transaction-like actions remain confirmation-gated regardless of whether the user interacts through touch, typed text or voice.

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

Stage 02–05 regression at Stage 05 release: **72 passed, 0 failed**.

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
- polite conversation live region;
- reduced-motion handling;
- no tested document-level horizontal overflow.

#### Live Mode

Live Mode presents one ready preparation task at a time with large controls. After task completion it asks the orchestrator for the next authoritative action and visibly presents the returned guidance.

#### Activity

Activity requests history from the application layer and displays receipts so a user can distinguish what actually succeeded, failed or was reversed.

#### Persistence

The browser stores authoritative application state through `JsonStoragePersistenceAdapter` over `localStorage`. The active event id is remembered separately. Reload resumes the event through the orchestrator and does not recreate stale pending confirmation UI.

Stage 06 final evidence:

- successful workflow run: `33501409738`;
- backend regression: **72 passed, 0 failed**;
- production web build: passed;
- Playwright acceptance: **8 passed, 0 failed**;
- Echo Show-like 1280 × 800 touch project;
- mobile 390 × 844 touch/mobile project;
- UI boundary scan passed.

See `docs/ALEXA_SIMULATION_UI_STAGE06.md` and `reports/STAGE06_VERIFICATION.md`.

### Stage 07 — voice interaction

Implemented and accepted in the isolated verified candidate:

- browser voice controller in `web/voice.ts`;
- Web Speech recognition detection (`SpeechRecognition` / `webkitSpeechRecognition`);
- speech synthesis (`SpeechSynthesisUtterance` / `speechSynthesis`);
- explicit Start/Stop Voice control;
- voice session states: `unavailable`, `idle`, `listening`, `processing`, `speaking`, `error`;
- one user activation followed by repeated conversational voice turns;
- recognised text routed through the same `HostAgentOrchestrator.handleText()` path as typed input;
- spoken output uses the same authoritative `AgentReply.speech` produced by the application;
- explicit touch/keyboard fallback when voice capabilities are unavailable or fail;
- customer-safe permission/microphone/recognition/speech-output error wording;
- no raw generic browser recognition error code in final customer-facing fallback;
- no direct voice/UI domain mutation path.

#### Voice-only menu selection

Stage 07 adds the `choose_menu` intent and optional `menuIndex` slot.

Menu proposal speech enumerates current options and tells the user to choose option one, two or three. Spoken menu selection resolves only against the current cached menu proposals and enters the existing `requestMenuCommit()` confirmation path.

A spoken menu choice therefore does **not** commit a menu. The user must still confirm.

#### Voice-only task completion

When a user says `done`, `finished` or `complete`, the orchestrator re-reads current authoritative status and resolves the completion against `status.data.nextAction` before invoking `mark_task_complete`.

This prevents the voice channel from guessing which visually displayed task was completed.

#### Spoken confirmation/cancellation

Existing Stage 05 confirmation logic is reused. Spoken yes/confirm/go-ahead invokes the same confirmation path. Spoken no/cancel leaves the pending action unapplied.

During Stage 07 browser testing, cancellation correctly preserved uncommitted menu state but the later shopping request exposed a generic message for `MENU_REQUIRED`. The final build adds a specific recovery message telling the user to choose and confirm a menu before building shopping.

#### Automated voice verification

`tests/web/voice-ui.spec.ts` injects deterministic fake Web Speech recognition and synthesis objects into Chromium. The test still runs the actual Host browser controller, orchestrator, tools, persistence and domain state path.

This verifies application integration and authoritative outcomes without depending on physical microphone acoustics or an external browser speech service.

Final Stage 07 evidence:

- final successful workflow run: `33552445789`;
- Stage 02–07 backend/application suite: **74 passed, 0 failed**;
- production web build: passed;
- complete Playwright browser suite: **14 passed, 0 failed**;
- boundary scan: passed.

The 14 browser cases comprise:

- eight retained Stage 06 touch cases;
- six Stage 07 voice cases: three voice scenarios across both Echo Show-like and mobile projects.

Voice scenarios:

1. complete voice-only core journey after one activation through event, menu, confirmation, shopping, products, simulated checkout, prep, next action, task completion and receipt/history evidence;
2. spoken `no` cancellation of a pending material menu change with correct authoritative state and recovery guidance;
3. explicit voice-unavailable state with touch/keyboard path retained.

See `docs/VOICE_INTERACTION_STAGE07.md` and `reports/STAGE07_VERIFICATION.md`.

## Stage 08 — competition integration decision

Stage 08 has now been researched against the current Devpost rules and current AWS documentation. It does not change the verified Stage 07 runtime.

### Open Source mini challenge — locked decision

**Enter the Open Source mini challenge.**

Verified evidence:

- public repository: `https://github.com/jamieozzy89-cmyk/host-alexa-event-execution-agent`;
- GitHub username: `jamieozzy89-cmyk`;
- MIT licence;
- repository created 1 September 2026 at 02:23:58 UTC;
- clean Stage 07 contribution/release commit: `871ae74bf53461a02201554250f68b22c5382fc9`;
- contribution URL: `https://github.com/jamieozzy89-cmyk/host-alexa-event-execution-agent/commit/871ae74bf53461a02201554250f68b22c5382fc9`;
- substantive implementation includes domain engine, persistence, 17 validated tools, agent/orchestrator, touch UI, browser voice, receipts/audit, tests and technical documentation.

Prepared submission evidence is stored in `submission/OPEN_SOURCE_MINI_EVIDENCE.md`.

### AWS Builder — conditional decision

AWS is **not required** for Host's valid simulated Alexa+ primary-track route.

The competition's AWS Builder examples explicitly distinguish obvious integrations such as a single Bedrock generation call from more creative multi-service/agentic architectures. Therefore Host must not add a token Bedrock call merely to qualify.

Options evaluated:

- single Bedrock text-generation call — rejected as shallow/padding;
- replace Host orchestration with Strands — rejected because it risks weakening the verified authoritative execution boundary;
- convert the current web simulation to AgentCore Gateway/MCP solely for the mini challenge — rejected as unnecessary architecture/infrastructure churn;
- **Bedrock + AgentCore Memory — selected as the only AWS architecture worth pursuing if real AWS access is supplied.**

#### Controlled Bedrock role

Bedrock would sit behind Host's existing `StructuredIntentModel` / `ModelBackedIntentInterpreter` interface, preferably through the Bedrock Converse API. Model output still terminates at the existing orchestrator/tool/domain path and cannot directly mutate authoritative state. `ResilientIntentInterpreter` must retain the deterministic fallback.

#### Controlled AgentCore Memory role

AgentCore Memory would hold **non-authoritative cross-event preferences** only, such as cuisine/style or normal prep preferences. Retrieved memory may suggest context; it must never silently become a confirmed dietary/allergen constraint, completion state, committed menu, transaction or other authoritative event fact.

#### AWS blocker

The current environment has no governed AWS connection or AWS/Bedrock plugin. Only the local-files connection is present. No AWS credentials/account access are available to verify real Bedrock or AgentCore calls.

Therefore:

- no AWS service is currently implemented or claimed;
- no mocked AWS integration may be substituted for a real competition claim;
- `Built With` must not list Bedrock/AgentCore until real calls are implemented and verified.

The competition rules currently offer up to $150 promotional AWS credits while supplies last, with additional charges remaining the entrant's responsibility. If AWS access is supplied, request/confirm credits and set a strict spend budget before implementation.

Full Stage 08 decision/evidence: `docs/COMPETITION_INTEGRATION_STAGE08.md`.

### Exact continuation after Stage 08

If secure AWS account access becomes available, implement Bedrock + AgentCore Memory behind the controlled adapters and rerun all existing plus AWS-specific tests before claiming AWS Builder.

If AWS access remains unavailable, Stage 08 is complete as a controlled decision: retain the stronger verified Stage 07 Alexa+ product, enter Open Source, do **not** claim AWS Builder, and proceed directly to Stage 09 hardening.

## Current simulation and capability boundaries

The following are simulations and must continue to be described truthfully:

- menu proposal source;
- product catalogue/candidate selection;
- cart/checkout transaction.

The browser voice channel uses Web Speech capability where available. It is not physical Alexa device integration.

The application does **not** currently perform or claim:

- real grocery/payment transactions;
- real Amazon retail calls;
- real calendar mutations;
- real invitation sending;
- physical Alexa device certification/integration;
- Amazon partner-only Alexa/MCP tooling;
- AWS/Bedrock calls;
- live external LLM provider calls;
- live smart-home control;
- universal Web Speech browser/device support.

The Alexa+ competition route is the allowed simulated web-experience route. Do not claim unavailable partner tooling is integrated.

## Current repository/runtime structure

- `src/domain/` — authoritative domain engine and invariants;
- `src/persistence/` — persistence contract/adapter;
- `src/tools/` — validated tool descriptors/runtime;
- `src/agent/` — interpretation/orchestration/presentation;
- `src/application/` — supported public application surface;
- `src/simulated-services/` — deterministic demo adapters;
- `web/` — simulated Alexa+ browser experience and browser voice adapter;
- `tests/*.test.mjs` — backend/application regressions;
- `tests/web/` — touch and voice Playwright acceptance;
- `docs/` — permanent architecture records;
- `reports/` — permanent verification records;
- `HANDOVER.md` — this self-contained continuation state.

## Local verification commands

Requirements:

- Node.js 22+
- npm

Install and verify backend/application layers:

```bash
npm ci
npm test
```

Build the web application:

```bash
npm run build:web
```

Install Playwright Chromium and required system libraries:

```bash
npx playwright install --with-deps chromium
```

Run all touch + voice browser acceptance tests:

```bash
npm run test:web
```

Run the full Stage 07 verification sequence after browser dependencies are installed:

```bash
npm run verify:stage07
```

## Exact continuation point

Stage 08's decision is recorded above. The next executable action depends only on verified AWS access:

- **AWS access available:** implement the controlled Bedrock + AgentCore Memory design, verify real calls/cost/failure behavior, then continue hardening.
- **AWS access unavailable:** proceed to Stage 09 hardening with the verified Stage 07 runtime and Open Source mini entry; do not claim AWS Builder.

## Later controlled work

After Stage 08:

- **Stage 09 — hardening**
  - actual-browser/manual microphone and permission compatibility;
  - accessibility audit beyond automated minimums;
  - error/recovery matrix;
  - security/privacy review;
  - persistence/reload and demo regression;
  - deployment/reproducibility;
  - source/licence/provenance review;
  - current competition-requirements recheck.

- **Stage 10 — submission artifacts**
  - final Devpost story;
  - truthful `Built With` list;
  - public repository/run/deployment links;
  - product/API/SDK feedback;
  - feature requests if warranted;
  - friction logs;
  - gallery/screenshots;
  - under-three-minute demo script/video;
  - final submission audit against the controlling page.

The Devpost `Built With` field, AWS claims, deployment links, screenshots and final submission prose must remain truthful to the actual verified build state.