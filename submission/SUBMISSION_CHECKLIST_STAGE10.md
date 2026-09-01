# Stage 10 — Controlled Submission Checklist

Current status: Stage 09 product is published and verified; Stage 10 narrative, feedback, friction, video plan and real application screenshots are prepared; hosted deployment, final visual audit, public demo video and Devpost submission remain pending.

## A. Product/repository gate

- [x] Public GitHub repository exists.
- [x] MIT licence is present.
- [x] Simulation source is in the repository.
- [x] Run/build/test instructions are in the README.
- [x] Stage 09 release is on public `main`.
- [x] Published Stage 09 `main` passes 74/74 backend/application tests.
- [x] Clean release candidate passed 26/26 Chromium browser touch/voice/hardening cases.
- [x] Production dependency audit reports zero vulnerabilities at verified gate.
- [x] Alexa+ simulation boundary is explicit.
- [x] Simulated products/checkout are explicitly labelled.
- [x] No AWS/Bedrock/AgentCore claim is present.
- [ ] Check repository About section visibly exposes the licence if Devpost requires it at the repository metadata level, not only as `LICENSE`.

## B. Devpost narrative

- [x] Project title selected.
- [x] Elevator pitch drafted.
- [x] Full project description drafted.
- [x] Inspiration drafted.
- [x] What it does drafted.
- [x] How it was built drafted.
- [x] Challenges drafted.
- [x] Accomplishments drafted.
- [x] What was learned drafted.
- [x] What's next drafted.
- [x] Judging-criteria framing prepared.
- [ ] Copy into actual Devpost form and adapt only to real field limits.
- [ ] Preview final Devpost page for formatting/line-break issues.

## C. Track / mini challenge

- [x] Alexa+ primary track selected in controlled plan.
- [x] Simulated web route verified against current rules.
- [x] Open Source mini challenge selected.
- [x] Public repo URL recorded.
- [x] GitHub username recorded.
- [x] Contribution URL recorded.
- [x] Open Source what/how/why response prepared and refreshed to Stage 09 evidence.
- [ ] Recheck Open Source form fields immediately before final submission.
- [ ] Select Open Source mini challenge in Devpost.
- [ ] Do not select AWS Builder unless a real AWS implementation is later added and verified.

## D. Product/tool feedback

- [x] Alexa+ simulated-route feedback drafted.
- [x] Accessibility-guide feedback drafted.
- [x] Components/patterns feedback drafted.
- [x] Browser Web Speech disclosure/feedback drafted.
- [x] Optional feature request drafted.
- [ ] Adapt to actual Devpost feedback field layout/limits.

## E. Friction logs

- [x] Simulated-route compliance friction drafted.
- [x] Simulation/design-guidance mapping friction drafted.
- [x] Voice-only verification friction drafted.
- [x] Generic technology wording vs simulation exception friction drafted.
- [ ] Enter only genuine relevant entries exposed by the final form.
- [ ] Preserve task / steps / expected / actual / severity / workaround / actionable suggestion structure.

## F. Screenshots / gallery

- [x] Controlled shot list prepared.
- [x] Reproducible Playwright capture script prepared.
- [x] Capture hero event-state image from the real application.
- [x] Capture menu/confirmation image from the real application.
- [x] Capture authoritative shopping image from the real application.
- [x] Capture Live Mode image from the real application.
- [x] Capture late-change impact image from the real application.
- [x] Capture Activity receipts image from the real application.
- [x] Capture one mobile Live image from the real application.
- [x] Validate all seven captured files as PNGs with expected dimensions.
- [x] Record URLs/captions/proposed order in `submission/GALLERY_INDEX_STAGE10.md`.
- [ ] Capture a dedicated voice-state image only if visual review shows it adds more value than the current seven images.
- [ ] Perform human/visual audit of every final image for legibility, clipping, transient UI and false-integration implications.
- [ ] Lock strongest final gallery order/crops after visual audit.

Successful gallery workflow: `33564617297`.

## G. Demo video

- [x] Under-three-minute script drafted.
- [x] Timing plan drafted.
- [x] Core differentiating late-change sequence included.
- [x] Simulation boundary included.
- [x] Voice parity included.
- [x] Activity/receipt proof included.
- [ ] Record clean uninterrupted source run.
- [ ] Edit to approximately 2:40–2:50.
- [ ] Confirm final runtime is under 3:00.
- [ ] Confirm narration/text is English.
- [ ] Confirm no unlicensed music/footage/trademarks are used beyond permitted product references.
- [ ] Upload public to YouTube or Vimeo.
- [ ] Watch final public stream end-to-end after platform processing.
- [ ] Insert final URL into Devpost.

## H. Deployment

- [x] Production static build verified.
- [x] Relative asset paths make build provider-independent.
- [ ] Obtain a supported hosted deployment path.
- [ ] Deploy exact verified source/build.
- [ ] Smoke-test Plan / menu / shopping / Live / change / Activity on hosted URL.
- [ ] Test hosted mobile layout.
- [ ] Test hosted keyboard path.
- [ ] Test voice availability/fallback on at least one real browser.
- [ ] Add hosted URL only after these checks.

**Competition-control note:** the currently verified rules require a working demo, public repo and public under-three-minute video for the simulated Alexa+ route. A hosted project URL is useful but must not be invented or treated as verified until one exists.

## I. Final integrity audit

- [ ] Re-read current competition overview and official rules on submission day.
- [ ] Verify deadline/time zone.
- [ ] Verify repo remains public.
- [ ] Verify final `main` commit and README are correct.
- [ ] Verify all URLs from a logged-out/private browser session.
- [ ] Verify no AWS claim slipped into Devpost/Built With.
- [ ] Verify all simulated-commerce language remains explicit.
- [ ] Verify test counts quoted in submission match the final release evidence.
- [ ] Verify screenshots/video show actual product behavior.
- [ ] Remove or deliberately retain Stage 10 temporary capture workflow/trigger before merging permanent submission materials.
- [ ] Submit before deadline.
- [ ] Reopen submitted project page and verify saved content/media after submission.
