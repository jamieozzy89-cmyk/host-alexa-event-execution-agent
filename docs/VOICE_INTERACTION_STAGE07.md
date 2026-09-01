# Stage 07 — Voice Interaction

## Purpose

Stage 07 adds a voice channel to the verified Host application without creating a second agent, state engine, or execution path.

The governing architecture remains:

`recognized/typed user request -> HostAgentOrchestrator -> controlled tool -> domain validation -> persistence -> receipt/audit -> AgentReply -> visual/spoken presentation`

Voice recognition and speech synthesis are presentation adapters. They do not directly mutate event state.

## Browser voice controller

`web/voice.ts` is deliberately separate from the orchestrator and domain layers.

It detects browser Web Speech capabilities:

- `SpeechRecognition` or `webkitSpeechRecognition`;
- `SpeechSynthesisUtterance`;
- `speechSynthesis`.

Voice mode is available only when both recognition and speech output are present. Unsupported environments remain fully usable through the Stage 06 touch/keyboard interface.

The controller exposes:

- `activate()`;
- `deactivate()`;
- `listen()`;
- `speak(text)`;
- `snapshot()`;
- `destroy()`.

Voice session states are:

- `unavailable`;
- `idle`;
- `listening`;
- `processing`;
- `speaking`;
- `error`.

These states are UI/session state, not authoritative event state.

## User activation and continuous turns

The browser Voice button is an explicit user action. Once activated:

1. Host speaks a short orientation message;
2. recognition listens for one final utterance;
3. recognised text is added to the ordinary conversation transcript;
4. the text is passed to `HostAgentOrchestrator.handleText()`;
5. the returned `AgentReply` is rendered through the normal presentation contract;
6. `reply.speech` is spoken;
7. if voice mode is still active, recognition begins listening for the next turn.

This gives continuous conversational turns after the initial activation while keeping browser permission/user-gesture requirements explicit.

## Voice and touch parity

Touch remains an equivalent route. Voice adds no exclusive authoritative action.

Stage 07 specifically closes two places where the Stage 06 visual UI previously carried information that a voice-only user needed.

### Menu choice

`showMenus()` now speaks numbered menu options and tells the user how to choose one.

The interpreter recognises spoken forms such as:

- `choose option one`;
- `pick option two`;
- `select the third`.

A spoken choice invokes the same `requestMenuCommit()` path as a menu-card touch action. It creates a pending confirmation only. The menu is not committed until the user explicitly confirms.

### Preparation completion

A voice-only user can ask `what's next` and hear the authoritative next preparation task.

When the user subsequently says `done`, `finished`, or `complete`, the orchestrator re-reads current authoritative status and resolves the completion against `status.data.nextAction`. It then invokes `mark_task_complete` through the existing tool layer.

The system therefore does not guess that a task is complete from conversational context or the currently visible card.

## Spoken confirmations

Existing Stage 05 confirmation state is reused.

While a pending action exists:

- `yes`, `confirm`, `go ahead`, etc. invoke the existing confirmation route;
- `no`, `cancel`, `leave it`, etc. clear the pending conversational action without committing it;
- unrelated speech repeats the pending confirmation rather than silently executing something else.

This applies to material menu commitment, simulated checkout, late-change application, and safe undo.

## Failure and recovery behavior

Voice-specific failures do not alter authoritative event state.

Handled cases include:

- no speech: Host reports that nothing was heard and listens again;
- microphone permission denied: voice mode stops and touch fallback is stated;
- no microphone/audio capture: voice mode stops and touch fallback is stated;
- generic recognition failure: customer-safe message, voice stops, touch fallback remains;
- recognition start failure: customer-safe message, voice stops;
- speech-output failure: voice stops and touch fallback remains;
- browser lacks required Web Speech features: Voice is explicitly unavailable/disabled while touch/keyboard stays operational.

Raw browser recognition error codes are not surfaced in the final customer-facing generic failure message.

## Existing application recovery improved for voice

During Stage 07 verification, spoken cancellation of a menu commitment correctly left authoritative state unchanged. A subsequent shopping request then failed with domain code `MENU_REQUIRED`, but the existing friendly-error map did not explain that code.

The final Stage 07 build adds the specific response:

> There isn't a committed menu yet. Choose and confirm a menu first, then I can build the shopping list.

This improves both voice and typed/touch recovery while preserving the domain rule.

## Automated verification design

`tests/web/voice-ui.spec.ts` injects deterministic Web Speech fakes before application startup.

The fake recognition object allows a test to emit a spoken phrase into the actual browser voice controller. The fake synthesis object records exactly what Host tries to speak and completes the utterance asynchronously.

This setup verifies:

- browser voice-controller lifecycle;
- Start/Stop Voice behavior;
- listening -> processing -> speaking -> listening transitions;
- text routing into the real orchestrator;
- spoken response routing from the real AgentReply;
- confirmation behavior;
- authoritative state changes through the real tool/runtime path;
- continued operation across many voice turns after one activation;
- touch fallback when voice capabilities are missing.

It deliberately avoids depending on physical microphone acoustics or a remote speech service, making the automated suite repeatable.

## Verified voice journey

After a single Voice activation, the automated customer journey performs the following without touch input:

1. create the hosting event;
2. request menu ideas;
3. hear numbered menu options;
4. choose option one;
5. confirm the menu;
6. request shopping list;
7. request demo products;
8. request simulated checkout;
9. confirm simulated checkout;
10. request prep plan;
11. ask what's next;
12. say `done`;
13. ask whether the action actually happened and receive receipt/history evidence.

A separate voice scenario confirms that `no` cancels a pending menu commitment and that the resulting uncommitted state is explained correctly.

## Verification result

Final GitHub Actions run: `33552445789`.

- Stage 02–07 backend/application tests: **74 passed, 0 failed**;
- production web TypeScript/build: **passed**;
- Playwright browser acceptance: **14 passed, 0 failed**;
- boundary scan: **passed**.

The browser total consists of eight retained Stage 06 touch cases plus six Stage 07 voice cases across the Echo Show-like and mobile projects.

## Current limitations

Stage 07 does not claim universal browser voice support. The Web Speech APIs vary by browser, device, permission state, and speech-service availability.

Automated voice acceptance validates Host's application integration using deterministic browser fakes. Physical microphone/browser compatibility and acoustic behavior require explicit manual testing during Stage 09 hardening.

Stage 07 also does not add or claim:

- physical Alexa device integration;
- Amazon partner-only MCP/Alexa tooling;
- a live external LLM provider;
- AWS/Bedrock services;
- real payment/retail transactions.

## Exit condition

Stage 07's controlled exit condition is satisfied when the verified core journey can be driven and understood through the voice channel without visual dependence, while touch remains equivalent and authoritative state boundaries are unchanged.

The verified automated journey satisfies that condition for the simulated browser environment. The next stage is **Stage 08 — competition integration decision**.