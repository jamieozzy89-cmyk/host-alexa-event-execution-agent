# Host: Alexa+ Event Execution Agent

**Competition:** Build, Ship, Shape: Amazon Developer Hackathon 2026
**Primary track:** Alexa+ — simulated Alexa+ web experience
**Current verified stage:** Stage 09 — hardened voice + touch product; hosted deployment still pending

Host turns an agreed hosting plan into authoritative execution state across menu commitment, inventory, shopping, preparation, late changes and hands-free live guidance.

> From “people are coming over” to “everything is actually ready.”

Conversation, UI and voice do not make an action true. Only the validated tool/domain path can establish completion.

## Verified state

- backend/application tests: **74/74**;
- browser touch/voice/hardening tests: **26/26**;
- production build: passed;
- production dependency audit: zero vulnerabilities at the Stage 09 gate;
- representative Axe WCAG A/AA checks: passed;
- web injection/direct-domain boundary scans: passed.

Stage 09 adds focus recovery, labelled dialog/focus lifecycle, focused scrollable transcript, latest-message screen-reader status, accessible unavailable-voice state, Data & privacy controls, scoped saved-event deletion, in-memory storage fallback, corrupt-state recovery, no-referrer policy and provider-independent relative static assets.

See:

- `docs/HARDENING_STAGE09.md`
- `reports/STAGE09_VERIFICATION.md`
- `HANDOVER.md`

## Competition status

- Alexa+ primary: simulated web experience.
- Open Source mini challenge: selected; evidence in `submission/OPEN_SOURCE_MINI_EVIDENCE.md`.
- AWS Builder: deliberately deferred; no AWS runtime integration claimed.

## Run locally

Requires Node.js 22.12+ and npm.

```bash
npm ci
npm test
npm run build:web
npx playwright install --with-deps chromium
npm run test:web
```

Full Stage 09 gate after browser dependencies are installed:

```bash
npm run verify:stage09
```

## Runtime boundary

The supported application path is:

`intent -> HostAgentOrchestrator -> HostToolRuntime -> domain validation -> persistence -> receipt/audit -> response`

Voice routes recognized text into that same path.

The public package does not expose the internal domain engine/state validator as its supported application surface.

## Authoritative tool surface

`create_event`, `update_event_constraints`, `propose_menu`, `commit_menu`, `record_inventory`, `build_shopping_plan`, `prepare_cart`, `confirm_cart_action`, `build_preparation_plan`, `mark_task_complete`, `advance_event_status`, `get_next_action`, `get_event_status`, `analyse_change_impact`, `apply_confirmed_change`, `get_action_history`, `undo_reversible_action`.

## Simulation boundary

Menu proposals, product candidates and checkout are deterministic simulations. They are not represented as real Amazon retail/payment calls.

Browser speech recognition is an optional browser/platform capability and may use a browser/platform speech service. Host does not claim to store speech audio.

## Deployment status

The static build is reproducible and path-portable, but **no hosted URL is currently verified**. Do not list a deployment URL until a real deployment has been created and smoke-tested.

## Next controlled work

Close Stage 09 with a real hosted deployment and smoke test, then proceed to Stage 10 submission artifacts.
