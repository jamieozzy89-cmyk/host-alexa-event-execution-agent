import type { AgentAction, AgentCard, AgentReply } from "../src/application/index.js";
import type { HostUiState, ViewMode } from "./types.js";

export interface UiHandlers {
  submit(text: string): Promise<void>;
  action(action: AgentAction): Promise<void>;
  mode(mode: ViewMode): Promise<void>;
  toggleTheme(): void;
  expand(card: AgentCard): void;
  closeExpanded(): void;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(label: string, className = "button secondary"): HTMLButtonElement {
  const node = el("button", className, label);
  node.type = "button";
  return node;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function money(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function latestReply(state: HostUiState): AgentReply | undefined {
  if (state.mode === "live" && state.liveReply) return state.liveReply;
  if (state.mode === "activity" && state.activityReply) return state.activityReply;
  for (let index = state.transcript.length - 1; index >= 0; index -= 1) {
    const reply = state.transcript[index]?.reply;
    if (reply) return reply;
  }
  return undefined;
}

function actionKey(action: AgentAction): string {
  switch (action.type) {
    case "choose_menu": return `menu:${action.menuId}`;
    case "complete_task": return `task:${action.taskId}`;
    case "confirm_pending": return "confirm";
    case "cancel_pending": return "cancel";
    case "retry_checkout": return "retry";
    case "request": return `request:${action.request}`;
    case "submit_text": return `text:${action.text}`;
  }
}

function bindAction(node: HTMLButtonElement, action: AgentAction, handlers: UiHandlers, state: HostUiState): void {
  node.dataset.actionKey = actionKey(action);
  node.disabled = state.busy;
  node.addEventListener("click", () => void handlers.action(action));
}

function findAction(reply: AgentReply | undefined, predicate: (action: AgentAction) => boolean): AgentAction | undefined {
  return reply?.actions.find(predicate);
}

function cardShell(title: string, eyebrow?: string): HTMLElement {
  const card = el("article", "surface-card");
  const head = el("div", "card-heading");
  if (eyebrow) head.append(el("p", "eyebrow", eyebrow));
  head.append(el("h2", "card-title", title));
  card.append(head);
  return card;
}

function renderEvent(card: Extract<AgentCard, { type: "event_summary" }>): HTMLElement {
  const wrap = cardShell(card.title, "Current plan");
  const grid = el("dl", "summary-grid");
  const fields: Array<[string, string]> = [
    ["When", formatDate(card.startAt)],
    ["Guests", String(card.guestCount)],
    ["Budget", money(card.budget, card.currency)],
    ["Stage", card.status.replaceAll("_", " ")],
  ];
  for (const [label, value] of fields) {
    const item = el("div", "summary-item");
    item.append(el("dt", "summary-label", label), el("dd", "summary-value", value));
    grid.append(item);
  }
  wrap.append(grid);
  return wrap;
}

function renderMenu(card: Extract<AgentCard, { type: "menu_options" }>, reply: AgentReply | undefined, handlers: UiHandlers, state: HostUiState): HTMLElement {
  const wrap = cardShell(card.title, "Choose one");
  const rail = el("div", "card-rail");
  for (const menu of card.menus) {
    const option = el("article", "choice-card");
    option.append(el("h3", "choice-title", menu.name));
    const meta = el("p", "choice-meta", `${menu.prepMinutes} min total prep + cook`);
    option.append(meta);
    const list = el("ul", "compact-list");
    for (const name of menu.itemNames) list.append(el("li", "", name));
    option.append(list);
    const action = findAction(reply, (candidate) => candidate.type === "choose_menu" && candidate.menuId === menu.id);
    if (action) {
      const choose = button("Choose this menu", "button primary full-width");
      bindAction(choose, action, handlers, state);
      option.append(choose);
    }
    rail.append(option);
  }
  wrap.append(rail);
  return wrap;
}

function renderShopping(card: Extract<AgentCard, { type: "shopping_list" }>, handlers: UiHandlers): HTMLElement {
  const wrap = cardShell(card.title, "Authoritative quantities");
  const open = card.items.filter((item) => item.toBuyQuantity > 0 && item.status !== "simulated_purchased");
  const purchased = card.items.filter((item) => item.status === "simulated_purchased").length;
  const stats = el("div", "stat-row");
  stats.append(stat(`${open.length}`, "to buy"), stat(`${purchased}`, "purchased in demo"));
  wrap.append(stats);
  const list = el("div", "shopping-preview");
  for (const item of card.items.slice(0, 5)) list.append(shoppingRow(item));
  wrap.append(list);
  if (card.items.length > 5) {
    const more = button(`View all ${card.items.length} items`, "button secondary full-width");
    more.addEventListener("click", () => handlers.expand(card));
    wrap.append(more);
  }
  return wrap;
}

function shoppingRow(item: Extract<AgentCard, { type: "shopping_list" }>["items"][number]): HTMLElement {
  const row = el("div", "shopping-row");
  const copy = el("div", "shopping-copy");
  copy.append(el("strong", "shopping-name", item.name));
  copy.append(el("span", "shopping-detail", `${item.toBuyQuantity} ${item.unit} to buy · ${item.onHandQuantity} on hand`));
  const status = el("span", `status-pill ${item.status === "simulated_purchased" ? "success" : "neutral"}`, item.status.replaceAll("_", " "));
  row.append(copy, status);
  return row;
}

function renderProducts(card: Extract<AgentCard, { type: "product_choices" }>): HTMLElement {
  const wrap = cardShell(card.title, "Simulation only — no real order");
  const rail = el("div", "card-rail product-rail");
  for (const item of card.items) {
    const option = el("article", "choice-card product-card");
    option.append(el("p", "eyebrow", `${item.quantity} ${item.unit}`), el("h3", "choice-title", item.name));
    const candidates = el("div", "candidate-list");
    for (const candidate of item.candidates) {
      const row = el("div", candidate.id === item.selectedProductId ? "candidate selected" : "candidate");
      const copy = el("div", "candidate-copy");
      copy.append(el("strong", "", candidate.name), el("span", "", money(candidate.price, candidate.currency)));
      if (candidate.id === item.selectedProductId) row.append(copy, el("span", "status-pill selected-pill", "Selected"));
      else row.append(copy);
      candidates.append(row);
    }
    option.append(candidates);
    rail.append(option);
  }
  wrap.append(rail, el("p", "fine-print", "Host currently selects the lowest-priced deterministic demo candidate. Alternatives are shown for transparency, not as active purchase controls."));
  return wrap;
}

function renderPrep(card: Extract<AgentCard, { type: "prep_timeline" }>, reply: AgentReply | undefined, handlers: UiHandlers, state: HostUiState, live = false): HTMLElement {
  const wrap = cardShell(live ? "Live preparation" : card.title, live ? "One thing at a time" : "Dependency-aware plan");
  const tasks = live ? card.tasks.filter((task) => task.status === "ready").slice(0, 1) : card.tasks;
  if (tasks.length === 0) {
    wrap.append(el("p", "empty-state", live ? "No prep task is ready right now." : "No preparation tasks yet."));
    return wrap;
  }
  const timeline = el("div", live ? "live-task-list" : "timeline");
  for (const task of tasks) {
    const row = el("article", live ? "live-task" : `timeline-row ${task.status}`);
    const marker = el("span", "timeline-marker");
    marker.setAttribute("aria-hidden", "true");
    const body = el("div", "timeline-body");
    body.append(el("p", "task-meta", `${task.category} · ${task.durationMinutes} min · ${formatDate(task.dueBy)}`));
    body.append(el(live ? "h1" : "h3", live ? "live-task-title" : "task-title", task.title));
    if (!live && task.dependencies.length) body.append(el("p", "task-deps", `${task.dependencies.length} prerequisite${task.dependencies.length === 1 ? "" : "s"}`));
    const statePill = el("span", `status-pill ${task.status === "done" ? "success" : task.status === "ready" ? "ready" : "neutral"}`, task.status.replaceAll("_", " "));
    const action = findAction(reply, (candidate) => candidate.type === "complete_task" && candidate.taskId === task.id);
    const actionWrap = el("div", "task-actions");
    actionWrap.append(statePill);
    if (action) {
      const done = button(live ? "Mark complete" : "Done", live ? "button primary live-complete" : "button secondary compact");
      bindAction(done, action, handlers, state);
      actionWrap.append(done);
    }
    body.append(actionWrap);
    row.append(marker, body);
    timeline.append(row);
  }
  wrap.append(timeline);
  return wrap;
}

function renderImpact(card: Extract<AgentCard, { type: "change_impact" }>): HTMLElement {
  const wrap = cardShell(card.title, "Checked — not applied yet");
  const list = el("div", "impact-grid");
  const values: Array<[string, string]> = [
    ["Guest count", card.guestCountChanged ? "Changes" : "Unchanged"],
    ["Menu", card.menuChanged ? "Changes" : "Preserved"],
    ["Shopping lines", String(card.shoppingChangedCount)],
    ["Prep tasks added", String(card.addedTaskCount)],
    ["Prep tasks removed", String(card.removedTaskCount)],
    ["Completed work kept", String(card.preservedCompletedTaskCount)],
  ];
  for (const [label, value] of values) list.append(stat(value, label));
  if (card.constraintsAdded.length) wrap.append(el("p", "impact-note", `New requirement: ${card.constraintsAdded.join(", ")}`));
  wrap.append(list);
  return wrap;
}

function renderHistory(card: Extract<AgentCard, { type: "history" }>): HTMLElement {
  const wrap = cardShell(card.title, "Receipts and safe reversals");
  const list = el("div", "history-list");
  if (!card.receipts.length) list.append(el("p", "empty-state", "No recorded actions yet."));
  for (const receipt of [...card.receipts].reverse()) {
    const row = el("div", "history-row");
    const copy = el("div", "history-copy");
    copy.append(el("strong", "", receipt.action), el("span", "", receipt.summary));
    row.append(copy, el("span", `status-pill ${receipt.status === "succeeded" ? "success" : receipt.status === "failed" ? "danger" : "neutral"}`, receipt.status));
    list.append(row);
  }
  wrap.append(list);
  return wrap;
}

function renderConfirmation(card: Extract<AgentCard, { type: "confirmation" }>, reply: AgentReply | undefined, handlers: UiHandlers, state: HostUiState): HTMLElement {
  const wrap = cardShell(card.title, "Your confirmation is required");
  wrap.classList.add("confirmation-card");
  wrap.append(el("p", "confirmation-body", card.body), el("p", "fine-print", card.consequence));
  const actions = el("div", "confirmation-actions");
  const confirmAction = findAction(reply, (candidate) => candidate.type === "confirm_pending");
  const cancelAction = findAction(reply, (candidate) => candidate.type === "cancel_pending");
  if (cancelAction) {
    const cancel = button("Cancel", "button secondary");
    bindAction(cancel, cancelAction, handlers, state);
    actions.append(cancel);
  }
  if (confirmAction) {
    const confirm = button("Confirm", "button primary");
    bindAction(confirm, confirmAction, handlers, state);
    actions.append(confirm);
  }
  wrap.append(actions);
  return wrap;
}

function renderError(card: Extract<AgentCard, { type: "error" }>): HTMLElement {
  const wrap = cardShell(card.title, "Host did not mark this as done");
  wrap.classList.add("error-card");
  wrap.append(el("p", "confirmation-body", card.body));
  return wrap;
}

function stat(value: string, label: string): HTMLElement {
  const node = el("div", "stat");
  node.append(el("strong", "stat-value", value), el("span", "stat-label", label));
  return node;
}

function renderCard(card: AgentCard, reply: AgentReply | undefined, handlers: UiHandlers, state: HostUiState, live = false): HTMLElement {
  switch (card.type) {
    case "event_summary": return renderEvent(card);
    case "menu_options": return renderMenu(card, reply, handlers, state);
    case "shopping_list": return renderShopping(card, handlers);
    case "product_choices": return renderProducts(card);
    case "prep_timeline": return renderPrep(card, reply, handlers, state, live);
    case "change_impact": return renderImpact(card);
    case "history": return renderHistory(card);
    case "confirmation": return renderConfirmation(card, reply, handlers, state);
    case "error": return renderError(card);
  }
}

function renderTranscript(state: HostUiState): HTMLElement {
  const log = el("section", "transcript");
  log.setAttribute("aria-label", "Host conversation");
  log.setAttribute("aria-live", "polite");
  for (const entry of state.transcript) {
    const bubble = el("div", `message ${entry.role}`);
    bubble.append(el("span", "message-role", entry.role === "assistant" ? "Host" : "You"));
    bubble.append(el("p", "message-text", entry.text));
    log.append(bubble);
  }
  return log;
}

function renderActionStrip(reply: AgentReply | undefined, handlers: UiHandlers, state: HostUiState): HTMLElement | null {
  if (!reply?.actions.length) return null;
  const embedded = new Set<string>();
  for (const card of reply.cards) {
    if (card.type === "menu_options") for (const menu of card.menus) embedded.add(`menu:${menu.id}`);
    if (card.type === "prep_timeline") for (const task of card.tasks) embedded.add(`task:${task.id}`);
    if (card.type === "confirmation") { embedded.add("confirm"); embedded.add("cancel"); }
  }
  const remaining = reply.actions.filter((action) => !embedded.has(actionKey(action)));
  if (!remaining.length) return null;
  const strip = el("div", "action-strip");
  for (const action of remaining) {
    const control = button(action.label, action.type === "request" && action.request === "checkout" ? "button primary" : "button secondary");
    bindAction(control, action, handlers, state);
    strip.append(control);
  }
  return strip;
}

function planWorkspace(state: HostUiState, handlers: UiHandlers): HTMLElement {
  const panel = el("section", "workspace-panel");
  panel.setAttribute("aria-label", "Current Host result");
  const reply = latestReply(state);
  if (!reply?.cards.length) {
    if (state.latest.event) panel.append(renderEvent(state.latest.event));
    else {
      const welcome = el("article", "welcome-card");
      welcome.append(el("p", "eyebrow", "Alexa+ simulation"));
      welcome.append(el("h1", "welcome-title", "Turn hosting into a plan you can actually finish."));
      welcome.append(el("p", "welcome-copy", "Tell Host what you're planning. It will keep the menu, shopping, preparation and late changes tied to real execution state—not just conversation."));
      panel.append(welcome);
    }
    const actions = renderActionStrip(reply, handlers, state);
    if (actions) panel.append(actions);
    return panel;
  }
  const stack = el("div", "card-stack");
  for (const card of reply.cards) stack.append(renderCard(card, reply, handlers, state));
  const actions = renderActionStrip(reply, handlers, state);
  if (actions) stack.append(actions);
  panel.append(stack);
  return panel;
}

function renderComposer(state: HostUiState, handlers: UiHandlers): HTMLElement {
  const form = el("form", "composer");
  form.setAttribute("aria-label", "Send a message to Host");
  const input = el("input", "composer-input") as HTMLInputElement;
  input.name = "message";
  input.placeholder = "Tell Host what changed…";
  input.autocomplete = "off";
  input.disabled = state.busy;
  input.setAttribute("aria-label", "Message Host");
  const send = button(state.busy ? "Working…" : "Send", "button primary composer-send");
  send.disabled = state.busy;
  send.type = "submit";
  form.append(input, send);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text || state.busy) return;
    input.value = "";
    void handlers.submit(text);
  });
  return form;
}

function renderPlan(state: HostUiState, handlers: UiHandlers): HTMLElement {
  const main = el("div", "plan-layout");
  const conversation = el("section", "conversation-panel");
  conversation.append(el("div", "section-kicker", "Conversation"), renderTranscript(state));
  conversation.append(renderComposer(state, handlers));
  main.append(conversation, planWorkspace(state, handlers));
  return main;
}

function renderLive(state: HostUiState, handlers: UiHandlers): HTMLElement {
  const view = el("section", "mode-view live-view");
  const reply = state.liveReply ?? latestReply(state);
  const prep = reply?.cards.find((card): card is Extract<AgentCard, { type: "prep_timeline" }> => card.type === "prep_timeline");
  const head = el("div", "mode-heading");
  head.append(el("p", "eyebrow", "Hands-busy view"), el("h1", "mode-title", "Live Mode"), el("p", "mode-copy", "One current action, large controls, no extra clutter."));
  view.append(head);
  if (prep) view.append(renderPrep(prep, reply, handlers, state, true));
  else {
    const empty = cardShell("Nothing ready yet", "Live Mode");
    empty.append(el("p", "empty-state", reply?.speech ?? "Build a preparation plan first, then Host can surface the next ready task."));
    const strip = renderActionStrip(reply, handlers, state);
    if (strip) empty.append(strip);
    view.append(empty);
  }
  return view;
}

function renderActivity(state: HostUiState, handlers: UiHandlers): HTMLElement {
  const view = el("section", "mode-view activity-view");
  const reply = latestReply(state);
  const history = reply?.cards.find((card): card is Extract<AgentCard, { type: "history" }> => card.type === "history") ?? state.latest.history;
  const head = el("div", "mode-heading");
  head.append(el("p", "eyebrow", "Verifiable state"), el("h1", "mode-title", "Activity"), el("p", "mode-copy", "Receipts show what Host actually completed, failed or reversed."));
  view.append(head);
  if (history) view.append(renderHistory(history));
  else view.append(el("p", "empty-state", "No action history is available yet."));
  const actions = renderActionStrip(reply, handlers, state);
  if (actions) view.append(actions);
  return view;
}

function renderDialog(card: AgentCard, handlers: UiHandlers): HTMLDialogElement {
  const dialog = el("dialog", "detail-dialog") as HTMLDialogElement;
  const head = el("div", "dialog-head");
  const close = button("Close", "button secondary compact");
  close.addEventListener("click", () => handlers.closeExpanded());
  head.append(el("h2", "dialog-title", card.type === "shopping_list" ? "Full shopping list" : "Details"), close);
  dialog.append(head);
  if (card.type === "shopping_list") {
    const list = el("div", "dialog-list");
    for (const item of card.items) list.append(shoppingRow(item));
    dialog.append(list);
  }
  dialog.addEventListener("cancel", (event) => { event.preventDefault(); handlers.closeExpanded(); });
  return dialog;
}

function renderHeader(state: HostUiState, handlers: UiHandlers): HTMLElement {
  const header = el("header", "topbar");
  const brand = el("div", "brand");
  const mark = el("span", "brand-mark", "H");
  mark.setAttribute("aria-hidden", "true");
  const copy = el("div", "brand-copy");
  copy.append(el("strong", "brand-name", "Host"), el("span", "brand-subtitle", "Alexa+ simulation"));
  brand.append(mark, copy);

  const nav = el("nav", "mode-nav");
  nav.setAttribute("aria-label", "Host views");
  const modes: Array<[ViewMode, string]> = [["conversation", "Plan"], ["live", "Live"], ["activity", "Activity"]];
  for (const [mode, label] of modes) {
    const control = button(label, state.mode === mode ? "nav-button active" : "nav-button");
    control.setAttribute("aria-current", state.mode === mode ? "page" : "false");
    control.addEventListener("click", () => void handlers.mode(mode));
    nav.append(control);
  }

  const theme = button("Theme", "icon-button");
  theme.setAttribute("aria-label", "Switch light or dark theme");
  theme.addEventListener("click", handlers.toggleTheme);
  header.append(brand, nav, theme);
  return header;
}

export function render(root: HTMLElement, state: HostUiState, handlers: UiHandlers): void {
  root.replaceChildren();
  const shell = el("div", "app-shell");
  shell.append(renderHeader(state, handlers));
  const main = el("main", "main-content");
  main.id = "main-content";
  main.tabIndex = -1;
  if (state.mode === "conversation") main.append(renderPlan(state, handlers));
  if (state.mode === "live") main.append(renderLive(state, handlers));
  if (state.mode === "activity") main.append(renderActivity(state, handlers));
  shell.append(main);
  root.append(shell);

  if (state.expandedCard) {
    const dialog = renderDialog(state.expandedCard, handlers);
    root.append(dialog);
    queueMicrotask(() => dialog.showModal());
  }

  if (state.mode === "conversation") {
    const transcript = root.querySelector<HTMLElement>(".transcript");
    if (transcript) transcript.scrollTop = transcript.scrollHeight;
  }
}
