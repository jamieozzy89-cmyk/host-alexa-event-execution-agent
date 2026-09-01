# Stage 09 — Competition Hardening

Date: 1 September 2026

## Objective

Stage 09 hardens the verified Stage 07 voice-and-touch product for judging and real browser use without changing Host's authoritative execution model.

The permanent product rule remains:

> Conversation, UI and voice may request or describe an action. Only the validated application/tool/domain path can establish that the action actually happened.

Stage 09 focuses on accessibility, privacy, recovery, browser-storage behavior, security boundaries, reproducibility and deployment readiness.

## Hardening baseline

Stage 09 starts from the clean Stage 08 `main` commit:

`7731011dad8a00fe7d92d1af7902e22d8a8a24c2`

That base already contained the accepted Stage 07 product:

- controlled domain/persistence/tool architecture;
- conversational agent/orchestrator;
- Alexa+-style Plan / Live / Activity web UI;
- touch journey;
- browser voice adapter;
- spoken material-action confirmation/cancellation;
- deterministic simulated menu/product/checkout adapters;
- authoritative receipts/history;
- Stage 07 verification: 74 backend/application tests and 14 browser cases.

## Accessibility hardening

### Focus continuity

Stage 09 adds explicit focus recovery after asynchronous rerenders:

- composer focus returns after typed submission;
- mode changes focus the relevant Live/Activity heading;
- confirmation flows move focus to a meaningful current control/context;
- expanded shopping dialogs focus their Close control when opened;
- closing the detail dialog restores focus to its opening button.

This prevents the single-page rerender model from silently dropping keyboard users back to the document body.

### Dialog semantics

The detail dialog now provides:

- native `<dialog>` behavior;
- `aria-modal="true"`;
- an explicit `aria-labelledby` relationship to its visible title;
- initial focus inside the dialog;
- Escape/close handling with focus restoration.

### Status announcements

The full reconstructed conversation log is no longer an `aria-live` region. Instead, Host exposes one visually hidden polite `role="status"` node containing only the latest assistant/status message.

This prevents a screen reader from repeatedly re-announcing the entire conversation after every UI rerender.

### Scrollable transcript

Axe identified that the scrollable transcript region required keyboard access. Stage 09 makes the transcript focusable while retaining its accessible name.

### Voice unavailable state

An unavailable voice control is no longer removed from keyboard focus with the native `disabled` attribute. It uses `aria-disabled="true"`, retains an accessible description, and does not execute when activated.

Touch/keyboard controls remain the complete fallback path.

### Automated accessibility coverage

`@axe-core/playwright` 4.13.0 is a development/test dependency.

`tests/web/hardening-ui.spec.ts` runs automated WCAG A/AA checks across:

- the initial experience;
- active event/menu content;
- material-action confirmation state;
- Activity/data-and-privacy state.

These automated scans are a control, not a claim of complete manual accessibility certification.

## Privacy and browser-storage hardening

### Current deterministic data boundary

The current non-AWS/non-live-model Host web application keeps authoritative event state in browser storage. The current deterministic core journey does not require a Host backend service.

Stage 09 adds a customer-facing **Data & privacy** surface explaining that:

- event details are stored in the current browser;
- the current Host build does not send plan data to a Host application server;
- browser/platform speech recognition may send audio to the browser/platform speech service;
- Host itself does not store audio recordings;
- saved event data can be deleted from the Host UI.

This wording deliberately does not claim that browser speech recognition is always local/offline.

### Scoped data deletion

The new clear-data control deletes only Host event persistence keys:

- `host:ui:active-event`
- `host:v1:event:*`

It does not call `localStorage.clear()` and therefore does not delete unrelated site/browser state. The Host theme preference is deliberately preserved by the tested clear-event action.

Deletion is confirmation-gated in the UI.

### Persistent-storage failure

Stage 09 probes browser local storage before constructing the persistence adapter. If storage access is blocked, Host falls back to an in-memory `Storage` implementation and clearly warns that the plan will last only until the page closes.

This keeps the app usable without pretending persistence succeeded.

### Corrupt persisted-state recovery

If an active event cannot be restored safely after the persistence adapter exhausts its valid recovery candidates:

- Host removes the active-event pointer so the broken event is not treated as current;
- the corrupt event snapshot is left untouched rather than silently deleted;
- Host returns to a usable fresh planning state;
- a visible recovery notice tells the user that the saved plan could not be restored and can be deliberately cleared from Data & privacy.

This preserves evidence/recovery options while avoiding a blank or misleading application.

## Browser security hardening

Stage 09 automated controls verify:

- no `innerHTML` assignment in the web UI;
- no `insertAdjacentHTML`;
- no `document.write`;
- no direct `HostDomainEngine` or `validateHostState` access from `web/`;
- no direct web imports from `src/domain`, `src/persistence` or `src/tools`;
- the browser remains behind the supported application/agent boundary;
- `npm audit --omit=dev` reports zero production dependency vulnerabilities at the verified Stage 09 gate.

The document also now sets a `no-referrer` referrer policy through HTML metadata.

## Network-boundary test

A Stage 09 Playwright scenario observes browser requests through event setup, menu commitment, shopping-plan creation and demo-product selection. It rejects unexpected cross-origin application requests.

This proves the current deterministic tested journey is not quietly sending Host event data to an application backend or analytics endpoint.

It does **not** attempt to prove browser/vendor speech-recognition network behavior, which is why voice privacy is disclosed separately.

## Reproducibility hardening

Stage 09 pins/retains:

- TypeScript `7.0.2`;
- Playwright `1.62.1`;
- Vite `8.2.2`;
- Axe Playwright `4.13.0`.

Package version and root lockfile metadata are both `0.9.0`.

The project declares Node.js `>=22.12.0`, matching the actual Vite 8 engine floor used by the build.

A clean checkout is intended to use:

```bash
npm ci
npm test
npm run build:web
npx playwright install --with-deps chromium
npm run test:web
```

`npm run verify:stage09` runs the backend/application, web build and browser suites once browser dependencies are installed.

### Portable static build

The Vite base path is `./`, so generated static asset references are relative rather than assuming deployment at domain root `/`.

The production output directory remains `dist-web/`.

This keeps the same verified build suitable for root-domain hosting or repository/sub-path static hosting without a product-code fork.

## Verification history

Stage 09 intentionally failed closed several times before acceptance:

1. the first Axe test used the wrong TypeScript import form;
2. the first expanded browser run exposed:
   - a real Axe scrollable-region keyboard-access issue;
   - a real corrupt-storage recovery-path gap;
   - existing visual assertions made ambiguous by the new separate screen-reader status node;
3. source audit later found package/lock root-version drift and an inaccurate Node engine floor.

Those issues were corrected and the full relevant gates rerun rather than waived.

Verified final functional evidence:

- backend/application tests: **74 passed, 0 failed**;
- production web build: passed;
- complete browser suite: **26 passed, 0 failed**;
- Axe WCAG A/AA representative surfaces: passed;
- production dependency audit: zero vulnerabilities;
- injection/direct-domain boundary scans: passed.

Permanent verification evidence is in `reports/STAGE09_VERIFICATION.md`.

## Current competition recheck

Official Devpost rules were rechecked on 1 September 2026.

Still controlling:

- deadline: 23 October 2026 at 12:00pm PDT;
- the simulated Alexa+ web-experience route remains explicitly valid and exempt from the normal Alexa+ runtime technology-hook requirement;
- public open-source repository/source/assets/run instructions remain required;
- demo video remains public YouTube/Vimeo, English, under three minutes;
- Open Source still requires contribution URL, repository URL, GitHub username, and what/how/why description;
- friction logs can still contribute up to a 10% judging bonus;
- one project can win one primary-track prize plus one mini-challenge prize.

Open Source remains selected. AWS Builder remains deliberately deferred for now and must not be claimed.

## Deployment status

The release is **deployment-ready but not yet truthfully hosted** from this environment.

### Vercel

The user connected Vercel. The connected deployment backend requires a target, project name and file tree, but the available chat tool schema currently exposes none of those arguments. The wrapper therefore cannot receive the exact verified artifact set through this chat surface.

No Vercel deployment is claimed.

### GitHub Pages

The repository currently has Pages disabled. GitHub's `configure-pages` action can enable a repository only when supplied a token other than the normal `GITHUB_TOKEN` with the required administration/pages permissions. That enabling credential is not available to the workflow in this environment.

No GitHub Pages deployment is claimed.

The inability to publish a hosted URL is an external deployment-control limitation, not evidence that a deployment occurred.

## Stage 09 release boundary

Stage 09 hardening functionality and the clean product/test release have been independently verified. Hosted deployment remains separately unresolved until a working hosting-control path is available and smoke-tested.
