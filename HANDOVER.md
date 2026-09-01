# Host — Controlled Project Handover

**Project:** Host: Alexa+ Event Execution Agent
**Competition:** Build, Ship, Shape: Amazon Developer Hackathon 2026
**Primary track:** Alexa+ — simulated Alexa+ web experience
**Current verified product:** Stage 09 hardening functionality
**Unresolved Stage 09 item:** hosted deployment + smoke test
**Competition decision:** Open Source selected; AWS Builder deliberately deferred

## Product rule

> Nothing becomes done because a model, voice response or UI says it is done. Only validated application/tool state establishes completion.

Controlled path:

`intent -> HostAgentOrchestrator -> HostToolRuntime -> domain validation -> persistence -> audit/receipt -> response`

Voice uses the same path.

## Completed product layers

- Stage 02: authoritative domain/state engine.
- Stage 03: persistence/restart/recovery.
- Stage 04: 17 validated tools.
- Stage 05: controlled agent/orchestrator.
- Stage 06: Plan / Live / Activity touch UI.
- Stage 07: browser voice through the same agent/tool boundary.
- Stage 08: Open Source selected; AWS deferred.
- Stage 09: accessibility/privacy/recovery/security/reproducibility hardening verified.

## Stage 09 verified controls

Accessibility and UX:

- focus continuity after rerenders;
- labelled modal dialog and return focus;
- focusable scrollable transcript;
- latest-message screen-reader status rather than full transcript replay;
- keyboard-reachable voice-unavailable state;
- retained large touch controls/responsive layouts;
- representative Axe WCAG A/AA checks.

Privacy/storage:

- Data & privacy explanation;
- browser/platform speech-recognition disclosure;
- confirmed scoped Host event-data deletion;
- theme preference preserved by tested deletion;
- in-memory fallback when browser persistence is blocked;
- corrupt persisted-state recovery without silent snapshot deletion.

Security:

- no unsafe HTML injection primitives accepted in web source;
- no direct web/domain-engine access;
- no direct browser imports from domain/persistence/tool internals;
- production dependency audit: zero vulnerabilities at verified gate;
- deterministic core journey rejects unexpected cross-origin application requests.

Reproducibility:

- package/lock version 0.9.0;
- Node >=22.12.0;
- portable Vite relative asset base `./`.

Verification:

- hardening workflow `33557794389`;
- reproducibility `33558676755`;
- portable-build requalification `33559155046`;
- clean release `33560083418`;
- backend/application: **74/74**;
- browser: **26/26**;
- production build passed;
- security boundary passed.

Permanent evidence:

- `docs/HARDENING_STAGE09.md`
- `reports/STAGE09_VERIFICATION.md`

## Competition status

Open Source evidence:

`submission/OPEN_SOURCE_MINI_EVIDENCE.md`

AWS account exists, but AWS integration is deliberately deferred. If resumed later, use Bedrock behind the existing model interpreter plus AgentCore Memory for non-authoritative preferences. Do not claim AWS Builder until real calls are implemented and verified.

## Truth boundaries

Simulated:

- menu proposal source;
- product catalogue;
- checkout.

Not currently claimed:

- real grocery/payment;
- Amazon retail API;
- real calendar/invitation mutations;
- physical Alexa integration/certification;
- AWS/Bedrock runtime;
- live external LLM;
- smart-home control;
- universal browser speech support.

## Local verification

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

## Deployment status

The build is verified, reproducible and path-portable, but no hosted URL is verified.

Vercel is connected, but the available chat wrapper cannot supply its backend-required target/name/files arguments. GitHub Pages is disabled and first-time workflow enablement requires a higher-permission token unavailable here.

Do not fabricate a URL.

## Exact continuation

1. obtain a hosting path able to receive the exact verified build/repository;
2. deploy without rebuilding a different product;
3. smoke-test Plan, Live, Activity, persistence/reload, touch and voice fallback;
4. record deployment URL/provider/evidence;
5. close Stage 09 deployment;
6. proceed to Stage 10 submission story, Built With, feedback/friction logs, screenshots/gallery, and <3 minute video.
