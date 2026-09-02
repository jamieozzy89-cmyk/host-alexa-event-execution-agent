# Host Competition Product Specification v1

**Status:** ACTIVE CONTROLLING PRODUCT SPECIFICATION  
**Branch:** `host-competition-build`  
**Baseline source commit:** `65a664ba60093991e47766c80cb5c365847f04a9`  
**Verified baseline product-code commit:** `e80fc18517111e55f3813c4e4eddf1c7428769a2`  
**Competition:** Build, Ship, Shape: Amazon Developer Hackathon 2026  
**Primary track:** Alexa+  
**Selected mini challenge:** Open Source  
**Specification purpose:** define the finished competition-grade Host product before implementation so development cannot collapse into another shallow UI or feature pass.

---

# 1. Authority and source order

This specification controls the next Host product generation.

Priority order:

1. current explicit user instruction;
2. repository-root `HANDOVER.md` on `host-competition-build` once updated for this stage;
3. this product specification;
4. current accepted source architecture and tests;
5. official current Amazon/Devpost Alexa+ rules and Alexa+ developer documentation;
6. implementation work.

Do not change the end-state because a smaller implementation appears easier.

Do not replace the required product with a prototype, thin demo, visual mock, partial route or isolated capability.

Do not add external-service claims before real implementation and verification exist.

---

# 2. Product mission

Host is not an event-planning chatbot.

Host is the execution agent responsible for carrying a home-hosting event from initial intent to verified readiness while the customer remains in control of consequential decisions.

Core promise:

> From “people are coming over” to “everything is actually ready.”

The product must continuously answer three customer questions without requiring the customer to understand Host's internal workflow:

1. **What is happening?**
2. **What needs attention?**
3. **What should I do next?**

The finished product must make the event itself the center of the experience. Conversation is an input and explanation mechanism, not the information architecture.

---

# 3. Competition target

The goal is not merely to qualify for submission.

The target is a credible first-place Alexa+ entry across all four equally weighted judging criteria:

- Tech Implementation;
- Design;
- Potential Impact;
- Quality of the Idea.

Current official rules, reverified 2 September 2026, explicitly distinguish obvious Alexa+ work such as a single-turn Q&A bot or basic MCP wrapper from creative work such as:

- autonomous/stateful agentic workflows;
- orchestration across services;
- purchasing capabilities;
- media/cards;
- MCP Apps;
- Agent Skills.

Therefore Host must expose the sophistication of its stateful execution architecture as a complete customer experience rather than relying on test counts or architecture prose to carry the entry.

---

# 4. Non-negotiable integrity rules

## 4.1 Execution truth

Permanent rule:

> Nothing becomes done because model text, Alexa speech, UI copy or an external client says it happened. Only validated Host tool/domain state and verified external results establish completion.

## 4.2 One authoritative mutation path

No new integration may mutate Host's authoritative domain state directly.

The protected path is:

`customer goal -> interpretation/planning -> validated Host tool -> domain validation -> persistence/external result -> receipt/audit -> customer response`

MCP, model, Alexa, web, voice and external adapters terminate at the controlled tool/application boundary.

## 4.3 Material actions remain confirmation-gated

Actions that commit a menu, apply a material late change, perform transaction-like behavior, advance a material lifecycle boundary or undo a consequential action remain explicitly confirmed where required by the tool risk model.

The orchestration layer may decide that confirmation is required. It may not manufacture confirmation.

## 4.4 Failure cannot become success through wording

If a provider, persistence operation, validation step or revision check fails:

- state must remain truthful;
- no success receipt may be emitted;
- UI and speech must say what failed;
- the customer must be told what remains unchanged when that matters.

## 4.5 No silent safety guesses

Host must not silently guess:

- allergen compatibility;
- dietary compatibility where structured evidence is missing;
- unit conversion where the existing domain does not support it;
- real purchase success;
- real product availability;
- external-service completion;
- irreversible intent.

---

# 5. Retained engineering foundation

The current 17 validated tools are the baseline protected application surface:

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

The existing descriptors already contain:

- tool names;
- meaningful descriptions;
- JSON-style input schemas;
- risk classification;
- mutation flags;
- explicit-confirmation metadata.

The current model boundary already contains:

- `HeuristicIntentInterpreter`;
- `ModelBackedIntentInterpreter`;
- `ResilientIntentInterpreter`;
- `JsonModelProxyAdapter`.

The competition build should extend these boundaries rather than replacing them.

---

# 6. Finished customer journey

The minimum complete end-to-end customer journey is:

1. customer states a hosting goal naturally;
2. Host extracts what it can and asks only for missing material information;
3. Host establishes event time, guest count, budget/preferences and dietary/allergen constraints;
4. Host proposes suitable menu options from structured menu/recipe knowledge;
5. customer selects and explicitly confirms a menu;
6. Host automatically determines that inventory information is now the next missing execution input;
7. customer states what they already have naturally;
8. Host records confirmed inventory and automatically reconciles menu requirements;
9. Host builds the authoritative shopping deficit without requiring a separate customer command;
10. Host shows shopping state and, where a verified provider path exists, prepares external acquisition actions;
11. Host builds the preparation graph automatically when prerequisites are satisfied;
12. Host converts the graph into a human Run Sheet with timing and dependencies expressed as customer meaning rather than implementation metadata;
13. Host transitions into hands-busy Live execution when appropriate;
14. Host surfaces one current actionable task at a time;
15. customer can mark tasks done by voice or touch through the same controlled path;
16. if reality changes, customer can state the change naturally at any point;
17. Host analyses impact before mutation;
18. Host shows exactly what will change and what completed work will remain valid;
19. customer confirms or rejects the proposed update;
20. if confirmed, Host applies the change atomically and recomputes the event;
21. Host continues execution from the new authoritative state;
22. when preparation is complete, Host enters Ready state;
23. Host can show Receipts proving what actually happened;
24. the event can be closed/completed without losing the historical execution record.

The customer must not need to know internal commands such as `build shopping plan`, `prepare cart`, `build preparation plan` or `analyse change impact`.

Those are agent responsibilities once prerequisite state exists.

---

# 7. Event lifecycle

The customer-facing lifecycle is:

`INTAKE -> PLAN -> SHOP -> PREP -> LIVE -> READY -> HOSTING -> COMPLETE`

Internal domain status may retain existing implementation names, but presentation/orchestration must map them into these human stages.

## 7.1 INTAKE

Goal: establish the minimum reliable event definition.

Required customer-visible information as available:

- event name/type;
- date/time;
- guest count;
- confirmed dietary/allergen constraints;
- budget if relevant;
- explicit host preferences.

Host asks one question at a time unless the customer's original utterance already contains multiple reliable values.

## 7.2 PLAN

Goal: commit a workable menu/hosting plan.

Primary unresolved object: menu decision.

Host may explain trade-offs but must use structured compatibility evidence for hard dietary/allergen constraints.

## 7.3 SHOP

Goal: reconcile requirements against what is already owned and establish remaining acquisition work.

Shopping is not just a generated list. The experience must visually prove:

`required - confirmed on hand = still needed`

## 7.4 PREP

Goal: establish the dependency-aware run sheet before active hands-busy execution.

Host must distinguish:

- already complete;
- ready now;
- blocked by dependencies;
- scheduled later;
- at risk because timing has slipped.

## 7.5 LIVE

Goal: minimize cognitive load while work is actively happening.

Default presentation is one current task, one dominant action and only immediately useful supporting information.

## 7.6 READY

Goal: clearly close the preparation loop.

Ready means authoritative required preparation work is complete for the current confirmed event state.

## 7.7 HOSTING

Goal: keep Host available for late execution/support without flooding the customer with planning UI.

## 7.8 COMPLETE

Goal: close the event while preserving the execution record and, where later implemented, approved non-authoritative preference learning.

---

# 8. Operational state projection

The finished UI must not simply render the cards in the most recent `AgentReply`.

It needs a durable **operational projection** derived from authoritative state.

The projection should answer:

- event identity;
- event time;
- guest count;
- confirmed constraints;
- lifecycle stage;
- committed menu summary;
- inventory coverage;
- shopping unresolved/completed counts;
- preparation completion/ready/blocked counts;
- next actionable task;
- timing health;
- current pending decision/confirmation;
- current pending late-change impact;
- most recent consequential receipt;
- whether the event is currently ready.

This projection is presentation/orchestration data. It must not become an alternate source of truth.

Where possible it should be derived from existing authoritative application reads and state snapshots.

---

# 9. Attention engine

Event Home must have exactly one dominant **Needs your attention / Next** object.

Attention priority should be deterministic and state-derived.

Initial ordering target:

1. unresolved explicit confirmation;
2. failed/recoverable consequential action needing customer input;
3. unresolved change impact needing review;
4. missing material intake fact;
5. menu choice required;
6. inventory information required before shopping can be authoritative;
7. shopping acquisition/review required;
8. preparation plan/run sheet required;
9. preparation task due/at risk;
10. event ready;
11. no customer action required.

The model may explain the attention item. It must not choose a lower-priority marketing/conversational action over a higher-priority authoritative requirement.

---

# 10. Goal-directed orchestration

## 10.1 Purpose

The orchestrator must evolve from mainly request-response command handling into a bounded goal-directed workflow agent.

The customer expresses goals and changes. Host determines the safe next internal steps.

## 10.2 Autonomous low-risk continuation

Host may automatically perform a sequence of low-risk internal tools when:

- each tool's preconditions are satisfied;
- no explicit confirmation is required;
- the next step is unambiguous from authoritative state;
- every mutation remains validated and receipted.

Example after confirmed menu commit:

- determine inventory is missing -> ask for inventory;
- after customer provides inventory -> `record_inventory`;
- then automatically `build_shopping_plan`;
- if preparation prerequisites are already satisfied and product policy says prep can now be built -> automatically `build_preparation_plan`;
- present one coherent response summarizing what now exists.

## 10.3 Stop conditions

Autonomous continuation stops when:

- explicit confirmation is required;
- required data is missing;
- multiple materially different actions are plausible;
- an external provider needs authentication/permission/customer choice;
- revision/state changed unexpectedly;
- an operation fails;
- safety/compatibility evidence is insufficient.

## 10.4 Workflow plan object

Implement a bounded internal workflow-plan representation containing at minimum:

- goal;
- current authoritative revision;
- candidate next steps;
- required inputs;
- confirmation boundary;
- stop condition;
- completed tool receipts.

The workflow plan is not authoritative event state and must be discardable/recomputable.

---

# 11. Model intelligence boundary

## 11.1 Required live-model responsibilities

A live model path should be implemented for the competition build unless a directly verified hard blocker makes that impossible.

The model may perform:

- natural event interpretation;
- arbitrary preference extraction;
- inventory statement extraction;
- equipment/prep-time constraint extraction;
- correction understanding;
- multi-intent utterance decomposition;
- conversational reference resolution;
- ambiguity detection;
- structured menu preference ranking;
- explanation of trade-offs;
- bounded workflow-intent planning.

## 11.2 Model must not perform

The model must not:

- mutate domain state;
- directly mark a task complete;
- assert real purchase success;
- declare an allergen-safe recipe without structured supporting data;
- fabricate inventory;
- override a stale revision failure;
- bypass confirmation metadata;
- produce arbitrary tool names or arbitrary executable code.

## 11.3 Structured model output

Model outputs must be parsed against explicit schemas and reject unknown fields where practical.

Required output families:

- interpreted customer intent;
- extracted structured facts;
- ambiguity/clarification result;
- bounded workflow suggestion;
- natural-language explanation generated only from supplied structured state/evidence.

## 11.4 Resilience

Retain deterministic fallback.

If live model service fails, times out, returns invalid data or drops below the accepted confidence/validation threshold:

- safe deterministic commands continue where supported;
- customer sees a truthful bounded fallback message where necessary;
- authoritative state remains intact.

---

# 12. Recipe and menu knowledge

## 12.1 Hard rule

Do not make allergen/dietary safety depend on unconstrained language generation.

## 12.2 Structured recipe data

Each recipe/menu component used for authoritative compatibility should contain structured fields such as:

- stable ID;
- title;
- ingredients with quantity/unit;
- allergen tags;
- dietary tags;
- equipment requirements;
- active prep minutes;
- cook minutes;
- make-ahead suitability;
- serving/portion scaling rules;
- dependency metadata;
- approximate cost data where supported;
- substitution/variant links where safely modeled.

## 12.3 Menu composition

The model may rank or explain options according to soft preferences such as:

- cheaper;
- easier;
- more impressive;
- minimal same-day cooking;
- cuisine preference;
- equipment preference.

Hard constraints remain validated against structured recipe evidence.

## 12.4 Menu UX

The menu decision surface must show the trade-offs a host actually cares about, not only menu name and prep time.

Minimum candidate comparison fields:

- menu name;
- active effort / total timing;
- dietary/allergen compatibility evidence;
- make-ahead suitability;
- approximate cost where verified;
- notable equipment requirement where relevant.

---

# 13. Inventory and shopping

## 13.1 Inventory capture

Customer can state inventory naturally, for example:

> “I've already got olive oil, salt, rice, garlic and two lemons.”

The model/extractor returns structured candidate inventory facts.

Before authoritative record:

- ambiguous quantities/units must be clarified when material;
- unsupported conversions are not guessed;
- only customer-confirmed/on-hand facts are recorded.

## 13.2 Reconciliation presentation

The customer must see:

- total required ingredient lines;
- what is already covered;
- what remains needed.

Use human grouping such as Produce, Pantry, Chilled where useful, while retaining authoritative quantities.

## 13.3 Product acquisition

Current deterministic demo product selection may remain as fallback/simulation.

A real product/commerce integration should only be added if research verifies:

- lawful/authorized API use;
- stable access for judging;
- suitable UK/customer coverage where relevant;
- meaningful data quality;
- authentication/testing feasibility;
- clear failure semantics.

Do not add a fake real-commerce claim merely to improve the submission narrative.

---

# 14. Temporal execution engine

Hosting is time-bound. Time must become a first-class execution input rather than metadata displayed next to tasks.

The competition build must support a derived timing-health model.

## 14.1 Required concepts

For each preparation task, derive where possible:

- duration;
- due-by/start-by relationship;
- dependencies;
- earliest feasible start;
- latest safe start;
- slack;
- whether the task is ready;
- whether the event remains on track.

## 14.2 Event timing health

Customer-facing states:

- **On track**;
- **Needs attention**;
- **Behind**;
- **Ready**.

The system should be able to produce guidance such as:

> “You're 12 minutes behind. Start the couscous now; dessert still has 25 minutes of slack.”

Such guidance must derive from deterministic schedule data, with the model used for explanation rather than inventing schedule facts.

## 14.3 Clock dependence

Tests must be deterministic through an injectable/test clock.

Do not make browser wall-clock timing impossible to reproduce in automated tests.

---

# 15. Late-change handling — signature product capability

The late-change sequence is a primary competition differentiator and must be designed as a first-class flow.

Example customer change:

> “Sarah is bringing another guest and they're vegan.”

Required sequence:

1. interpret structured change candidate;
2. do not mutate committed state;
3. call/read authoritative impact analysis;
4. if replacement menu/variant selection is needed, obtain compatible structured options;
5. construct customer-facing impact summary;
6. explicitly separate **will change** from **will stay**;
7. explicitly show completed work preserved where applicable;
8. explicitly state that nothing has changed yet;
9. require confirmation;
10. apply only if impact is still current;
11. if stale, re-analyse rather than applying old impact;
12. continue from new authoritative next action.

Minimum impact presentation:

**WILL CHANGE**

- guest count;
- affected menu/variant;
- shopping delta;
- prep tasks added/removed/rescheduled;
- timing impact.

**WILL STAY**

- preserved menu elements where relevant;
- completed tasks preserved;
- unaffected shopping/work;
- event time if unchanged.

Prominent control copy:

> Nothing has changed yet.

Then:

- `Apply update`;
- `Keep current plan`.

This screen should be designed to become one of the strongest gallery/demo moments.

---

# 16. MCP architecture

## 16.1 Competition target

The competition build should include a real self-hosted MCP server unless implementation research proves a hard external blocker.

Current rules accept a self-hosted MCP server implementing minimum MCP 2025-11-25 over Streamable HTTP. A working Agent Skill is prioritized, but a self-hosted MCP implementation materially strengthens Host beyond simulation-only eligibility.

## 16.2 Architecture

`Alexa/MCP client -> Host MCP server -> MCP adapter -> HostToolRuntime -> domain/persistence/providers -> receipts`

The MCP layer must not call `HostDomainEngine` directly.

## 16.3 MCP requirements

Target at minimum:

- MCP spec 2025-11-25 or later as verified during implementation;
- Streamable HTTP transport;
- `tools/list` exposing reviewed Host tool schemas;
- controlled `tools/call` mapping to Host tool runtime;
- structured errors;
- authentication/authorization strategy appropriate to hosted test environment;
- request/session isolation;
- no arbitrary filesystem or shell execution;
- test coverage for malformed inputs, stale revisions, repeat calls and confirmation boundaries;
- preserved interaction traces for evidence.

## 16.4 Tool-surface review

Do not mechanically expose all 17 internal tools without review.

For each tool determine:

- whether it maps to a meaningful Alexa customer intent;
- whether its description is sufficient for model selection;
- whether its schema is minimal and unambiguous;
- whether confirmation is handled safely;
- whether internal-only sequencing should instead remain behind a higher-level MCP/customer tool.

A basic one-to-one MCP wrapper is not enough for the competition target.

Where appropriate, expose higher-level customer tools that internally orchestrate protected Host tools while preserving the same authoritative path.

## 16.5 MCP Apps

If custom interactive Alexa visuals can be supplied through the available MCP Apps route, evaluate using MCP Apps for high-value surfaces such as:

- menu decision;
- late-change impact;
- Live execution;
- Receipts.

Do not depend on unavailable partner access. Preserve the simulated web surface as a fully functional judged route regardless.

---

# 17. Agent Skill path

Because working Agent Skills are prioritized in the current rules, research the current external access/onboarding requirements during implementation planning.

Possible outcomes:

1. **Access available and feasible:** implement and verify the Agent Skill path using the same Host execution backend.
2. **Access unavailable/external blocker:** preserve evidence of the blocker; ship the verified self-hosted MCP + simulated Alexa+ route.

Do not delay the entire product waiting for invite-only/partner access.

Do not claim Agent Skill implementation without real runtime evidence.

---

# 18. External integration strategy

External integrations exist to make Host more useful, not to decorate the architecture diagram.

Candidate categories must be researched before selection:

- live model provider;
- calendar/reminder service;
- grocery/product data;
- smart-home scene execution;
- optional AWS services.

Selection scorecard:

- direct customer value;
- competition differentiation;
- reliable judge access;
- permission/licensing compatibility;
- failure semantics;
- authentication burden;
- implementation/testability;
- geographic relevance;
- maintenance risk.

Prefer one or two deep, verifiable integrations over several shallow ones.

---

# 19. AWS Builder decision

Do not add AWS merely to enter the mini challenge.

If AWS is implemented, target a meaningful multi-service agentic architecture rather than one superficial model call.

Candidate architecture to evaluate:

- Bedrock or equivalent AWS-supported model path for structured reasoning;
- AgentCore Memory or an appropriate current AWS memory service for **non-authoritative cross-event preferences only**;
- a suitable scheduling/event service if it materially improves timed execution;
- hosted MCP/service infrastructure where appropriate.

Memory must not silently become authoritative event state.

Example remembered preference:

> usually prefers minimal cooking once guests arrive

This may influence a suggestion. It does not become a confirmed constraint for a new event without appropriate confirmation/context.

Only select AWS Builder in Devpost after actual AWS runtime evidence exists.

---

# 20. Information architecture

The existing equal-weight `Plan / Live / Activity` top-level model is retired as the target product architecture.

Target structure:

- **Event Home** — default operating picture;
- **Run Sheet** — preparation/timing detail;
- **Receipts** — execution evidence;
- **Ask Host** — ambient conversational input available from all relevant states;
- **Live** — deliberate execution takeover state, not a peer navigation tab.

Conversation history should be available when useful but should not permanently occupy a large part of Event Home.

---

# 21. Canonical UI states

The final product must be designed and tested against at least these canonical states:

1. empty/create-event;
2. event intake with one missing fact;
3. Event Home — plan incomplete;
4. menu decision;
5. menu confirmation;
6. Event Home — committed plan;
7. inventory capture/reconciliation;
8. shopping state;
9. product/cart state where relevant;
10. Run Sheet;
11. Live execution;
12. Live voice listening/speaking state;
13. change detected/analysing;
14. late-change impact before confirmation;
15. confirmed change applied;
16. Receipts;
17. failed action with truthful unchanged-state explanation;
18. recoverable stale/revision conflict;
19. voice unavailable;
20. persistence recovery;
21. Ready;
22. Complete;
23. mobile equivalents for all material flows;
24. Echo landscape equivalents for all material flows;
25. light/dark behavior where applicable.

No final UI claim is complete based on a subset of showcase screenshots.

---

# 22. Event Home specification

Event Home is the center of the product.

## 22.1 Header

Primary:

- Host brand, restrained;
- event name;
- event date/time;
- guest count;
- optional budget/status where useful.

Developer-facing simulation disclosure must not dominate customer hierarchy. Keep disclosure available in an appropriate information/about location and beside simulated transaction behavior where needed.

## 22.2 Status sentence

One concise authoritative summary, for example:

> Menu chosen. 9 shopping items remain. Prep starts at 4:45 PM.

This should derive from operational projection state rather than generated conversational memory.

## 22.3 Attention block

Exactly one primary next item, for example:

**NEEDS YOUR ATTENTION**

**Choose tonight's menu**

Three options satisfy the confirmed vegetarian and nut-allergy constraints.

`Review menus`

## 22.4 Lifecycle strip

Human stage indicator:

`PLAN ✓   SHOP ●   PREP ○   HOST ○`

Do not turn this into a meaningless gamified percentage.

## 22.5 Tonight status

At-a-glance objects:

- Menu;
- Shopping;
- Prep;
- Ready.

These are compact state summaries, not four generic cards competing equally with the attention object.

## 22.6 Ask Host

A low-chrome `Ask Host` affordance remains globally available.

On large landscape surfaces it may open a side conversational sheet.

On mobile it may open a bottom sheet/full conversational surface.

It does not permanently own 30–40% of Event Home.

---

# 23. Menu decision specification

The menu screen exists to support one consequential choice.

For each menu show only decision-useful fields:

- name;
- effort/timing;
- key dishes;
- hard-constraint compatibility indicators;
- make-ahead suitability;
- approximate cost if verified;
- relevant equipment note.

Primary action per candidate:

`Choose this menu`

After selection, present a confirmation surface that clearly states what becomes true after confirmation.

Example:

**Use Mediterranean Table?**

- 6 guests;
- compatible with confirmed constraints;
- 5 prep tasks;
- estimated ingredient cost if reliable.

> This will become tonight's committed menu and Host will calculate the required shopping/preparation state.

`Confirm menu` / `Go back`

---

# 24. Shopping/inventory specification

Shopping must visibly demonstrate reconciliation.

Top summary example:

**12 ingredient lines required**  
**3 already covered**  
**9 still needed**

Then human sections:

**HAVE**

- olive oil;
- salt;
- rice.

**NEED**

- basil;
- berries;
- cucumber;
- etc.

Where exact quantity matters, show it clearly.

Do not repeat verbose implementation prose on every row if a simpler representation remains truthful.

---

# 25. Run Sheet specification

Run Sheet converts the dependency graph into human execution meaning.

Sections:

**NOW**

Current ready work.

**NEXT**

Next timed work.

**LATER**

Upcoming tasks in event order.

Human dependency language example:

> Starts after the dessert has chilled.

Do not expose only raw prerequisite counts such as `2 prerequisites` where the dependency can be expressed meaningfully.

Show timing-health signals only where they help action.

---

# 26. Live specification

Live is the hero hands-busy experience.

Default large-display hierarchy:

**HOST · DINNER AT 7**

**NOW**

# Chop the vegetables

**12 min**

`DONE`

*Next: start the couscous*

Avoid explanatory UI that describes Live Mode instead of simply being Live Mode.

Primary action must be comfortably touchable at distance and usable by voice.

When voice is active, show compact transient state:

- Listening;
- Processing;
- Speaking.

Do not maintain permanent verbose voice-status text when no action is occurring.

---

# 27. Change-impact specification

This is the signature visual/product state.

Example:

# One more guest is coming

**7 guests · vegan**

## WILL CHANGE

**Menu**  
Mediterranean Table -> Vegan-adjusted Mediterranean Table

**Shopping**  
9 remaining -> 13 remaining

**Prep**  
5 tasks -> 6 tasks

## WILL STAY

**2 completed tasks preserved**  
**Dinner remains on track for 7:00 PM**

> **Nothing has changed yet.**

`Apply update`  
`Keep current plan`

If timing will slip, say so explicitly rather than showing only task counts.

---

# 28. Receipts specification

Rename the customer-facing concept from generic `Activity` to **Receipts** unless usability testing shows a clearer term.

Chronology example:

**5:44 PM — Guest update applied ✓**

6 -> 7 guests  
Vegan requirement added  
2 completed prep tasks preserved

**5:20 PM — Shopping plan built ✓**

9 items needed

**5:18 PM — Menu committed ✓**

Mediterranean Table

Reversible actions show `Undo available` only while the authoritative runtime says reversal is safe.

Failure receipts remain visible and cannot be rewritten as success.

---

# 29. Ready and completion specification

Preparation must have an emotional/product closure.

Ready state example:

# You're ready

**Dinner at home · 7:00 PM**

✓ Shopping complete  
✓ Preparation complete  
✓ Confirmed changes applied

> Enjoy your evening.

Secondary action:

`View receipts`

Complete state preserves the event record and explicitly separates event history from any later non-authoritative preference memory.

---

# 30. Voice-only contract

Every material customer journey must be completable without seeing the screen.

Voice-only coverage includes:

- create event;
- clarify missing event facts;
- hear menu choices;
- choose menu;
- confirm/cancel;
- provide inventory;
- hear shopping status;
- ask what's next;
- complete task;
- make late change;
- hear impact;
- confirm/reject impact;
- hear readiness;
- ask what actually happened;
- recover from supported failures.

Voice responses must not depend on labels visible only on screen such as “tap the second card.”

Numbered choices are acceptable only when the same ordering is clearly spoken and remains stable for that turn.

---

# 31. Touch-only contract

Every material journey must also be completable without speech.

The UI must expose equivalent safe actions for:

- decisions;
- confirmations;
- task completion;
- change review;
- undo where available;
- data/privacy operations;
- navigation.

No essential action may be voice-exclusive.

---

# 32. Echo landscape behavior

1280×800 is treated as a far-field/multimodal surface, not a desktop website.

Target layout model:

- top 10–15%: event identity/status;
- middle 65–75%: one dominant operational object;
- bottom 15–20%: primary action / Ask Host / minimal next information.

Avoid:

- dense desktop navigation;
- permanent chat sidebars;
- tiny 10–11 px metadata as essential information;
- large empty decorative regions;
- generic SaaS multi-card dashboards.

---

# 33. Mobile behavior

Mobile is not a squeezed landscape composition.

Event Home mobile order:

1. event identity;
2. status sentence;
3. attention action;
4. lifecycle strip;
5. Tonight state;
6. Ask Host fixed/accessible action.

Live becomes a full-screen task surface.

Late-change impact becomes a single vertical comparison with a fixed/reachable confirmation action.

Receipts become a single chronological column.

---

# 34. Visual language

Product character:

- calm;
- capable;
- warm;
- exact;
- low-friction;
- trustworthy.

Retain useful existing identity:

- warm light neutral;
- restrained Host rust/red accent;
- dark focused Live surface;
- strong typographic hierarchy;
- generous negative space.

Change target:

- serif becomes restrained brand/display accent, not the default for all task information;
- primary operational text uses highly readable sans-serif sizing appropriate to distance;
- saturated accent is reserved for identity/action/attention;
- green means verified success, not decoration;
- rounded containers are used where there is a real discrete object/decision, not everywhere and not nowhere;
- lists remain flatter where content is homogeneous.

Essential text must not rely on tiny metadata sizes.

---

# 35. Accessibility

Retain current accepted controls and expand them for the new surfaces.

Minimum acceptance:

- 48×48 px touch target floor where applicable;
- WCAG A/AA automated checks on representative material states;
- keyboard reachability and meaningful focus order;
- modal/sheet focus lifecycle;
- screen-reader announcements limited to useful state changes;
- no color-only status meaning;
- reduced motion preference respected for any nonessential animation;
- voice-unavailable state remains operable;
- far-field readability reviewed directly at target resolution.

Automated Axe is necessary but not sufficient for final visual/accessibility acceptance.

---

# 36. Error, recovery and conflict behavior

Required error families:

- input ambiguity;
- model unavailable/invalid;
- persistence unavailable;
- corrupted stored event;
- stale revision;
- stale impact;
- external-provider failure;
- authentication/permission failure;
- transaction-like failure;
- no task ready;
- impossible schedule/constraint conflict.

Each error must answer where relevant:

1. what failed;
2. what did **not** change;
3. what the customer can do next.

Example:

# Cart wasn't completed

The provider did not confirm the action.

**Nothing was marked as purchased.**

`Try again`

---

# 37. Privacy and security boundaries

The final product must document and enforce:

- what data is stored locally versus remotely;
- what voice provider/browser may receive;
- what model provider receives;
- what MCP endpoint receives;
- what external integrations receive;
- how event data can be cleared;
- how secrets are kept out of repository/client bundles;
- how hosted MCP/API authentication works;
- how logs/traces avoid exposing unnecessary personal data.

Do not send the full event record to a model/provider when a smaller structured context is sufficient.

No production secret may be committed to Git.

---

# 38. Observability and evidence

The competition build must preserve evidence that the agent actually executed through its controlled boundaries.

Add structured development/test traces for:

- model interpretation result;
- workflow plan;
- tool calls;
- tool results;
- external provider calls/results;
- receipts;
- MCP requests/responses where implemented.

Customer-facing UI should remain simple; developer/judge evidence may expose deeper trace detail in repository reports or demonstration segments.

Trace data must not become a second source of authoritative state.

---

# 39. Automated verification expansion

Existing baseline gates remain mandatory and may not be weakened.

Current retained baseline:

- 74 backend/application tests;
- production web build;
- 26 browser tests across Echo Show-like and mobile;
- existing Axe scope;
- direct visual examination for interface changes.

The competition build must add tests for all newly implemented behavior.

Required new test classes include:

## Model

- valid structured interpretation;
- invalid model response rejected;
- timeout/provider failure fallback;
- ambiguous request clarification;
- multi-intent request;
- inventory extraction;
- conversational reference resolution;
- no model direct mutation.

## Goal-directed orchestration

- safe multi-tool continuation;
- stops at confirmation;
- stops at missing information;
- stops on failure;
- recomputes after revision conflict;
- emits receipts in correct order;
- no duplicate irreversible behavior on retry.

## Temporal engine

- latest safe start;
- dependency timing;
- slack calculation;
- on-track/behind transition;
- deterministic injected clock;
- late-change timing impact.

## MCP

- protocol/transport compliance as implemented;
- tools/list;
- valid tool call;
- malformed input;
- unknown tool;
- stale revision;
- repeat/idempotency behavior;
- confirmation boundary;
- structured error;
- request isolation.

## UI

- all canonical states render;
- Event Home attention priority;
- menu confirmation;
- inventory/shopping reconciliation;
- Run Sheet;
- Live;
- late-change impact;
- Receipts;
- Ready;
- failure unchanged-state copy;
- mobile equivalents;
- voice-only core journey;
- touch-only core journey;
- keyboard/focus;
- storage/recovery;
- accessibility scans.

---

# 40. Direct visual verification

Every material UI change requires real rendered captures and direct examination.

Final visual acceptance cannot be based on:

- unit tests;
- DOM assertions;
- screenshot existence;
- dimensions;
- CSS review alone.

Directly inspect at minimum:

- all canonical competition gallery candidates;
- Event Home at each major lifecycle stage;
- Live desktop/Echo;
- Live mobile;
- late-change impact;
- menu decision;
- shopping/inventory;
- Run Sheet;
- Receipts;
- Ready;
- error state;
- voice state;
- light/dark where applicable.

Compare against the immediately preceding accepted product, not memory.

---

# 41. Human usability gate

Before final competition acceptance, run scenario-based usability testing with people who were not involved in development.

Target recruitment: 8–12 participants if practical.

Core scenario:

> You are hosting friends for dinner. Use Host to get the event ready. During the session, an extra guest with a new dietary requirement will be introduced.

Observe without coaching.

Measure:

- could participant create the event;
- did they understand what Host needed from them;
- did they understand what Host did automatically;
- did they trust confirmation boundaries;
- could they understand inventory reconciliation;
- could they use Run Sheet/Live without explanation;
- did they understand the change impact before confirming;
- did they understand what remained unchanged;
- could they find proof of execution;
- would they use Host again;
- satisfaction score and qualitative friction.

Repeated confusion is a product defect to fix, not a submission explanation.

Where feasible, target average satisfaction >=4.3/5 in line with current Amazon UX guidance, but do not manufacture or cherry-pick scores.

---

# 42. Potential-impact evidence

Final submission should support impact with product evidence rather than generic claims.

Evidence targets:

- fewer manual workflow commands required;
- successful completion of the full hosting journey;
- user understanding of late changes;
- reduced uncertainty about what remains;
- hands-busy task completion;
- user trust in confirmation/failure behavior;
- repeat-use intent from usability testing.

Do not claim quantitative time/stress savings unless measured.

---

# 43. Open Source target

The repository should demonstrate a reusable trustworthy-agent pattern, not merely contain source code.

Final Open Source strength should include:

- authoritative-state architecture documentation;
- explicit tool risk/confirmation pattern;
- model/fallback boundary;
- MCP adapter/server implementation if delivered;
- temporal planning logic;
- receipts/audit pattern;
- test harness;
- example adapter patterns;
- clear local setup;
- meaningful tests and verification reports.

This should make the project useful as a reference for developers building stateful agents where generated language cannot be treated as execution truth.

---

# 44. Deployment and judge access

Before final submission, provide a practical judged route.

Preferred final access set:

- public GitHub repository;
- public working Host web deployment;
- hosted MCP endpoint if MCP is part of the entry;
- clear test instructions;
- public final video.

Hosted app requirements:

- HTTPS;
- stable asset loading;
- clean-browser smoke test;
- mobile smoke test;
- voice supported/fallback behavior verified;
- no exposed secrets;
- all claimed integrations reachable for judges or clearly documented if credentials/test mode are required.

The official rules allow judging via repository + demo video, so deployment failure must not destroy submission eligibility; however, the target is a real hosted product if a reliable path is available.

---

# 45. Final gallery target

Do not retain the old gallery order by inertia.

Final six-image target, subject to actual built quality:

1. **Event Home** — complete operating picture;
2. **Late-change impact** — signature safe-replanning capability;
3. **Live** — hands-busy Alexa-native execution;
4. **Inventory -> shopping reconciliation** — proves this is not a list generator;
5. **Run Sheet** — dependency/time-aware execution;
6. **Receipts** — proves execution truth.

Menu decision remains a reserve candidate if stronger than one of the above after final visual audit.

All images must come from the actual final working product.

---

# 46. Final video target

Maximum: under 3 minutes.

The strongest differentiator must appear early.

Target structure:

**0–15 sec** — hosting goal entered naturally; Event Home forms.  
**15–40 sec** — menu choice/confirmation and automatic workflow continuation.  
**40–70 sec** — inventory -> shopping reconciliation; Run Sheet appears.  
**70–105 sec** — Live execution, one hands-busy task completed.  
**105–145 sec** — extra vegan guest introduced; impact analysis; preserved work; confirmation; updated plan.  
**145–165 sec** — Receipts prove what actually happened.  
**165–175 sec** — brief real architecture/MCP/integration evidence.  
**175–180 sec** — Ready / HOST close.

If the final product flow can demonstrate the core story more clearly in less time, use less time. Do not fill the three-minute limit merely because it exists.

No final video claim is accepted until the public processed YouTube/Vimeo stream is watched end-to-end.

---

# 47. Development phases and gates

Implementation must proceed in controlled stages. A later stage does not erase the gate of an earlier one.

## Phase A — specification/source audit

Deliverables:

- this complete product specification;
- source-architecture mapping showing where each required capability belongs;
- no implementation yet beyond control files.

Gate:

- specification checked against current source architecture;
- specification checked against current official competition/Alexa+ requirements;
- contradictions/open design decisions explicitly resolved or listed.

## Phase B — operational projection + attention engine

Deliverables:

- derived event operating projection;
- deterministic attention priority;
- tests.

Gate:

- existing state truth preserved;
- no duplicate mutation path;
- regression suite passes.

## Phase C — goal-directed orchestration

Deliverables:

- bounded workflow planner/executor;
- automatic low-risk continuation;
- stop/confirmation boundaries;
- tests/traces.

Gate:

- no material action bypasses confirmation;
- no duplicate/retry corruption;
- regression + new orchestration tests pass.

## Phase D — model intelligence

Deliverables:

- live structured model adapter path;
- inventory/preferences/multi-intent extraction;
- schema validation;
- deterministic fallback;
- tests.

Gate:

- invalid model outputs cannot mutate state;
- provider failure preserves functionality/state;
- real model call evidence exists before any final claim.

## Phase E — recipe/menu knowledge expansion

Deliverables:

- structured recipe/menu data;
- hard-constraint validation;
- richer menu ranking/presentation data;
- tests.

Gate:

- hard compatibility is not LLM-only;
- invalid/allergen-incompatible cases rejected.

## Phase F — temporal engine

Deliverables:

- task slack/latest-start calculations;
- event timing health;
- time-aware next action;
- deterministic clock tests.

Gate:

- timing claims derive from schedule data;
- late-change timing effects tested.

## Phase G — MCP / Agent Skill path

Deliverables:

- MCP research outcome;
- self-hosted MCP server target unless hard blocked;
- Streamable HTTP;
- reviewed customer-facing tool schemas;
- protocol/error/idempotency tests;
- hosted/test evidence;
- Agent Skill access decision documented.

Gate:

- no direct domain mutation;
- real protocol interaction verified;
- no MCP claim from mock-only behavior.

## Phase H — external integrations

Deliverables:

- research scorecard;
- selected real integration(s);
- adapter boundaries;
- permission/auth/failure handling;
- tests/evidence.

Gate:

- integration adds real customer value;
- external failure cannot falsify Host state.

## Phase I — full UI rebuild

Deliverables:

- Event Home;
- menu decision;
- inventory/shopping;
- Run Sheet;
- Live;
- late-change impact;
- Receipts;
- Ready/Complete;
- Ask Host sheet;
- Echo/mobile variants.

Gate:

- full technical browser gate;
- direct visual audit of all material states;
- voice-only/touch-only complete route.

## Phase J — human usability + correction

Deliverables:

- scenario protocol;
- participant results;
- friction findings;
- product fixes;
- re-verification.

Gate:

- repeated usability failures corrected or explicitly unresolved;
- final state re-tested after corrections.

## Phase K — competition release

Deliverables:

- final release candidate;
- clean package;
- hosted judge route if available;
- final gallery;
- final public video;
- rebuilt Devpost story;
- refreshed Open Source evidence;
- product feedback/friction log;
- final integrity audit.

Gate:

- final submission claims trace directly to verified evidence;
- current official rules rechecked;
- user explicitly authorises final promotion/submission.

---

# 48. No-shortcut prohibitions for this build

Do not:

- polish the current seven screenshots and call that the new product;
- implement only the UI while leaving workflow intelligence unchanged;
- add a model call solely for marketing;
- expose a mechanical MCP wrapper and call it a creative agent architecture;
- replace deterministic domain controls with generated reasoning;
- skip temporal execution because task ordering already exists;
- invent external integration success;
- write final submission prose before the capabilities exist;
- reduce the canonical-state verification set to a few attractive screens;
- use automated screenshot checks as a substitute for direct visual examination;
- merge to `main` because a partial phase looks good.

---

# 49. Definition of competition-grade completion

Host is not competition-grade complete until all applicable required conditions below are true and verified:

- complete hosting journey works end-to-end;
- goal-directed orchestration removes internal workflow-command burden from the customer;
- live structured model path exists or a directly verified hard blocker is documented and the product remains strong without unsupported claims;
- hard menu/constraint safety is structured/validated;
- inventory reconciliation is natural and visible;
- temporal execution produces truthful on-track/behind guidance;
- Live is a genuine hands-busy experience;
- late-change impact clearly shows changed vs preserved work before mutation;
- Receipts prove consequential execution;
- voice-only journey passes;
- touch-only journey passes;
- Echo landscape and mobile material states pass direct visual review;
- MCP path exists and passes protocol/runtime verification unless a directly verified external blocker is accepted in the controlled plan;
- any external-service/AWS claims have real runtime evidence;
- accessibility/recovery/security gates pass;
- human usability testing has been completed and resulting repeated issues addressed;
- final hosted/judge-access route is verified where implemented;
- final gallery uses real final-product states;
- final public video is under 3 minutes and watched after processing;
- Devpost narrative is rebuilt from final evidence;
- final integrity audit passes;
- user explicitly authorises promotion/submission.

Until then, report the exact partial state rather than calling the product finished.

---

# 50. Immediate next action after this specification

Do not begin broad implementation immediately after writing this file.

The next required stage is **Phase A source-architecture mapping and specification audit**:

1. map every major requirement in this specification to existing source modules or required new modules;
2. identify which current domain/tool capabilities can be reused unchanged;
3. identify which requirements need new authoritative capabilities versus derived presentation/orchestration capabilities;
4. inspect the current model, orchestrator, tool runtime, domain state, persistence, UI state and test architecture directly;
5. recheck official MCP/Alexa+ requirements relevant to implementation;
6. produce the controlled implementation map;
7. audit this specification against that evidence and correct any unsupported or contradictory requirement before implementation begins.

Only then proceed to Phase B.