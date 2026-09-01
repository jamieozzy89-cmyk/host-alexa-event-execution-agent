# Stage 10 — Friction Log Draft

Prepared: 1 September 2026

These entries are limited to genuine friction encountered while using the Alexa+ hackathon route and Alexa+ developer guidance. They are written to match Devpost's requested structure: task, steps, expected result, actual result, severity, workaround, and actionable suggestion.

## Friction 1 — Determining the exact simulated Alexa+ compliance path

**Task attempted**

Confirm what a simulated Alexa+ web submission must contain and prove.

**Steps taken**

1. Read the hackathon Alexa+ track requirements.
2. Read the general repository technology requirement.
3. Cross-checked the Alexa+ simulation exception.
4. Cross-checked the demo-video requirements.
5. Re-read the rules before release/submission work to ensure the route had not changed.

**Expected**

A single route-specific checklist clearly separating production Agent Skill/MCP requirements from the simulated-web route.

**Actual**

The competition page does contain the necessary simulation exception, including that no specific framework/SDK is required, but the relevant requirements are distributed across the Alexa+ track description, general repository requirements and simulation-specific exception. Detailed Alexa+ developer documentation then naturally focuses on production add-ons/MCP/Category SDK work, so route boundaries require careful cross-checking.

**Severity**

Medium — no technical blocker, but it creates avoidable compliance uncertainty and can encourage unnecessary integration work.

**Workaround used**

Maintained a controlled project decision record and repeatedly rechecked the explicit Devpost simulated-route wording before making technology or submission claims.

**Actionable suggestion**

Publish a one-page **Alexa+ simulated-hackathon compliance checklist** with columns for Simulated Web / MCP Add-on / Agent Skill showing exactly which source, demo, SDK, hosting and certification requirements apply to each route.

---

## Friction 2 — Mapping production Alexa+ design guidance onto a web simulation

**Task attempted**

Make the simulated experience feel consistent with Alexa+ interaction principles without falsely claiming production add-on integration.

**Steps taken**

1. Read the Alexa+ Components and Patterns guidance.
2. Identified transferable List/Card/confirmation/status patterns.
3. Read the accessibility/input-parity guidance.
4. Converted those principles into browser UI acceptance criteria.
5. Added automated touch-target, focus and Axe checks.

**Expected**

A framework-neutral reference showing how the same Alexa+ design principles should be represented in the explicitly permitted simulated-web route.

**Actual**

The design guidance is useful and concrete, but it is written for Alexa+ add-ons. Applying it to a simulation requires the entrant to decide which behavior is conceptual/transferable and which behavior is owned by the real Alexa surface.

**Severity**

Low to medium — the guidance itself is strong, but simulation entrants can produce inconsistent interpretations.

**Workaround used**

Used the documentation as a design constraint rather than claiming literal Alexa rendering. Host implements transferable behavior such as concise spoken responses, structured lists/cards, confirmations, input parity and large touch targets while explicitly labelling the experience a simulation.

**Actionable suggestion**

Add a small simulated-web reference project demonstrating the intended hierarchy for transcript, List, Card/Carousel-like choices, confirmations and status/receipt surfaces.

---

## Friction 3 — Voice-only verification for the simulated route

**Task attempted**

Verify a complete voice-only journey while also maintaining an independently complete touch path.

**Steps taken**

1. Used the Alexa+ accessibility requirement that the experience should be completable through voice only or touch only.
2. Implemented browser speech recognition/synthesis as an optional simulation adapter.
3. Routed recognized text through the same authoritative orchestrator as typed input.
4. Built deterministic fake Web Speech objects in Playwright.
5. Verified menu choice, confirmation/cancellation, simulated checkout, prep, next-action and task completion through the voice path.
6. Added explicit fallback when browser speech capabilities are unavailable.

**Expected**

A recommended Alexa+ simulated-route voice harness or testing pattern explaining what needs to be demonstrated when physical Alexa infrastructure is intentionally not part of the submission route.

**Actual**

The input-parity requirement is clear, but simulation-specific browser voice testing is left to the entrant. Browser speech implementations also vary by browser/device/permission state.

**Severity**

Medium — it does not prevent implementation, but voice-only claims can otherwise become difficult to test reproducibly.

**Workaround used**

Separated the browser speech adapter from the authoritative application path and used deterministic browser test doubles to verify Host's control flow and state effects without claiming microphone/acoustic certification.

**Actionable suggestion**

Provide a first-party simulated Alexa+ voice-test adapter or sample harness with deterministic recognition/synthesis events, plus explicit guidance on what a simulated-route demo must prove versus what requires real-device certification.

---

## Friction 4 — General technology wording versus the Alexa+ simulation exception

**Task attempted**

Make sure the public repository satisfies the hackathon's technology-evidence requirement without inventing an Alexa SDK/MCP dependency.

**Steps taken**

1. Read the general rule that Alexa+/Bee/Ring repositories need to actually call required technology in code rather than merely mention it.
2. Read the immediately following Alexa+ simulated-experience exception.
3. Confirmed that the simulation route says no specific framework or SDK is required if the source is present and the demo clearly shows it working.
4. Kept the repository explicit about the simulation boundary and deliberately did not add a token SDK/import merely for appearances.

**Expected**

Route-specific language with no apparent tension between the generic technology rule and the simulation exception.

**Actual**

The exception resolves the requirement, but a developer scanning the generic rule first can initially conclude that an Alexa technology import is mandatory even for the explicitly permitted simulated route.

**Severity**

Medium — the wording can encourage shallow or unnecessary technology padding if not read carefully.

**Workaround used**

Used the explicit simulation exception as controlling language and documented the route throughout the repository and submission draft.

**Actionable suggestion**

Rewrite the repository requirement as a three-row route table. For the Alexa+ simulated route, state directly: "No Alexa SDK/MCP import required; repository must contain the working simulation source and the video must demonstrate it."

---

# Submission control

Before pasting these into Devpost:

- keep only friction actually experienced;
- do not turn unrelated GitHub/Vercel issues into Amazon product friction;
- preserve the requested severity/workaround/suggestion structure;
- edit only for field-length limits, not to exaggerate severity;
- if Devpost asks for a separate friction entry per Amazon tool rather than general Alexa+ route friction, map these only to the Alexa+ hackathon/docs surfaces actually used.
