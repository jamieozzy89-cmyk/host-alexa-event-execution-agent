# Stage 07 Verification Record

Date: 1 September 2026

## Scope

Stage 07 adds browser voice interaction to Host without creating a second agent, state engine, or mutation path.

The governing rule remains:

> Voice may capture a request and speak an authoritative reply. It does not make state true. All authoritative mutations still terminate at `HostToolRuntime`, domain validation, persistence, and receipt/audit creation.

## Implemented voice boundary

`web/voice.ts` provides a browser voice controller over Web Speech capabilities when available:

- `SpeechRecognition` / `webkitSpeechRecognition` for single-turn recognition;
- `SpeechSynthesisUtterance` / `speechSynthesis` for spoken output;
- `en-GB` recognition and synthesis configuration;
- session-only states: `unavailable`, `idle`, `listening`, `processing`, `speaking`, `error`;
- explicit Start/Stop Voice control;
- automatic return to listening after Host finishes speaking while voice mode remains active;
- explicit handling for no speech, permission denial, missing microphone, recognition failure, and speech-output failure;
- transparent touch/keyboard fallback when voice is unavailable.

Voice state is presentation/session state only and is not part of authoritative event state.

Recognised text is routed to the same `HostAgentOrchestrator.handleText()` path used by typed conversation. Agent replies are rendered normally and the same `reply.speech` value is spoken.

## Agent changes required for voice-only parity

Stage 07 added two interaction capabilities needed to avoid visual dependence:

1. **Spoken menu choice**
   - menu proposals are spoken as numbered choices;
   - the user can say `choose option one`, `choose option two`, or `choose option three`;
   - that request enters the existing `requestMenuCommit` path;
   - menu state remains unchanged until explicit confirmation.

2. **Authoritative spoken task completion**
   - a generic spoken `done`, `finished`, or `complete` resolves against the current authoritative `nextAction` returned from tool state;
   - Host does not guess which visually displayed task the user meant;
   - completion still invokes `mark_task_complete` through the controlled tool path.

Stage 07 also added a specific customer-safe `MENU_REQUIRED` recovery response after a cancelled menu selection so a voice-only user is told to choose and confirm a menu before shopping can be built.

## Final verification

Final successful GitHub Actions run:

`33552445789`

### Backend/application regression

Final Stage 02–07 suite:

- tests: **74**
- passed: **74**
- failed: **0**

The Stage 07 additions include tests proving:

- spoken numbered menu selection is confirmation-gated before authoritative menu mutation;
- spoken `done` completes the authoritative current next preparation task.

### Production web build

`npm run build:web`

Result: **passed**.

### Browser acceptance

`npm run test:web`

Final result: **14 passed, 0 failed**.

The suite runs in both configured projects:

- `echo-show`: 1280 × 800, touch enabled;
- `mobile`: 390 × 844, touch/mobile enabled.

The 14 cases consist of the existing eight Stage 06 touch cases plus six Stage 07 voice cases (three voice scenarios in each viewport).

Verified Stage 07 voice scenarios:

1. **Voice-only core journey after one activation**
   - create event;
   - hear numbered menu choices;
   - choose menu by voice;
   - confirm by voice;
   - build shopping list;
   - request demo products;
   - request simulated checkout;
   - confirm simulated checkout;
   - build prep plan;
   - ask what is next;
   - say `done`;
   - ask whether the action actually happened / retrieve receipt history.

2. **Spoken cancellation**
   - enter pending menu commitment;
   - say `no`;
   - no menu is committed;
   - a subsequent shopping request receives a specific menu-required recovery message rather than a generic failure.

3. **Voice unavailable fallback**
   - Voice control is explicitly unavailable/disabled;
   - touch/keyboard route remains usable;
   - customer text states that touch and keyboard controls still work.

### Test voice implementation

Automated browser voice tests inject deterministic fake Web Speech recognition and synthesis objects. This verifies Host's recognition/output integration, continuous turn-taking logic, orchestration routing, confirmation behavior, and authoritative state effects without depending on physical microphone acoustics or an external browser speech service.

This automated result does **not** constitute physical microphone/device certification. Real-browser permission/device behavior remains a Stage 09 hardening/manual-compatibility check.

### Boundary scan

Passed.

The verified web/test boundary contains no accepted:

- direct `HostDomainEngine` use;
- direct `validateHostState` use;
- direct browser imports of `src/domain`;
- TODO/FIXME/HACK markers in the Stage 07 web/browser-test surface.

## Defects found and corrected during Stage 07

### Invalid temporary verification workflow

An early temporary workflow embedded source incorrectly and GitHub scheduled zero jobs. That run was rejected as testing nothing. Verification was rebuilt as an executable workflow with actual runner jobs.

### Cancellation recovery wording

The initial real browser run passed 12/14 cases. Both failures occurred after spoken `no`: authoritative state correctly left the menu uncommitted, but the next shopping request exposed a generic failure message for domain code `MENU_REQUIRED`.

Correction: `MENU_REQUIRED` now tells the user that no menu is committed and to choose and confirm a menu before shopping is built.

### Generic recognition error wording

Final source audit identified that an unrecognised Web Speech error code could be echoed in customer-facing status text.

Correction: generic recognition failures now use customer-safe wording and explicitly preserve touch-control fallback instead of displaying raw browser error codes.

The complete backend/web/browser gate was rerun after this final correction and passed.

## Release hygiene

Temporary Stage 07 build/verification workflows, triggers, transformation script, and raw last-run diagnostic are verification scaffolding and must not be included in the clean `main` release.

Permanent evidence is retained in this report and `docs/VOICE_INTERACTION_STAGE07.md`.

## Acceptance boundary

Stage 07 establishes the simulated browser voice channel and voice-only execution path for the verified core journey.

It does not claim:

- physical Alexa device integration or certification;
- Amazon partner-only Alexa/MCP tooling;
- an external live LLM provider;
- AWS/Bedrock integration;
- real commerce/payment transactions;
- universal Web Speech support across all browsers/devices.

The next controlled stage is **Stage 08 — competition integration decision**, including whether an AWS Builder mini-challenge integration adds real product value without weakening the primary Alexa+ experience.