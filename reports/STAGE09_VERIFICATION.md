# Stage 09 Verification Report

Date: 1 September 2026

## Scope

This report records the verified Stage 09 hardening state for Host: Alexa+ Event Execution Agent. Stage 09 hardens the accepted Stage 07 voice-and-touch application without replacing Host's authoritative execution architecture.

## Verified base

Stage 09 began from clean Stage 08 `main`:

`7731011dad8a00fe7d92d1af7902e22d8a8a24c2`

## Functional hardening gate

Successful hardening workflow: `33557794389`.

Results:

- backend/application: **74 passed, 0 failed**;
- production Vite build: passed;
- browser: **26 passed, 0 failed**;
- production dependency audit: **0 vulnerabilities**;
- web injection/direct-domain boundary scans: passed.

The browser suite retains the Stage 06 touch and Stage 07 voice journeys and adds Axe accessibility, focus, recovery, local-storage/privacy and network-boundary checks.

## Defects found and corrected

Stage 09 failed closed before acceptance. The expanded tests/source review found and corrected:

- incorrect Axe TypeScript import;
- scrollable conversation region without keyboard access;
- corrupt persisted-state recovery not returning to the intended safe fresh UI;
- existing visible-text assertions made ambiguous by a separate screen-reader status node;
- package/root-lock version mismatch;
- Node engine floor below pinned Vite's actual requirement;
- root-relative Vite static asset base that reduced deployment portability.

All relevant gates were rerun after the corrections.

## Accessibility controls

Verified controls include:

- 48 × 48 px touch floor retained;
- keyboard-visible focus treatment;
- composer/mode/dialog focus recovery;
- labelled modal dialog with initial/return focus;
- keyboard-focusable scrollable transcript;
- one latest-message polite status rather than full transcript reannouncement;
- keyboard-reachable unavailable-voice state using `aria-disabled`;
- touch/keyboard fallback when voice is unavailable;
- Axe WCAG A/AA representative-surface checks.

Automated Axe success is not represented as complete manual WCAG certification.

## Privacy / persistence controls

Verified:

- event state remains browser-local in the deterministic current build;
- Data & privacy explanation is visible;
- browser/platform speech-recognition service boundary is disclosed;
- no claim that Host stores speech audio;
- scoped confirmed Host event-data deletion;
- theme preference preserved by the tested deletion path;
- explicit in-memory fallback if persistent browser storage is blocked;
- corrupt event snapshots preserved while the active pointer is removed and a recovery notice returns the UI to a usable state.

## Security controls

Release checks reject:

- `.innerHTML`;
- `insertAdjacentHTML`;
- `document.write`;
- direct `HostDomainEngine` / `validateHostState` use from `web/`;
- direct browser imports from domain/persistence/tool internals.

The deterministic core journey also rejects unexpected cross-origin application requests.

## Reproducibility

Successful reproducibility workflow: `33558676755`.

Verified:

- package version `0.9.0`;
- lockfile top-level/root version `0.9.0`;
- Node floor `>=22.12.0`;
- full product/security gate passed again.

Corrected commit: `6ff654b548c7e28ebffc26f16519e23adb5377e4`.

## Portable static build

Vite uses `base: "./"` for relative static assets.

Successful full requalification workflow: `33559155046`.

## Clean release verification

Permanent product/test/documentation blobs were assembled on top of Stage 08 `main` without Stage 09 development transformation scripts, triggers or development workflows.

Clean candidate commit:

`7498cbe7e10fbe6df068d7eb91e9793c06284c79`

Clean candidate workflow:

`33560083418`

That exact clean candidate passed:

- dependency/Chromium installation;
- **74/74** backend/application tests;
- production web build;
- **26/26** browser cases;
- production dependency audit;
- injection/direct-domain scans;
- clean-tree checks excluding Stage 09 development scaffolding.

The public release documentation may record this evidence without changing the tested product/test blobs.

## Dependency/licence observations

The browser application has no declared third-party runtime dependency.

Development/build/test dependencies:

- TypeScript 7.0.2 — Apache-2.0;
- Playwright test 1.62.1 — Apache-2.0;
- Vite 8.2.2 — MIT;
- Axe Playwright 4.13.0 — MPL-2.0.

Repository licence remains MIT.

## Competition recheck

Official Devpost rules were rechecked on 1 September 2026. The simulated Alexa+ web route remains valid; Open Source evidence remains prepared; friction logs can still contribute up to a 10% judging bonus. AWS Builder is deliberately deferred and is not claimed.

## Deployment status

Hosted deployment is **not verified**.

- Vercel is connected, but the available chat wrapper cannot supply its backend-required target/name/files arguments.
- GitHub Pages is disabled and first-time workflow enablement requires a higher-permission token not available here.

The static build is path-portable and reproducible. Do not list a hosted URL until one is actually deployed and smoke-tested.

## Completion boundary

Stage 09 hardening functionality and clean product/test release blobs are verified.

The unresolved Stage 09 item is **hosted deployment plus smoke testing**.
