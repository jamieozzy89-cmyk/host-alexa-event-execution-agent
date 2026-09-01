# Stage 10 — Product / Tool Feedback Draft

Prepared: 1 September 2026

This draft is intended for the Devpost product-feedback requirement. It reflects tools/guidance actually used during Host development. It does not claim use of an Alexa SDK, MCP server, Agent Skill, AWS runtime service or physical Alexa device.

## Alexa+ simulated-experience route

### What it was used for

Host uses the Alexa+ hackathon's simulated web-experience route. The project was designed around Alexa+ multimodal interaction expectations while keeping the implementation as a web simulation with its complete source in the public repository.

### What worked well

The route made it possible to validate a substantial Alexa+-style product without pretending to have a production Agent Skill or MCP integration. That was useful because the main engineering work was the execution model: authoritative state, confirmations, late-change handling, receipts, voice/touch parity and recovery.

The competition page is particularly helpful where it explicitly states that a simulated Alexa+ web experience may use a preferred agentic tool and that no specific framework or SDK is required for that route.

### Onboarding experience

The initial route selection required more cross-checking than expected. The hackathon overview contains the simulation exception, while much of the detailed Alexa+ builder documentation naturally focuses on production add-ons, MCP and Category SDK integrations.

The route is workable, but a new developer can spend time determining which production-add-on requirements are relevant to a hackathon simulation and which are not.

### What could be improved

A dedicated **Simulated Alexa+ Hackathon Quickstart** would reduce ambiguity. It should contain, in one place:

- the minimum repository requirements;
- what judges expect to see in the demo;
- which Alexa+ UX principles should be reproduced in the simulation;
- which MCP/Agent Skill requirements do not apply to this route;
- a reference web simulation showing voice/touch parity and confirmation patterns;
- a final compliance checklist.

### Would this route be used again?

Yes. It is a strong route for validating the product interaction model before committing to a production Alexa+ integration, provided the simulation boundary is made explicit and the repository/demo clearly show the working experience.

---

## Alexa+ Design Guide — Accessibility

### What it was used for

The accessibility guidance directly informed Host's Stage 06–09 acceptance criteria, especially:

- complete voice-only and touch-only routes;
- minimum 48×48 px touch targets;
- screen-reader-friendly controls;
- contrast and motion-safety considerations.

### What worked well

The guidance is concrete. The 48×48 target rule and input-parity requirement are directly testable rather than subjective. Those requirements materially changed Host: touch and voice were kept as equivalent controlled routes instead of treating voice as an optional demo flourish.

### What could be improved

For simulated/web experiences, it would help to include a small browser-focused testing appendix showing how Amazon expects developers to approximate VoiceView/input-parity validation when they are not yet running a certified add-on on physical Alexa hardware.

### Would it be used again?

Yes. The accessibility guidance is one of the most actionable parts of the Alexa+ documentation.

---

## Alexa+ Design Guide — Components and Patterns

### What it was used for

Host used the guidance as a design reference for glanceable structured output:

- list-like shopping and task information;
- card-style menu/product choices;
- concise screen detail paired with spoken responses;
- explicit confirmation patterns;
- status/history data that closes the loop after an action.

### What worked well

The patterns provide useful constraints instead of encouraging every add-on to invent a completely different interaction model. Guidance around lists, carousels/cards, confirmations and returning meaningful status data aligns particularly well with an execution-focused assistant.

### What could be improved

A downloadable set of framework-neutral HTML/CSS reference layouts would be valuable for the simulated route. The conceptual guidance is clear, but a canonical responsive simulation template would help entrants reproduce the intended Alexa+ hierarchy more consistently.

### Would it be used again?

Yes. The patterns helped keep Host's interface focused on task completion rather than turning the simulation into a generic dashboard.

---

## Browser Web Speech API

This is not an Amazon SDK, but it is part of the implemented simulation and should be disclosed if Devpost asks for all APIs/tools used.

### What it was used for

Browser `SpeechRecognition` / `webkitSpeechRecognition` and speech synthesis provide the optional browser voice channel. Recognized text is passed into the same Host orchestrator used by typed input.

### What worked well

It allowed the simulation to prove that voice and touch can share one authoritative execution architecture rather than creating separate demo logic.

### What needs work

Browser support and permission behavior vary. This is why Host includes an explicit unavailable/error state and retains complete touch/keyboard operation. Automated tests use deterministic fake speech objects to verify Host's integration logic without pretending to prove microphone acoustics or remote browser speech services.

### Would it be used again?

For a web simulation, yes, as an optional adapter with an explicit fallback. It would not be treated as a substitute for production Alexa voice infrastructure.

---

## GitHub / GitHub Actions

### What it was used for

Public source control, immutable release commits and independent clean-environment verification.

### What worked well

The ability to assemble a clean release tree, test it independently and publish only verified blobs was valuable for a stateful project where temporary verification machinery should not enter the public release.

### What could be improved

The work itself did not expose an Amazon-specific issue here. Do not turn generic development friction into Amazon product feedback.

---

# Optional feature request

**Request:** A first-party simulated Alexa+ web starter and compliance harness.

**Why it matters:** The hackathon explicitly allows simulated Alexa+ experiences, but the detailed production documentation naturally centers on MCP/add-on development. A maintained simulation starter could demonstrate multimodal patterns, accessibility/input parity, confirmations, status/receipt presentation and what the final demo must prove.

**Urgency:** Important.
