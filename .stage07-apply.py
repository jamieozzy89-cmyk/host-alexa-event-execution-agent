from pathlib import Path
import json


def replace_once(path: str, old: str, new: str) -> None:
    target = Path(path)
    text = target.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected one source match, found {count}")
    target.write_text(text.replace(old, new))


replace_once(
    "src/agent/types.ts",
    '  | "create_event" | "status" | "next_action" | "menu_options" | "shopping" | "products"\n',
    '  | "create_event" | "status" | "next_action" | "menu_options" | "choose_menu" | "shopping" | "products"\n',
)
replace_once("src/agent/types.ts", "  taskId?: string;\n", "  taskId?: string;\n  menuIndex?: number;\n")
replace_once("src/agent/types.ts", "  hasPendingConfirmation: boolean;\n", "  hasPendingConfirmation: boolean;\n  hasMenuOptions: boolean;\n")

replace_once(
    "src/agent/model.ts",
    '  "create_event", "status", "next_action", "menu_options", "shopping", "products", "checkout", "prep",\n',
    '  "create_event", "status", "next_action", "menu_options", "choose_menu", "shopping", "products", "checkout", "prep",\n',
)
replace_once("src/agent/model.ts", '  const taskId = optionalString(value, "taskId");\n', '  const taskId = optionalString(value, "taskId");\n  const menuIndex = optionalNumber(value, "menuIndex");\n')
replace_once("src/agent/model.ts", "  if (taskId) slots.taskId = taskId;\n", "  if (taskId) slots.taskId = taskId;\n  if (menuIndex !== undefined && Number.isInteger(menuIndex) && menuIndex >= 1) slots.menuIndex = menuIndex;\n")

replace_once(
    "src/agent/interpreter.ts",
    '    if (/\\b(?:prep plan|preparation plan|plan my prep|plan the prep|prep schedule|preparation schedule)\\b/.test(lower)) return result("prep", 0.96);\n    if (/\\b(?:menu|meal ideas|food ideas|what should we eat|show.*meals)\\b/.test(lower)) return result("menu_options", 0.95);\n',
    '    if (/\\b(?:prep plan|preparation plan|plan my prep|plan the prep|prep schedule|preparation schedule)\\b/.test(lower)) return result("prep", 0.96);\n\n    if (context.hasEvent && context.hasMenuOptions && /\\b(?:choose|pick|select|use)\\b/.test(lower)) {\n      const numbered = lower.match(/\\b(?:option|menu)?\\s*(1|2|3)\\b/);\n      const wordIndex = /\\b(?:first|one)\\b/.test(lower) ? 1 : /\\b(?:second|two)\\b/.test(lower) ? 2 : /\\b(?:third|three)\\b/.test(lower) ? 3 : undefined;\n      const menuIndex = numbered ? Number(numbered[1]) : wordIndex;\n      return result("choose_menu", 0.97, menuIndex ? { menuIndex } : {});\n    }\n\n    if (/\\b(?:menu|meal ideas|food ideas|what should we eat|show.*meals)\\b/.test(lower)) return result("menu_options", 0.95);\n',
)

replace_once(
    "src/agent/orchestrator.ts",
    "      hasPendingConfirmation: Boolean(state.pending),\n",
    "      hasPendingConfirmation: Boolean(state.pending),\n      hasMenuOptions: Boolean(state.lastMenus?.length),\n",
)
replace_once(
    "src/agent/orchestrator.ts",
    '      case "menu_options": return this.showMenus(state);\n',
    '      case "menu_options": return this.showMenus(state);\n      case "choose_menu": return this.chooseMenuFromText(state, text, intent.slots.menuIndex);\n',
)
replace_once(
    "src/agent/orchestrator.ts",
    '    state.lastMenus = result.data.menus;\n    return reply({\n      status: "ok",\n      speech: `I found ${result.data.menus.length} menu options that fit the confirmed guest requirements.`,\n      eventId: state.eventId,\n      cards: [menuCard(result.data.menus)],\n      actions: result.data.menus.map((menu) => ({ type: "choose_menu", label: shorten(`Choose ${menu.name}`), menuId: menu.id })),\n    });\n  }\n\n  private async requestMenuCommit',
    '    state.lastMenus = result.data.menus;\n    const spokenOptions = result.data.menus.map((menu, index) => `Option ${index + 1}: ${menu.name}.`).join(" ");\n    return reply({\n      status: "ok",\n      speech: `I found ${result.data.menus.length} menu options. ${spokenOptions} Say choose option one, two or three.`,\n      eventId: state.eventId,\n      cards: [menuCard(result.data.menus)],\n      actions: result.data.menus.map((menu) => ({ type: "choose_menu", label: shorten(`Choose ${menu.name}`), menuId: menu.id })),\n    });\n  }\n\n  private async chooseMenuFromText(state: ConversationState, text: string, menuIndex?: number): Promise<AgentReply> {\n    const menus = state.lastMenus ?? [];\n    if (!menus.length) return this.showMenus(state);\n    if (menuIndex !== undefined) {\n      const menu = menus[menuIndex - 1];\n      if (menu) return this.requestMenuCommit(state, menu.id);\n    }\n    const lower = text.toLowerCase();\n    const matched = menus.find((menu) => {\n      const words = menu.name.toLowerCase().split(/\\s+/).filter((word) => word.length > 4);\n      return words.some((word) => lower.includes(word));\n    });\n    if (matched) return this.requestMenuCommit(state, matched.id);\n    return reply({\n      status: "needs_input",\n      speech: `Which menu should I use? Say choose option ${menus.map((_, index) => index + 1).join(", ")}.`,\n      question: "Which menu should I use?",\n      eventId: state.eventId,\n      actions: menus.map((menu) => ({ type: "choose_menu", label: shorten(`Choose ${menu.name}`), menuId: menu.id })),\n    });\n  }\n\n  private async requestMenuCommit',
)
replace_once(
    "src/agent/orchestrator.ts",
    '  private async completeTaskFromText(state: ConversationState, text: string, explicitTaskId?: string): Promise<AgentReply> {\n    if (explicitTaskId) return this.completeTask(state, explicitTaskId);\n    const ready = state.lastTasks?.filter((task) => task.status === "ready") ?? [];\n    if (ready.length === 1) return this.completeTask(state, ready[0]!.id);\n    const lower = text.toLowerCase();\n    const matched = ready.find((task) => task.title.toLowerCase().split(/\\s+/).filter((word) => word.length > 4).some((word) => lower.includes(word)));\n    if (matched) return this.completeTask(state, matched.id);\n    return reply({ status: "needs_input", speech: "Which prep task did you finish?", question: "Which prep task did you finish?", eventId: state.eventId, actions: ready.slice(0, 4).map((task) => ({ type: "complete_task", label: shorten(task.title), taskId: task.id })) });\n  }\n',
    '  private async completeTaskFromText(state: ConversationState, text: string, explicitTaskId?: string): Promise<AgentReply> {\n    if (explicitTaskId) return this.completeTask(state, explicitTaskId);\n    const lower = text.toLowerCase();\n    const status = await this.currentStatus(state);\n    if (!status) return this.noEvent();\n    if (!status.ok) return this.failure(status, state);\n\n    const authoritativeNext = status.data.nextAction;\n    if (authoritativeNext && /\\b(?:done|finished|complete)\\b/.test(lower)) {\n      return this.completeTask(state, authoritativeNext.id);\n    }\n\n    const ready = state.lastTasks?.filter((task) => task.status === "ready") ?? [];\n    const matched = ready.find((task) => task.title.toLowerCase().split(/\\s+/).filter((word) => word.length > 4).some((word) => lower.includes(word)));\n    if (matched) return this.completeTask(state, matched.id);\n    return reply({ status: "needs_input", speech: "Which prep task did you finish?", question: "Which prep task did you finish?", eventId: state.eventId, actions: ready.slice(0, 4).map((task) => ({ type: "complete_task", label: shorten(task.title), taskId: task.id })) });\n  }\n',
)

replace_once(
    "web/types.ts",
    'export type ViewMode = "conversation" | "live" | "activity";\n\n',
    'export type ViewMode = "conversation" | "live" | "activity";\n\nexport type VoiceSessionStatus = "unavailable" | "idle" | "listening" | "processing" | "speaking" | "error";\n\nexport interface VoiceUiState {\n  supported: boolean;\n  active: boolean;\n  status: VoiceSessionStatus;\n  message: string;\n  lastHeard?: string;\n  lastSpoken?: string;\n}\n\n',
)
replace_once("web/types.ts", "  busy: boolean;\n  expandedCard?: AgentCard;\n", "  busy: boolean;\n  voice: VoiceUiState;\n  expandedCard?: AgentCard;\n")

replace_once("web/main.ts", 'import { createBrowserHostRuntime } from "./runtime.js";\n', 'import { createBrowserHostRuntime } from "./runtime.js";\nimport { createBrowserVoiceController } from "./voice.js";\n')
replace_once(
    "web/main.ts",
    '  busy: false,\n};\n',
    '  busy: false,\n  voice: {\n    supported: false,\n    active: false,\n    status: "unavailable",\n    message: "Voice is loading.",\n  },\n};\n\nconst voice = createBrowserVoiceController({\n  onTranscript: (text) => { void submitVoice(text); },\n  onState: (next) => {\n    state.voice = next;\n    renderNow();\n  },\n});\nstate.voice = voice.snapshot();\n',
)
replace_once(
    "web/main.ts",
    'async function submit(text: string): Promise<void> {\n  await guarded(async () => {\n    state.mode = "conversation";\n    state.transcript.push({ id: nextTranscriptId(), role: "user", text });\n    renderNow();\n    const reply = await runtime.agent.handleText(conversationId, text);\n    applyReply(reply);\n  });\n}\n\n',
    'async function submit(text: string): Promise<void> {\n  await guarded(async () => {\n    state.mode = "conversation";\n    state.transcript.push({ id: nextTranscriptId(), role: "user", text });\n    renderNow();\n    const reply = await runtime.agent.handleText(conversationId, text);\n    applyReply(reply);\n  });\n}\n\nasync function submitVoice(text: string): Promise<void> {\n  await guarded(async () => {\n    state.mode = "conversation";\n    state.transcript.push({ id: nextTranscriptId(), role: "user", text });\n    renderNow();\n    const reply = await runtime.agent.handleText(conversationId, text);\n    applyReply(reply);\n    await voice.speak(reply.speech);\n  });\n  if (voice.snapshot().active) voice.listen();\n}\n\nasync function startVoice(): Promise<void> {\n  if (state.busy || !state.voice.supported || state.voice.active) return;\n  voice.activate();\n  const intro = runtime.activeEventId()\n    ? "Voice mode on. Ask for status, what is next, shopping, prep, history, or tell me what changed."\n    : "Voice mode on. Tell me what you are hosting, when it is, how many people are coming and your budget.";\n  await voice.speak(intro);\n  if (voice.snapshot().active) voice.listen();\n}\n\nfunction stopVoice(): void {\n  voice.deactivate();\n}\n\n',
)
replace_once("web/main.ts", "  toggleTheme,\n", "  toggleTheme,\n  startVoice,\n  stopVoice,\n")
replace_once("web/main.ts", "void initialise();\n", 'window.addEventListener("beforeunload", () => voice.destroy());\n\nvoid initialise();\n')

replace_once("web/render.ts", "  toggleTheme(): void;\n", "  toggleTheme(): void;\n  startVoice(): Promise<void>;\n  stopVoice(): void;\n")
replace_once(
    "web/render.ts",
    '  const theme = button("Theme", "icon-button");\n  theme.setAttribute("aria-label", "Switch light or dark theme");\n  theme.addEventListener("click", handlers.toggleTheme);\n  header.append(brand, nav, theme);\n  return header;\n}\n',
    '  const controls = el("div", "header-actions");\n  const voiceLabel = !state.voice.supported\n    ? "Voice unavailable"\n    : state.voice.active\n      ? state.voice.status === "listening" ? "Listening…" : state.voice.status === "speaking" ? "Speaking…" : "Voice on"\n      : "Voice";\n  const voice = button(voiceLabel, state.voice.active ? "voice-button active" : "voice-button");\n  voice.disabled = state.busy || !state.voice.supported;\n  voice.setAttribute("aria-label", state.voice.active ? "Stop voice" : state.voice.supported ? "Start voice" : "Voice unavailable");\n  voice.setAttribute("aria-pressed", state.voice.active ? "true" : "false");\n  voice.dataset.voiceStatus = state.voice.status;\n  voice.addEventListener("click", () => {\n    if (state.voice.active) handlers.stopVoice();\n    else void handlers.startVoice();\n  });\n  const voiceState = el("span", "voice-state", state.voice.message);\n  voiceState.setAttribute("aria-live", "polite");\n  voiceState.setAttribute("role", "status");\n\n  const theme = button("Theme", "icon-button");\n  theme.setAttribute("aria-label", "Switch light or dark theme");\n  theme.addEventListener("click", handlers.toggleTheme);\n  controls.append(voice, voiceState, theme);\n  header.append(brand, nav, controls);\n  return header;\n}\n',
)

replace_once("web/styles.css", ".nav-button, .icon-button {\n", ".nav-button, .icon-button, .voice-button {\n")
replace_once("web/styles.css", ".nav-button:hover, .icon-button:hover { background: var(--bg-soft); }\n", ".nav-button:hover, .icon-button:hover, .voice-button:hover:not(:disabled) { background: var(--bg-soft); }\n")
replace_once(
    "web/styles.css",
    ".icon-button { justify-self: end; padding: 0 14px; border: 1px solid var(--line); }\n",
    ".icon-button { padding: 0 14px; border: 1px solid var(--line); }\n.header-actions { justify-self: end; min-width: 0; display: flex; align-items: center; gap: 8px; }\n.voice-button { min-height: var(--touch); padding: 0 15px; border: 1px solid var(--line); background: transparent; cursor: pointer; font-weight: 800; }\n.voice-button.active { background: var(--bg-strong); border-color: color-mix(in srgb, var(--ready) 40%, var(--line)); }\n.voice-button:disabled { opacity: 0.52; cursor: not-allowed; }\n.voice-state { max-width: 220px; color: var(--text-muted); font-size: 12px; line-height: 1.25; }\n",
)
replace_once("web/styles.css", "  .icon-button { grid-column: 2; grid-row: 1; }\n", "  .header-actions { grid-column: 2; grid-row: 1; }\n  .voice-state { display: none; }\n")

replace_once(
    "tests/agent-orchestrator.test.mjs",
    'test("menu selection is confirmation-gated before committed state changes", async () => {\n',
    'test("spoken menu option choice uses the existing confirmation-gated commit path", async () => {\n  const { agent, persistence } = makeAgent();\n  await createEvent(agent, "voice-menu");\n  const menus = await agent.handleText("voice-menu", "menu ideas");\n  assert.match(menus.speech, /Option 1:/);\n  assert.match(menus.speech, /choose option one/i);\n  const confirmation = await agent.handleText("voice-menu", "choose option one");\n  assert.equal(confirmation.status, "needs_confirmation");\n  let loaded = await persistence.load("agent-dinner");\n  assert.equal(loaded?.state.event.selectedMenuId, undefined);\n  const confirmed = await agent.handleText("voice-menu", "yes");\n  assert.equal(confirmed.status, "ok");\n  loaded = await persistence.load("agent-dinner");\n  assert.ok(loaded?.state.event.selectedMenuId);\n});\n\ntest("menu selection is confirmation-gated before committed state changes", async () => {\n',
)
replace_once(
    "tests/agent-orchestrator.test.mjs",
    'test("status response is derived from authoritative tool state and stays concise", async () => {\n',
    'test("spoken done completes the authoritative next preparation task", async () => {\n  const { agent, persistence } = makeAgent();\n  await setupCommitted(agent, "voice-done");\n  await agent.handleText("voice-done", "prep plan");\n  const next = await agent.handleText("voice-done", "what\'s next");\n  assert.match(next.speech, /Next:/);\n  const nextTaskId = next.actions.find((action) => action.type === "complete_task")?.taskId;\n  assert.ok(nextTaskId);\n  const completed = await agent.handleText("voice-done", "done");\n  assert.equal(completed.status, "ok");\n  const loaded = await persistence.load("agent-dinner");\n  assert.equal(loaded?.state.tasks[nextTaskId]?.status, "done");\n});\n\ntest("status response is derived from authoritative tool state and stays concise", async () => {\n',
)

package = json.loads(Path("package.json").read_text())
package["version"] = "0.7.0"
package["description"] = "Voice-and-touch simulated Alexa+ hosting execution experience backed by controlled authoritative state."
package["scripts"]["verify:stage07"] = "npm test && npm run build:web && npm run test:web"
Path("package.json").write_text(json.dumps(package, indent=2) + "\n")
