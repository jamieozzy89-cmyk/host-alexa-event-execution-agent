# Stage 06 Verification Record

## Candidate

Stage: **06 — Alexa+ simulation UI**

Purpose of this record: preserve the direct evidence used to accept the Stage 06 product state before publication to `main`.

## Verified product behavior

The browser simulation was tested against the real Stage 05 application/orchestrator/tool stack rather than a UI-only mock.

Verified customer journeys:

1. **Complete core journey**
   - create dinner event from natural language;
   - choose menu;
   - explicitly confirm material menu commitment;
   - build authoritative shopping list;
   - inspect deterministic demo product candidates;
   - explicitly confirm simulated checkout;
   - build preparation plan;
   - enter Live Mode;
   - complete a ready preparation task;
   - receive visible authoritative `Next:` guidance;
   - open Activity and inspect recorded receipts.

2. **Late constraint change**
   - add another guest who is vegan;
   - show impact before mutation;
   - show completed work preservation;
   - require explicit confirmation;
   - apply the change;
   - update guest count to seven while preserving unaffected work.

3. **Persistence/reload recovery**
   - create authoritative event state;
   - enter a pending menu confirmation;
   - reload the page;
   - restore the event through the orchestrator/persistence path;
   - do not restore stale pending confirmation UI;
   - retain the six-person event summary;
   - retain access to Activity.

4. **Touch/accessibility floor**
   - visible buttons/inputs at least 48 × 48 px;
   - no document-level horizontal overflow.

## Final automated results

GitHub Actions workflow run: `33501409738`

Final branch head used to trigger the successful browser gate: `9ddfda64af364db3ef85ea0873fa5b5af6208d42`.

The workflow itself completed with `conclusion: success`.

### Backend regression

`npm test`

Result: **72 passed, 0 failed**.

### Web build

`npm run build:web`

Result: **passed**.

This command includes the Stage 06 web TypeScript check and Vite production build.

### Browser acceptance

`npm run test:web`

Result: **8 passed, 0 failed**.

Configured Playwright projects:

- `echo-show`: 1280 × 800 viewport, touch enabled;
- `mobile`: 390 × 844 viewport, touch/mobile enabled.

The four acceptance scenarios above each passed in both projects.

### Browser boundary check

Result: **passed**.

The verified boundary scan rejected:

- direct `HostDomainEngine` references in `web/`;
- direct `validateHostState` references in `web/`;
- TODO/FIXME/HACK markers in `web/` and `tests/web/`.

## Defects found and corrected during the gate

The Stage 06 gate was not weakened when failures appeared.

### Live next-action visibility

Initial browser testing showed that completing a task in Live Mode correctly requested the next action from the orchestrator but did not render the returned speech prominently in the Live view.

Correction: Live Mode now renders the current authoritative speech (`live-status`) before the active preparation card.

### Reload test contamination

The first reload test used a Playwright init script that cleared local storage on every navigation, including the reload being tested. That deleted the persisted event before the application could restore it.

Correction: the test now opens the page, clears storage once, reloads into a clean initial state, then allows subsequent scenario reloads to preserve application state.

### Activity selector ambiguity

After the functional corrections passed, Playwright's non-exact `Activity` heading locator also matched the `Recent activity` card title.

Correction: the acceptance assertions now require the exact `Activity` heading. Product behavior was not changed to satisfy this selector issue.

## Release hygiene

The permanent Stage 06 release excludes temporary verification machinery used during diagnosis:

- Stage 06 fix/verification workflow files;
- trigger files;
- temporary patch file;
- raw last-run diagnostic text.

Permanent evidence is retained in this report and in `docs/ALEXA_SIMULATION_UI_STAGE06.md`.

The release candidate must preserve the verified application/test blobs while making only documentation and verification-scaffolding cleanup changes before publication.

## Acceptance decision

**Stage 06 is accepted for release** on the evidence above, subject to final clean-tree identity/diff verification and a clean install/backend/web-build check of the release candidate before `main` is advanced.
