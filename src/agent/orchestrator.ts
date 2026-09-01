import type { Constraint, Menu, PreparationTask, ShoppingItem } from "../domain/types.js";
import type { ActionHistoryView, ChangeImpactView, EventStatusView, HostToolFailure, HostToolResult, ProposedMenusView } from "../tools/types.js";
import { HostToolRuntime } from "../tools/runtime.js";
import { parseNaturalStartAt } from "./date.js";
import { friendlyToolFailure } from "./friendly-errors.js";
import { HeuristicIntentInterpreter } from "./interpreter.js";
import { eventSummaryCard, historyCard, impactCard, menuCard, prepCard, productCard, shoppingCard } from "./presentation.js";
import type { AgentAction, AgentReply, ConversationState, EventDraft, HostAgentDependencies, IntentContext, IntentInterpreter, PendingConfirmation } from "./types.js";

function shorten(value: string, max = 34): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

function nowIso(now: () => Date): string { return now().toISOString(); }

function reply(params: {
  status: AgentReply["status"];
  speech: string;
  displayText?: string;
  cards?: AgentReply["cards"];
  actions?: AgentAction[];
  eventId?: string;
  question?: string;
}): AgentReply {
  return {
    status: params.status,
    speech: params.speech,
    displayText: params.displayText ?? params.speech,
    cards: params.cards ?? [],
    actions: params.actions ?? [],
    ...(params.eventId ? { eventId: params.eventId } : {}),
    ...(params.question ? { question: params.question } : {}),
  };
}

function asStatus(result: HostToolResult): EventStatusView | undefined {
  if (!result.ok || typeof result.data !== "object" || result.data === null) return undefined;
  const candidate = result.data as Partial<EventStatusView>;
  return candidate.event && candidate.shopping && candidate.tasks ? candidate as EventStatusView : undefined;
}

function eventCardFromStatus(status: EventStatusView) {
  return eventSummaryCard({
    name: status.event.name,
    startAt: status.event.startAt,
    guestCount: status.event.guestCount,
    budget: status.event.budget,
    currency: status.event.currency,
    status: status.event.status,
    revision: status.event.revision,
  });
}

function confirmationReply(state: ConversationState, pending: PendingConfirmation): AgentReply {
  return reply({
    status: "needs_confirmation",
    speech: pending.prompt,
    eventId: state.eventId,
    question: pending.prompt,
    cards: [{ type: "confirmation", title: "Confirm change", body: pending.prompt, consequence: pending.consequence }],
    actions: [
      { type: "confirm_pending", label: "Confirm" },
      { type: "cancel_pending", label: "Cancel" },
    ],
  });
}

function mergeConstraints(existing: Constraint[], additions: Constraint[]): Constraint[] {
  const byId = new Map(existing.map((constraint) => [constraint.id, constraint]));
  for (const constraint of additions) byId.set(constraint.id, constraint);
  return [...byId.values()];
}

export class HostAgentOrchestrator {
  private readonly conversations = new Map<string, ConversationState>();
  private readonly now: () => Date;
  private readonly idFactory: () => string;
  private readonly defaultTimezone: string;
  private readonly defaultCurrency: string;
  private idCounter = 0;

  constructor(
    private readonly runtime: HostToolRuntime,
    private readonly interpreter: IntentInterpreter = new HeuristicIntentInterpreter(),
    dependencies: HostAgentDependencies = {},
  ) {
    this.now = dependencies.now ?? (() => new Date());
    this.idFactory = dependencies.idFactory ?? (() => `host-event-${this.now().getTime()}-${++this.idCounter}`);
    this.defaultTimezone = dependencies.defaultTimezone ?? "Europe/London";
    this.defaultCurrency = dependencies.defaultCurrency ?? "GBP";
  }

  getConversationState(conversationId: string): ConversationState {
    return structuredClone(this.state(conversationId));
  }

  private state(conversationId: string): ConversationState {
    const existing = this.conversations.get(conversationId);
    if (existing) return existing;
    const created: ConversationState = {};
    this.conversations.set(conversationId, created);
    return created;
  }

  private context(state: ConversationState): IntentContext {
    return {
      hasEvent: Boolean(state.eventId),
      hasPendingConfirmation: Boolean(state.pending),
      ...(state.awaitingField ? { awaitingField: state.awaitingField } : {}),
    };
  }

  private failure(result: HostToolFailure, state: ConversationState, actions: AgentAction[] = []): AgentReply {
    const friendly = friendlyToolFailure(result);
    return reply({
      status: "error",
      speech: friendly.message,
      eventId: state.eventId,
      cards: [{ type: "error", title: "Needs attention", body: friendly.message, retryable: friendly.retryable }],
      actions,
    });
  }

  private noEvent(): AgentReply {
    const question = "What are you hosting?";
    return reply({
      status: "needs_input",
      speech: "Tell me what you're hosting and I'll turn it into a working plan.",
      question,
      actions: [{ type: "submit_text", label: "Plan a dinner", text: "I'm hosting dinner" }],
    });
  }

  async handleText(conversationId: string, text: string): Promise<AgentReply> {
    const state = this.state(conversationId);

    if (state.awaitingField && state.draft && !state.pending) {
      const captured = await this.captureAwaitedField(state, text);
      if (!captured) return this.askForDraftField(state, state.awaitingField);
      return this.continueEventCreation(state);
    }

    const intent = await this.interpreter.interpret(text, this.context(state));
    if (state.pending) {
      if (intent.kind === "confirm") return this.confirmPending(state);
      if (intent.kind === "cancel") {
        state.pending = undefined;
        return reply({ status: "ok", speech: "Cancelled. I haven't changed the plan.", eventId: state.eventId });
      }
      return confirmationReply(state, state.pending);
    }

    switch (intent.kind) {
      case "create_event": return this.startEvent(state, intent.slots);
      case "status": return this.showStatus(state);
      case "next_action": return this.showNextAction(state);
      case "menu_options": return this.showMenus(state);
      case "shopping": return this.buildShopping(state);
      case "products": return this.prepareProducts(state);
      case "checkout": return this.requestCheckout(state);
      case "prep": return this.buildPrep(state);
      case "history": return this.showHistory(state);
      case "change": return this.previewChange(state, intent.slots);
      case "mark_task_complete": return this.completeTaskFromText(state, text, intent.slots.taskId);
      case "undo": return this.requestUndo(state);
      case "help": return this.help(state);
      case "confirm": return reply({ status: "ok", speech: "There's nothing waiting for confirmation.", eventId: state.eventId });
      case "cancel": return reply({ status: "ok", speech: "There's nothing waiting to cancel.", eventId: state.eventId });
      default: return this.help(state);
    }
  }

  async handleAction(conversationId: string, action: AgentAction): Promise<AgentReply> {
    const state = this.state(conversationId);
    switch (action.type) {
      case "submit_text": return this.handleText(conversationId, action.text);
      case "confirm_pending": return state.pending ? this.confirmPending(state) : reply({ status: "ok", speech: "There's nothing waiting for confirmation.", eventId: state.eventId });
      case "cancel_pending":
        state.pending = undefined;
        return reply({ status: "ok", speech: "Cancelled. I haven't changed the plan.", eventId: state.eventId });
      case "choose_menu": return this.requestMenuCommit(state, action.menuId);
      case "complete_task": return this.completeTask(state, action.taskId);
      case "retry_checkout": return this.requestCheckout(state, "Retry the simulated checkout?");
      case "request": {
        switch (action.request) {
          case "menu": return this.showMenus(state);
          case "shopping": return this.buildShopping(state);
          case "products": return this.prepareProducts(state);
          case "prep": return this.buildPrep(state);
          case "status": return this.showStatus(state);
          case "history": return this.showHistory(state);
          case "next": return this.showNextAction(state);
          case "undo": return this.requestUndo(state);
          case "checkout": return this.requestCheckout(state);
        }
      }
    }
  }

  private async startEvent(state: ConversationState, slots: Parameters<IntentInterpreter["interpret"]> extends never ? never : import("./types.js").HostIntentSlots): Promise<AgentReply> {
    const draft: EventDraft = state.draft ?? {
      currency: slots.currency ?? this.defaultCurrency,
      timezone: slots.timezone ?? this.defaultTimezone,
      constraints: [],
      preferences: [],
    };
    if (slots.name) draft.name = slots.name;
    if (slots.guestCount !== undefined) draft.guestCount = slots.guestCount;
    if (slots.budget !== undefined) draft.budget = slots.budget;
    if (slots.currency) draft.currency = slots.currency;
    if (slots.timezone) draft.timezone = slots.timezone;
    if (slots.constraints) draft.constraints = mergeConstraints(draft.constraints, slots.constraints);
    if (slots.preferences) draft.preferences = [...new Set([...draft.preferences, ...slots.preferences])];
    if (slots.startText) {
      try { draft.startAt = parseNaturalStartAt(slots.startText, this.now(), draft.timezone); } catch { draft.startAt = undefined; }
    }
    state.draft = draft;
    return this.continueEventCreation(state);
  }

  private askForDraftField(state: ConversationState, field: "guestCount" | "startAt" | "budget"): AgentReply {
    state.awaitingField = field;
    const question = field === "guestCount"
      ? "How many people are you hosting?"
      : field === "startAt"
        ? "What day and time should I plan for?"
        : "What's your budget?";
    return reply({ status: "needs_input", speech: question, question, eventId: state.eventId });
  }

  private async captureAwaitedField(state: ConversationState, text: string): Promise<boolean> {
    const draft = state.draft;
    const field = state.awaitingField;
    if (!draft || !field) return false;
    if (field === "startAt") {
      try {
        const startAt = parseNaturalStartAt(text, this.now(), draft.timezone);
        if (!startAt) return false;
        draft.startAt = startAt;
      } catch { return false; }
    } else {
      const intent = await this.interpreter.interpret(text, this.context(state));
      const direct = text.match(/£?\s*(\d+(?:\.\d{1,2})?)/);
      if (field === "guestCount") {
        const value = intent.slots.guestCount ?? (direct ? Number(direct[1]) : undefined);
        if (!value || !Number.isInteger(value) || value <= 0) return false;
        draft.guestCount = value;
      } else {
        const value = intent.slots.budget ?? (direct ? Number(direct[1]) : undefined);
        if (value === undefined || !Number.isFinite(value) || value < 0) return false;
        draft.budget = value;
      }
    }
    state.awaitingField = undefined;
    return true;
  }

  private async continueEventCreation(state: ConversationState): Promise<AgentReply> {
    const draft = state.draft;
    if (!draft) return this.noEvent();
    if (draft.guestCount === undefined) return this.askForDraftField(state, "guestCount");
    if (!draft.startAt) return this.askForDraftField(state, "startAt");
    if (draft.budget === undefined) return this.askForDraftField(state, "budget");

    const id = this.idFactory();
    const result = await this.runtime.execute({
      name: "create_event",
      input: {
        id,
        name: draft.name ?? "Hosting at home",
        startAt: draft.startAt,
        timezone: draft.timezone,
        guestCount: draft.guestCount,
        budget: draft.budget,
        currency: draft.currency,
        constraints: draft.constraints,
        preferences: draft.preferences,
      },
    });
    if (!result.ok) return this.failure(result, state);
    state.eventId = id;
    state.draft = undefined;
    state.awaitingField = undefined;
    const status = asStatus(result);
    const speech = `Done. I've set up ${status?.event.name ?? "your event"} for ${status?.event.guestCount ?? draft.guestCount} people.`;
    return reply({
      status: "ok",
      speech,
      eventId: id,
      cards: status ? [eventCardFromStatus(status)] : [],
      actions: [{ type: "request", label: "Show menu ideas", request: "menu" }],
    });
  }

  private async currentStatus(state: ConversationState): Promise<HostToolResult<EventStatusView> | undefined> {
    if (!state.eventId) return undefined;
    return this.runtime.execute({ name: "get_event_status", input: { eventId: state.eventId } }) as Promise<HostToolResult<EventStatusView>>;
  }

  private async showStatus(state: ConversationState): Promise<AgentReply> {
    const result = await this.currentStatus(state);
    if (!result) return this.noEvent();
    if (!result.ok) return this.failure(result, state);
    const data = result.data;
    const speech = data.tasks.total
      ? `${data.tasks.done} of ${data.tasks.total} prep tasks are done, with ${data.shopping.unresolvedLines} shopping items still open.`
      : `The plan is ${data.event.status}. There are ${data.shopping.unresolvedLines} shopping items still open.`;
    return reply({
      status: "ok", speech, eventId: state.eventId, cards: [eventCardFromStatus(data)],
      actions: [
        { type: "request", label: "What's next", request: "next" },
        { type: "request", label: "View history", request: "history" },
      ],
    });
  }

  private async showNextAction(state: ConversationState): Promise<AgentReply> {
    if (!state.eventId) return this.noEvent();
    const result = await this.runtime.execute({ name: "get_next_action", input: { eventId: state.eventId } });
    if (!result.ok) return this.failure(result, state);
    const next = (result.data as { nextAction: PreparationTask | null }).nextAction;
    if (!next) return reply({ status: "ok", speech: "There isn't a ready prep task right now.", eventId: state.eventId, actions: [{ type: "request", label: "Check status", request: "status" }] });
    return reply({
      status: "ok",
      speech: `Next: ${next.title}. It should take about ${next.durationMinutes} minutes.`,
      eventId: state.eventId,
      cards: [prepCard([next])],
      actions: [{ type: "complete_task", label: "Mark done", taskId: next.id }],
    });
  }

  private async showMenus(state: ConversationState): Promise<AgentReply> {
    if (!state.eventId) return this.noEvent();
    const result = await this.runtime.execute({ name: "propose_menu", input: { eventId: state.eventId, maxOptions: 3 } }) as HostToolResult<ProposedMenusView>;
    if (!result.ok) return this.failure(result, state);
    state.lastMenus = result.data.menus;
    return reply({
      status: "ok",
      speech: `I found ${result.data.menus.length} menu options that fit the confirmed guest requirements.`,
      eventId: state.eventId,
      cards: [menuCard(result.data.menus)],
      actions: result.data.menus.map((menu) => ({ type: "choose_menu", label: shorten(`Choose ${menu.name}`), menuId: menu.id })),
    });
  }

  private async requestMenuCommit(state: ConversationState, menuId: string): Promise<AgentReply> {
    if (!state.eventId) return this.noEvent();
    const menu = state.lastMenus?.find((entry) => entry.id === menuId);
    if (!menu) return reply({ status: "error", speech: "That menu option is no longer available. I'll refresh the choices.", eventId: state.eventId, actions: [{ type: "request", label: "Refresh menus", request: "menu" }] });
    const status = await this.currentStatus(state);
    if (!status) return this.noEvent();
    if (!status.ok) return this.failure(status, state);
    state.pending = {
      kind: "commit_menu",
      prompt: `Use ${menu.name} as the committed menu?`,
      consequence: "This sets the menu that shopping and preparation will be calculated from.",
      tool: "commit_menu",
      input: { eventId: state.eventId, expectedRevision: status.data.event.revision, menuId },
    };
    return confirmationReply(state, state.pending);
  }

  private async buildShopping(state: ConversationState): Promise<AgentReply> {
    const status = await this.currentStatus(state);
    if (!status) return this.noEvent();
    if (!status.ok) return this.failure(status, state);
    const result = await this.runtime.execute({ name: "build_shopping_plan", input: { eventId: state.eventId, expectedRevision: status.data.event.revision } });
    if (!result.ok) return this.failure(result, state);
    const shopping = (result.data as { shopping: ShoppingItem[] }).shopping;
    state.lastShopping = shopping;
    const open = shopping.filter((item) => item.toBuyQuantity > 0).length;
    return reply({
      status: "ok",
      speech: open ? `Shopping list ready. ${open} items still need buying.` : "Shopping list ready. The confirmed inventory covers everything.",
      eventId: state.eventId,
      cards: [shoppingCard(shopping)],
      actions: open ? [{ type: "request", label: "Find demo products", request: "products" }] : [],
    });
  }

  private async prepareProducts(state: ConversationState): Promise<AgentReply> {
    const status = await this.currentStatus(state);
    if (!status) return this.noEvent();
    if (!status.ok) return this.failure(status, state);
    const result = await this.runtime.execute({ name: "prepare_cart", input: { eventId: state.eventId, expectedRevision: status.data.event.revision } });
    if (!result.ok) return this.failure(result, state);
    const shopping = (result.data as { shopping: ShoppingItem[] }).shopping;
    state.lastShopping = shopping;
    return reply({
      status: "ok",
      speech: "I've selected the lowest-priced demo option for each open shopping item. Nothing has been purchased.",
      eventId: state.eventId,
      cards: [productCard(shopping)],
      actions: [{ type: "request", label: "Simulate checkout", request: "checkout" }],
    });
  }

  private async requestCheckout(state: ConversationState, prompt = "Run the simulated checkout now?"): Promise<AgentReply> {
    const status = await this.currentStatus(state);
    if (!status) return this.noEvent();
    if (!status.ok) return this.failure(status, state);
    state.pending = {
      kind: "checkout",
      prompt,
      consequence: "This is a labelled simulation. It will update Host's demo shopping state only; it does not place a real order.",
      tool: "confirm_cart_action",
      input: { eventId: state.eventId, expectedRevision: status.data.event.revision },
    };
    return confirmationReply(state, state.pending);
  }

  private async buildPrep(state: ConversationState): Promise<AgentReply> {
    const status = await this.currentStatus(state);
    if (!status) return this.noEvent();
    if (!status.ok) return this.failure(status, state);
    const result = await this.runtime.execute({ name: "build_preparation_plan", input: { eventId: state.eventId, expectedRevision: status.data.event.revision } });
    if (!result.ok) return this.failure(result, state);
    const tasks = Object.values((result.data as { tasks: Record<string, PreparationTask> }).tasks);
    state.lastTasks = tasks;
    const ready = tasks.filter((task) => task.status === "ready");
    return reply({
      status: "ok",
      speech: `Prep plan ready with ${tasks.length} tasks. ${ready.length} ${ready.length === 1 ? "is" : "are"} ready now.`,
      eventId: state.eventId,
      cards: [prepCard(tasks)],
      actions: ready.slice(0, 3).map((task) => ({ type: "complete_task", label: shorten(`Done: ${task.title}`), taskId: task.id })),
    });
  }

  private async completeTaskFromText(state: ConversationState, text: string, explicitTaskId?: string): Promise<AgentReply> {
    if (explicitTaskId) return this.completeTask(state, explicitTaskId);
    const ready = state.lastTasks?.filter((task) => task.status === "ready") ?? [];
    if (ready.length === 1) return this.completeTask(state, ready[0]!.id);
    const lower = text.toLowerCase();
    const matched = ready.find((task) => task.title.toLowerCase().split(/\s+/).filter((word) => word.length > 4).some((word) => lower.includes(word)));
    if (matched) return this.completeTask(state, matched.id);
    return reply({ status: "needs_input", speech: "Which prep task did you finish?", question: "Which prep task did you finish?", eventId: state.eventId, actions: ready.slice(0, 4).map((task) => ({ type: "complete_task", label: shorten(task.title), taskId: task.id })) });
  }

  private async completeTask(state: ConversationState, taskId: string): Promise<AgentReply> {
    const status = await this.currentStatus(state);
    if (!status) return this.noEvent();
    if (!status.ok) return this.failure(status, state);
    const result = await this.runtime.execute({ name: "mark_task_complete", input: { eventId: state.eventId, expectedRevision: status.data.event.revision, taskId, completedAt: nowIso(this.now) } });
    if (!result.ok) return this.failure(result, state);
    if (state.lastTasks) state.lastTasks = state.lastTasks.map((task) => task.id === taskId ? { ...task, status: "done", completedAt: nowIso(this.now) } : task);
    const next = asStatus(result)?.nextAction;
    return reply({
      status: "ok",
      speech: next ? `Done. Next is ${next.title}.` : "Done. I'll keep the plan updated.",
      eventId: state.eventId,
      actions: next ? [{ type: "complete_task", label: "Mark next done", taskId: next.id }] : [{ type: "request", label: "Check status", request: "status" }],
    });
  }

  private async showHistory(state: ConversationState): Promise<AgentReply> {
    if (!state.eventId) return this.noEvent();
    const result = await this.runtime.execute({ name: "get_action_history", input: { eventId: state.eventId, limit: 12 } }) as HostToolResult<ActionHistoryView>;
    if (!result.ok) return this.failure(result, state);
    state.lastReceipts = result.data.receipts;
    state.lastAudit = result.data.audit;
    const last = result.data.receipts.at(-1);
    return reply({
      status: "ok",
      speech: last ? `The latest recorded action is ${last.resultSummary}` : "There isn't any recorded action history yet.",
      eventId: state.eventId,
      cards: [historyCard(result.data.receipts, result.data.audit)],
      actions: result.data.reversibleReceiptIds.length ? [{ type: "request", label: "Undo latest safe change", request: "undo" }] : [],
    });
  }

  private async requestUndo(state: ConversationState): Promise<AgentReply> {
    if (!state.eventId) return this.noEvent();
    const result = await this.runtime.execute({ name: "get_action_history", input: { eventId: state.eventId, limit: 20 } }) as HostToolResult<ActionHistoryView>;
    if (!result.ok) return this.failure(result, state);
    const receiptId = result.data.reversibleReceiptIds.at(-1);
    if (!receiptId) return reply({ status: "ok", speech: "There isn't a currently safe change to undo.", eventId: state.eventId });
    const receipt = result.data.receipts.find((entry) => entry.id === receiptId);
    const status = await this.currentStatus(state);
    if (!status) return this.noEvent();
    if (!status.ok) return this.failure(status, state);
    state.pending = {
      kind: "undo",
      prompt: `Undo ${receipt?.resultSummary ?? "the latest safe change"}?`,
      consequence: "The reversal will be recorded; the original history will remain visible.",
      tool: "undo_reversible_action",
      input: { eventId: state.eventId, expectedRevision: status.data.event.revision, receiptId },
    };
    return confirmationReply(state, state.pending);
  }

  private async previewChange(state: ConversationState, slots: import("./types.js").HostIntentSlots): Promise<AgentReply> {
    const status = await this.currentStatus(state);
    if (!status) return this.noEvent();
    if (!status.ok) return this.failure(status, state);
    const targetGuestCount = slots.guestCount ?? (slots.guestDelta ? status.data.event.guestCount + slots.guestDelta : undefined);
    const additions = slots.constraints ?? [];
    if (targetGuestCount === undefined && additions.length === 0) {
      const question = "What should I change?";
      return reply({ status: "needs_input", speech: question, question, eventId: state.eventId });
    }

    const proposalInput: Record<string, unknown> = { eventId: state.eventId, maxOptions: 1 };
    if (targetGuestCount !== undefined) proposalInput.guestCount = targetGuestCount;
    if (additions.length) proposalInput.additionalConstraints = additions;
    const proposal = await this.runtime.execute({ name: "propose_menu", input: proposalInput }) as HostToolResult<ProposedMenusView>;
    if (!proposal.ok) return this.failure(proposal, state);
    const replacement = proposal.data.menus[0];
    if (!replacement) return reply({ status: "error", speech: "I couldn't build a compatible replacement plan.", eventId: state.eventId });

    const impactInput: Record<string, unknown> = {
      eventId: state.eventId,
      expectedRevision: status.data.event.revision,
      replacementMenuId: replacement.id,
    };
    if (targetGuestCount !== undefined) impactInput.guestCount = targetGuestCount;
    if (additions.length) impactInput.addConstraints = additions;
    const analysed = await this.runtime.execute({ name: "analyse_change_impact", input: impactInput }) as HostToolResult<ChangeImpactView>;
    if (!analysed.ok) return this.failure(analysed, state);
    const impact = analysed.data.impact;
    state.pending = {
      kind: "apply_change",
      prompt: "Apply this update to the plan?",
      consequence: "Host will preserve unaffected completed work and recalculate the affected menu, shopping and prep state.",
      tool: "apply_confirmed_change",
      input: { eventId: state.eventId, expectedRevision: impact.baseRevision, impactId: impact.id },
    };
    return reply({
      status: "needs_confirmation",
      speech: "I checked the change without applying it. Review the impact, then confirm if you want me to update the plan.",
      eventId: state.eventId,
      question: state.pending.prompt,
      cards: [impactCard(impact), { type: "confirmation", title: "Confirm update", body: state.pending.prompt, consequence: state.pending.consequence }],
      actions: [{ type: "confirm_pending", label: "Apply update" }, { type: "cancel_pending", label: "Keep current plan" }],
    });
  }

  private async confirmPending(state: ConversationState): Promise<AgentReply> {
    const pending = state.pending;
    if (!pending) return reply({ status: "ok", speech: "There's nothing waiting for confirmation.", eventId: state.eventId });
    const input = { ...pending.input, confirmedAt: nowIso(this.now) };
    const result = await this.runtime.execute({ name: pending.tool, input });
    state.pending = undefined;
    if (!result.ok) {
      const actions: AgentAction[] = pending.kind === "checkout" && result.error.retryable
        ? [{ type: "retry_checkout", label: "Retry simulated checkout" }]
        : [];
      return this.failure(result, state, actions);
    }
    const status = asStatus(result);
    if (pending.kind === "commit_menu") {
      return reply({ status: "ok", speech: "Menu saved. I can build the shopping list next.", eventId: state.eventId, cards: status ? [eventCardFromStatus(status)] : [], actions: [{ type: "request", label: "Build shopping list", request: "shopping" }, { type: "request", label: "Build prep plan", request: "prep" }] });
    }
    if (pending.kind === "apply_change") {
      return reply({ status: "ok", speech: "Updated. I kept unaffected work and recalculated the parts that changed.", eventId: state.eventId, cards: status ? [eventCardFromStatus(status)] : [], actions: [{ type: "request", label: "See what changed", request: "history" }] });
    }
    if (pending.kind === "checkout") {
      const data = result.data as { reference: string; total: number; currency: string; shopping: ShoppingItem[] };
      state.lastShopping = data.shopping;
      return reply({ status: "ok", speech: `Simulated checkout complete for ${data.currency} ${data.total.toFixed(2)}.`, eventId: state.eventId, cards: [shoppingCard(data.shopping)], actions: [{ type: "request", label: "Build prep plan", request: "prep" }] });
    }
    return reply({ status: "ok", speech: "Undone. The reversal is recorded in the activity history.", eventId: state.eventId, cards: status ? [eventCardFromStatus(status)] : [], actions: [{ type: "request", label: "View history", request: "history" }] });
  }

  private help(state: ConversationState): AgentReply {
    const speech = state.eventId
      ? "I can handle menus, shopping, demo product choices, prep, status, late changes, history and safe undo."
      : "Tell me what you're hosting, when it is, how many people are coming and your budget.";
    const actions: AgentAction[] = state.eventId
      ? [
          { type: "request", label: "Menu ideas", request: "menu" },
          { type: "request", label: "Shopping", request: "shopping" },
          { type: "request", label: "Prep plan", request: "prep" },
          { type: "request", label: "Status", request: "status" },
        ]
      : [{ type: "submit_text", label: "Plan a dinner", text: "I'm hosting dinner" }];
    return reply({ status: "ok", speech, eventId: state.eventId, actions });
  }
}
