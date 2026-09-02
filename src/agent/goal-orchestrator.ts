import type { PreparationTask, ShoppingItem } from "../domain/types.js";
import { HostToolRuntime } from "../tools/runtime.js";
import { HeuristicIntentInterpreter } from "./interpreter.js";
import { prepCard, shoppingCard } from "./presentation.js";
import { HostAgentOrchestrator } from "./orchestrator.js";
import type {
  AgentAction,
  AgentReply,
  ConversationState,
  HostAgentDependencies,
  IntentInterpreter,
  OperatingProjectionReader,
} from "./types.js";
import { runLowRiskWorkflow, type WorkflowRunResult } from "./workflow.js";

interface GoalConversationState {
  awaitingInventoryReview: boolean;
  inventoryReviewConfirmed: boolean;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function shorten(value: string, max = 34): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

function reply(params: {
  status: AgentReply["status"];
  speech: string;
  displayText?: string | undefined;
  cards?: AgentReply["cards"] | undefined;
  actions?: AgentAction[] | undefined;
  eventId?: string | undefined;
  question?: string | undefined;
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

/**
 * Phase C customer-facing orchestrator. The proven HostAgentOrchestrator remains
 * responsible for existing intent interpretation, confirmations and direct
 * customer actions. This layer adds bounded goal-directed sequencing around the
 * same HostToolRuntime; it cannot bypass the runtime or domain engine.
 */
export class GoalDirectedHostAgentOrchestrator {
  private readonly base: HostAgentOrchestrator;
  private readonly projectionReader: OperatingProjectionReader | undefined;
  private readonly workflowState = new Map<string, GoalConversationState>();

  constructor(
    private readonly runtime: HostToolRuntime,
    interpreter: IntentInterpreter = new HeuristicIntentInterpreter(),
    dependencies: HostAgentDependencies = {},
  ) {
    this.base = new HostAgentOrchestrator(runtime, interpreter, dependencies);
    this.projectionReader = dependencies.operatingProjectionReader;
  }

  private state(conversationId: string): GoalConversationState {
    const existing = this.workflowState.get(conversationId);
    if (existing) return existing;
    const created: GoalConversationState = {
      awaitingInventoryReview: false,
      inventoryReviewConfirmed: false,
    };
    this.workflowState.set(conversationId, created);
    return created;
  }

  getConversationState(conversationId: string): ConversationState {
    const base = this.base.getConversationState(conversationId);
    const workflow = this.state(conversationId);
    return {
      ...base,
      ...(workflow.awaitingInventoryReview ? { awaitingWorkflowInput: "inventory_review" as const } : {}),
      ...(workflow.inventoryReviewConfirmed ? { inventoryReviewConfirmed: true } : {}),
    };
  }

  private inventoryQuestion(conversationId: string, prefix?: string, cards: AgentReply["cards"] = []): AgentReply {
    const workflow = this.state(conversationId);
    workflow.awaitingInventoryReview = true;
    const question = "What required ingredients do you already have? If you have none of them, say “I don't have any of them.”";
    const speech = prefix
      ? `${prefix} ${question} I won't guess pantry quantities from an unclear answer.`
      : `${question} I won't guess pantry quantities from an unclear answer.`;
    return reply({
      status: "needs_input",
      speech,
      question,
      eventId: this.base.getConversationState(conversationId).eventId,
      cards,
    });
  }

  private explicitNoInventory(text: string): boolean {
    const normalized = text.trim().toLowerCase().replace(/[’]/g, "'");
    return /\b(?:i\s+(?:do\s+not|don't|dont)\s+have\s+any|i\s+have\s+(?:none|nothing)|have\s+(?:none|nothing)|nothing\s+(?:on\s+hand|in\s+the\s+cupboard|in\s+the\s+pantry)|none\s+(?:of\s+them|on\s+hand)|need\s+(?:all|everything)|buy\s+everything)\b/.test(normalized);
  }

  private looksLikeAllowedInterruption(text: string): boolean {
    const normalized = text.toLowerCase();
    return /\b(?:another\s+guest|one\s+more\s+guest|guest\s+(?:is|will|can|can't|cannot)|vegan|vegetarian|allerg|status|what(?:'s| is)\s+(?:the\s+)?status|history|what\s+changed|help)\b/.test(normalized);
  }

  private workflowReply(conversationId: string, run: WorkflowRunResult): AgentReply {
    const eventId = this.base.getConversationState(conversationId).eventId;
    const shoppingRecord = [...run.records].reverse().find(
      (record) => record.tool === "build_shopping_plan" && record.status === "succeeded",
    );
    const prepRecord = [...run.records].reverse().find(
      (record) => record.tool === "build_preparation_plan" && record.status === "succeeded",
    );
    const shopping = shoppingRecord?.data && typeof shoppingRecord.data === "object"
      ? (shoppingRecord.data as { shopping?: ShoppingItem[] }).shopping
      : undefined;
    const taskMap = prepRecord?.data && typeof prepRecord.data === "object"
      ? (prepRecord.data as { tasks?: Record<string, PreparationTask> }).tasks
      : undefined;
    const tasks = taskMap ? Object.values(taskMap) : undefined;

    if (run.stopReason === "failure") {
      const failed = run.records.at(-1);
      return reply({
        status: "error",
        speech: "I stopped at the failed step. I did not treat any later work as completed.",
        eventId,
        cards: [{
          type: "error",
          title: "Workflow stopped",
          body: failed?.errorCode
            ? `The next safe step failed (${failed.errorCode}). Later steps were not run.`
            : "The next safe step failed. Later steps were not run.",
          retryable: true,
        }],
        actions: [{ type: "request", label: "Check status", request: "status" }],
      });
    }

    if (run.stopReason === "stale_revision_limit") {
      return reply({
        status: "error",
        speech: "The event kept changing while I was continuing the plan. I refreshed current state and stopped rather than replaying work against a moving revision.",
        eventId,
        cards: [{
          type: "error",
          title: "Plan changed while updating",
          body: "Host refreshed authoritative state after revision conflicts and stopped. No material action was replayed.",
          retryable: true,
        }],
        actions: [{ type: "request", label: "Check status", request: "status" }],
      });
    }

    if (run.requiredInput?.field === "inventory_review") {
      return this.inventoryQuestion(conversationId);
    }

    const cards: AgentReply["cards"] = [];
    if (shopping) cards.push(shoppingCard(shopping));
    if (tasks) cards.push(prepCard(tasks));

    const projection = run.projection;
    const openShopping = projection?.shopping.unresolvedLines
      ?? shopping?.filter((item) => item.toBuyQuantity > 0 && item.status !== "simulated_purchased").length
      ?? 0;
    const totalTasks = projection?.preparation.totalTasks
      ?? tasks?.filter((task) => task.status !== "cancelled").length
      ?? 0;
    const next = projection?.nextAction;
    const pieces: string[] = [];
    if (shoppingRecord) {
      pieces.push(openShopping > 0
        ? `I reconciled shopping and ${openShopping} items still need buying.`
        : "I reconciled shopping and the confirmed inventory covers everything.");
    }
    if (prepRecord) pieces.push(`I built the run sheet with ${totalTasks} prep tasks.`);
    if (next) pieces.push(`Next is ${next.title}.`);
    if (pieces.length === 0) pieces.push(projection?.statusSentence ?? "The current low-risk workflow is up to date.");

    const actions: AgentAction[] = [];
    if (openShopping > 0) actions.push({ type: "request", label: "Review demo products", request: "products" });
    if (next) actions.push({ type: "complete_task", label: shorten(`Done: ${next.title}`), taskId: next.id });
    actions.push({ type: "request", label: "Check status", request: "status" });

    return reply({
      status: "ok",
      speech: pieces.join(" "),
      eventId,
      cards,
      actions,
    });
  }

  private async continueLowRiskWorkflow(conversationId: string): Promise<AgentReply> {
    const baseState = this.base.getConversationState(conversationId);
    if (!baseState.eventId) return this.base.handleText(conversationId, "help");
    if (!this.projectionReader) {
      return reply({
        status: "error",
        speech: "The workflow read model is unavailable, so I stopped instead of guessing the next state.",
        eventId: baseState.eventId,
        cards: [{
          type: "error",
          title: "Workflow unavailable",
          body: "Host could not read committed operating state.",
          retryable: true,
        }],
      });
    }

    const workflow = this.state(conversationId);
    const run = await runLowRiskWorkflow({
      eventId: baseState.eventId,
      tools: this.runtime,
      projectionReader: this.projectionReader,
      policy: { inventoryReviewConfirmed: workflow.inventoryReviewConfirmed },
    });
    return this.workflowReply(conversationId, run);
  }

  private async autoSurfaceMenus(conversationId: string, eventReply: AgentReply): Promise<AgentReply> {
    if (!eventReply.eventId) return eventReply;
    const menuReply = await this.base.handleText(conversationId, "menu ideas");
    if (menuReply.status === "error") {
      return reply({
        status: "error",
        speech: `${eventReply.speech} ${menuReply.speech}`,
        eventId: eventReply.eventId,
        cards: [...eventReply.cards, ...menuReply.cards],
        actions: menuReply.actions,
      });
    }

    return reply({
      status: "ok",
      speech: `${eventReply.speech} ${menuReply.speech}`,
      eventId: eventReply.eventId,
      cards: [...eventReply.cards, ...menuReply.cards],
      actions: menuReply.actions,
    });
  }

  private async afterBaseReply(
    conversationId: string,
    before: ConversationState,
    result: AgentReply,
  ): Promise<AgentReply> {
    const after = this.base.getConversationState(conversationId);
    if (!before.eventId && after.eventId && result.status === "ok") {
      return this.autoSurfaceMenus(conversationId, result);
    }

    if (before.pending?.kind === "commit_menu" && result.status === "ok" && /menu saved/i.test(result.speech)) {
      const workflow = this.state(conversationId);
      workflow.inventoryReviewConfirmed = false;
      return this.inventoryQuestion(conversationId, "Menu saved.", result.cards);
    }

    return result;
  }

  async resumeConversation(conversationId: string, eventId: string): Promise<AgentReply> {
    const result = await this.base.resumeConversation(conversationId, eventId);
    const workflow = this.state(conversationId);
    workflow.awaitingInventoryReview = false;
    workflow.inventoryReviewConfirmed = false;
    if (result.status === "error" || !this.projectionReader) return result;

    const projection = await this.projectionReader.readProjection(eventId, { inventoryConfirmed: false });
    if (!projection) return result;
    if (projection.shopping.totalLines > 0 || projection.inventoryCoverage.confirmedItemCount > 0) {
      workflow.inventoryReviewConfirmed = true;
      if (projection.preparation.totalTasks === 0) {
        const continued = await this.continueLowRiskWorkflow(conversationId);
        return reply({
          status: continued.status,
          speech: `${result.speech} ${continued.speech}`,
          displayText: `${result.displayText} ${continued.displayText}`,
          cards: [...result.cards, ...continued.cards],
          actions: continued.actions,
          eventId: continued.eventId ?? result.eventId,
          question: continued.question,
        });
      }
      return result;
    }
    if (projection.menu) return this.inventoryQuestion(conversationId, result.speech, result.cards);
    return result;
  }

  async handleText(conversationId: string, text: string): Promise<AgentReply> {
    const before = this.base.getConversationState(conversationId);
    const workflow = this.state(conversationId);

    if (before.pending) {
      const result = await this.base.handleText(conversationId, text);
      return this.afterBaseReply(conversationId, before, result);
    }

    if (workflow.awaitingInventoryReview) {
      if (this.explicitNoInventory(text)) {
        workflow.awaitingInventoryReview = false;
        workflow.inventoryReviewConfirmed = true;
        return this.continueLowRiskWorkflow(conversationId);
      }
      if (this.looksLikeAllowedInterruption(text)) {
        return this.base.handleText(conversationId, text);
      }
      return this.inventoryQuestion(
        conversationId,
        "I haven't recorded that as inventory because this deterministic stage does not yet extract exact pantry quantities from free text.",
      );
    }

    const result = await this.base.handleText(conversationId, text);
    return this.afterBaseReply(conversationId, before, result);
  }

  async handleAction(conversationId: string, action: AgentAction): Promise<AgentReply> {
    const before = this.base.getConversationState(conversationId);
    const workflow = this.state(conversationId);

    if (workflow.awaitingInventoryReview && action.type === "request" && (action.request === "shopping" || action.request === "prep")) {
      return this.inventoryQuestion(conversationId);
    }

    const result = await this.base.handleAction(conversationId, clone(action));
    return this.afterBaseReply(conversationId, before, result);
  }
}
