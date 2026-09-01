# Stage 09 Verification Report

Date: 1 September 2026

## Scope

This report records the verified Stage 09 hardening state for Host: Alexa+ Event Execution Agent.

Stage 09 hardens the accepted Stage 07 voice-and-touch application without replacing Host's authoritative execution architecture.

## Verified base

Stage 09 began from clean Stage 08 `main`:

`7731011dad8a00fe7d92d1af7902e22d8a8a24c2`

## Verified results

Hardening workflow: `33557794389`.

- backend/application: **74/74**;
- production build: passed;
- browser: **26/26**;
- production dependency audit: **0 vulnerabilities**;
- injection/direct-domain boundary scans: passed.

Reproducibility workflow: `33558676755`.

- package/root-lock version: `0.9.0`;
- Node floor: `>=22.12.0`;
- full product/security gate passed.

Portable static-build requalification: `33559155046`.

- Vite uses relative `./` asset base;
- full product/security gate passed.

Clean release candidate: `7498cbe7e10fbe6df068d7eb91e9793c06284c79`.

Clean release workflow: `33560083418`.

- dependency/Chromium install passed;
- backend/application: **74/74**;
- production build passed;
- browser: **26/26**;
- production dependency audit passed;
- security/application-boundary scans passed;
- Stage 09 development workflows/scripts were absent from the candidate.

## Hardening controls

Accessibility:

- retained 48 × 48 touch floor;
- keyboard focus continuity;
- labelled modal with initial/return focus;
- focusable scrollable transcript;
- latest-message status instead of whole-transcript live replay;
- keyboard-reachable unavailable-voice state;
- representative Axe WCAG A/AA checks.

Privacy/storage:

- browser-local event-storage disclosure;
- browser/platform speech recognition disclosure;
- no Host audio-storage claim;
- confirmed scoped event-data deletion;
- theme preservation during tested deletion;
- in-memory fallback if persistent storage is blocked;
- corrupt-snapshot preservation plus safe fresh-state recovery.

Security:

- no `.innerHTML`, `insertAdjacentHTML` or `document.write` accepted;
- no direct web/domain engine or validator access;
- no direct web imports from domain/persistence/tools;
- deterministic core journey rejects unexpected cross-origin application requests.

## Source review findings

The line-by-line release audit found and corrected issues not exposed by the earlier passing functional gate:

- package/lock root-version mismatch;
- inaccurate Node engine floor;
- non-portable root-relative static asset base.

These corrections were requalified rather than accepted on inspection alone.

## Dependency/licence observations

No third-party runtime dependency is declared for the browser application.

Development/build/test dependencies include TypeScript 7.0.2, Playwright 1.62.1, Vite 8.2.2 and Axe Playwright 4.13.0. Repository licence remains MIT.

## Competition status

The simulated Alexa+ web route remains the selected valid primary route. Open Source evidence is prepared. AWS Builder is deliberately deferred and not claimed.

## Deployment status

Hosted deployment is **not verified**.

Vercel is connected, but its exposed chat wrapper cannot supply the backend-required target/name/files arguments. GitHub Pages is disabled and first-time workflow enablement requires a higher-permission token not available here.

The build is reproducible and path-portable. Do not list a hosted URL until a real deployment is created and smoke-tested.

## Completion boundary

Stage 09 hardening functionality and clean product/test release are verified. The remaining Stage 09 item is **hosted deployment plus smoke testing**.
