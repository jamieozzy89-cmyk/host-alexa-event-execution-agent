# Stage 05 — Agent / Orchestrator

## Objective

Stage 05 adds the customer-facing orchestration layer without weakening the authoritative state boundary established in Stages 02–04.

The Stage 05 rule is:

> The agent may interpret, ask, explain, and choose tools. It may not make state true by saying that it happened.

All committed mutations still travel through `HostToolRuntime`, which performs strict input validation, domain validation, persistence checkpointing, receipt/audit generation, and rollback on checkpoint failure.

## Runtime boundary

`HostAgentOrchestrator` is the application-facing conversation runtime.

It depends on:

- `HostToolRuntime` for all authoritative reads/mutations;
- an `IntentInterpreter` for natural-language interpretation;
- an injected clock/id factory for deterministic testing;
- the Stage 05 presentation contract for UI-ready cards/actions.

It does **not** import or instantiate `HostDomainEngine`.

The supported package root exports the orchestrator and interpreter interfaces, while `HostDomainEngine` remains unavailable from the package root and direct package subpaths remain blocked.

## Intent interpreters

### Deterministic default

`HeuristicIntentInterpreter` is the verified default/fallback runtime. It covers the controlled Host request families required by the current product journey:

- event setup;
- status/next action;
- menu choices;
- shopping;
- demo product choices;
- simulated checkout;
- preparation planning;
- action history;
- late changes;
- task completion;
- safe undo;
- confirmation/cancellation/help.

It extracts current Stage 05 slots for guest count, budget, event/date signals, vegetarian/vegan/nut-allergy constraints, limited same-day-cooking preference, and GBP.

### Model-backed boundary

`ModelBackedIntentInterpreter` accepts a structured model result only after validating:

- supported intent name;
- bounded confidence;
- primitive slot types;
- positive integer guest counts;
- non-negative budgets;
- recognised constraint types/source values.

`ResilientIntentInterpreter` is designed to place a preferred model interpreter in front of the deterministic interpreter. It falls back when the preferred interpreter throws, returns an unknown intent, or produces a weaker interpretation below the current confidence threshold.

`JsonModelProxyAdapter` provides a generic POST/JSON boundary for a later live model provider.

No external LLM provider, AWS Bedrock runtime, API key, or live model call is claimed in Stage 05.

## Conversation state

Conversation state contains only interaction/session information:

- active `eventId`;
- temporary event-creation draft;
- one currently requested missing field;
- one pending confirmation;
- transient presentation caches for recent menus/shopping/tasks/history.

Authoritative event state is **not duplicated into conversation state**.

A new agent instance can call `resumeConversation(conversationId, eventId)`. This verifies the event through `get_event_status`, binds the fresh conversation to persisted authoritative state, and clears stale draft/confirmation/cache fields. Uncommitted confirmations are deliberately not restored after restart.

## Event creation

Host accepts a natural setup request and captures supported fields. If required information is missing, it asks exactly one question at a time in this order:

1. guest count;
2. day/time;
3. budget.

Only when required values are available does the orchestrator call `create_event`.

Natural date support currently covers:

- weekday names;
- today/tomorrow;
- named calendar dates;
- ISO calendar dates;
- explicit `at 7`, `7pm`, or `19:00`-style times.

A specific regression prevents a guest-count number such as `6 people` from being interpreted as 06:00. Where a time is not explicitly supplied, the current hosting default is 19:00 local time.

## Menu flow

1. `propose_menu` returns compatible uncommitted menu choices.
2. Stage 05 converts them into a `menu_options` card and working `choose_menu` actions.
3. Choosing a menu creates a pending confirmation; it does not commit.
4. Confirmation invokes `commit_menu` using the current expected revision.
5. Cancellation leaves authoritative state unchanged.

## Shopping/product flow

`build_shopping_plan` returns real authoritative quantities rather than a conversational count summary. The `shopping_list` presentation includes required quantity, confirmed on-hand quantity, deficit quantity, unit, and status.

`prepare_cart` returns deterministic demo candidate products and selected product IDs through the `product_choices` presentation object. Customer text explicitly says these are demo products and that nothing has been purchased.

`confirm_cart_action` remains confirmation-bound and clearly labelled simulated checkout. Provider-declared failure, invalid provider output, and thrown provider errors remain governed by the Stage 04 durable-failure path.

## Preparation / Live-mode foundation

`build_preparation_plan` produces a `prep_timeline` card containing:

- task title/category;
- duration;
- due time;
- current status;
- dependency IDs.

Ready tasks create executable `complete_task` actions. Task completion routes through `mark_task_complete` and returns the next authoritative ready task where one exists.

This structured contract is the foundation for Stage 06's visual Live Mode and Stage 07 voice interaction. Stage 05 does not claim those interfaces yet.

## Late-change flow

Late changes remain deliberately two-phase:

1. obtain current authoritative status/revision;
2. preview a compatible replacement menu if the guest/constraint set changed;
3. call `analyse_change_impact` without mutation;
4. render a `change_impact` card;
5. ask for explicit confirmation;
6. only after confirmation call `apply_confirmed_change` with the engine-issued impact ID/base revision.

The impact card exposes counts/flags for affected shopping/tasks and preserved completed work without exposing internal engine structures.

## History and undo

`get_action_history` drives the `history` presentation.

Customer-facing history does not reuse raw provider error strings. Receipt summaries are normalised to plain-language status, and failed audit entries are rendered generically rather than exposing adapter/provider internals.

When a latest-revision reversible receipt exists, Host can offer `Undo latest safe change`. Undo remains confirmation-bound and invokes the existing `undo_reversible_action` tool. The original history remains visible after reversal.

## Customer-facing presentation contract

Stage 05 separates spoken text from richer structured UI data.

Current card types:

- `event_summary`
- `menu_options`
- `shopping_list`
- `product_choices`
- `prep_timeline`
- `change_impact`
- `history`
- `confirmation`
- `error`

Current actions:

- submit suggested text;
- choose menu;
- confirm/cancel pending action;
- complete task;
- retry checkout;
- request menu/shopping/products/prep/status/history/next/undo/checkout.

These actions are real routes back into `HostAgentOrchestrator`; they are not decorative UI affordances.

## User-friendly interaction controls

Stage 05 makes the following requirements part of the controlled product behavior rather than final-stage cosmetic polish:

- one clarification question at a time;
- short normal spoken responses;
- structured detail instead of long spoken lists;
- plain-language failure messages;
- no raw domain/tool/provider stack wording in normal customer-visible failure/history surfaces;
- explicit simulation labels for product/checkout features;
- confirmation before menu commitment, late-plan mutation, simulated checkout, and undo;
- no false completion language after failed/pending actions;
- touch/action alternatives for the current conversational journeys;
- recoverable session binding through explicit resume.

## Reproducible build correction

The Stage 05 recovery was run from a clean build workspace. That exposed a Stage 04 packaging weakness: the repository required `tsc` but did not declare TypeScript.

Stage 05 corrects this by pinning TypeScript `7.0.2` in `devDependencies` and committing `package-lock.json`.

The public run path is now:

```bash
npm ci
npm test
```

A machine-global TypeScript installation is no longer required.

## Verification gate

The complete Stage 02–05 suite now covers 72 tests, including 24 Stage 05 agent tests.

Stage 05 tests directly cover:

- complete natural event setup;
- one-question clarification;
- invalid date recovery;
- working menu actions/confirmation/cancellation;
- authoritative shopping data;
- demo product presentation;
- checkout confirmation/success/failure/retry;
- prep timeline/touch completion;
- concise state-driven status;
- read-only late-change analysis;
- confirmed replan/audit;
- safe undo;
- provider-error sanitisation;
- model-provider failure fallback;
- low-confidence model fallback;
- package-root agent export while domain engine remains hidden;
- guest-number/time regression;
- fresh-session authoritative event resume.

Final verified result on 1 September 2026: **72 passed, 0 failed**.

## Boundary after Stage 05

Implemented and verified:

- authoritative domain/state engine;
- persistence/restart integrity;
- controlled tool/action layer;
- deterministic conversation/runtime;
- pluggable validated model interpretation boundary;
- customer-safe structured presentation contract;
- confirmation/failure/recovery behavior;
- explicit event-session resume;
- reproducible clean-machine TypeScript build.

Not yet implemented or claimed:

- polished Alexa+ simulated web UI;
- microphone/speech recognition or text-to-speech voice interaction;
- a live external LLM provider;
- AWS integration;
- real external purchasing/grocery integrations;
- deployment;
- screenshots/demo video/submission media.

The next controlled stage is **Stage 06 — Alexa+ simulation UI**, with the exit gate that the complete core journey can be completed through touch alone using the real Stage 05 cards/actions.