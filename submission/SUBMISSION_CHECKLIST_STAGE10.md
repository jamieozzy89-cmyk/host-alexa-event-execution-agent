# Stage 10 — Controlled Submission Checklist

**Control status:** ACTIVE submission checklist for the current repository state.  
**Current accepted product:** promoted second editorial refinement on `main`.  
**Verified product-code commit:** `e80fc18517111e55f3813c4e4eddf1c7428769a2`.  
**Current repository branch:** `main`.  
**Important:** the current product is an accepted engineering baseline, not yet the intended competition-final Host product. A new competition-grade product specification/build is being created before final submission materials are locked.

## A. Product/repository baseline

- [x] Public GitHub repository exists.
- [x] MIT licence is present.
- [x] GitHub repository metadata detects the licence as MIT.
- [x] Simulation source is in the repository.
- [x] Run/build/test instructions are in the README.
- [x] Promoted second editorial refinement is on `main`.
- [x] Verified product code passed 74/74 backend/application tests.
- [x] Verified product code passed production TypeScript/Vite build.
- [x] Verified product code passed 26/26 Chromium browser cases across Echo Show-like and mobile projects.
- [x] Existing Axe WCAG A/AA scope passed inside that browser gate.
- [x] Dependency install/audit output at the refinement gate reported zero vulnerabilities for the audited install.
- [x] Alexa+ simulation boundary is explicit.
- [x] Simulated products/checkout are explicitly labelled.
- [x] No AWS/Bedrock/AgentCore claim is present.
- [x] Stage 10 capture/demo/gallery/package workflows now target `main`, not superseded branches.
- [ ] Build the new competition-grade Host product defined by the controlling product specification.
- [ ] Re-run the full final product gate after that build.
- [ ] Decide whether a standards-compliant self-hosted MCP server / Agent Skill path will be included after implementation and verification.
- [ ] Decide whether AWS Builder will be entered only after real AWS implementation exists and is verified.

## B. Current submission narrative state

The previous detailed Devpost draft described the pre-competition-build baseline and is no longer a final submission source. `submission/DEVPOST_STAGE10_DRAFT.md` now acts as a controlled placeholder until the new product is built.

- [x] Project title selected: `Host: Alexa+ Event Execution Agent`.
- [x] Primary track selected: Alexa+.
- [x] Open Source mini challenge selected.
- [x] Public repository URL exists.
- [x] Current official rules verified on 2 September 2026.
- [x] Current Alexa+ route verified: working Agent Skill is prioritized; self-hosted MCP server implementing MCP 2025-11-25+ over Streamable HTTP is accepted; simulated Alexa+ experience remains explicitly permitted.
- [x] Current judging criteria verified: Tech Implementation, Design, Potential Impact, Quality of Idea are equally weighted.
- [ ] Rewrite the complete Devpost story from the final product rather than patching the old draft.
- [ ] Verify all final claims directly against final source/evidence.
- [ ] Copy into the actual logged-in Devpost form and adapt only to real form constraints.
- [ ] Preview final Devpost page for formatting and media issues.

## C. Track / mini challenge

- [x] Alexa+ primary track selected in controlled plan.
- [x] Simulated Alexa+ route remains eligible under current official rules.
- [x] Open Source mini challenge selected.
- [x] Public repo URL recorded.
- [x] GitHub username recorded in existing submission material.
- [x] Existing Open Source evidence is retained as historical/current-baseline evidence.
- [ ] Rebuild Open Source evidence around the final competition product, tests and any MCP/integration pattern actually delivered.
- [ ] If MCP is implemented, verify Streamable HTTP and minimum MCP 2025-11-25 compliance before claiming it.
- [ ] If an Agent Skill is implemented, verify a working runtime path before claiming it.
- [ ] Recheck Open Source form fields immediately before final submission.
- [ ] Select Open Source mini challenge in Devpost.
- [ ] Do not select AWS Builder unless real AWS implementation has been added and verified.

## D. Product/tool feedback

Existing feedback drafts are retained but must be refreshed against the final product and the tools actually used.

- [x] Baseline Alexa+ simulated-route feedback drafted.
- [x] Baseline accessibility-guide feedback drafted.
- [x] Baseline components/patterns feedback drafted.
- [x] Baseline Browser Web Speech disclosure/feedback drafted.
- [x] Optional feature request material exists.
- [ ] Add feedback for any MCP, model, AWS, hosting or external integration tools actually used in the final build.
- [ ] Remove feedback for any tool not actually used.
- [ ] Adapt to the real logged-in Devpost feedback field layout/limits.

## E. Friction logs

- [x] Existing genuine friction material is retained.
- [x] Current rules rechecked: friction logs can contribute up to a 10% judging bonus.
- [ ] Record new genuine friction encountered during the competition-grade build.
- [ ] Preserve task / steps / expected / actual / severity / workaround / actionable suggestion structure.
- [ ] Enter only genuine relevant entries exposed by the final form.

## F. Current gallery evidence

The current seven-state gallery is evidence of the promoted redesign baseline. It is **not locked as the final competition gallery** because the final product is now being redesigned/rebuilt around Event Home, Run Sheet, Live execution, impact analysis and receipts.

Current verified baseline captures:

1. event-created state;
2. menu confirmation;
3. authoritative shopping;
4. Live Mode;
5. late-change impact;
6. Activity receipts;
7. mobile Live Mode.

Baseline gallery evidence:

- [x] Seven real states captured from the working application.
- [x] Six desktop images validated at 1280×800.
- [x] Mobile Live validated at 390×844.
- [x] Seven states directly visually audited.
- [x] Refined gallery export artifact produced.
- [ ] Replace the baseline gallery with final-product canonical states after the new build exists.
- [ ] Final intended gallery should be selected from actual final-product evidence, not from the old seven-state order.
- [ ] Confirm Devpost thumbnail/crop rendering during actual upload.

Current refined gallery artifact for baseline evidence:

- GitHub Actions artifact ID: `9828517705`;
- SHA-256: `3ebba29dfab769fd46f2bb3f975434498b30d327afb0df42ad726015599fc648`.

## G. Demo video

The existing uninterrupted recording is source evidence for the promoted baseline only. It is not the final competition video.

- [x] Existing under-three-minute script material exists.
- [x] Baseline uninterrupted working source run was recorded and validated.
- [x] Refined baseline source recording artifact exists.
- [x] Sampled baseline frames were directly examined.
- [ ] Rewrite the final demo around the actual final product and its strongest end-to-end workflow.
- [ ] Record final real working product source footage.
- [ ] Demonstrate the signature late-change flow early.
- [ ] If MCP/Agent Skill/external orchestration is implemented, show real runtime evidence rather than narration-only claims.
- [ ] Produce a human-quality narrated or otherwise fully self-explanatory public cut.
- [ ] Confirm final runtime is under 3:00.
- [ ] Confirm final narration/text is English.
- [ ] Confirm no unlicensed music/footage/trademarks are used beyond permitted product references.
- [ ] Upload publicly to YouTube or Vimeo.
- [ ] Watch final public stream end-to-end after platform processing.
- [ ] Insert final URL into Devpost.

Current refined baseline source artifact:

- artifact ID: `9828582371`;
- SHA-256: `b27c910ecec716437e8a935b0c51b0121395d79588364fe0e1d2ff9312fdee02`;
- source is silent captioned working-app evidence, not a final public video.

## H. Deployment / judge access

- [x] Production static build has been verified for the current baseline.
- [x] Relative asset paths are provider-independent.
- [x] Current rules permit judges to evaluate through repository + demo video; a public hosted app is useful but not mandatory for the simulated Alexa+ route.
- [ ] Select and implement a real hosted deployment path for the final product if it materially improves judging access.
- [ ] If an MCP server is part of the final entry, host the actual Streamable HTTP endpoint and preserve judge/testing instructions.
- [ ] Smoke-test the final hosted product from a clean/logged-out browser.
- [ ] Test final mobile layout and voice fallback on the hosted product.
- [ ] Add hosted URLs only after those checks.

## I. Final integrity audit

Perform only after the competition-grade product is built and submission materials have been regenerated.

- [ ] Re-read current competition overview and official rules on submission day.
- [ ] Verify deadline and time zone.
- [ ] Verify repo remains public and GitHub still detects the MIT licence.
- [ ] Verify final `main` commit and README are correct.
- [ ] Verify all URLs from a logged-out/private browser session.
- [ ] Verify all AWS/MCP/Agent Skill/external-service claims are backed by real implementation evidence.
- [ ] Verify all simulated-commerce language remains explicit wherever simulation remains.
- [ ] Verify all test counts quoted in submission match final release evidence.
- [ ] Verify screenshots/video show actual final product behavior.
- [ ] Verify repository contains all source, assets and instructions required for the judged product.
- [ ] Deliberately retain or remove temporary evidence workflows/triggers based on final repository requirements; do not leave stale controls accidentally.
- [ ] Submit before 23 October 2026, 12:00 PM PDT / 20:00 BST.
- [ ] Reopen the submitted project page and verify saved content/media after submission.
