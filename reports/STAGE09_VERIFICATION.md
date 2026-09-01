# Stage 09 Verification Report

Date: 1 September 2026

## Scope

This report records the Stage 09 hardening verification for Host: Alexa+ Event Execution Agent.

Stage 09 does not replace Host's product architecture. It hardens the accepted Stage 07 voice-and-touch application for accessibility, recovery, privacy, browser storage, security boundaries and reproducibility.

## Verified base

Stage 09 branch base:

`7731011dad8a00fe7d92d1af7902e22d8a8a24c2`

This is the clean Stage 08 documentation release on top of the accepted Stage 07 product.

## Functional hardening gate

Successful GitHub Actions hardening run:

`33557794389`

Results:

- backend/application tests: **74 passed, 0 failed**;
- production Vite build: **passed**;
- browser cases: **26 passed, 0 failed**;
- production dependency audit: **0 vulnerabilities**;
- web injection/direct-domain boundary scans: **passed**.

The 26 browser cases execute across the existing Echo Show-like and mobile Playwright projects. They retain the Stage 06 touch and Stage 07 voice journeys and add Stage 09 accessibility/privacy/recovery cases.

## Stage 09 browser controls

New browser hardening coverage directly tests:

1. Axe WCAG A/AA checks on core application states;
2. composer focus continuity after async submit/rerender;
3. detail-dialog initial focus and focus return to the opener;
4. corrupt persisted-event recovery into a usable fresh state;
5. explicit in-memory fallback when persistent browser storage is unavailable;
6. user-confirmed deletion of Host event data without deleting the theme preference;
7. absence of unexpected cross-origin requests in the deterministic non-voice core journey.

Existing touch and voice journeys remain in the same browser suite.

## Defects found by the hardening gate

The initial Stage 09 browser run was not accepted.

It produced 18 passes and 8 failures across the two viewport projects. The failures reduced to three causes:

- Axe identified the scrollable conversation region lacked keyboard accessibility;
- unrecoverable persisted state returned a structured error but the browser startup path did not yet convert that result into the intended safe recovery UI;
- two existing visible-text assertions became ambiguous after adding the separate screen-reader status node.

Corrections:

- transcript made keyboard-focusable;
- structured resume failure now removes only the active pointer, preserves corrupt snapshots, shows a recovery notice, and returns to a usable planning state;
- legacy visual assertions scoped to the visible conversation rather than weakening/removing the screen-reader status node.

The full browser gate was then rerun and passed 26/26.

## Accessibility verification

Automated Axe checks use `@axe-core/playwright` 4.13.0 and target WCAG A/AA rule tags on representative surfaces.

Verified accessibility controls also include:

- 48 × 48 px touch floor retained from Stage 06;
- keyboard-visible focus treatment;
- focus recovery after SPA rerenders;
- dialog labelling and focus lifecycle;
- focused scrollable transcript;
- latest-status live announcement rather than full-conversation reannouncement;
- voice-unavailable control remains keyboard reachable with `aria-disabled` semantics;
- touch/keyboard route remains usable when voice is unavailable.

Automated test success is not represented as complete manual WCAG certification.

## Privacy / storage verification

Verified browser behavior:

- event state is stored in browser storage in the current deterministic build;
- Host exposes an explicit Data & privacy explanation;
- browser/platform speech-recognition network behavior is disclosed separately;
- Host does not claim to store speech audio;
- clear-data operation removes only the current Host event/active-event keys;
- theme preference remains after the tested event-data deletion;
- blocked localStorage produces an explicit in-memory-only state rather than false persistence;
- corrupt persisted event snapshots are not silently destroyed during startup recovery.

## Security-boundary verification

Automated release checks reject:

- `.innerHTML` assignment;
- `insertAdjacentHTML`;
- `document.write`;
- `HostDomainEngine` or `validateHostState` direct use from `web/`;
- direct imports from domain/persistence/tool internals into the browser layer.

`npm audit --omit=dev` at the verified gate reports zero production dependency vulnerabilities.

## Source review

After the passing functional gate, the changed Stage 09 release files were read line by line/contextually rather than accepting tests as sufficient:

- `package.json`
- `package-lock.json`
- `index.html`
- `vite.config.ts`
- `web/types.ts`
- `web/runtime.ts`
- `web/main.ts`
- `web/render.ts`
- `web/styles.css`
- `tests/web/hardening-ui.spec.ts`
- changed `tests/web/host-ui.spec.ts`
- changed `tests/web/voice-ui.spec.ts`

The review found a reproducibility defect after the initial 26/26 gate:

- `package.json` reported version `0.9.0` while root `package-lock.json` metadata still reported `0.7.0`;
- package Node engine was `>=22` even though the pinned Vite 8 build requires Node 22.12+ on the project's chosen Node 22 line.

That defect was not accepted as complete.

## Reproducibility correction

Successful reproducibility workflow:

`33558676755`

The correction verified:

- package version: `0.9.0`;
- lockfile top-level version: `0.9.0`;
- lockfile root package version: `0.9.0`;
- declared Node floor: `>=22.12.0`;
- full Stage 09 product gate rerun successfully;
- security boundary rerun successfully.

Corrected branch commit:

`6ff654b548c7e28ebffc26f16519e23adb5377e4`

## Portable static-build correction

The source audit also identified that the Vite build used the default root-relative asset base. This is valid for root-domain hosts but makes the same build less portable to repository/sub-path hosts.

Stage 09 changes Vite `base` to `./` so static assets are referenced relative to `index.html`.

Successful portable-build full requalification workflow:

`33559155046`

The same Stage 09 test/security gate passed after this change.

## Clean release-candidate verification

The permanent Stage 09 product/test/documentation blobs were assembled directly on top of Stage 08 `main`, excluding all temporary Stage 09 transformation scripts, triggers and verification workflows.

Clean candidate commit:

`7498cbe7e10fbe6df068d7eb91e9793c06284c79`

Clean release verification workflow:

`33560083418`

That exact release candidate passed:

- dependency/Chromium installation;
- **74/74** backend/application tests;
- production web build;
- **26/26** browser touch/voice/hardening cases;
- production dependency audit;
- injection/direct-domain boundary scans;
- clean-tree checks confirming Stage 09 development workflows/scripts were absent from the candidate.

## Dependency/licence observations

The browser application has no third-party runtime dependency declared in `dependencies`.

Current declared development/build/test dependencies are:

- TypeScript 7.0.2 — Apache-2.0;
- Playwright test 1.62.1 — Apache-2.0;
- Vite 8.2.2 — MIT;
- Axe Playwright 4.13.0 — MPL-2.0.

These are build/test dependencies, not claimed as Amazon/Alexa runtime integrations.

The repository itself remains MIT licensed.

## Competition recheck

Official Devpost rules were rechecked on 1 September 2026 and still support:

- the simulated Alexa+ web-app alternate route;
- public open-source repository/source/assets/run instructions;
- public English demo video under three minutes;
- Open Source mini-challenge evidence already prepared in the repository;
- friction-log bonus up to 10%.

AWS Builder remains deliberately deferred and no AWS runtime service is claimed.

## Deployment verification status

Hosted deployment is **not verified yet**.

Vercel is connected, but the exposed chat deployment tool currently has a contract defect: its backend requires deployment target/name/files while the available tool schema does not expose parameters for supplying those required values. No deployment was created through that route.

GitHub Pages is currently disabled. Initial enablement through `actions/configure-pages` requires a token other than normal `GITHUB_TOKEN` with administration/pages permissions; that credential is not available here.

The Stage 09 build is path-portable and reproducible, but a public hosted URL must not be claimed until one of those deployment control paths becomes available and is smoke-tested.

## Completion boundary

Stage 09 hardening functionality and its clean release candidate are verified.

Stage 09 as a whole retains one unresolved external item until a hosted deployment can be created and smoke-tested: **deployment**.

Do not claim complete Stage 09 closure or a deployment URL until that external item is actually resolved.
