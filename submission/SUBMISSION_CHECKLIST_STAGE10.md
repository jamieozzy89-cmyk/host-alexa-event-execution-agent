# Stage 10 — Controlled Submission Checklist

Current status: Stage 09 product is published and verified; Stage 10 narrative, exact Devpost field map, feedback, friction, visually audited gallery, 3:2 thumbnail and uninterrupted real-app demo source run are prepared; final public demo video, Devpost entry and optional hosted deployment remain pending.

## A. Product/repository gate

- [x] Public GitHub repository exists.
- [x] MIT licence is present.
- [x] GitHub repository metadata directly detects the licence as **MIT License**.
- [x] Simulation source is in the repository.
- [x] Run/build/test instructions are in the README.
- [x] Stage 09 release is on public `main`.
- [x] Published Stage 09 `main` passes 74/74 backend/application tests.
- [x] Clean release candidate passed 26/26 Chromium browser touch/voice/hardening cases.
- [x] Production dependency audit reports zero vulnerabilities at verified gate.
- [x] Alexa+ simulation boundary is explicit.
- [x] Simulated products/checkout are explicitly labelled.
- [x] No AWS/Bedrock/AgentCore claim is present.
- [ ] Optional repository polish: add an About description/topics if a supported metadata-edit route becomes available. This is not a stated submission requirement.

## B. Devpost narrative / field map

- [x] Project title selected.
- [x] Full project description drafted.
- [x] Inspiration drafted.
- [x] What it does drafted.
- [x] How it was built drafted.
- [x] Challenges drafted.
- [x] Accomplishments drafted.
- [x] What was learned drafted.
- [x] What's next drafted.
- [x] Judging-criteria framing prepared.
- [x] Verify Devpost standard field structure from current Help Center documentation.
- [x] Verify project tagline maximum: **140 characters**.
- [x] Lock compliant 100-character tagline: `An Alexa+ hosting agent that executes menu, shopping and prep while tracking what actually happened.`
- [x] Verify thumbnail guidance: JPG/PNG/GIF, maximum 5 MB, 3:2 recommended.
- [x] Prepare visually checked **1200×800, ~268 KB** Live Mode thumbnail.
- [x] Verify Built With maximum: **25 tags**; controlled list uses 11 verified technologies plus optional Alexa+ sponsor tag.
- [x] Verify Markdown is supported in the project story.
- [x] Create exact field mapping in `submission/DEVPOST_FIELD_MAP_STAGE10.md`.
- [x] Confirm no public official project-story character maximum was found in the currently accessible Devpost participant guidance; do not arbitrarily shorten before seeing the form.
- [ ] Copy into actual logged-in Devpost form and adapt only to any real custom-field limits shown there.
- [ ] Upload 3:2 thumbnail and inspect Devpost's own crop.
- [ ] Preview final Devpost page for formatting/line-break issues.

## C. Track / mini challenge

- [x] Alexa+ primary track selected in controlled plan.
- [x] Simulated web route verified against current rules.
- [x] Open Source mini challenge selected.
- [x] Public repo URL recorded.
- [x] GitHub username recorded.
- [x] Contribution URL recorded.
- [x] Open Source what/how/why response prepared and refreshed to Stage 09 evidence.
- [x] Current Amazon rules rechecked: simulated Alexa+ web route remains explicitly valid and exempt from the generic runtime-technology-hook requirement.
- [ ] Recheck Open Source form fields immediately before final submission.
- [ ] Select Open Source mini challenge in Devpost.
- [ ] Do not select AWS Builder unless a real AWS implementation is later added and verified.

## D. Product/tool feedback

- [x] Alexa+ simulated-route feedback drafted.
- [x] Accessibility-guide feedback drafted.
- [x] Components/patterns feedback drafted.
- [x] Browser Web Speech disclosure/feedback drafted.
- [x] Optional feature request drafted.
- [x] Current Amazon rules rechecked: feedback must cover tools used/why, what worked, what needs work, onboarding, and whether the entrant would build with them again.
- [ ] Adapt to actual logged-in Devpost feedback field layout/limits.

## E. Friction logs

- [x] Simulated-route compliance friction drafted.
- [x] Simulation/design-guidance mapping friction drafted.
- [x] Voice-only verification friction drafted.
- [x] Generic technology wording vs simulation exception friction drafted.
- [x] Current rules rechecked: genuine friction logs can contribute up to a **10% judging bonus**.
- [ ] Enter only genuine relevant entries exposed by the final form.
- [ ] Preserve task / steps / expected / actual / severity / workaround / actionable suggestion structure.

## F. Screenshots / gallery

- [x] Controlled shot list prepared.
- [x] Reproducible Playwright capture script prepared.
- [x] Capture hero event-state image from the real application.
- [x] Capture menu/confirmation reserve image from the real application.
- [x] Capture authoritative shopping image from the real application.
- [x] Capture Live Mode image from the real application.
- [x] Capture late-change impact image from the real application.
- [x] Capture Activity receipts image from the real application.
- [x] Capture one mobile Live image from the real application.
- [x] Validate all seven captured files as PNGs with expected dimensions.
- [x] Export exact repository PNGs and inspect them directly at full resolution and as a contact sheet.
- [x] Audit legibility, clipping, transient UI, simulation implications and thumbnail/story value.
- [x] Lock final six-image gallery order in `submission/GALLERY_INDEX_STAGE10.md`.
- [x] Keep menu confirmation as reserve rather than uploading a redundant seventh image.
- [x] Dedicated voice-state image assessed as unnecessary for the current gallery; voice is better demonstrated in video/text than by an idle browser state.
- [ ] Confirm Devpost's own thumbnail/crop rendering does not materially damage the locked images during actual upload.

Successful gallery capture workflow: `33564617297`.

Successful gallery export/audit artifact workflow: `33569094876`.

Locked order: Live Mode → late-change impact → Activity receipts → authoritative shopping → event created → mobile Live.

## G. Demo video

- [x] Under-three-minute script drafted.
- [x] Timing plan drafted.
- [x] Core differentiating late-change sequence included.
- [x] Simulation boundary included.
- [x] Voice parity included in the final narration/run plan.
- [x] Activity/receipt proof included.
- [x] Record one clean uninterrupted source run from the real working application.
- [x] Reverify `npm test` and production web build immediately before the source recording.
- [x] Validate recorded WebM and preserve it as a downloadable workflow artifact.
- [x] Confirm uninterrupted source runtime: **35.96 seconds**, 1280 × 800.
- [x] Preserve a local MP4 conversion for review/editing.
- [x] Visually inspect representative source-video frames/contact sheet; Live and Activity states are clear and readable.
- [x] Evaluate locally available synthetic narration. Only robotic system `espeak` is available; rejected for the final cut because it would reduce presentation quality.
- [ ] Record/edit the final human-quality narrated or otherwise fully self-explanatory public cut. The 35.96-second silent captioned run is source material, not yet the final submission video.
- [ ] Confirm final runtime is under 3:00.
- [ ] Confirm final narration/text is English.
- [ ] Confirm no unlicensed music/footage/trademarks are used beyond permitted product references.
- [ ] Demonstrate voice honestly in the final cut if shown; do not present deterministic test fakes as live microphone evidence.
- [ ] Upload public to YouTube or Vimeo.
- [ ] Watch final public stream end-to-end after platform processing.
- [ ] Insert final URL into Devpost.

Successful uninterrupted-source workflow: `33568858893`.

Artifact: `host-stage10-demo-source-run` (GitHub Actions artifact id `9824201533`, retained for 30 days from 1 September 2026).

## H. Deployment

- [x] Production static build verified.
- [x] Relative asset paths make build provider-independent.
- [x] Current rules rechecked: judges can evaluate via repository + demonstration video; a public hosted app is useful but not mandatory for the selected simulated Alexa+ route.
- [ ] Obtain a supported hosted deployment path if worthwhile before submission.
- [ ] If deployed, smoke-test Plan / menu / shopping / Live / change / Activity on hosted URL.
- [ ] If deployed, test hosted mobile layout, keyboard path and voice availability/fallback.
- [ ] Add hosted URL only after those checks.

## I. Final integrity audit

- [ ] Re-read current competition overview and official rules on submission day.
- [ ] Verify deadline/time zone.
- [ ] Verify repo remains public and GitHub still detects the MIT licence.
- [ ] Verify final `main` commit and README are correct.
- [ ] Verify all URLs from a logged-out/private browser session.
- [ ] Verify no AWS claim slipped into Devpost/Built With.
- [ ] Verify all simulated-commerce language remains explicit.
- [ ] Verify test counts quoted in submission match the final release evidence.
- [ ] Verify screenshots/video show actual product behavior.
- [ ] Remove or deliberately retain Stage 10 temporary capture/export/demo workflows and triggers before merging permanent submission materials.
- [ ] Submit before deadline.
- [ ] Reopen submitted project page and verify saved content/media after submission.
