# Phase D1 Verification — Structured Conversational Understanding Boundary

Date: 3 September 2026

Repository: `jamieozzy89-cmyk/host-alexa-event-execution-agent`

Development branch: `host-competition-build`

Protected baseline branch: `main`

## Status

Phase D1 product code passed the complete competition-build gate on exact code head:

`e5e0bd428af04c391907cc77ebe4b2db724495f8`

Workflow: `Competition build verification`

Run: `33813403037`

Job: `100840137204`

Conclusion: **success**

This report is committed after that successful code-head run. The later report/handover preservation head must pass the same complete gate before D1 is called closed.

## Objective

D1 establishes a richer conversational-understanding boundary without allowing model output to become authoritative state.

Permanent path:

`customer text -> non-authoritative understanding -> deterministic validation/resolution -> Host tool -> domain validation -> persistence/receipt -> customer response`

A model may propose facts and customer meaning. It may not confirm, persist, execute or prove them.

D1 is narrower than the complete Phase D roadmap. It does not yet wire the new understanding object into authoritative orchestration, add inventory-coverage mutation, add WorkflowSuggestion/Explanation contracts, or prove a real external model call.

## Implemented source

Controlling D1 contract:

`docs/PHASE_D_FACT_ACQUISITION_CONTRACT_V1.md`

### `src/model/types.ts`

Adds non-authoritative contracts for:

- one or more bounded customer intent candidates;
- candidate event facts;
- candidate constraints;
- soft preferences;
- inventory review and inventory candidates;
- conversational-reference candidates;
- explicit ambiguities;
- overall confidence/evidence;
- understanding context/input;
- structured model and interpreter interfaces.

The model-facing type surface contains no arbitrary executable tool-name field and no trusted domain IDs supplied by the model.

### `src/model/schema.ts`

Adds a strict application parser/validator and provider JSON Schema.

Application bounds:

- maximum 8 intents;
- maximum 16 constraints;
- maximum 16 preferences;
- maximum 64 inventory candidates;
- maximum 16 references;
- maximum 8 ambiguities;
- maximum 500 characters for each structured text field.

The parser rejects non-object output, unknown top-level/nested fields, unsupported enums, invalid confidence, invalid numeric facts, contradictory inventory evidence, oversized output and arbitrary extra execution fields.

Inventory candidate semantics:

- `stated_quantity` requires positive quantity and unit;
- `enough` cannot carry invented quantity/unit;
- `identity_only` cannot carry invented quantity/unit;
- `none` requires customer evidence and zero items;
- `items` requires customer evidence and one or more candidates;
- `unspecified` carries no evidence/items.

### `src/model/provider.ts`

Adds:

- `ModelCustomerUnderstandingInterpreter`;
- `LegacyIntentUnderstandingInterpreter`;
- `ResilientUnderstandingInterpreter`.

Provider-backed evidence and reference text are normalized and checked against the actual customer input. Unsupported/paraphrased/invented evidence is rejected before the understanding object is accepted.

The preferred path is selected only when confidence is sufficient and the result is semantically meaningful. A high-confidence object containing only `unknown` with no other useful facts cannot suppress deterministic fallback.

Legacy deterministic behavior remains available through the existing `HeuristicIntentInterpreter`.

### `server/openai-understanding-provider.ts`

Adds a server-only raw-fetch OpenAI Responses adapter.

Controls include:

- server-only API-key configuration;
- configurable model and endpoint;
- default timeout 12 seconds;
- default customer-input bound 8,000 characters;
- default output limit 4,000 tokens;
- `store: false`;
- strict `text.format` JSON-schema request;
- non-2xx response rejected;
- API-error payload rejected;
- response must explicitly have `status: "completed"`;
- refusal rejected;
- zero structured payloads rejected;
- multiple structured output payloads rejected;
- invalid JSON rejected.

Provider-side schema conformance is not application authority. Returned data still passes the Host parser and evidence checks.

### `server/index.ts`

Adds the server-only preferred/fallback factory:

`OpenAIResponsesUnderstandingModel -> ModelCustomerUnderstandingInterpreter -> ResilientUnderstandingInterpreter -> deterministic HeuristicIntentInterpreter fallback`

No provider secret is added to `web/runtime.ts` or the browser application surface.

### Public application surface

`src/application/index.ts` exports the D1 non-authoritative understanding contracts/parser/interpreters. It still does not expose `HostDomainEngine` as a customer mutation route.

`tsconfig.json` includes `server/**/*.ts` so the server-only adapter is typechecked by the normal application build.

## Direct source-audit corrections before commit

D1 was not accepted at its first plausible draft.

1. **High-confidence empty unknown:** preferred output must be both above threshold and semantically meaningful; otherwise deterministic fallback runs.
2. **Unbounded structured output:** explicit parser/schema array and text limits were added.
3. **Incomplete/ambiguous provider response:** only explicit `completed` responses with exactly one structured output payload can continue; refusals/errors/missing/multiple payloads fail safely.
4. **Ungrounded model evidence:** evidence/reference text must normalize to spans in the customer input.
5. **Inventory evidence discipline:** `none`/`items` require direct customer evidence; identity-only/enough candidates cannot smuggle quantity/unit values.

## Verification evidence

Exact code head: `e5e0bd428af04c391907cc77ebe4b2db724495f8`

Run: `33813403037`

Job: `100840137204`

Environment:

- Ubuntu 24.04;
- Node 22.12.0;
- npm 10.9.0.

### Backend/application

Command: `npm test`

Result:

- **118 tests**;
- **118 passed**;
- **0 failed**;
- **0 cancelled**;
- **0 skipped**;
- **0 todo**.

The prior controlled suite had 99 tests. D1 adds 19 focused tests.

The 19 D1 checks cover:

1. bounded multi-intent parsing;
2. arbitrary execution-field rejection;
3. unknown nested-field rejection;
4. array/text bounds;
5. zero-inventory evidence requirement;
6. stated quantity requires quantity+unit;
7. identity-only cannot carry invented quantity;
8. ungrounded provider evidence rejected;
9. normalized grounded evidence accepted;
10. deterministic legacy fallback;
11. fallback on provider failure;
12. fallback below confidence threshold;
13. high-confidence empty unknown cannot suppress useful fallback;
14. bounded strict Responses request/server-secret boundary;
15. non-success HTTP rejected;
16. incomplete response rejected despite parseable text;
17. refusal rejected;
18. multiple structured payloads rejected;
19. input-character bound enforced before network call.

### Dependency/security

Command: `npm audit --omit=dev`

Result: **0 vulnerabilities**.

The clean dependency install also reported 0 vulnerabilities.

### Production web build

Command: `npm run build:web`

Result:

- web TypeScript no-emit check passed;
- Vite 8.2.2 production build passed;
- 40 modules transformed;
- production assets emitted successfully.

D1 does not place provider credentials into the browser runtime.

### Browser regression

Command: `npx playwright test`

Result:

- **26 tests**;
- **26 passed**;
- **0 failed**;
- Echo-like and mobile projects.

Existing touch/voice, late-change confirmation, reload/recovery, accessibility, focus, privacy/storage and deterministic network-boundary controls remained passing.

D1 does not claim a visual redesign.

## Code-head controlled artifact

Artifact name: `host-competition-build-source`

Artifact ID: `9915769333`

Artifact size: `804225` bytes

Outer artifact SHA-256:

`59c6f1683a7e37d2c50d8cf945e7c3d822579af5c9f69a8d194f0137c4d7cc59`

Artifact provenance:

- `source_branch=host-competition-build`;
- `source_commit=e5e0bd428af04c391907cc77ebe4b2db724495f8`;
- `created_utc=2026-09-03T22:35:51Z`.

Inner source ZIP SHA-256:

`98e411be1bf1e7b1caa440a048f0b27db303afed2e84887e528087999167c59f`

The artifact was independently downloaded and extracted after CI. Its downloaded outer checksum exactly matched GitHub's artifact digest and:

`sha256sum -c HOST_COMPETITION_BUILD_SOURCE.zip.sha256`

returned:

`HOST_COMPETITION_BUILD_SOURCE.zip: OK`

## Repository-control issue recorded during D1

An unnecessary temporary branch was created while preparing the atomic D1 write:

`host-d1-staging-temp`

It points to the already-verified Phase C head:

`f007ef48e3f53bd2f26846692a2d511bd9fe2dd2`

It contains no D1 product changes and is not an authorised continuation branch. The available connector exposed file deletion but not branch-ref deletion, so it could not be removed in this environment. Do not use it. If branch deletion becomes available later, delete it only after verifying it still points to that historical Phase C state.

The real development branch remains only `host-competition-build`.

## D1 non-claims

D1 does **not** claim:

- a real external OpenAI/model request was executed;
- provider credentials are configured in production;
- `CustomerUnderstanding` is already wired into authoritative customer orchestration;
- free-text inventory has become authoritative;
- `confirm_inventory_coverage` exists;
- `WorkflowSuggestion` exists;
- `ExplanationInput` / `ExplanationOutput` exist;
- whole Phase D is complete;
- production AWS/Bedrock/AgentCore integration;
- production MCP/Alexa deployment;
- final recipe-safety semantics;
- final timing intelligence;
- final competition UI/video/submission.

## D1 close condition

D1 is closed only after:

1. this report is committed;
2. `HANDOVER.md` is updated to the D1 state;
3. the resulting exact preservation head passes the complete competition-build workflow;
4. 118/118 application/backend tests remain passing;
5. production dependency audit remains clean;
6. production web build remains passing;
7. 26/26 browser tests remain passing;
8. a new controlled source artifact is uploaded and independently checksum/provenance verified.

Only after that preservation gate should work move into D2 controlled orchestrator/inventory-coverage integration.
