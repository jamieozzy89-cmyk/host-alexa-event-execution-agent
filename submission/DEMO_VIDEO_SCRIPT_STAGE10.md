# Stage 10 — Demo Video Script

Target runtime: **2:40–2:50**. Hard maximum: **under 3:00**.

The video must be public, English, and show the working simulation clearly. Do not imply real Amazon retail, real payment, AWS, MCP, Agent Skill, physical Alexa hardware, or a live LLM provider.

## 0:00–0:12 — Hook

**Visual:** Host opening screen / Plan view.

**Narration:**

“Planning a dinner is easy. Keeping the plan correct while guests, shopping and prep change is harder. Host is an Alexa+ execution-agent simulation built around one rule: nothing becomes done just because the AI says it did.”

## 0:12–0:32 — Create the event

**Action:** Enter or speak:

“I’m hosting dinner for six people Saturday at 7pm, budget £120, one vegetarian guest and a nut allergy, with limited same-day cooking.”

**Visual:** Event summary appears.

**Narration:**

“Host turns the request into authoritative event state. Missing details are clarified one at a time, and confirmed constraints become part of the plan.”

## 0:32–0:52 — Menu + confirmation

**Action:** Show menu ideas. Select one option.

**Visual:** Menu cards, then confirmation state.

**Narration:**

“Menu choices are proposals, not commitments. Choosing one still requires explicit confirmation before shopping or prep can depend on it.”

**Action:** Confirm.

## 0:52–1:12 — Shopping + simulated checkout

**Action:** Build shopping list, then demo products.

**Visual:** Required/on-hand/to-buy quantities and product choices.

**Narration:**

“Shopping is calculated from confirmed inventory, so Host tracks what is actually missing rather than producing a generic list.”

**Action:** Request simulated checkout; show confirmation.

**Narration:**

“Checkout is deliberately labelled as a simulation and is confirmation-gated. A failed action can’t become purchased state because the conversation sounds successful.”

## 1:12–1:34 — Live Mode

**Action:** Build prep plan and switch to Live.

**Visual:** Large current-task card and hands-busy controls.

**Narration:**

“Live Mode reduces the plan to the current authoritative next task. Touch, keyboard and browser voice all route through the same execution layer.”

**Action:** Mark one ready task done; show visible Next guidance.

## 1:34–2:05 — The differentiating moment: late change

**Action:** Add: “We have another guest and they’re vegan.”

**Visual:** Change-impact preview before confirmation.

**Narration:**

“This is where Host differs from a normal planner. A seventh vegan guest arrives after work has already started. Host analyses the impact without changing anything first.”

**Visual:** Show guest/menu/shopping/task impact and preserved completed work count.

**Narration:**

“Only after confirmation does it replan, preserving unaffected completed work and recalculating what changed.”

**Action:** Confirm.

## 2:05–2:25 — Activity / proof

**Action:** Open Activity.

**Visual:** Receipts/history.

**Narration:**

“Activity closes the loop. These receipts show what actually succeeded, failed or was reversed. Language is presentation; validated persisted state is the source of truth.”

## 2:25–2:40 — Voice parity

**Action:** Start Voice. Say “What’s next?” then “Done.”

**Visual:** Listening/processing/speaking state, next task, completion result.

**Narration:**

“Voice is not a second demo path. Recognized speech goes through the same orchestrator and controlled tools, so spoken ‘done’ resolves against the authoritative current next task.”

## 2:40–2:52 — Close

**Visual:** Quick montage: Plan / Live / Activity / GitHub README or test evidence.

**Narration:**

“Host is open source, responsive, hardened for touch and voice, and verified by 74 backend tests plus 26 Chromium browser cases. From ‘people are coming over’ to ‘everything is actually ready.’”

## Recording controls

- Keep the product visible for the majority of the video.
- Use large browser zoom/crop so text remains legible after Devpost/YouTube compression.
- Avoid long terminal footage; test evidence can be a brief closing insert.
- Do not spend more than ~8 seconds on architecture diagrams.
- Do not show unverified deployment/AWS fields.
- Do not use copyrighted music unless permission is certain; clean narration is preferable.
- Record one uninterrupted successful core journey before editing so every final cut can be traced to a real working run.
