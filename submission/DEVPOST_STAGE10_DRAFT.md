# Stage 10 — Devpost Submission Draft

Prepared: 1 September 2026

This file is a controlled draft for the Build, Ship, Shape: Amazon Developer Hackathon 2026 submission. Replace only fields explicitly marked `PENDING` after they are actually available. Do not add AWS, a live commerce provider, a physical Alexa device, or a hosted URL unless that integration has been implemented and verified.

## Submission identity

**Project name:** Host: Alexa+ Event Execution Agent

**Tagline / elevator pitch:**

A stateful Alexa+ hosting agent that turns “people are coming over” into a plan that is actually executed — menu, shopping, prep, late changes and hands-busy guidance — while tracking what really happened.

**Primary track:** Alexa+

**Implementation route:** Simulated Alexa+ experience in a web app

**Mini challenge:** Open Source

**Repository:** https://github.com/jamieozzy89-cmyk/host-alexa-event-execution-agent

**Current clean verified release:** `7498cbe7e10fbe6df068d7eb91e9793c06284c79`

**Hosted project URL:** `PENDING — do not claim until deployed and smoke-tested`

**Demo video URL:** `PENDING — public YouTube or Vimeo, English, under 3 minutes`

---

# Project description

## Inspiration

Hosting is rarely difficult because people cannot make a list. It becomes difficult because the plan changes while real work is happening.

A guest is added. A dietary constraint appears. Something thought to be in the cupboard is missing. Prep tasks depend on other prep tasks. The host is cooking with wet hands and cannot keep checking a screen. A conversational assistant can sound helpful in that situation, but a confident sentence is not evidence that anything actually happened.

Host was built around a stricter idea:

> Nothing becomes done because an AI says it is done.

The assistant can interpret, propose and explain. Authoritative application state decides what is committed, purchased in the simulation, completed, changed or reversed.

## What it does

Host is an Alexa+ event-execution simulation for people hosting at home. It takes an event from initial intent through execution instead of stopping after planning.

A host can:

- describe the event naturally;
- confirm guest count, timing, budget and dietary/allergen constraints;
- review menu options and explicitly commit one;
- reconcile confirmed inventory against required quantities;
- build an authoritative shopping list;
- review deterministic demo product choices;
- run a clearly labelled simulated checkout only after confirmation;
- generate dependency-aware preparation tasks;
- switch to a hands-busy Live view that presents the current next task;
- use touch, keyboard or browser voice where supported;
- add a late guest or constraint and see the impact before anything changes;
- confirm bounded replanning while preserving unaffected completed work;
- inspect Activity receipts showing what really succeeded, failed or was reversed;
- reload the app and resume persisted event state without reviving stale confirmations.

The primary demo scenario starts with six dinner guests, including one vegetarian guest and a nut allergy. Mid-flow, a seventh vegan guest is added. Host does not rebuild blindly. It analyses the impact first, shows the affected menu/shopping/prep state, requires confirmation, then applies the change through the same controlled execution path.

## How we built it

Host is written in TypeScript and deliberately separates natural-language interaction from execution truth.

The authoritative mutation path is:

`user intent -> agent chooses controlled tool -> schema validation -> domain validation -> execution -> persistence -> receipt/audit -> customer response`

The product contains:

- a typed authoritative domain/state engine with revision controls and invariants;
- persistence with checksum/schema validation and recovery behavior;
- 17 validated application tools covering event creation, constraints, menu, inventory, shopping, prep, status, change analysis, confirmed replanning, history and undo;
- `HostAgentOrchestrator`, which interprets requests but has no direct domain-mutation route;
- explicit confirmation gates for material and transaction-like actions;
- deterministic simulation adapters for menu proposals, product candidates and checkout;
- a responsive Alexa+-inspired Plan / Live / Activity web interface;
- browser speech recognition/synthesis where supported, routed through the same orchestrator as typed input;
- local browser persistence with explicit temporary-memory fallback when persistent storage is unavailable;
- customer-safe action receipts;
- accessibility, recovery, privacy and security controls added during hardening.

For the Alexa+ simulation route, the interface follows current Alexa+ design principles where they transfer to the web simulation: voice-only and touch-only completion paths, 48×48 px minimum touch targets, concise speech plus structured screen detail, list-style shopping/task presentation, comparison cards, explicit confirmations and follow-up status evidence.

## Why the architecture matters

Agent demos often allow generated language to become state implicitly. Host does not.

A model or heuristic interpreter can suggest an intent, but it cannot mark a task complete or claim a transaction succeeded. The tool/domain layer validates the action, persists authoritative state and emits evidence. If persistence fails, the mutation is rolled back. If a late-change analysis becomes stale, it cannot be applied. If checkout fails, the shopping state cannot become purchased merely because the conversation sounds successful.

That pattern is applicable beyond hosting to any assistant managing mutable plans, tasks or transactions.

## Challenges we ran into

### Keeping language separate from execution truth

The largest design challenge was resisting the usual chatbot shortcut of treating the assistant response as the result. Host instead carries revisions, confirmation state, receipts and persistence through every material action.

### Late changes without destroying completed work

A realistic host changes the plan while work is already complete. The change system therefore has a read-only impact phase followed by a confirmed atomic apply phase. Completed tasks are preserved only when their definitions remain unaffected.

### Making voice trustworthy, not decorative

Voice recognition is only an input adapter. Recognized speech is routed into the same orchestrator/tool path as typed input. Spoken “done” resolves against the authoritative current next task, and spoken menu selection still requires confirmation.

### Recovery and accessibility

Hardening exposed issues that functional happy-path tests did not: focus loss after SPA rerenders, dialog focus lifecycle, corrupt browser state, blocked persistent storage and overly broad live-region announcements. These were treated as product defects and fixed before the release candidate was accepted.

## Accomplishments that we're proud of

- A complete execution architecture rather than a scripted chat demo.
- 17 controlled application tools with strict validation and confirmation semantics.
- Read-only late-change analysis followed by bounded confirmed replanning.
- Voice and touch sharing the same authoritative execution path.
- Persistent restart/reload recovery with stale confirmations intentionally discarded.
- Customer-readable receipts proving what actually happened.
- Explicit simulation boundaries: demo products and checkout never masquerade as real commerce.
- A hardened interface with keyboard focus controls, Axe WCAG A/AA automated checks, privacy/storage controls and recovery paths.
- **74/74 backend/application tests passing.**
- **26/26 Chromium browser touch/voice/hardening cases passing** across Echo Show-like and mobile configurations.
- Zero production dependency vulnerabilities at the verified release gate.

## What we learned

The most important lesson was that useful agentic UX is not just better language generation. The difficult part is controlling the boundary between interpretation and consequence.

A good assistant needs to know the difference between:

- a proposal and a commitment;
- a conversation claim and a persisted fact;
- a completed task and a suggested next task;
- a safe reversible change and an old action that can no longer be undone;
- a failed provider operation and a successful-looking response.

We also found that multimodal parity changes architecture. Voice cannot depend on a user seeing numbered buttons or current screen context, and touch cannot depend on speech being available. Both input modes need to terminate in the same controlled application state.

## What's next

The hackathon build intentionally keeps external commerce and AWS out of the verified core rather than pretending mocked integrations are real.

Logical future extensions include:

- real grocery/provider adapters behind the existing cart boundary;
- a live model provider behind the existing structured intent interface;
- optional Bedrock interpretation plus AgentCore Memory for non-authoritative cross-event preferences if the AWS Builder route is later activated;
- real smart-home or calendar adapters through explicit permissioned tools;
- deployment and real-device/browser compatibility testing across a broader hardware matrix.

The execution-control rule remains the same: external intelligence may interpret or recommend, but authoritative state and tool results remain the source of truth.

---

# Built With

List only technologies actually present in the verified repository:

- TypeScript
- Node.js
- Vite
- HTML
- CSS
- Browser Web Speech API (`SpeechRecognition` / speech synthesis where available)
- Web Storage / `localStorage`
- Playwright
- Axe / `@axe-core/playwright`
- GitHub / GitHub Actions
- Alexa+ design and accessibility guidance

**Do not list:** AWS, Amazon Bedrock, AgentCore, MCP, a physical Alexa device, Amazon retail APIs, grocery APIs, payment APIs or a live LLM provider. They are not part of the current verified release.

---

# Judging-criteria framing

## Tech Implementation

Lead with the authoritative state architecture, strict tools, revisions, persistence, read-only change analysis, confirmations, rollback/recovery, receipts and the 74 + 26 verification evidence.

## Design

Lead with the user-facing execution journey: concise conversation, glanceable structured cards, Plan / Live / Activity, touch/voice parity, explicit confirmations, large hands-busy controls and hardening work.

## Potential Impact

Frame Host as useful to ordinary people hosting meals/gatherings, then broaden the architectural lesson: assistants that manage real mutable work need proof of execution rather than conversational confidence.

## Quality of Idea

Emphasize the shift from “AI event planner” to **execution agent with authoritative truth**. The novelty is not generating a menu; it is safely carrying the host from intent through changing real-world work while proving state.

---

# Required-field control

Before submission confirm:

- project text description is entered;
- public GitHub repository is entered;
- repository About area visibly shows the open-source licence if Devpost interprets the rule literally;
- public English demo video is under three minutes;
- product/tool feedback is entered;
- Alexa+ primary track is selected;
- Open Source mini challenge is selected;
- Open Source contribution URL, repo URL, GitHub username and what/how/why response are entered;
- friction logs are entered if the final submission form exposes them;
- any requested pre-existing-project question states that Host was created during the hackathon window;
- hosted URL is entered only if one has actually been deployed and smoke-tested;
- AWS Builder is not selected unless a real AWS integration is later implemented and verified.
