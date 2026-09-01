# Host: Alexa+ Event Execution Agent

**Competition:** Build, Ship, Shape: Amazon Developer Hackathon 2026
**Primary track:** Alexa+ — simulated Alexa+ web experience
**Current verified state:** Stage 09 hardening functionality verified; hosted deployment pending

Host turns an agreed hosting plan into authoritative execution state across menu, shopping, preparation, late changes and live hands-busy guidance.

> From “people are coming over” to “everything is actually ready.”

Nothing becomes done because the model, voice output or UI says it is done. Only the validated tool/domain path establishes completion.

## Verification

- backend/application: **74/74**
- browser touch/voice/hardening: **26/26**
- production build: passed
- Axe representative WCAG A/AA checks: passed
- production dependency audit: zero vulnerabilities
- web injection/direct-domain scans: passed

See `docs/HARDENING_STAGE09.md`, `reports/STAGE09_VERIFICATION.md`, and `HANDOVER.md`.

## Competition status

- Open Source mini challenge: selected; evidence in `submission/OPEN_SOURCE_MINI_EVIDENCE.md`.
- AWS Builder: deliberately deferred; no AWS runtime integration claimed.

## Run

Node.js 22.12+ and npm:

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

## Boundaries

Menu proposals, product candidates and checkout are deterministic simulations. Browser speech recognition is optional browser/platform functionality. No real payment, Amazon retail, AWS runtime or physical Alexa integration is currently claimed.

## Deployment

The static build is reproducible and path-portable, but **no hosted URL is verified**. Deployment remains the unresolved Stage 09 item.
