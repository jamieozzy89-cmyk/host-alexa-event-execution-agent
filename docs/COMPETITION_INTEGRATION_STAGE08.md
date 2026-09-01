# Stage 08 — Competition Integration Decision

Date: 1 September 2026

## Purpose

Stage 08 decides whether Host should add an AWS Builder mini-challenge integration and locks the Open Source mini-challenge evidence without weakening the primary Alexa+ product.

This is a decision gate, not an instruction to add services for their own sake.

## Current competition facts

Controlling/current sources reviewed on 1 September 2026:

- Devpost overview: https://amazonappdev2026.devpost.com/
- Devpost official rules: https://amazonappdev2026.devpost.com/rules
- Amazon Bedrock model access: https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html
- Amazon Bedrock Converse API: https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html
- Amazon Bedrock pricing: https://aws.amazon.com/bedrock/pricing/
- AgentCore Memory: https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/memory.html
- AgentCore user preference memory: https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/user-preference-memory-strategy.html
- AgentCore pricing: https://aws.amazon.com/bedrock/agentcore/pricing/

Verified competition requirements relevant to this decision:

- the simulated Alexa+ web route is fully valid and does not require AWS;
- AWS Builder accepts projects that incorporate AWS services with documented integrations;
- Kiro Crew alone can qualify, but is not required;
- the AWS Builder judging guidance explicitly characterises a single Bedrock text-generation call or S3 storage as an obvious use;
- the creative AWS Builder examples favour multi-service/agentic integrations such as Bedrock + AgentCore + Strands;
- a project may win one primary-track prize plus one mini-challenge prize;
- AWS Builder winner prize is $5,000 cash + $5,000 AWS credits + Amazon Developer meeting + feature;
- entrants can request up to $150 in AWS promotional credits while supplies last, by the rules' stated deadline of 21 October 2026 at 12pm PT;
- additional AWS charges beyond credits remain the entrant's responsibility.

## Open Source mini challenge — decision: ENTER

Host should enter the Open Source mini challenge.

Why:

- Host is a new public repository;
- it carries an MIT open-source licence;
- the project contains substantial original implementation rather than a README-only contribution;
- it includes the authoritative domain engine, persistence, validated tool runtime, agent/orchestrator, touch UI, voice interaction, automated tests and permanent technical documentation;
- entering does not require weakening or complicating the primary Alexa+ product.

The Open Source mini challenge is therefore a low-risk additional prize route and should be retained through submission.

Prepared submission evidence is stored in `submission/OPEN_SOURCE_MINI_EVIDENCE.md`.

## AWS Builder — options considered

### Option A — one Bedrock call

Example: send raw user text to a Bedrock model and use its response for intent classification or generation.

Decision: **reject as the AWS Builder design**.

Reasons:

- the competition itself gives a single Bedrock text-generation call as an example of an obvious AWS Builder entry;
- Host already has a controlled model-interpreter boundary, so adding one remote call would add credentials, latency, cost and failure modes without materially advancing the product;
- it would look like technology-list padding rather than a competition-winning architecture.

### Option B — Strands replaces Host orchestration

Decision: **reject**.

Reasons:

- Strands is a model-driven agent framework and could be useful for many applications;
- Host's main differentiation is the opposite failure-control principle: language/model output may select tools but cannot directly establish execution truth;
- replacing the verified orchestrator with a model-driven loop would duplicate or weaken controls that have already been tested across the product;
- this would create substantial regression and demo risk primarily to qualify for a mini challenge.

### Option C — AgentCore Gateway/Policy around Host tools

Decision: **not selected for the current simulated route**.

Reasons:

- AgentCore Policy can provide strong external deterministic authorization for tool calls;
- current Policy-in-Gateway evaluation applies to MCP tools and requires Gateway/IAM/policy-engine setup;
- Host's selected Alexa+ route is deliberately the allowed web simulation, not an MCP server;
- converting the 17-tool application boundary into a Gateway/MCP topology now would add infrastructure and security configuration that overlaps Host's existing confirmation/domain-validation controls.

This remains an interesting future production architecture, not the best hackathon-stage integration.

### Option D — Bedrock + AgentCore Memory

Decision: **preferred AWS Builder architecture, conditional on real AWS account access**.

This is the only AWS route currently judged to strengthen Host enough to justify the added system surface.

#### Bedrock role

Use Amazon Bedrock through a server-side adapter implementing Host's existing `StructuredIntentModel` / model-backed interpreter boundary.

The model may improve interpretation of varied natural-language hosting requests and late changes, but its result still terminates at `HostAgentOrchestrator` and the existing controlled tool layer.

It does not receive a direct domain-state mutation route.

The Bedrock Converse API is the preferred runtime interface because AWS documents it as a consistent messages interface across supported Bedrock models.

#### AgentCore Memory role

Use AgentCore Memory for **non-authoritative cross-event user preference memory**.

Candidate examples:

- preferred hosting style;
- recurring menu preferences;
- usual prep-time tolerance;
- recurring non-safety preferences such as presentation style or preferred cuisine.

AgentCore's user-preference strategy is explicitly designed to extract and consolidate user choices/preferences across interactions.

Important control boundary:

> AgentCore Memory may suggest a preference. It must never silently create a confirmed dietary/allergen constraint, mark work complete, commit a menu, buy an item, or change authoritative event state.

Safety-critical or execution-critical facts remain in Host's own confirmed authoritative state. A retrieved memory becomes only optional context/recommendation unless the user confirms it for the current event.

#### Why this is product-native

This combination adds two things the current product genuinely lacks:

1. broader language understanding without replacing Host's deterministic execution controls;
2. useful personalization across separate hosting events without confusing remembered preference with authoritative current-event truth.

It is also materially stronger against the AWS Builder judging examples than a single Bedrock call.

## AWS cost/access controls

Current official documentation shows:

- Bedrock is usage-priced by model/input/output tokens;
- Bedrock third-party model access can require AWS Marketplace permissions, a valid payment method, and provider-specific first-use requirements;
- AgentCore services use consumption-based pricing with no upfront minimums;
- AgentCore Memory currently prices short-term events, stored long-term records and retrievals separately;
- the competition rules offer up to $150 AWS promotional credits while supplies last but explicitly leave additional charges with the entrant.

No real AWS account/credential connection is available in the current project environment. Only a local-files governed connection is present, and no installable AWS/Bedrock plugin was found.

Therefore **no AWS runtime integration is currently claimed or implemented**.

## Controlled AWS implementation plan once access exists

If AWS account access is supplied, implement in this order:

1. Request/confirm hackathon AWS promotional credits and set a strict spend alarm/budget before calls.
2. Choose a supported Bedrock model/region and verify model access/pricing.
3. Add a server-side Bedrock `StructuredIntentModel` adapter; never place AWS credentials in browser code.
4. Preserve `ResilientIntentInterpreter` so deterministic interpretation remains an available fallback.
5. Add tests proving model output still cannot bypass confirmation/tool/domain boundaries.
6. Create an AgentCore Memory resource with an explicit user-preference strategy and conservative retention.
7. Add a separate `PreferenceMemoryAdapter` whose output is non-authoritative suggestion context only.
8. Add tests proving retrieved memory cannot silently become confirmed constraints or completion state.
9. Add failure-mode tests: AWS unavailable, access denied, timeout, malformed model output, memory unavailable.
10. Run the full backend + touch + voice suite with AWS disabled and an AWS integration suite with real calls enabled.
11. Record actual service usage, setup/friction and cost observations for Devpost Product Feedback/Friction Logs.
12. Only after real successful calls may `Built With` or AWS Builder submission fields claim Bedrock/AgentCore.

## Stage 08 decision

### Locked now

- **Open Source mini challenge: YES — enter.**
- **AWS Builder architecture if pursued: Bedrock + AgentCore Memory.**
- **Single-call Bedrock padding: NO.**
- **Replacing Host orchestration with Strands: NO.**
- **Converting the current simulated route to AgentCore Gateway/MCP solely for the mini challenge: NO.**

### Current blocker

A real AWS Builder implementation cannot be verified until AWS account/credential access is available to the project environment.

This is an external access blocker, not a reason to substitute mocked AWS calls or to claim an integration prematurely.

## Exact continuation

If AWS access becomes available, continue with the controlled Bedrock + AgentCore Memory implementation plan above.

If AWS access is deliberately not supplied, retain the verified Stage 07 Alexa+ build, enter the Open Source mini challenge, and proceed to Stage 09 hardening without claiming AWS Builder.
