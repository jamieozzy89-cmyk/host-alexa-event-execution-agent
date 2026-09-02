# Host — Current Controlled Handover

## One-line continuation rule

Repository: `jamieozzy89-cmyk/host-alexa-event-execution-agent`. `main` is the preserved accepted engineering baseline. The next product-generation work must continue on branch `host-competition-build` once that branch exists. Read this file and the active product specification before changing product state. Git is the controlling source; do not reconstruct project state from chat memory.

## Current controlled state

The user rejected the promoted redesign as insufficient for a serious attempt at winning the Alexa+ track and authorised a full plan for what Host now needs. The authorised direction is **not another CSS/polish pass**. The project is to be developed into a competition-grade stateful Alexa+ execution agent using the existing authoritative engine as the foundation.

The previous source-control inconsistency has been corrected on `main` before beginning the new product generation:

- README no longer describes Stage 09 as the current product;
- Stage 10 submission checklist now distinguishes the promoted baseline from the future competition-final product;
- stale detailed Devpost draft has been intentionally invalidated as a final submission source until the new product exists;
- Stage 10 gallery-capture workflow now targets `main`;
- Stage 10 demo-source workflow now targets `main`;
- Stage 10 gallery-export workflow now targets `main`;
- Stage 10 package workflow now targets `main` and writes `source_branch=main` in package provenance;
- gallery capture no longer fails merely because regenerated screenshots are byte-identical.

No accepted product source was altered during this control cleanup.

## Preserved accepted product baseline

**Project:** Host: Alexa+ Event Execution Agent  
**Competition:** Build, Ship, Shape: Amazon Developer Hackathon 2026  
**Primary track:** Alexa+  
**Current accepted implementation route:** simulated Alexa+ web experience  
**Repository:** `jamieozzy89-cmyk/host-alexa-event-execution-agent`  
**Preserved baseline branch:** `main`  
**Verified product-code commit:** `e80fc18517111e55f3813c4e4eddf1c7428769a2`  
**Former Stage 09 baseline:** `7498cbe7e10fbe6df068d7eb91e9793c06284c79`

The `main` branch contains documentation/control commits after `e80fc18517111e55f3813c4e4eddf1c7428769a2`; those commits do not change the accepted product code.

## Baseline product capabilities

The accepted engineering foundation retains:

- authoritative typed event state and revisions;
- confirmed constraints;
- confirmation-gated menu commitment;
- inventory reconciliation;
- shopping deficit calculation;
- no guessed unit conversion;
- dependency-aware preparation graph;
- action receipts/audit history;
- read-only late-change impact analysis;
- atomic confirmed change application;
- preservation of completed unaffected work;
- reversible actions and concurrency/revision controls;
- versioned JSON persistence with checksum/integrity validation;
- primary/backup/temp recovery behavior;
- persisted event/tasks/receipts;
- safe reload/restart continuation;
- pending uncommitted impacts intentionally not persisted;
- `HostAgentOrchestrator`;
- deterministic heuristic interpreter;
- structured model-backed interpreter interface;
- resilient fallback when preferred model interpretation fails or is low-confidence;
- browser touch UI;
- browser Web Speech input/output when supported;
- voice and typed input routed through the same orchestrator/tool path;
- explicit voice-unavailable fallback;
- privacy/storage controls;
- light/dark themes;
- accessibility/focus hardening;
- seven-state refined gallery evidence;
- silent uninterrupted refined source-recording evidence.

## Permanent execution-integrity rule

> Nothing becomes done because model text, voice output or UI language says it happened. Only validated application/tool/domain state and receipts establish completion.

The competition-grade build must preserve this rule. A model, MCP client, Alexa surface or external service may interpret, request or recommend actions, but it must not create an alternate authoritative mutation path.

Controlled application path remains conceptually:

`user goal -> interpretation/planning -> validated Host tool -> domain validation -> persistence/external result -> receipt/audit -> customer response`

Any new MCP or Alexa integration must terminate at the existing controlled Host tool/runtime boundary rather than calling domain mutation directly.

## Authoritative tool surface

The current 17 Host tools remain the protected application action surface unless a later product specification explicitly requires a new capability and that addition is implemented with matching validation/tests:

1. `create_event`
2. `update_event_constraints`
3. `propose_menu`
4. `commit_menu`
5. `record_inventory`
6. `build_shopping_plan`
7. `prepare_cart`
8. `confirm_cart_action`
9. `build_preparation_plan`
10. `mark_task_complete`
11. `advance_event_status`
12. `get_next_action`
13. `get_event_status`
14. `analyse_change_impact`
15. `apply_confirmed_change`
16. `get_action_history`
17. `undo_reversible_action`

Current descriptors already include schema, risk, mutation and explicit-confirmation metadata, making them a viable foundation for a later MCP adapter after tool/schema review.

## Verified baseline gate

The promoted second editorial refinement passed before promotion:

- dependency install completed with zero vulnerabilities reported in that install/audit output;
- backend/application tests: **74 passed, 0 failed**;
- production TypeScript/Vite build: passed;
- browser tests: **26 passed, 0 failed**;
- browser projects: Echo Show-like 1280×800 and mobile 390×844;
- existing Axe WCAG A/AA scope included and passed;
- seven real product states captured and directly visually examined.

Full refinement gate:

- run: `33581353724`;
- job: `100096132537`;
- refined screenshot commit: `46b537fc3b79fcae20ff59bb49d5d52ccf331ff9`.

Refined gallery artifact:

- ID: `9828517705`;
- SHA-256: `3ebba29dfab769fd46f2bb3f975434498b30d327afb0df42ad726015599fc648`.

Refined source-video artifact:

- ID: `9828582371`;
- SHA-256: `b27c910ecec716437e8a935b0c51b0121395d79588364fe0e1d2ff9312fdee02`;
- silent captioned working-app source evidence only, not a final public competition video.

## Current official competition facts reverified 2 September 2026

Official Devpost rules currently establish:

- submission deadline: **23 October 2026 at 12:00 PM PDT**;
- Alexa+ route: working Agent Skill is **prioritized**;
- Alexa+ also accepts a self-hosted MCP server implementing **MCP 2025-11-25 or later over Streamable HTTP**;
- alternatively, a simulated Alexa+ experience using the entrant's own AI/agentic tools remains explicitly valid and is exempt from the normal runtime-technology-hook requirement;
- final repository must be public/open source and include necessary source/assets/instructions;
- final public demonstration video must be on YouTube or Vimeo and be under three minutes; judges are not required to watch beyond three minutes;
- judging criteria are equally weighted: **Tech Implementation, Design, Potential Impact, Quality of the Idea**;
- Alexa+ creative examples specifically include autonomous/stateful agentic workflows, orchestration across services, purchasing capabilities, media/cards, MCP Apps and Agent Skills;
- a basic single-turn Q&A bot or basic MCP wrapper is explicitly given as an obvious rather than creative example;
- Open Source mini-challenge evidence requires contribution URL, repository URL, GitHub username and what/how/why description;
- genuine friction-log entries can contribute a judging bonus of up to 10%.

Amazon's current Alexa+ MCP documentation also establishes:

- Alexa+ is a multimodal conversational surface where conventional mobile/web density does not translate directly;
- MCP add-ons can use inline, fullscreen and voice-only modes;
- current MCP requirements include Streamable HTTP and minimum MCP specification 2025-11-25;
- MCP Apps are the relevant standard where custom interactive visuals are supplied.

These external requirements are time-sensitive and must be rechecked again before final claims/submission.

## Why the current baseline is not sufficient as the final entry

The current product is a strong controlled execution-engine foundation but remains limited in several ways that materially affect the four judging criteria:

- default interpretation is primarily heuristic;
- current model-backed path is an interface/proxy boundary rather than an active verified live reasoning system;
- no self-hosted MCP server or working Agent Skill is currently implemented or claimed;
- no AWS runtime is currently implemented or claimed;
- current product/menu/product/checkout external services are deterministic simulations;
- temporal execution is not yet rich enough to reason about lateness, slack and event-time pressure as a first-class product capability;
- current UI is still organized around response cards and Plan/Live/Activity surfaces rather than an event operating picture;
- inventory reconciliation, dependency intelligence and preserved-work late-change behavior are stronger in the engine than they appear in the product;
- final deployment, final public video, final gallery and final Devpost entry do not exist.

## Authorised competition-grade direction

The new product generation must be designed and built as a complete execution agent, not as a cosmetic extension of the existing UI.

Required high-level end state:

- goal-directed workflow orchestration so the user does not manually invoke internal workflow steps;
- model-backed structured reasoning with deterministic fallback while retaining authoritative tool boundaries;
- stronger structured recipe/menu knowledge and constraint safety rather than unconstrained model-generated claims;
- standards-compliant MCP path evaluated and implemented if verified feasible, using the existing Host tool runtime rather than duplicating it;
- time-aware event execution and schedule-pressure reasoning;
- one or more real external integrations only where they provide genuine value and can be legally/reliably verified;
- Event Home as the operating picture rather than permanent chat-first layout;
- human-readable inventory reconciliation;
- human-readable Run Sheet built from the preparation dependency graph;
- Live execution as the hero hands-busy experience;
- late-change impact as the signature demonstration of safe agentic replanning;
- Receipts as proof of what actually happened;
- ready/completed event closure;
- voice-only and touch-only complete routes;
- final product testing substantially beyond the existing 74+26 baseline;
- real human usability testing;
- hosted judge-access path where useful/feasible;
- final competition package, gallery, public video and Devpost narrative rebuilt from the final verified product.

## Source-control rule for the next generation

`main` is now the preserved accepted baseline. Do not perform the competition-grade product build directly on `main`.

Create and use:

`host-competition-build`

from the cleaned `main` baseline. Product specification and implementation work belong on that branch until the new generation passes its complete acceptance gates and the user explicitly authorises promotion.

No automatic merge back to `main`.

## Next controlled stage

1. Create branch `host-competition-build` from this cleaned `main` state.
2. Create a full controlling product specification before implementation.
3. The specification must define:
   - product mission and non-negotiable integrity boundaries;
   - complete customer journeys;
   - event lifecycle/state model;
   - goal-directed orchestration behavior;
   - model boundary and structured outputs;
   - recipe/menu knowledge design;
   - inventory/shopping behavior;
   - temporal preparation/execution behavior;
   - MCP architecture and compliance target;
   - external-integration selection criteria;
   - Event Home / menu / shopping / Run Sheet / Live / change impact / Receipts / ready states;
   - voice-only, touch-only, Echo landscape and mobile behavior;
   - error/recovery/undo behavior;
   - privacy/security/data boundaries;
   - verification and human-usability gates;
   - final competition evidence requirements.
4. Do not begin broad product implementation until that specification exists and has been checked against the existing source architecture and current official competition/Alexa+ requirements.
5. Update this handover after the specification stage.

## Current submission-material state

`submission/DEVPOST_STAGE10_DRAFT.md` is intentionally **not a final draft**. It now exists as a control placeholder so stale Stage 09 claims cannot be mistaken for current submission truth.

`submission/SUBMISSION_CHECKLIST_STAGE10.md` has been updated to distinguish baseline evidence from future final-product work.

Existing screenshot, narration, feedback and friction material remain useful historical/baseline evidence but must be refreshed against the actual final product before submission.

## Completion boundary

Do not claim the competition-grade Host is complete, winning-quality, MCP-enabled, Agent-Skill-enabled, AWS-enabled, model-powered, deployed, publicly demonstrated or submitted unless that exact state has been directly produced and verified.
