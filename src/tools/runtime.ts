import { HostDomainEngine } from "../domain/engine.js";
import { DomainError, StaleRevisionError } from "../domain/errors.js";
import type { ChangeImpact, ChangeRequest, HostState, Menu } from "../domain/types.js";
import { assertMenuSatisfiesConstraints, assertMenuServesGuestCount, validateMenu } from "../domain/validation.js";
import { HostPersistenceService } from "../persistence/service.js";
import { PersistenceError } from "../persistence/errors.js";
import type { HostPersistenceAdapter } from "../persistence/types.js";
import { HOST_TOOL_DESCRIPTORS } from "./descriptors.js";
import { ToolInputError, ToolRuntimeError } from "./errors.js";
import type {
  ActionHistoryView,
  ChangeImpactView,
  EventStatusView,
  HostToolCall,
  HostToolDescriptor,
  HostToolFailure,
  HostToolName,
  HostToolResult,
  HostToolSuccess,
  ProposedMenusView,
  SimulatedCartLine,
  ToolRuntimeDependencies,
} from "./types.js";
import {
  asObject,
  assertOnlyFields,
  optionalDateString,
  optionalPositiveInteger,
  optionalString,
  parseConstraints,
  parseEventStatus,
  parseInventory,
  requireDateString,
  requireFiniteNumber,
  requirePositiveInteger,
  requireString,
} from "./validation.js";

function clone<T>(value: T): T {
  return structuredClone(value);
}

async function sha256Hex(value: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new ToolRuntimeError("Web Crypto SHA-256 is unavailable.", "CRYPTO_UNAVAILABLE");
  const digest = await subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function readEventId(input: unknown): string | undefined {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return undefined;
  const eventId = (input as Record<string, unknown>).eventId;
  return typeof eventId === "string" && eventId.trim() ? eventId : undefined;
}

function statusView(state: HostState, nextAction = undefined as ReturnType<HostDomainEngine["getNextAction"]>): EventStatusView {
  return {
    event: clone(state.event),
    shopping: {
      totalLines: state.shopping.length,
      unresolvedLines: state.shopping.filter((item) => item.toBuyQuantity > 0 && item.status !== "simulated_purchased").length,
      selectedLines: state.shopping.filter((item) => item.status === "selected").length,
      purchasedLines: state.shopping.filter((item) => item.status === "simulated_purchased").length,
    },
    tasks: {
      total: Object.keys(state.tasks).length,
      blocked: Object.values(state.tasks).filter((task) => task.status === "blocked").length,
      ready: Object.values(state.tasks).filter((task) => task.status === "ready").length,
      done: Object.values(state.tasks).filter((task) => task.status === "done").length,
    },
    ...(nextAction ? { nextAction: clone(nextAction) } : {}),
  };
}

export class HostToolRuntime {
  private readonly persistenceService: HostPersistenceService;
  private readonly sessions = new Map<string, HostDomainEngine>();
  private readonly proposals = new Map<string, Map<string, Menu>>();
  private readonly pendingImpacts = new Map<string, Map<string, ChangeImpact>>();

  constructor(
    private readonly persistence: HostPersistenceAdapter,
    private readonly dependencies: ToolRuntimeDependencies,
  ) {
    this.persistenceService = new HostPersistenceService(persistence);
  }

  listTools(): HostToolDescriptor[] {
    return clone([...HOST_TOOL_DESCRIPTORS]);
  }

  private async engineFor(eventId: string): Promise<HostDomainEngine> {
    const existing = this.sessions.get(eventId);
    if (existing) return existing;
    const resumed = await this.persistenceService.resume(eventId);
    this.sessions.set(eventId, resumed.engine);
    return resumed.engine;
  }

  private async checkpointOrRollback(eventId: string, engine: HostDomainEngine, before: HostState): Promise<void> {
    try {
      await this.persistenceService.checkpoint(engine);
    } catch (error) {
      this.sessions.set(eventId, HostDomainEngine.restore(before));
      throw new ToolRuntimeError(
        "Mutation was rolled back in the live session because the persistence checkpoint failed.",
        "PERSISTENCE_CHECKPOINT_FAILED",
        true,
        { cause: error },
      );
    }
  }

  private success<T>(tool: HostToolName, data: T, stateChanged: boolean, state?: HostState): HostToolSuccess<T> {
    return {
      ok: true,
      tool,
      status: "succeeded",
      stateChanged,
      ...(state ? { eventId: state.event.id, revision: state.event.revision } : {}),
      data,
    };
  }

  private failure(
    tool: HostToolName,
    error: unknown,
    input: unknown,
    stateChanged = false,
    state?: HostState,
    data?: unknown,
  ): HostToolFailure {
    const eventId = state?.event.id ?? readEventId(input);
    const revision = state?.event.revision;
    let code = "TOOL_EXECUTION_FAILED";
    let message = error instanceof Error ? error.message : String(error);
    let retryable = false;
    let status: HostToolFailure["status"] = "failed";

    if (error instanceof ToolInputError) {
      code = error.code;
      status = "needs_attention";
    } else if (error instanceof StaleRevisionError) {
      code = error.code;
      retryable = true;
      status = "needs_attention";
    } else if (error instanceof DomainError) {
      code = error.code;
      status = "needs_attention";
    } else if (error instanceof PersistenceError) {
      code = error.code;
      retryable = true;
    } else if (error instanceof ToolRuntimeError) {
      code = error.code;
      retryable = error.retryable;
    }

    return {
      ok: false,
      tool,
      status,
      stateChanged,
      ...(eventId ? { eventId } : {}),
      ...(revision !== undefined ? { revision } : {}),
      error: { code, message, retryable },
      ...(data !== undefined ? { data } : {}),
    };
  }

  private proposedMenu(eventId: string, menuId: string, state: HostState): Menu {
    const fromProposal = this.proposals.get(eventId)?.get(menuId);
    const existing = state.menus[menuId];
    const menu = fromProposal ?? existing;
    if (!menu) throw new DomainError(`Menu ${menuId} is not an active proposal or committed menu.`, "MENU_PROPOSAL_NOT_FOUND");
    return clone(menu);
  }

  async execute(call: HostToolCall): Promise<HostToolResult> {
    const tool = call.name;
    try {
      switch (tool) {
        case "create_event":
          return await this.createEvent(call.input);
        case "update_event_constraints":
          return await this.updateConstraints(call.input);
        case "propose_menu":
          return await this.proposeMenu(call.input);
        case "commit_menu":
          return await this.commitMenu(call.input);
        case "record_inventory":
          return await this.recordInventory(call.input);
        case "build_shopping_plan":
          return await this.buildShoppingPlan(call.input);
        case "prepare_cart":
          return await this.prepareCart(call.input);
        case "confirm_cart_action":
          return await this.confirmCartAction(call.input);
        case "build_preparation_plan":
          return await this.buildPreparationPlan(call.input);
        case "mark_task_complete":
          return await this.markTaskComplete(call.input);
        case "advance_event_status":
          return await this.advanceEventStatus(call.input);
        case "get_next_action":
          return await this.getNextAction(call.input);
        case "get_event_status":
          return await this.getEventStatus(call.input);
        case "analyse_change_impact":
          return await this.analyseChangeImpact(call.input);
        case "apply_confirmed_change":
          return await this.applyConfirmedChange(call.input);
        case "get_action_history":
          return await this.getActionHistory(call.input);
        case "undo_reversible_action":
          return await this.undoReversibleAction(call.input);
        default:
          throw new ToolInputError(`Unknown Host tool: ${String(tool)}.`, "TOOL_NOT_FOUND");
      }
    } catch (error) {
      let state: HostState | undefined;
      const eventId = readEventId(call.input);
      if (eventId) state = this.sessions.get(eventId)?.snapshot();
      return this.failure(tool, error, call.input, false, state);
    }
  }

  private async createEvent(inputValue: unknown): Promise<HostToolResult> {
    const input = asObject(inputValue, "create_event");
    assertOnlyFields(input, ["id", "name", "startAt", "timezone", "guestCount", "budget", "currency", "constraints", "preferences"], "create_event");
    const id = requireString(input, "id");
    const existing = await this.persistence.load(id);
    if (existing) throw new DomainError(`Event ${id} already exists.`, "EVENT_ALREADY_EXISTS");
    const startAt = requireDateString(input, "startAt");
    const preferencesValue = input.preferences ?? [];
    if (!Array.isArray(preferencesValue) || preferencesValue.some((value) => typeof value !== "string" || !value.trim())) {
      throw new ToolInputError("preferences must be an array of non-empty strings.");
    }
    const engine = await this.persistenceService.create(
      {
        id,
        name: requireString(input, "name"),
        startAt,
        timezone: requireString(input, "timezone"),
        guestCount: requirePositiveInteger(input, "guestCount"),
        budget: requireFiniteNumber(input, "budget", 0),
        currency: requireString(input, "currency"),
        ...(input.constraints !== undefined ? { constraints: parseConstraints(input.constraints) } : {}),
        preferences: preferencesValue as string[],
      },
    );
    this.sessions.set(id, engine);
    const state = engine.snapshot();
    return this.success("create_event", statusView(state, engine.getNextAction()), true, state);
  }

  private async updateConstraints(inputValue: unknown): Promise<HostToolResult> {
    const input = asObject(inputValue, "update_event_constraints");
    assertOnlyFields(input, ["eventId", "expectedRevision", "constraints"], "update_event_constraints");
    const eventId = requireString(input, "eventId");
    const expectedRevision = requirePositiveInteger(input, "expectedRevision");
    const constraints = parseConstraints(input.constraints);
    const engine = await this.engineFor(eventId);
    const before = engine.snapshot();
    const state = engine.addConstraints(constraints, expectedRevision);
    await this.checkpointOrRollback(eventId, engine, before);
    return this.success("update_event_constraints", statusView(state, engine.getNextAction()), true, state);
  }

  private async proposeMenu(inputValue: unknown): Promise<HostToolResult<ProposedMenusView>> {
    const input = asObject(inputValue, "propose_menu");
    assertOnlyFields(input, ["eventId", "maxOptions", "guestCount", "additionalConstraints"], "propose_menu");
    const eventId = requireString(input, "eventId");
    const maxOptions = optionalPositiveInteger(input, "maxOptions") ?? 3;
    if (maxOptions > 5) throw new ToolInputError("maxOptions cannot exceed 5.");
    const engine = await this.engineFor(eventId);
    const state = engine.snapshot();
    const proposalState = clone(state);
    if (input.guestCount !== undefined) proposalState.event.guestCount = requirePositiveInteger(input, "guestCount");
    if (input.additionalConstraints !== undefined) {
      const additions = parseConstraints(input.additionalConstraints, "additionalConstraints");
      const byId = new Map(proposalState.event.constraints.map((constraint) => [constraint.id, constraint]));
      for (const constraint of additions) byId.set(constraint.id, constraint);
      proposalState.event.constraints = [...byId.values()];
    }
    const menus = await this.dependencies.menuProposals.proposeMenus(proposalState, maxOptions);
    if (menus.length === 0) throw new DomainError("No compatible menu proposal is currently available.", "NO_COMPATIBLE_MENU");
    const cache = new Map<string, Menu>();
    for (const menu of menus.slice(0, maxOptions)) {
      validateMenu(menu);
      assertMenuSatisfiesConstraints(menu, proposalState.event.constraints);
      assertMenuServesGuestCount(menu, proposalState.event.guestCount);
      if (cache.has(menu.id)) throw new DomainError(`Menu proposal id ${menu.id} is duplicated.`, "DUPLICATE_MENU_PROPOSAL");
      cache.set(menu.id, clone(menu));
    }
    this.proposals.set(eventId, cache);
    return this.success("propose_menu", { menus: [...cache.values()].map(clone), eventRevision: state.event.revision }, false, state);
  }

  private async commitMenu(inputValue: unknown): Promise<HostToolResult> {
    const input = asObject(inputValue, "commit_menu");
    assertOnlyFields(input, ["eventId", "expectedRevision", "menuId", "confirmedAt"], "commit_menu");
    const eventId = requireString(input, "eventId");
    const expectedRevision = requirePositiveInteger(input, "expectedRevision");
    const menuId = requireString(input, "menuId");
    const confirmedAt = requireDateString(input, "confirmedAt");
    const engine = await this.engineFor(eventId);
    const before = engine.snapshot();
    const menu = this.proposedMenu(eventId, menuId, before);
    const state = engine.commitMenu(menu, expectedRevision, confirmedAt);
    await this.checkpointOrRollback(eventId, engine, before);
    return this.success("commit_menu", statusView(state, engine.getNextAction()), true, state);
  }

  private async recordInventory(inputValue: unknown): Promise<HostToolResult> {
    const input = asObject(inputValue, "record_inventory");
    assertOnlyFields(input, ["eventId", "expectedRevision", "items"], "record_inventory");
    const eventId = requireString(input, "eventId");
    const engine = await this.engineFor(eventId);
    const before = engine.snapshot();
    const state = engine.recordInventory(parseInventory(input.items), requirePositiveInteger(input, "expectedRevision"));
    await this.checkpointOrRollback(eventId, engine, before);
    return this.success("record_inventory", statusView(state, engine.getNextAction()), true, state);
  }

  private async buildShoppingPlan(inputValue: unknown): Promise<HostToolResult> {
    const input = asObject(inputValue, "build_shopping_plan");
    assertOnlyFields(input, ["eventId", "expectedRevision"], "build_shopping_plan");
    const eventId = requireString(input, "eventId");
    const engine = await this.engineFor(eventId);
    const before = engine.snapshot();
    const state = engine.calculateShoppingPlan(requirePositiveInteger(input, "expectedRevision"));
    await this.checkpointOrRollback(eventId, engine, before);
    return this.success("build_shopping_plan", { shopping: clone(state.shopping) }, true, state);
  }

  private async prepareCart(inputValue: unknown): Promise<HostToolResult> {
    const input = asObject(inputValue, "prepare_cart");
    assertOnlyFields(input, ["eventId", "expectedRevision"], "prepare_cart");
    const eventId = requireString(input, "eventId");
    const expectedRevision = requirePositiveInteger(input, "expectedRevision");
    const engine = await this.engineFor(eventId);
    const before = engine.snapshot();
    const unresolved = before.shopping.filter((item) => item.toBuyQuantity > 0 && item.status !== "simulated_purchased");
    const candidatesByItem: Record<string, Awaited<ReturnType<ToolRuntimeDependencies["productCatalogue"]["getCandidates"]>>> = {};
    const selectedProductIds: Record<string, string> = {};
    for (const item of unresolved) {
      const candidates = await this.dependencies.productCatalogue.getCandidates({
        eventId,
        itemId: item.itemId,
        name: item.name,
        quantity: item.toBuyQuantity,
        unit: item.unit,
        currency: before.event.currency,
      });
      candidatesByItem[item.itemId] = clone(candidates);
      const selected = [...candidates].sort((a, b) => a.price - b.price || a.id.localeCompare(b.id))[0];
      if (!selected) throw new DomainError(`No product candidates returned for ${item.itemId}.`, "PRODUCT_CANDIDATES_REQUIRED");
      selectedProductIds[item.itemId] = selected.id;
    }
    const state = engine.prepareCart(candidatesByItem, selectedProductIds, expectedRevision);
    await this.checkpointOrRollback(eventId, engine, before);
    return this.success("prepare_cart", { shopping: clone(state.shopping) }, true, state);
  }

  private async persistCartFailure(params: {
    eventId: string;
    expectedRevision: number;
    confirmedAt: string;
    inputValue: unknown;
    engine: HostDomainEngine;
    before: HostState;
    errorCode: string;
    message: string;
    retryable: boolean;
  }): Promise<HostToolFailure> {
    const failedState = params.engine.recordFailedAction({
      actionType: "confirm_cart_action",
      expectedRevision: params.expectedRevision,
      errorCode: params.errorCode,
      summary: `Simulated checkout failed: ${params.message}`,
      confirmationRequired: true,
      confirmedAt: params.confirmedAt,
      actor: "system",
    });
    await this.checkpointOrRollback(params.eventId, params.engine, params.before);
    const lastReceipt = failedState.receipts.at(-1);
    return this.failure(
      "confirm_cart_action",
      new ToolRuntimeError(params.message, params.errorCode, params.retryable),
      params.inputValue,
      true,
      failedState,
      { receipt: lastReceipt ? clone(lastReceipt) : undefined },
    );
  }

  private async confirmCartAction(inputValue: unknown): Promise<HostToolResult> {
    const input = asObject(inputValue, "confirm_cart_action");
    assertOnlyFields(input, ["eventId", "expectedRevision", "confirmedAt"], "confirm_cart_action");
    const eventId = requireString(input, "eventId");
    const expectedRevision = requirePositiveInteger(input, "expectedRevision");
    const confirmedAt = requireDateString(input, "confirmedAt");
    const engine = await this.engineFor(eventId);
    const before = engine.snapshot();
    if (before.event.revision !== expectedRevision) throw new StaleRevisionError(expectedRevision, before.event.revision);
    const lines: SimulatedCartLine[] = before.shopping
      .filter((item) => item.toBuyQuantity > 0 && item.status === "selected" && item.selectedProductId)
      .map((item) => {
        const selected = item.candidateProducts.find((candidate) => candidate.id === item.selectedProductId);
        if (!selected) throw new DomainError(`Selected product for ${item.itemId} is missing.`, "CART_NOT_READY");
        return {
          itemId: item.itemId,
          productId: selected.id,
          productName: selected.name,
          quantityNeeded: item.toBuyQuantity,
          unit: item.unit,
          linePrice: selected.price,
          currency: selected.currency,
        };
      });
    const unresolvedCount = before.shopping.filter((item) => item.toBuyQuantity > 0 && item.status !== "simulated_purchased").length;
    if (lines.length === 0 || lines.length !== unresolvedCount) throw new DomainError("Cart is not fully prepared for checkout.", "CART_NOT_READY");
    const idempotencyKey = await sha256Hex(JSON.stringify({ eventId, revision: expectedRevision, lines }));
    let checkout;
    try {
      checkout = await this.dependencies.cartActions.checkout({
        eventId,
        revision: expectedRevision,
        idempotencyKey,
        lines,
        currency: before.event.currency,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return this.persistCartFailure({
        eventId, expectedRevision, confirmedAt, inputValue, engine, before,
        errorCode: "SIMULATED_CHECKOUT_ADAPTER_ERROR",
        message: `checkout adapter error: ${message}`,
        retryable: true,
      });
    }

    if (!checkout.ok) {
      return this.persistCartFailure({
        eventId, expectedRevision, confirmedAt, inputValue, engine, before,
        errorCode: checkout.errorCode,
        message: checkout.message,
        retryable: true,
      });
    }
    const expectedTotal = Math.round(lines.reduce((sum, line) => sum + line.linePrice, 0) * 100) / 100;
    let invalidResultMessage: string | undefined;
    if (checkout.currency !== before.event.currency) invalidResultMessage = "checkout adapter returned an unexpected currency";
    else if (!checkout.reference.trim()) invalidResultMessage = "checkout adapter returned an empty checkout reference";
    else if (!Number.isFinite(checkout.total) || checkout.total < 0 || Math.abs(checkout.total - expectedTotal) > 0.001) {
      invalidResultMessage = `checkout adapter total ${String(checkout.total)} does not match selected-line total ${expectedTotal.toFixed(2)}`;
    }
    if (invalidResultMessage) {
      return this.persistCartFailure({
        eventId, expectedRevision, confirmedAt, inputValue, engine, before,
        errorCode: "CART_RESULT_INVALID",
        message: invalidResultMessage,
        retryable: false,
      });
    }
    const state = engine.confirmSimulatedCartAction({
      expectedRevision,
      confirmedAt,
      externalReference: checkout.reference,
      total: checkout.total,
    });
    await this.checkpointOrRollback(eventId, engine, before);
    return this.success("confirm_cart_action", { reference: checkout.reference, total: checkout.total, currency: checkout.currency, shopping: clone(state.shopping) }, true, state);
  }

  private async buildPreparationPlan(inputValue: unknown): Promise<HostToolResult> {
    const input = asObject(inputValue, "build_preparation_plan");
    assertOnlyFields(input, ["eventId", "expectedRevision"], "build_preparation_plan");
    const eventId = requireString(input, "eventId");
    const engine = await this.engineFor(eventId);
    const before = engine.snapshot();
    const state = engine.buildPreparationPlan(requirePositiveInteger(input, "expectedRevision"));
    await this.checkpointOrRollback(eventId, engine, before);
    return this.success("build_preparation_plan", { tasks: clone(state.tasks) }, true, state);
  }

  private async markTaskComplete(inputValue: unknown): Promise<HostToolResult> {
    const input = asObject(inputValue, "mark_task_complete");
    assertOnlyFields(input, ["eventId", "expectedRevision", "taskId", "completedAt"], "mark_task_complete");
    const eventId = requireString(input, "eventId");
    const engine = await this.engineFor(eventId);
    const before = engine.snapshot();
    const expectedRevision = requirePositiveInteger(input, "expectedRevision");
    const taskId = requireString(input, "taskId");
    const completedAt = optionalDateString(input, "completedAt");
    const state = completedAt
      ? engine.markTaskComplete(taskId, expectedRevision, completedAt)
      : engine.markTaskComplete(taskId, expectedRevision);
    await this.checkpointOrRollback(eventId, engine, before);
    return this.success("mark_task_complete", statusView(state, engine.getNextAction()), true, state);
  }

  private async advanceEventStatus(inputValue: unknown): Promise<HostToolResult> {
    const input = asObject(inputValue, "advance_event_status");
    assertOnlyFields(input, ["eventId", "expectedRevision", "nextStatus", "confirmedAt"], "advance_event_status");
    const eventId = requireString(input, "eventId");
    const engine = await this.engineFor(eventId);
    const before = engine.snapshot();
    const state = engine.advanceEventStatus(
      parseEventStatus(input.nextStatus),
      requirePositiveInteger(input, "expectedRevision"),
      requireDateString(input, "confirmedAt"),
    );
    await this.checkpointOrRollback(eventId, engine, before);
    return this.success("advance_event_status", statusView(state, engine.getNextAction()), true, state);
  }

  private async getNextAction(inputValue: unknown): Promise<HostToolResult> {
    const input = asObject(inputValue, "get_next_action");
    assertOnlyFields(input, ["eventId"], "get_next_action");
    const eventId = requireString(input, "eventId");
    const engine = await this.engineFor(eventId);
    const state = engine.snapshot();
    return this.success("get_next_action", { nextAction: engine.getNextAction() ?? null }, false, state);
  }

  private async getEventStatus(inputValue: unknown): Promise<HostToolResult<EventStatusView>> {
    const input = asObject(inputValue, "get_event_status");
    assertOnlyFields(input, ["eventId"], "get_event_status");
    const eventId = requireString(input, "eventId");
    const engine = await this.engineFor(eventId);
    const state = engine.snapshot();
    return this.success("get_event_status", statusView(state, engine.getNextAction()), false, state);
  }

  private async analyseChangeImpact(inputValue: unknown): Promise<HostToolResult<ChangeImpactView>> {
    const input = asObject(inputValue, "analyse_change_impact");
    assertOnlyFields(input, ["eventId", "expectedRevision", "guestCount", "addConstraints", "replacementMenuId"], "analyse_change_impact");
    const eventId = requireString(input, "eventId");
    const expectedRevision = requirePositiveInteger(input, "expectedRevision");
    const engine = await this.engineFor(eventId);
    const state = engine.snapshot();
    const request: ChangeRequest = {};
    if (input.guestCount !== undefined) request.guestCount = requirePositiveInteger(input, "guestCount");
    if (input.addConstraints !== undefined) request.addConstraints = parseConstraints(input.addConstraints, "addConstraints");
    const replacementMenuId = optionalString(input, "replacementMenuId");
    if (replacementMenuId) request.replacementMenu = this.proposedMenu(eventId, replacementMenuId, state);
    if (Object.keys(request).length === 0) throw new ToolInputError("analyse_change_impact requires at least one proposed change.");
    const impact = engine.analyseChangeImpact(request, expectedRevision);
    const cache = this.pendingImpacts.get(eventId) ?? new Map<string, ChangeImpact>();
    cache.set(impact.id, clone(impact));
    this.pendingImpacts.set(eventId, cache);
    return this.success("analyse_change_impact", { impact: clone(impact) }, false, state);
  }

  private async applyConfirmedChange(inputValue: unknown): Promise<HostToolResult> {
    const input = asObject(inputValue, "apply_confirmed_change");
    assertOnlyFields(input, ["eventId", "expectedRevision", "impactId", "confirmedAt"], "apply_confirmed_change");
    const eventId = requireString(input, "eventId");
    const expectedRevision = requirePositiveInteger(input, "expectedRevision");
    const impactId = requireString(input, "impactId");
    const confirmedAt = requireDateString(input, "confirmedAt");
    const impact = this.pendingImpacts.get(eventId)?.get(impactId);
    if (!impact) throw new DomainError(`Impact ${impactId} is not pending in this live session.`, "UNKNOWN_CHANGE_IMPACT");
    if (impact.baseRevision !== expectedRevision) throw new StaleRevisionError(expectedRevision, impact.baseRevision);
    const engine = await this.engineFor(eventId);
    const before = engine.snapshot();
    const state = engine.applyConfirmedChange(impact, confirmedAt);
    await this.checkpointOrRollback(eventId, engine, before);
    this.pendingImpacts.get(eventId)?.delete(impactId);
    return this.success("apply_confirmed_change", statusView(state, engine.getNextAction()), true, state);
  }

  private async getActionHistory(inputValue: unknown): Promise<HostToolResult<ActionHistoryView>> {
    const input = asObject(inputValue, "get_action_history");
    assertOnlyFields(input, ["eventId", "limit"], "get_action_history");
    const eventId = requireString(input, "eventId");
    const limit = optionalPositiveInteger(input, "limit") ?? 20;
    if (limit > 100) throw new ToolInputError("limit cannot exceed 100.");
    const engine = await this.engineFor(eventId);
    const state = engine.snapshot();
    const reversibleReceiptIds = Object.values(state.undo)
      .filter((record) => !record.reversedAt && record.appliedRevision === state.event.revision)
      .map((record) => record.receiptId);
    return this.success(
      "get_action_history",
      {
        receipts: clone(state.receipts.slice(-limit)),
        audit: clone(state.audit.slice(-limit)),
        reversibleReceiptIds,
      },
      false,
      state,
    );
  }

  private async undoReversibleAction(inputValue: unknown): Promise<HostToolResult> {
    const input = asObject(inputValue, "undo_reversible_action");
    assertOnlyFields(input, ["eventId", "expectedRevision", "receiptId", "confirmedAt"], "undo_reversible_action");
    const eventId = requireString(input, "eventId");
    const engine = await this.engineFor(eventId);
    const before = engine.snapshot();
    const state = engine.undoReversibleAction(
      requireString(input, "receiptId"),
      requirePositiveInteger(input, "expectedRevision"),
      requireDateString(input, "confirmedAt"),
    );
    await this.checkpointOrRollback(eventId, engine, before);
    return this.success("undo_reversible_action", statusView(state, engine.getNextAction()), true, state);
  }
}
