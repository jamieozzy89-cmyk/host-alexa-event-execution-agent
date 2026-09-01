# Host — Stage 10 Submission Handover

Updated: 1 September 2026

## Purpose

This file is the self-contained continuation record for the final competition-submission stage. It is intended to let another controlled session continue Stage 10 without relying on chat history.

## Product identity

**Project:** Host: Alexa+ Event Execution Agent

**Competition:** Build, Ship, Shape: Amazon Developer Hackathon 2026

**Primary track:** Alexa+

**Implementation route:** Simulated Alexa+ web experience

**Selected mini challenge:** Open Source

**AWS Builder:** deliberately deferred; no AWS runtime integration is currently claimed

**Public repository:** https://github.com/jamieozzy89-cmyk/host-alexa-event-execution-agent

## Accepted public product release

Public `main` currently points to the clean Stage 09 release:

`7498cbe7e10fbe6df068d7eb91e9793c06284c79`

Published-main clean verification after release:

- `npm ci --ignore-scripts`: passed;
- backend/application regression: **74/74 passed**;
- production Vite build: passed;
- production dependency audit: **0 vulnerabilities**;
- web injection/direct-domain boundary scan: passed.

The exact clean Stage 09 release candidate had already passed the independent full browser gate:

- Chromium browser touch/voice/hardening cases: **26/26 passed**;
- Echo Show-like 1280×800 configuration;
- mobile 390×844 configuration;
- automated Axe WCAG A/AA checks included;
- clean/security boundary checks passed.

Do not replace the clean-release evidence with a Stage 10 working-branch commit when describing the product release.

## Current Stage 10 branch

Working branch:

`stage10-submission`

The branch contains submission artifacts and reproducible screenshot-capture tooling. It is not yet the public product release and should not be merged wholesale into `main` until temporary Stage 10 workflow/trigger files are removed or deliberately retained.

The screenshot capture commit was:

`f5c63a6dc6fd3bbaeb25502e38892c5f9932717a`

Later Stage 10 documentation commits may advance the branch; always re-read the branch head before writes.

## Current competition controls

Official Devpost requirements were rechecked on 1 September 2026.

For the selected simulated Alexa+ web route, current controlling points are:

- the simulated web experience route is explicitly allowed;
- no specific Alexa framework/SDK is required for that route if the repository contains the simulation source and the demo clearly shows it working;
- public GitHub source/assets/run instructions and an open-source licence are required;
- final demo video must be public, English and under three minutes;
- product/tool feedback is part of the submission requirement;
- Alexa+ primary track must be selected;
- Open Source mini challenge requires contribution URL, repo URL, GitHub username and short what/how/why fields;
- friction logs can add up to 10% judging bonus;
- hosted deployment is useful but must not be invented or represented as required when the current simulated-route rules do not require it.

Deadline previously verified:

**23 October 2026 at 12:00pm PDT.**

Recheck the live competition page and rules immediately before final submission.

## Stage 10 material already prepared

### Devpost narrative

`submission/DEVPOST_STAGE10_DRAFT.md`

Contains:

- project identity/tagline;
- full Inspiration / What it does / How we built it narrative;
- execution-integrity explanation;
- challenges/accomplishments/learnings/next steps;
- verified Built With list;
- judging-criteria framing;
- required-field control.

The draft deliberately excludes AWS, Bedrock, AgentCore, MCP, physical Alexa, real Amazon retail/payment/grocery integrations and a live LLM provider because none is part of the verified release.

### Product/tool feedback

`submission/PRODUCT_FEEDBACK_STAGE10.md`

Contains grounded feedback for:

- Alexa+ simulated-experience route;
- Alexa+ accessibility guidance;
- Alexa+ components/patterns guidance;
- browser Web Speech API disclosure/experience;
- proposed first-party simulated Alexa+ starter/compliance harness.

Do not turn unrelated GitHub/Vercel infrastructure issues into Amazon product feedback.

### Friction logs

`submission/FRICTION_LOG_STAGE10.md`

Four grounded drafts covering:

1. route/compliance requirements split across generic and simulated-route language;
2. mapping production Alexa+ design guidance onto the web-simulation route;
3. reproducible voice-only verification for a simulated route;
4. generic repository technology wording versus the explicit simulation exception.

Each entry preserves task / steps / expected / actual / severity / workaround / actionable suggestion.

### Demo video

`submission/DEMO_VIDEO_SCRIPT_STAGE10.md`

Target runtime: **2:40–2:50** with a hard under-three-minute control.

Planned sequence:

- hook;
- six-person dinner event creation;
- menu proposal/confirmation;
- authoritative shopping and explicitly simulated checkout;
- Live Mode;
- late seventh vegan guest impact preview and confirmed replan;
- Activity receipts;
- voice parity;
- close with verification evidence.

Video has not yet been recorded/uploaded. Do not claim a demo-video URL until the final public YouTube/Vimeo version has been watched end-to-end after processing.

### Open Source mini evidence

`submission/OPEN_SOURCE_MINI_EVIDENCE.md`

Refreshed to the Stage 09 release and current verification figures.

Controlled contribution/release URL:

https://github.com/jamieozzy89-cmyk/host-alexa-event-execution-agent/commit/7498cbe7e10fbe6df068d7eb91e9793c06284c79

Current Devpost-ready proof includes:

- public repository;
- GitHub username `jamieozzy89-cmyk`;
- MIT licence;
- repository created during the hackathon window;
- substantive source/product contribution;
- current 74 backend + 26 browser verification evidence;
- what/how/why response.

### Submission checklist

`submission/SUBMISSION_CHECKLIST_STAGE10.md`

Contains current product/repo, narrative, mini challenge, feedback, friction, screenshot, video, deployment and final-integrity controls.

### Screenshot shot list and index

`submission/SCREENSHOT_SHOTLIST_STAGE10.md`

`submission/GALLERY_INDEX_STAGE10.md`

The index records the actual generated files, resolutions, URLs, proposed order and captions.

## Generated gallery screenshots

Successful capture workflow:

`33564617297`

The workflow:

1. checked out `stage10-submission`;
2. installed dependencies/Chromium;
3. reran `npm test`;
4. reran `npm run build:web`;
5. started the built app with Vite preview;
6. drove actual Host UI states using Playwright;
7. generated seven screenshots;
8. validated them as PNG files and checked dimensions;
9. committed them to the Stage 10 branch.

Files:

1. `submission/screenshots/01-hero-event-created.png` — 1280×800
2. `submission/screenshots/02-menu-confirmation.png` — 1280×800
3. `submission/screenshots/03-authoritative-shopping.png` — 1280×800
4. `submission/screenshots/04-live-mode.png` — 1280×800
5. `submission/screenshots/05-late-change-impact.png` — 1280×800
6. `submission/screenshots/06-activity-receipts.png` — 1280×800
7. `submission/screenshots/07-mobile-live.png` — 390×844

These are real application screenshots, not mockups.

### Remaining screenshot gate

A full human/visual gallery audit is still required before final upload. The capture and file validation prove application provenance and dimensions, but they do not alone prove that every crop is the strongest marketing choice.

Do not mark the gallery final until the images have been inspected for clipping, legibility, transient UI, simulation disclosure and thumbnail impact.

## Deployment state

Hosted deployment remains unresolved but is not currently treated as a blocker to continued submission preparation.

Verified build controls:

- production static build succeeds;
- Vite uses relative `./` asset paths for portable root/subpath hosting.

Known deployment-interface blockers:

- connected Vercel chat wrapper requires target/name/files internally but its exposed action schema did not provide those required inputs;
- GitHub Pages is disabled and first-time activation through the normal repository workflow token lacks the required administration/pages permission.

No hosted URL exists. Do not invent one.

If a valid deployment path becomes available later, deploy the exact verified product source/build and smoke-test Plan, menu, shopping, Live, late change, Activity, mobile, keyboard and voice/fallback before listing the URL.

## AWS state

The user has an AWS account but explicitly chose to continue without AWS for now.

No AWS runtime integration is implemented or claimed.

If revisited later, the only selected architecture worth pursuing is:

- Bedrock behind the existing structured intent/model boundary;
- AgentCore Memory for **non-authoritative preferences only**.

Do not allow memory/model output to silently create confirmed allergens/diets, completed tasks, committed menus or transaction state.

## Remaining Stage 10 work

### Can be completed in-project

- audit/refine final Devpost prose against actual field limits if the form exposes them;
- keep Open Source evidence synchronized with final release evidence;
- finalize friction/feedback wording for exact form fields;
- visually audit/select gallery images when a suitable visual inspection path is available;
- remove temporary Stage 10 capture workflow/trigger before any permanent release merge;
- maintain this Stage 10 handover/checklist as state changes.

### Requires external/user-facing platform work

- record the demo video from a real working run;
- edit to under three minutes;
- upload public English version to YouTube/Vimeo;
- visually watch final uploaded stream after processing;
- enter/copy final content into Devpost;
- choose Alexa+ primary and Open Source mini challenge;
- upload final gallery images;
- fill feedback/friction fields;
- submit and verify the saved Devpost project page.

These actions must not be claimed as complete until actually performed on the external platforms.

## Exact continuation point

Continue Stage 10 from the current `stage10-submission` branch.

Priority order:

1. visually audit the seven generated screenshots and lock gallery order/crops;
2. inspect actual Devpost field limits/layout if accessible and adapt the controlled drafts without losing substantive content;
3. prepare the final demo recording package and run sheet;
4. resolve deployment only if a supported path becomes available — do not stall the submission route solely for hosting;
5. remove temporary Stage 10 capture workflow/trigger before publishing permanent Stage 10 repository materials;
6. complete the final rules/integrity audit immediately before submission.
