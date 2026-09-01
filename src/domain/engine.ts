import { buildPreparationTasks, buildShoppingPlan, refreshTaskReadiness } from "./calculations.js";
import { DomainError, StaleRevisionError } from "./errors.js";
import type {
  ActionReceipt,
  AuditEvent,
  ChangeImpact,
  ChangeRequest,
  Constraint,
  EventCreateInput,
  EventRecord,
  EventStatus,
  HostState,
  InventoryItem,
  Menu,
  PreparationTask,
} from "./types.js";
import { validateHostState } from "./state-validation.js";
import { assertMenuSatisfiesConstraints, validateConstraint, validateEventCreateInput, validateMenu } from "./validation.js";

const ALLOWED_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  draft: ["planned", "cancelled"],
  planned: ["sourcing", "cancelled"],
  sourcing: ["preparing", "cancelled"],
  preparing: ["live", "cancelled"],
  live: ["complete", "cancelled"],
  complete: [],
  cancelled: [],
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

function nowIso(): string {
  return new Date().toISOString();
}

function revisionChecked(event: EventRecord, expectedRevision: number): void {
  if (event.revision !== expectedRevision) {
    throw new StaleRevisionError(expectedRevision, event.revision);
  }
}

export class HostDomainEngine {
  private state: HostState;
  private pendingImpacts: Map<string, ChangeImpact>;

  constructor(input: EventCreateInput, createdAt = nowIso()) {
    this.pendingImpacts = new Map<string, ChangeImpact>();
    validateEventCreateInput(input);
    const event: EventRecord = {
      id: input.id,
      name: input.name,
      startAt: input.startAt,
      timezone: input.timezone,
      status: "draft",
      guestCount: input.guestCount,
      budget: input.budget,
      currency: input.currency,
      constraints: clone(input.constraints ?? []),
      preferences: clone(input.preferences ?? []),
      createdAt,
      updatedAt: createdAt,
      revision: 1,
    };
    this.state = {
      event,
      menus: {},
      inventory: {},
      shopping: [],
      tasks: {},
      receipts: [],
      audit: [],
    };
    this.state.receipts.push({
      id: globalThis.crypto.randomUUID(),
      actionType: "create_event",
      requestedAt: createdAt,
      confirmationRequired: false,
      executedAt: createdAt,
      status: "succeeded",
      resultSummary: `Created event ${event.id} at revision 1.`,
      reversible: false,
    });
    this.state.audit.push({
      id: globalThis.crypto.randomUUID(),
      eventId: event.id,
      actor: "user",
      action: "create_event",
      beforeRevision: 0,
      afterRevision: 1,
      timestamp: createdAt,
      result: "succeeded",
      delta: `Created event for ${event.guestCount} guests.`,
    });
  }

  static restore(committedState: HostState): HostDomainEngine {
    validateHostState(committedState);
    const engine = Object.create(HostDomainEngine.prototype) as HostDomainEngine;
    engine.state = clone(committedState);
    engine.pendingImpacts = new Map<string, ChangeImpact>();
    return engine;
  }

  snapshot(): HostState {
    return clone(this.state);
  }

  private commitMutation(params: {
    actionType: string;
    expectedRevision: number;
    confirmationRequired?: boolean;
    confirmedAt?: string;
    reversible?: boolean;
    actor?: "user" | "agent" | "system";
    delta: string;
    mutate: (draft: HostState, nextRevision: number) => void;
  }): HostState {
    revisionChecked(this.state.event, params.expectedRevision);
    if (params.confirmationRequired && !params.confirmedAt) {
      throw new DomainError(`${params.actionType} requires explicit confirmation.`, "CONFIRMATION_REQUIRED");
    }

    const beforeRevision = this.state.event.revision;
    const draft = clone(this.state);
    const nextRevision = beforeRevision + 1;
    const executedAt = nowIso();

    params.mutate(draft, nextRevision);
    draft.event.revision = nextRevision;
    draft.event.updatedAt = executedAt;

    const receipt: ActionReceipt = {
      id: globalThis.crypto.randomUUID(),
      actionType: params.actionType,
      requestedAt: executedAt,
      confirmationRequired: params.confirmationRequired ?? false,
      ...(params.confirmedAt ? { confirmedAt: params.confirmedAt } : {}),
      executedAt,
      status: "succeeded",
      resultSummary: params.delta,
      reversible: params.reversible ?? true,
    };
    const audit: AuditEvent = {
      id: globalThis.crypto.randomUUID(),
      eventId: draft.event.id,
      actor: params.actor ?? "user",
      action: params.actionType,
      beforeRevision,
      afterRevision: nextRevision,
      timestamp: executedAt,
      result: "succeeded",
      delta: params.delta,
    };
    draft.receipts.push(receipt);
    draft.audit.push(audit);
    this.state = draft;
    return this.snapshot();
  }

  commitMenu(menu: Menu, expectedRevision: number, confirmedAt?: string): HostState {
    revisionChecked(this.state.event, expectedRevision);
    validateMenu(menu);
    assertMenuSatisfiesConstraints(menu, this.state.event.constraints);
    return this.commitMutation({
      actionType: "commit_menu",
      expectedRevision,
      confirmationRequired: true,
      ...(confirmedAt ? { confirmedAt } : {}),
      delta: `Committed menu ${menu.id}.`,
      mutate: (draft) => {
        draft.menus[menu.id] = clone(menu);
        draft.event.selectedMenuId = menu.id;
        if (draft.event.status === "draft") draft.event.status = "planned";
      },
    });
  }

  addConstraints(constraints: Constraint[], expectedRevision: number): HostState {
    revisionChecked(this.state.event, expectedRevision);
    for (const constraint of constraints) validateConstraint(constraint);
    const byId = new Map(this.state.event.constraints.map((constraint) => [constraint.id, constraint]));
    for (const constraint of constraints) byId.set(constraint.id, clone(constraint));
    const nextConstraints = [...byId.values()];
    const selectedMenuId = this.state.event.selectedMenuId;
    if (selectedMenuId) {
      const selectedMenu = this.state.menus[selectedMenuId];
      if (!selectedMenu) throw new DomainError("Committed menu is missing from state.", "MENU_NOT_FOUND");
      assertMenuSatisfiesConstraints(selectedMenu, nextConstraints);
    }
    return this.commitMutation({
      actionType: "update_event_constraints",
      expectedRevision,
      delta: `Added ${constraints.length} constraint(s).`,
      mutate: (draft) => {
        draft.event.constraints = clone(nextConstraints);
      },
    });
  }

  recordInventory(items: InventoryItem[], expectedRevision: number): HostState {
    revisionChecked(this.state.event, expectedRevision);
    for (const item of items) {
      if (!Number.isFinite(item.quantity) || item.quantity < 0) {
        throw new DomainError(`Inventory quantity for ${item.itemId} must be non-negative.`, "INVALID_INPUT");
      }
      if (!item.unit.trim()) throw new DomainError(`Inventory unit for ${item.itemId} is required.`, "INVALID_INPUT");
    }
    return this.commitMutation({
      actionType: "record_inventory",
      expectedRevision,
      delta: `Recorded ${items.length} inventory item(s).`,
      mutate: (draft) => {
        for (const item of items) draft.inventory[item.itemId] = clone(item);
      },
    });
  }

  calculateShoppingPlan(expectedRevision: number): HostState {
    revisionChecked(this.state.event, expectedRevision);
    const selected = this.state.event.selectedMenuId;
    if (!selected) throw new DomainError("A menu must be committed before shopping can be calculated.", "MENU_REQUIRED");
    const menu = this.state.menus[selected];
    if (!menu) throw new DomainError("Committed menu is missing from state.", "MENU_NOT_FOUND");
    const plan = buildShoppingPlan(menu, this.state.inventory);
    return this.commitMutation({
      actionType: "build_shopping_plan",
      expectedRevision,
      delta: `Calculated shopping plan with ${plan.filter((item) => item.toBuyQuantity > 0).length} item(s) to buy.`,
      mutate: (draft) => {
        draft.shopping = plan;
      },
    });
  }

  buildPreparationPlan(expectedRevision: number): HostState {
    revisionChecked(this.state.event, expectedRevision);
    const selected = this.state.event.selectedMenuId;
    if (!selected) throw new DomainError("A menu must be committed before preparation can be planned.", "MENU_REQUIRED");
    const menu = this.state.menus[selected];
    if (!menu) throw new DomainError("Committed menu is missing from state.", "MENU_NOT_FOUND");
    const tasks = buildPreparationTasks(menu, this.state.event.startAt, expectedRevision + 1, this.state.tasks);
    return this.commitMutation({
      actionType: "build_preparation_plan",
      expectedRevision,
      delta: `Built preparation graph with ${Object.keys(tasks).length} task(s).`,
      mutate: (draft) => {
        draft.tasks = tasks;
      },
    });
  }

  markTaskComplete(taskId: string, expectedRevision: number, completedAt = nowIso()): HostState {
    revisionChecked(this.state.event, expectedRevision);
    const current = this.state.tasks[taskId];
    if (!current) throw new DomainError(`Task ${taskId} does not exist.`, "TASK_NOT_FOUND");
    const incompleteDependencies = current.dependencies.filter((id) => this.state.tasks[id]?.status !== "done");
    if (incompleteDependencies.length > 0) {
      throw new DomainError(
        `Task ${taskId} is blocked by: ${incompleteDependencies.join(", ")}.`,
        "TASK_DEPENDENCY_BLOCKED",
      );
    }
    return this.commitMutation({
      actionType: "mark_task_complete",
      expectedRevision,
      delta: `Completed task ${taskId}.`,
      mutate: (draft, nextRevision) => {
        const task = draft.tasks[taskId];
        if (!task) throw new DomainError(`Task ${taskId} does not exist.`, "TASK_NOT_FOUND");
        task.status = "done";
        task.completedAt = completedAt;
        task.revision = nextRevision;
        refreshTaskReadiness(draft.tasks);
        for (const dependent of Object.values(draft.tasks)) {
          if (dependent.revision < nextRevision && dependent.status !== "done") dependent.revision = nextRevision;
        }
      },
    });
  }

  advanceEventStatus(nextStatus: EventStatus, expectedRevision: number, confirmedAt?: string): HostState {
    revisionChecked(this.state.event, expectedRevision);
    const currentStatus = this.state.event.status;
    if (!ALLOWED_TRANSITIONS[currentStatus].includes(nextStatus)) {
      throw new DomainError(`Invalid event transition: ${currentStatus} -> ${nextStatus}.`, "INVALID_STATE_TRANSITION");
    }
    const confirmationRequired = nextStatus === "cancelled";
    return this.commitMutation({
      actionType: "advance_event_status",
      expectedRevision,
      confirmationRequired,
      ...(confirmedAt ? { confirmedAt } : {}),
      delta: `Advanced event status ${currentStatus} -> ${nextStatus}.`,
      mutate: (draft) => {
        draft.event.status = nextStatus;
      },
    });
  }

  analyseChangeImpact(request: ChangeRequest, expectedRevision: number, analysedAt = nowIso()): ChangeImpact {
    revisionChecked(this.state.event, expectedRevision);
    if (request.guestCount !== undefined && (!Number.isFinite(request.guestCount) || request.guestCount <= 0)) {
      throw new DomainError("Change guestCount must be positive.", "INVALID_INPUT");
    }
    for (const constraint of request.addConstraints ?? []) validateConstraint(constraint);
    if (request.replacementMenu) validateMenu(request.replacementMenu);

    const proposed = clone(this.state);
    if (request.guestCount !== undefined) proposed.event.guestCount = request.guestCount;
    if (request.addConstraints) {
      const byId = new Map(proposed.event.constraints.map((constraint) => [constraint.id, constraint]));
      for (const constraint of request.addConstraints) byId.set(constraint.id, clone(constraint));
      proposed.event.constraints = [...byId.values()];
    }
    if (request.replacementMenu) {
      proposed.menus[request.replacementMenu.id] = clone(request.replacementMenu);
      proposed.event.selectedMenuId = request.replacementMenu.id;
    }

    const selected = proposed.event.selectedMenuId;
    if (!selected) throw new DomainError("A committed menu is required for impact analysis.", "MENU_REQUIRED");
    const selectedMenu = proposed.menus[selected];
    if (!selectedMenu) throw new DomainError("Selected menu is missing.", "MENU_NOT_FOUND");
    assertMenuSatisfiesConstraints(selectedMenu, proposed.event.constraints);

    proposed.shopping = buildShoppingPlan(selectedMenu, proposed.inventory);
    proposed.tasks = buildPreparationTasks(selectedMenu, proposed.event.startAt, expectedRevision + 1, this.state.tasks);

    const oldShopping = new Map(this.state.shopping.map((item) => [item.itemId, item]));
    const newShopping = new Map(proposed.shopping.map((item) => [item.itemId, item]));
    const shoppingIds = new Set([...oldShopping.keys(), ...newShopping.keys()]);
    const shoppingChangedItemIds = [...shoppingIds].filter((id) => {
      const before = oldShopping.get(id);
      const after = newShopping.get(id);
      return JSON.stringify(before ?? null) !== JSON.stringify(after ?? null);
    });

    const oldTaskIds = new Set(Object.keys(this.state.tasks));
    const newTaskIds = new Set(Object.keys(proposed.tasks));
    const addedTaskIds = [...newTaskIds].filter((id) => !oldTaskIds.has(id));
    const removedTaskIds = [...oldTaskIds].filter((id) => !newTaskIds.has(id));
    const preservedCompletedTaskIds = [...newTaskIds].filter(
      (id) => this.state.tasks[id]?.status === "done" && proposed.tasks[id]?.status === "done",
    );

    const impact: ChangeImpact = {
      id: globalThis.crypto.randomUUID(),
      baseRevision: expectedRevision,
      request: clone(request),
      proposedEvent: clone(proposed.event),
      proposedMenus: clone(proposed.menus),
      proposedShopping: clone(proposed.shopping),
      proposedTasks: clone(proposed.tasks),
      delta: {
        guestCountChanged: request.guestCount !== undefined && request.guestCount !== this.state.event.guestCount,
        constraintsAdded: (request.addConstraints ?? []).map((constraint) => constraint.id),
        menuChanged: request.replacementMenu !== undefined && request.replacementMenu.id !== this.state.event.selectedMenuId,
        shoppingChangedItemIds,
        addedTaskIds,
        removedTaskIds,
        preservedCompletedTaskIds,
      },
      requiresConfirmation: true,
      analysedAt,
    };
    this.pendingImpacts.set(impact.id, clone(impact));
    return clone(impact);
  }

  applyConfirmedChange(impact: ChangeImpact, confirmedAt?: string): HostState {
    const storedImpact = this.pendingImpacts.get(impact.id);
    if (!storedImpact) {
      throw new DomainError(`Change impact ${impact.id} was not produced by this engine or is no longer pending.`, "UNKNOWN_CHANGE_IMPACT");
    }
    revisionChecked(this.state.event, storedImpact.baseRevision);
    if (!confirmedAt) {
      throw new DomainError("Applying a material change requires explicit confirmation.", "CONFIRMATION_REQUIRED");
    }
    const nextState = this.commitMutation({
      actionType: "apply_confirmed_change",
      expectedRevision: storedImpact.baseRevision,
      confirmationRequired: true,
      confirmedAt,
      delta: `Applied change ${storedImpact.id}: ${storedImpact.delta.shoppingChangedItemIds.length} shopping item(s) and ${storedImpact.delta.addedTaskIds.length + storedImpact.delta.removedTaskIds.length} task membership change(s).`,
      mutate: (draft, nextRevision) => {
        draft.event = clone(storedImpact.proposedEvent);
        draft.event.revision = nextRevision;
        draft.menus = clone(storedImpact.proposedMenus);
        draft.shopping = clone(storedImpact.proposedShopping);
        draft.tasks = clone(storedImpact.proposedTasks);
        for (const task of Object.values(draft.tasks)) task.revision = nextRevision;
      },
    });
    this.pendingImpacts.delete(storedImpact.id);
    return nextState;
  }

  getNextAction(): PreparationTask | undefined {
    return Object.values(this.state.tasks)
      .filter((task) => task.status === "ready")
      .sort((a, b) => Date.parse(a.dueBy) - Date.parse(b.dueBy))[0];
  }
}
