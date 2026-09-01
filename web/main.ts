import "./styles.css";
import type { AgentAction, AgentCard, AgentReply } from "../src/application/index.js";
import { render, type UiHandlers } from "./render.js";
import { createBrowserHostRuntime } from "./runtime.js";
import type { HostUiState, ViewMode } from "./types.js";

const appRoot = document.querySelector<HTMLElement>("#app");
if (!appRoot) throw new Error("Host UI root was not found.");
const root: HTMLElement = appRoot;

const runtime = createBrowserHostRuntime();
const conversationId = `ui-${crypto.randomUUID()}`;
const THEME_KEY = "host:ui:theme";
let transcriptCounter = 0;

const state: HostUiState = {
  transcript: [],
  latest: {},
  mode: "conversation",
  busy: false,
};

function nextTranscriptId(): string {
  transcriptCounter += 1;
  return `turn-${transcriptCounter}`;
}

function rememberCards(cards: AgentCard[]): void {
  for (const card of cards) {
    switch (card.type) {
      case "event_summary": state.latest.event = card; break;
      case "menu_options": state.latest.menu = card; break;
      case "shopping_list": state.latest.shopping = card; break;
      case "product_choices": state.latest.products = card; break;
      case "prep_timeline": state.latest.prep = card; break;
      case "change_impact": state.latest.impact = card; break;
      case "history": state.latest.history = card; break;
      case "error": state.latest.error = card; break;
      case "confirmation": break;
    }
  }
}

function applyReply(reply: AgentReply, options: { transcript?: boolean; live?: boolean } = {}): void {
  if (reply.eventId) runtime.rememberEvent(reply.eventId);
  rememberCards(reply.cards);
  if (options.live) state.liveReply = reply;
  if (options.transcript !== false) {
    state.transcript.push({
      id: nextTranscriptId(),
      role: "assistant",
      text: reply.speech,
      reply,
    });
  }
}

function renderNow(): void {
  render(root, state, handlers);
}

function setBusy(value: boolean): void {
  state.busy = value;
  renderNow();
}

async function guarded(operation: () => Promise<void>): Promise<void> {
  if (state.busy) return;
  setBusy(true);
  try {
    await operation();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    state.transcript.push({
      id: nextTranscriptId(),
      role: "assistant",
      text: "Host hit an unexpected browser problem. Nothing new has been treated as completed.",
    });
    console.error("Host UI operation failed", message);
  } finally {
    state.busy = false;
    renderNow();
  }
}

async function submit(text: string): Promise<void> {
  await guarded(async () => {
    state.mode = "conversation";
    state.transcript.push({ id: nextTranscriptId(), role: "user", text });
    renderNow();
    const reply = await runtime.agent.handleText(conversationId, text);
    applyReply(reply);
  });
}

async function performAction(action: AgentAction): Promise<void> {
  await guarded(async () => {
    const first = await runtime.agent.handleAction(conversationId, action);
    if (state.mode === "live" && action.type === "complete_task") {
      applyReply(first, { transcript: true });
      const next = await runtime.agent.handleAction(conversationId, { type: "request", label: "Next", request: "next" });
      applyReply(next, { transcript: false, live: true });
      return;
    }
    applyReply(first, { transcript: state.mode === "conversation", live: state.mode === "live" });
  });
}

async function switchMode(mode: ViewMode): Promise<void> {
  if (state.mode === mode && !state.busy) return;
  state.mode = mode;
  renderNow();
  if (mode === "conversation") return;
  const eventId = runtime.activeEventId();
  if (!eventId) return;

  await guarded(async () => {
    if (mode === "live") {
      const reply = await runtime.agent.handleAction(conversationId, { type: "request", label: "What's next", request: "next" });
      applyReply(reply, { transcript: false, live: true });
    }
    if (mode === "activity") {
      const reply = await runtime.agent.handleAction(conversationId, { type: "request", label: "View history", request: "history" });
      applyReply(reply, { transcript: false });
    }
  });
}

function applyTheme(theme: "dark" | "light"): void {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme(): void {
  applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
}

const handlers: UiHandlers = {
  submit,
  action: performAction,
  mode: switchMode,
  toggleTheme,
  expand: (card) => { state.expandedCard = card; renderNow(); },
  closeExpanded: () => { delete state.expandedCard; renderNow(); },
};

async function initialise(): Promise<void> {
  const storedTheme = localStorage.getItem(THEME_KEY);
  applyTheme(storedTheme === "light" ? "light" : "dark");
  renderNow();

  const activeEventId = runtime.activeEventId();
  if (activeEventId) {
    setBusy(true);
    try {
      const resumed = await runtime.agent.resumeConversation(conversationId, activeEventId);
      if (resumed.status === "error") runtime.forgetEvent();
      applyReply(resumed);
    } catch {
      runtime.forgetEvent();
    } finally {
      state.busy = false;
      renderNow();
    }
    return;
  }

  setBusy(true);
  try {
    const welcome = await runtime.agent.handleText(conversationId, "help");
    applyReply(welcome);
  } finally {
    state.busy = false;
    renderNow();
  }
}

void initialise();
