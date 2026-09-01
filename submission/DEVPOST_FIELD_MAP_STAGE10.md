# Stage 10 — Devpost Field Map

Verified: 2 September 2026 against the current Amazon hackathon rules and Devpost Help Center submission documentation.

This file maps the prepared Host material to the fields Devpost currently documents. It separates **verified platform constraints** from hackathon-specific content so the final entry does not discover basic format limits at submission time.

## Step 1 — Manage team

No project-copy field.

Current control: enter only the actual entrant/team members. Do not add placeholder collaborators.

## Step 2 — Project Overview

### Project name

**Host: Alexa+ Event Execution Agent**

### Project tagline

Devpost documents a **140-character maximum**.

Locked tagline — **100 characters**:

> An Alexa+ hosting agent that executes menu, shopping and prep while tracking what actually happened.

The longer elevator pitch remains useful in the project story but must not be pasted into the capped tagline field.

### Project Gallery thumbnail

Devpost documents:

- JPG, PNG or GIF;
- maximum 5 MB;
- **3:2 recommended ratio**.

Prepared thumbnail:

`host-stage10-thumbnail-3x2.png`

Verified local asset:

- 1200 × 800 (3:2);
- PNG;
- approximately 268 KB;
- derived from the visually strongest real-app Live Mode capture;
- preserves the Alexa+ simulation label, Live navigation, current next action and large hands-busy task control.

The thumbnail is a presentation derivative of the real application screenshot, not a mock product screen.

## Step 3 — Project Details

### Project story

Use the substantive Markdown story in:

`submission/DEVPOST_STAGE10_DRAFT.md`

Recommended visible heading order:

1. Inspiration
2. What it does
3. How we built it
4. Why the architecture matters
5. Challenges we ran into
6. Accomplishments that we're proud of
7. What we learned
8. What's next

Devpost's current public participant guidance confirms Markdown support. No public official story-character maximum was found in the currently accessible Devpost submission guidance, so do not arbitrarily compress the story before seeing the actual form.

### Built With tags

Devpost documents a **25-tag maximum**.

Use only verified technologies:

1. TypeScript
2. Node.js
3. Vite
4. HTML
5. CSS
6. Web Speech API
7. Web Storage
8. Playwright
9. Axe
10. GitHub
11. GitHub Actions

If the form offers a sponsor-specific Alexa+ tag, add **Alexa+** while remaining under 25.

Do **not** add AWS, Bedrock, AgentCore, MCP, physical Alexa hardware, Amazon retail APIs, grocery/payment APIs, or a live LLM provider; those are not part of the verified release.

### Try it Out link

A hosted project URL is not currently verified.

Current control:

- leave this blank if optional;
- do not invent a deployment URL;
- do not replace the required code-repository field with an unverified app URL.

The official hackathon rules say the simulated Alexa+ route can be evaluated through the public source repository and working demonstration video; projects do not need to be publicly available to all participants/viewers.

### Image Gallery

Locked six-image order from the direct visual audit:

1. `04-live-mode.png`
2. `05-late-change-impact.png`
3. `06-activity-receipts.png`
4. `03-authoritative-shopping.png`
5. `01-hero-event-created.png`
6. `07-mobile-live.png`

Reserve only:

- `02-menu-confirmation.png`

Use the captions in `submission/GALLERY_INDEX_STAGE10.md`.

### Video demo link

Required by the Amazon rules:

- public YouTube or Vimeo;
- English;
- under three minutes;
- must clearly show the simulated Alexa+ experience working.

Current value: **PENDING**.

A verified uninterrupted real-app source run has been recorded, but it is not yet the final public narrated/self-explanatory upload.

## Step 4 — Amazon hackathon Additional Details

The current Amazon rules require the following information even though the exact logged-in form layout is not publicly visible.

### Public code repository

https://github.com/jamieozzy89-cmyk/host-alexa-event-execution-agent

Current verified product release:

`7498cbe7e10fbe6df068d7eb91e9793c06284c79`

### New or existing project

**New project created during the hackathon window.**

GitHub repository creation timestamp:

`2026-09-01T02:23:58Z`

### Primary track

**Alexa+**

Implementation route:

**Simulated Alexa+ web experience using agentic tools.**

### Mini challenge

**Open Source**

Do not select AWS Builder unless a real AWS integration is later implemented and reverified.

### Product Feedback

Use/adapt:

`submission/PRODUCT_FEEDBACK_STAGE10.md`

Amazon currently requires feedback covering:

- which developer tools/APIs/SDKs were used and for what;
- what worked well;
- what needs work;
- onboarding experience;
- whether the entrant would build with the devices/services again and why.

### Open Source required fields

Use:

`submission/OPEN_SOURCE_MINI_EVIDENCE.md`

Required values include:

- contribution URL;
- project repository URL;
- GitHub username;
- description of what was done, how it works and why it matters.

### Feature request

Optional.

Use only if the form exposes it and the prepared request remains relevant. Amazon currently asks for description, why it matters and priority rating (Critical / Important / Nice-to-have).

### Friction logs

Optional but strategically valuable: current rules state qualifying friction logs can contribute up to a **10% judging bonus**.

Use only genuine entries from:

`submission/FRICTION_LOG_STAGE10.md`

Preserve:

- specific task attempted;
- steps taken;
- expected result;
- actual result;
- severity;
- workaround;
- actionable suggestion.

## Repository metadata check

GitHub metadata directly reports:

- visibility: public;
- detected licence: **MIT License**;
- default branch: main;
- language: TypeScript.

This satisfies the core licence-detection evidence required by the rules.

Minor presentation issue:

- repository description is currently blank;
- repository topics are currently empty.

Neither is listed as a submission requirement, but adding a concise About description/topics would improve public presentation if a supported repository-metadata edit route is available.

## Final field controls

Before pressing Submit:

1. Re-open the live rules and confirm no field/track requirement changed.
2. Use the 100-character tagline, not the longer story pitch.
3. Upload the 3:2 thumbnail and inspect Devpost's crop.
4. Use the locked six-image gallery order.
5. Paste the story in Markdown and preview it.
6. Keep Built With to verified technologies only.
7. Leave Try it Out blank unless a real hosted URL exists.
8. Enter the public GitHub repository and Stage 09 release evidence.
9. Select Alexa+ and Open Source.
10. Enter Product Feedback and genuine friction logs.
11. Insert the public YouTube/Vimeo URL only after the final video is processed and watched end-to-end.
12. Do not claim AWS or real commerce integrations.
