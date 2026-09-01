from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    if old not in text:
        raise SystemExit(f"required Stage 09 marker missing in {path}: {old[:80]!r}")
    p.write_text(text.replace(old, new, 1))


# index.html privacy/referrer control
replace_once(
    "index.html",
    '    <meta name="description" content="Host — a simulated Alexa+ event execution experience." />\n',
    '    <meta name="description" content="Host — a simulated Alexa+ event execution experience." />\n    <meta name="referrer" content="no-referrer" />\n',
)

# main.ts state/focus/recovery/data controls
replace_once(
    "web/main.ts",
    '  busy: false,\n  voice: {\n',
    '  busy: false,\n  storageMode: runtime.storageMode,\n  clearDataPending: false,\n  voice: {\n',
)
replace_once(
    "web/main.ts",
    '''function renderNow(): void {\n  render(root, state, handlers);\n}\n''',
    '''function renderNow(): void {\n  render(root, state, handlers);\n}\n\nfunction focusByKey(key: string): boolean {\n  const target = root.querySelector<HTMLElement>(`[data-focus-key="${CSS.escape(key)}"]`);\n  if (!target) return false;\n  target.focus();\n  return true;\n}\n\nfunction focusComposer(): void {\n  queueMicrotask(() => {\n    if (!focusByKey("composer")) root.querySelector<HTMLElement>("#main-content")?.focus();\n  });\n}\n\nfunction focusMainContext(): void {\n  queueMicrotask(() => {\n    if (focusByKey("mode-heading")) return;\n    if (state.mode === "conversation" && focusByKey("composer")) return;\n    root.querySelector<HTMLElement>("#main-content")?.focus();\n  });\n}\n\nfunction focusAfterAction(): void {\n  queueMicrotask(() => {\n    if (focusByKey("clear-data-cancel")) return;\n    const cancel = root.querySelector<HTMLButtonElement>(".confirmation-card .button.secondary");\n    if (cancel) { cancel.focus(); return; }\n    focusMainContext();\n  });\n}\n''',
)
replace_once(
    "web/main.ts",
    '''async function submit(text: string): Promise<void> {\n  await guarded(async () => {\n    state.mode = "conversation";\n    state.transcript.push({ id: nextTranscriptId(), role: "user", text });\n    renderNow();\n    const reply = await runtime.agent.handleText(conversationId, text);\n    applyReply(reply);\n  });\n}\n''',
    '''async function submit(text: string): Promise<void> {\n  await guarded(async () => {\n    state.mode = "conversation";\n    state.transcript.push({ id: nextTranscriptId(), role: "user", text });\n    renderNow();\n    const reply = await runtime.agent.handleText(conversationId, text);\n    applyReply(reply);\n  });\n  focusComposer();\n}\n''',
)
replace_once(
    "web/main.ts",
    '''async function performAction(action: AgentAction): Promise<void> {\n  await guarded(async () => {\n''',
    '''async function performAction(action: AgentAction): Promise<void> {\n  await guarded(async () => {\n''',
)
replace_once(
    "web/main.ts",
    '''    applyReply(first, {\n      transcript: state.mode === "conversation",\n      live: state.mode === "live",\n      activity: state.mode === "activity",\n    });\n  });\n}\n\nasync function switchMode''',
    '''    applyReply(first, {\n      transcript: state.mode === "conversation",\n      live: state.mode === "live",\n      activity: state.mode === "activity",\n    });\n  });\n  focusAfterAction();\n}\n\nasync function switchMode''',
)
replace_once(
    "web/main.ts",
    '''    if (mode === "activity") {\n      const reply = await runtime.agent.handleAction(conversationId, { type: "request", label: "View history", request: "history" });\n      applyReply(reply, { transcript: false, activity: true });\n    }\n  });\n}\n\nfunction applyTheme''',
    '''    if (mode === "activity") {\n      const reply = await runtime.agent.handleAction(conversationId, { type: "request", label: "View history", request: "history" });\n      applyReply(reply, { transcript: false, activity: true });\n    }\n  });\n  focusMainContext();\n}\n\nfunction readStoredTheme(): string | null {\n  try { return localStorage.getItem(THEME_KEY); } catch { return null; }\n}\n\nfunction saveStoredTheme(theme: "dark" | "light"): void {\n  try { localStorage.setItem(THEME_KEY, theme); } catch { /* Theme persistence is optional. */ }\n}\n\nfunction applyTheme''',
)
replace_once(
    "web/main.ts",
    '''function applyTheme(theme: "dark" | "light"): void {\n  document.documentElement.dataset.theme = theme;\n  localStorage.setItem(THEME_KEY, theme);\n}\n''',
    '''function applyTheme(theme: "dark" | "light"): void {\n  document.documentElement.dataset.theme = theme;\n  saveStoredTheme(theme);\n}\n''',
)
replace_once(
    "web/main.ts",
    '''  startVoice,\n  stopVoice,\n  expand: (card) => { state.expandedCard = card; renderNow(); },\n  closeExpanded: () => { delete state.expandedCard; renderNow(); },\n};\n''',
    '''  startVoice,\n  stopVoice,\n  requestClearData: () => {\n    state.clearDataPending = true;\n    renderNow();\n    queueMicrotask(() => focusByKey("clear-data-cancel"));\n  },\n  cancelClearData: () => {\n    state.clearDataPending = false;\n    renderNow();\n    queueMicrotask(() => focusByKey("clear-host-data"));\n  },\n  confirmClearData: () => {\n    voice.deactivate();\n    runtime.clearHostEventData();\n    window.location.reload();\n  },\n  expand: (card) => {\n    state.expandedCard = card;\n    state.dialogReturnFocusKey = `expand:${card.type}`;\n    renderNow();\n  },\n  closeExpanded: () => {\n    const returnKey = state.dialogReturnFocusKey;\n    delete state.expandedCard;\n    delete state.dialogReturnFocusKey;\n    renderNow();\n    if (returnKey) queueMicrotask(() => focusByKey(returnKey));\n  },\n};\n''',
)
replace_once(
    "web/main.ts",
    '''async function initialise(): Promise<void> {\n  const storedTheme = localStorage.getItem(THEME_KEY);\n  applyTheme(storedTheme === "light" ? "light" : "dark");\n''',
    '''async function initialise(): Promise<void> {\n  const storedTheme = readStoredTheme();\n  applyTheme(storedTheme === "light" ? "light" : "dark");\n''',
)
replace_once(
    "web/main.ts",
    '''    } catch {\n      runtime.forgetEvent();\n    } finally {\n      state.busy = false;\n      renderNow();\n    }\n    return;\n''',
    '''    } catch {\n      runtime.forgetEvent();\n      state.recoveryNotice = "Host couldn't safely restore the saved plan. The stored snapshot was left untouched so you can clear it deliberately from Data & privacy.";\n      state.transcript.push({\n        id: nextTranscriptId(),\n        role: "assistant",\n        text: state.recoveryNotice,\n      });\n      const welcome = await runtime.agent.handleText(conversationId, "help");\n      applyReply(welcome);\n    } finally {\n      state.busy = false;\n      renderNow();\n    }\n    return;\n''',
)

# render.ts handler surface
replace_once(
    "web/render.ts",
    '''  startVoice(): Promise<void>;\n  stopVoice(): void;\n  expand(card: AgentCard): void;\n''',
    '''  startVoice(): Promise<void>;\n  stopVoice(): void;\n  requestClearData(): void;\n  cancelClearData(): void;\n  confirmClearData(): void;\n  expand(card: AgentCard): void;\n''',
)
replace_once(
    "web/render.ts",
    '''    const more = button(`View all ${card.items.length} items`, "button secondary full-width");\n    more.addEventListener("click", () => handlers.expand(card));\n''',
    '''    const more = button(`View all ${card.items.length} items`, "button secondary full-width");\n    more.dataset.focusKey = `expand:${card.type}`;\n    more.addEventListener("click", () => handlers.expand(card));\n''',
)
replace_once(
    "web/render.ts",
    '''  log.setAttribute("aria-label", "Host conversation");\n  log.setAttribute("aria-live", "polite");\n''',
    '''  log.setAttribute("aria-label", "Host conversation");\n''',
)
replace_once(
    "web/render.ts",
    '''  input.setAttribute("aria-label", "Message Host");\n''',
    '''  input.setAttribute("aria-label", "Message Host");\n  input.dataset.focusKey = "composer";\n''',
)
replace_once(
    "web/render.ts",
    '''function renderActivity(state: HostUiState, handlers: UiHandlers): HTMLElement {\n''',
    '''function renderPrivacy(state: HostUiState, handlers: UiHandlers): HTMLElement {\n  const wrap = cardShell("Data & privacy", "Current demo behavior");\n  wrap.classList.add("privacy-card");\n  wrap.append(el("p", "privacy-copy", "Host stores event details in this browser only. This current build does not send plan data to a Host application server."));\n  wrap.append(el("p", "privacy-copy", "Voice recognition is provided by the browser or platform and may send audio to its speech service. Host does not store audio recordings."));\n  if (state.storageMode === "memory") {\n    wrap.append(el("p", "privacy-warning", "Persistent browser storage is unavailable, so this plan is saved only until this page closes."));\n  } else {\n    wrap.append(el("p", "privacy-copy", "Saved event data stays in local browser storage until it is cleared here or browser site data is removed."));\n  }\n  if (state.recoveryNotice) {\n    const notice = el("p", "privacy-warning", state.recoveryNotice);\n    notice.setAttribute("role", "alert");\n    wrap.append(notice);\n  }\n  const actions = el("div", "privacy-actions");\n  if (state.clearDataPending) {\n    const warning = el("div", "data-delete-confirmation");\n    warning.append(el("p", "confirmation-body", "Delete the saved Host event data from this browser? This cannot be undone."));\n    const cancel = button("Cancel data deletion", "button secondary");\n    cancel.dataset.focusKey = "clear-data-cancel";\n    cancel.addEventListener("click", handlers.cancelClearData);\n    const confirm = button("Delete saved Host data", "button danger-button");\n    confirm.addEventListener("click", handlers.confirmClearData);\n    const row = el("div", "confirmation-actions");\n    row.append(cancel, confirm);\n    warning.append(row);\n    actions.append(warning);\n  } else {\n    const clear = button("Clear saved Host data", "button secondary");\n    clear.dataset.focusKey = "clear-host-data";\n    clear.addEventListener("click", handlers.requestClearData);\n    actions.append(clear);\n  }\n  wrap.append(actions);\n  return wrap;\n}\n\nfunction renderActivity(state: HostUiState, handlers: UiHandlers): HTMLElement {\n''',
)
replace_once(
    "web/render.ts",
    '''  const actions = renderActionStrip(reply, handlers, state);\n  if (actions) view.append(actions);\n  return view;\n}\n\nfunction renderDialog''',
    '''  const actions = renderActionStrip(reply, handlers, state);\n  if (actions) view.append(actions);\n  view.append(renderPrivacy(state, handlers));\n  return view;\n}\n\nfunction renderDialog''',
)
replace_once(
    "web/render.ts",
    '''function renderDialog(card: AgentCard, handlers: UiHandlers): HTMLDialogElement {\n  const dialog = el("dialog", "detail-dialog") as HTMLDialogElement;\n  const head = el("div", "dialog-head");\n  const close = button("Close", "button secondary compact");\n  close.addEventListener("click", () => handlers.closeExpanded());\n  head.append(el("h2", "dialog-title", card.type === "shopping_list" ? "Full shopping list" : "Details"), close);\n''',
    '''function renderDialog(card: AgentCard, handlers: UiHandlers): HTMLDialogElement {\n  const dialog = el("dialog", "detail-dialog") as HTMLDialogElement;\n  const head = el("div", "dialog-head");\n  const title = el("h2", "dialog-title", card.type === "shopping_list" ? "Full shopping list" : "Details");\n  title.id = `host-dialog-title-${card.type}`;\n  const close = button("Close", "button secondary compact");\n  close.dataset.focusKey = "dialog-close";\n  close.addEventListener("click", () => handlers.closeExpanded());\n  dialog.setAttribute("aria-labelledby", title.id);\n  dialog.setAttribute("aria-modal", "true");\n  head.append(title, close);\n''',
)
replace_once(
    "web/render.ts",
    '''  head.append(el("p", "eyebrow", "Hands-busy view"), el("h1", "mode-title", "Live Mode"), el("p", "mode-copy", "One current action, large controls, no extra clutter."));\n''',
    '''  const title = el("h1", "mode-title focus-target", "Live Mode");\n  title.tabIndex = -1;\n  title.dataset.focusKey = "mode-heading";\n  head.append(el("p", "eyebrow", "Hands-busy view"), title, el("p", "mode-copy", "One current action, large controls, no extra clutter."));\n''',
)
replace_once(
    "web/render.ts",
    '''  head.append(el("p", "eyebrow", "Verifiable state"), el("h1", "mode-title", "Activity"), el("p", "mode-copy", "Receipts show what Host actually completed, failed or reversed."));\n''',
    '''  const title = el("h1", "mode-title focus-target", "Activity");\n  title.tabIndex = -1;\n  title.dataset.focusKey = "mode-heading";\n  head.append(el("p", "eyebrow", "Verifiable state"), title, el("p", "mode-copy", "Receipts show what Host actually completed, failed or reversed."));\n''',
)
replace_once(
    "web/render.ts",
    '''  voice.disabled = state.busy || !state.voice.supported;\n  voice.setAttribute("aria-label", state.voice.active ? "Stop voice" : state.voice.supported ? "Start voice" : "Voice unavailable");\n  voice.setAttribute("aria-pressed", state.voice.active ? "true" : "false");\n  voice.dataset.voiceStatus = state.voice.status;\n  voice.addEventListener("click", () => {\n    if (state.voice.active) handlers.stopVoice();\n    else void handlers.startVoice();\n  });\n  const voiceState = el("span", "voice-state", state.voice.message);\n''',
    '''  voice.disabled = state.busy;\n  voice.setAttribute("aria-label", state.voice.active ? "Stop voice" : state.voice.supported ? "Start voice" : "Voice unavailable");\n  voice.setAttribute("aria-pressed", state.voice.active ? "true" : "false");\n  voice.setAttribute("aria-disabled", state.voice.supported ? "false" : "true");\n  voice.setAttribute("aria-describedby", "host-voice-state");\n  voice.dataset.voiceStatus = state.voice.status;\n  voice.addEventListener("click", () => {\n    if (!state.voice.supported) return;\n    if (state.voice.active) handlers.stopVoice();\n    else void handlers.startVoice();\n  });\n  const voiceState = el("span", "voice-state", state.voice.message);\n  voiceState.id = "host-voice-state";\n''',
)
replace_once(
    "web/render.ts",
    '''  main.id = "main-content";\n  main.tabIndex = -1;\n''',
    '''  main.id = "main-content";\n  main.tabIndex = -1;\n  main.setAttribute("aria-busy", state.busy ? "true" : "false");\n''',
)
replace_once(
    "web/render.ts",
    '''  shell.append(main);\n  root.append(shell);\n\n  if (state.expandedCard) {\n''',
    '''  shell.append(main);\n  const latestAssistant = [...state.transcript].reverse().find((entry) => entry.role === "assistant")?.text ?? state.voice.message;\n  const announcement = el("div", "sr-only", latestAssistant);\n  announcement.setAttribute("role", "status");\n  announcement.setAttribute("aria-live", "polite");\n  announcement.setAttribute("aria-atomic", "true");\n  shell.append(announcement);\n  root.append(shell);\n\n  if (state.expandedCard) {\n''',
)
replace_once(
    "web/render.ts",
    '''    root.append(dialog);\n    queueMicrotask(() => dialog.showModal());\n''',
    '''    root.append(dialog);\n    queueMicrotask(() => {\n      dialog.showModal();\n      dialog.querySelector<HTMLButtonElement>("[data-focus-key=dialog-close]")?.focus();\n    });\n''',
)

# styles.css accessibility/privacy controls
replace_once(
    "web/styles.css",
    '''button:focus-visible, input:focus-visible, dialog:focus-visible, a:focus-visible {\n  outline: 3px solid var(--focus);\n  outline-offset: 3px;\n}\n''',
    '''button:focus-visible, input:focus-visible, dialog:focus-visible, a:focus-visible, .focus-target:focus {\n  outline: 3px solid var(--focus);\n  outline-offset: 3px;\n}\n\n.sr-only {\n  position: absolute !important;\n  width: 1px !important;\n  height: 1px !important;\n  padding: 0 !important;\n  margin: -1px !important;\n  overflow: hidden !important;\n  clip: rect(0, 0, 0, 0) !important;\n  white-space: nowrap !important;\n  border: 0 !important;\n}\n''',
)
replace_once(
    "web/styles.css",
    '''.voice-button:disabled { opacity: 0.52; cursor: not-allowed; }\n''',
    '''.voice-button:disabled, .voice-button[aria-disabled="true"] { opacity: 0.52; cursor: not-allowed; }\n''',
)
replace_once(
    "web/styles.css",
    '''.error-card { border-color: color-mix(in srgb, var(--danger) 35%, var(--line)); }\n''',
    '''.error-card { border-color: color-mix(in srgb, var(--danger) 35%, var(--line)); }\n.privacy-card { margin-top: var(--gap); }\n.privacy-copy, .privacy-warning { margin: 0 0 10px; color: var(--text-soft); line-height: 1.55; }\n.privacy-warning { padding: 12px 14px; border: 1px solid color-mix(in srgb, var(--ready) 35%, var(--line)); border-radius: 12px; background: var(--bg); }\n.privacy-actions { margin-top: 16px; }\n.data-delete-confirmation { padding: 16px; border: 1px solid color-mix(in srgb, var(--danger) 38%, var(--line)); border-radius: var(--radius-md); background: var(--bg); }\n.danger-button { background: color-mix(in srgb, var(--danger) 18%, var(--bg)); color: var(--text); border-color: color-mix(in srgb, var(--danger) 50%, var(--line)); }\n''',
)
replace_once(
    "web/styles.css",
    '''  .voice-state { display: none; }\n''',
    '''  .voice-state {\n    position: absolute;\n    width: 1px;\n    height: 1px;\n    padding: 0;\n    margin: -1px;\n    overflow: hidden;\n    clip: rect(0, 0, 0, 0);\n    white-space: nowrap;\n    border: 0;\n  }\n''',
)

# Voice unsupported should remain keyboard-focusable with aria-disabled semantics.
replace_once(
    "tests/web/voice-ui.spec.ts",
    '''  await expect(page.getByRole("button", { name: "Voice unavailable" })).toBeDisabled();\n''',
    '''  const unavailable = page.getByRole("button", { name: "Voice unavailable" });\n  await expect(unavailable).toHaveAttribute("aria-disabled", "true");\n  await unavailable.focus();\n  await expect(unavailable).toBeFocused();\n''',
)
