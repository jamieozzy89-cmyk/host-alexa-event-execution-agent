import { buildShoppingPlan } from "./calculations.js";
import { DomainError } from "./errors.js";
import type {
  ActionReceipt,
  AuditEvent,
  Constraint,
  EventRecord,
  HostState,
  InventoryItem,
  Menu,
  PreparationTask,
  ShoppingItem,
  UndoRecord,
} from "./types.js";
import { assertMenuSatisfiesConstraints, assertMenuServesGuestCount, validateConstraint, validateMenu } from "./validation.js";

const EVENT_STATUSES = new Set(["draft", "planned", "sourcing", "preparing", "live", "complete", "cancelled"]);
const CONSTRAINT_TYPES = new Set(["dietary", "allergen", "budget", "prep_time", "equipment"]);
const CONSTRAINT_SOURCES = new Set(["user", "agent", "system"]);
const INVENTORY_SOURCES = new Set(["user", "system"]);
const SHOPPING_STATUSES = new Set(["needed", "covered", "selected", "simulated_purchased"]);
const TASK_STATUSES = new Set(["blocked", "ready", "in_progress", "done", "cancelled"]);
const RECEIPT_STATUSES = new Set(["pending", "succeeded", "failed", "reversed"]);
const AUDIT_ACTORS = new Set(["user", "agent", "system"]);
const AUDIT_RESULTS = new Set(["succeeded", "failed"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertString(value: unknown, field: string, allowEmpty = false): asserts value is string {
  if (typeof value !== "string" || (!allowEmpty && value.trim().length === 0)) {
    throw new DomainError(`${field} must be a${allowEmpty ? "" : " non-empty"} string.`, "INVALID_PERSISTED_STATE");
  }
}

function assertBoolean(value: unknown, field: string): asserts value is boolean {
  if (typeof value !== "boolean") {
    throw new DomainError(`${field} must be a boolean.`, "INVALID_PERSISTED_STATE");
  }
}

function assertFiniteNumber(value: unknown, field: string, minimum?: number): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value) || (minimum !== undefined && value < minimum)) {
    throw new DomainError(`${field} must be a finite number${minimum !== undefined ? ` >= ${minimum}` : ""}.`, "INVALID_PERSISTED_STATE");
  }
}

function assertPositiveInteger(value: unknown, field: string): asserts value is number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new DomainError(`${field} must be a positive integer.`, "INVALID_PERSISTED_STATE");
  }
}

function assertDate(value: unknown, field: string): asserts value is string {
  assertString(value, field);
  if (Number.isNaN(Date.parse(value))) {
    throw new DomainError(`${field} must be a valid date/time string.`, "INVALID_PERSISTED_STATE");
  }
}

function assertStringArray(value: unknown, field: string): asserts value is string[] {
  if (!Array.isArray(value)) throw new DomainError(`${field} must be an array.`, "INVALID_PERSISTED_STATE");
  for (let index = 0; index < value.length; index += 1) assertString(value[index], `${field}[${index}]`);
}

function validatePersistedConstraint(value: unknown, field: string): asserts value is Constraint {
  if (!isRecord(value)) throw new DomainError(`${field} must be an object.`, "INVALID_PERSISTED_STATE");
  assertString(value.id, `${field}.id`);
  assertString(value.type, `${field}.type`);
  assertString(value.value, `${field}.value`);
  assertString(value.scope, `${field}.scope`);
  assertString(value.source, `${field}.source`);
  assertBoolean(value.confirmed, `${field}.confirmed`);
  if (!CONSTRAINT_TYPES.has(value.type)) throw new DomainError(`${field}.type is invalid.`, "INVALID_PERSISTED_STATE");
  if (!CONSTRAINT_SOURCES.has(value.source)) throw new DomainError(`${field}.source is invalid.`, "INVALID_PERSISTED_STATE");
  validateConstraint(value as unknown as Constraint);
}

function validatePersistedEvent(value: unknown): asserts value is EventRecord {
  if (!isRecord(value)) throw new DomainError("state.event must be an object.", "INVALID_PERSISTED_STATE");
  assertString(value.id, "state.event.id");
  assertString(value.name, "state.event.name");
  assertDate(value.startAt, "state.event.startAt");
  assertString(value.timezone, "state.event.timezone");
  assertString(value.status, "state.event.status");
  if (!EVENT_STATUSES.has(value.status)) throw new DomainError("state.event.status is invalid.", "INVALID_PERSISTED_STATE");
  assertFiniteNumber(value.guestCount, "state.event.guestCount", Number.MIN_VALUE);
  if (value.guestCount <= 0) throw new DomainError("state.event.guestCount must be positive.", "INVALID_PERSISTED_STATE");
  assertFiniteNumber(value.budget, "state.event.budget", 0);
  assertString(value.currency, "state.event.currency");
  if (!Array.isArray(value.constraints)) throw new DomainError("state.event.constraints must be an array.", "INVALID_PERSISTED_STATE");
  value.constraints.forEach((constraint, index) => validatePersistedConstraint(constraint, `state.event.constraints[${index}]`));
  assertStringArray(value.preferences, "state.event.preferences");
  if (value.selectedMenuId !== undefined) assertString(value.selectedMenuId, "state.event.selectedMenuId");
  assertDate(value.createdAt, "state.event.createdAt");
  assertDate(value.updatedAt, "state.event.updatedAt");
  assertPositiveInteger(value.revision, "state.event.revision");
  if (Date.parse(value.updatedAt) < Date.parse(value.createdAt)) {
    throw new DomainError("state.event.updatedAt cannot precede createdAt.", "INVALID_PERSISTED_STATE");
  }
}

function validatePersistedMenu(value: unknown, key: string): asserts value is Menu {
  if (!isRecord(value)) throw new DomainError(`state.menus.${key} must be an object.`, "INVALID_PERSISTED_STATE");
  assertString(value.id, `state.menus.${key}.id`);
  assertString(value.name, `state.menus.${key}.name`);
  if (value.id !== key) throw new DomainError(`Menu map key ${key} does not match menu id ${value.id}.`, "INVALID_PERSISTED_STATE");
  if (!Array.isArray(value.items)) throw new DomainError(`state.menus.${key}.items must be an array.`, "INVALID_PERSISTED_STATE");
  for (let itemIndex = 0; itemIndex < value.items.length; itemIndex += 1) {
    const item = value.items[itemIndex];
    if (!isRecord(item)) throw new DomainError(`state.menus.${key}.items[${itemIndex}] must be an object.`, "INVALID_PERSISTED_STATE");
    assertString(item.id, `state.menus.${key}.items[${itemIndex}].id`);
    assertString(item.name, `state.menus.${key}.items[${itemIndex}].name`);
    assertFiniteNumber(item.servings, `state.menus.${key}.items[${itemIndex}].servings`, Number.MIN_VALUE);
    assertFiniteNumber(item.estimatedPrepMinutes, `state.menus.${key}.items[${itemIndex}].estimatedPrepMinutes`, 0);
    assertFiniteNumber(item.estimatedCookMinutes, `state.menus.${key}.items[${itemIndex}].estimatedCookMinutes`, 0);
    assertStringArray(item.constraintTags, `state.menus.${key}.items[${itemIndex}].constraintTags`);
    if (!Array.isArray(item.ingredients)) throw new DomainError(`state.menus.${key}.items[${itemIndex}].ingredients must be an array.`, "INVALID_PERSISTED_STATE");
    for (let ingredientIndex = 0; ingredientIndex < item.ingredients.length; ingredientIndex += 1) {
      const ingredient = item.ingredients[ingredientIndex];
      if (!isRecord(ingredient)) throw new DomainError(`Ingredient ${ingredientIndex} must be an object.`, "INVALID_PERSISTED_STATE");
      assertString(ingredient.itemId, `ingredient[${ingredientIndex}].itemId`);
      assertString(ingredient.name, `ingredient[${ingredientIndex}].name`);
      assertFiniteNumber(ingredient.quantity, `ingredient[${ingredientIndex}].quantity`, Number.MIN_VALUE);
      assertString(ingredient.unit, `ingredient[${ingredientIndex}].unit`);
    }
    if (!Array.isArray(item.taskTemplates)) throw new DomainError(`state.menus.${key}.items[${itemIndex}].taskTemplates must be an array.`, "INVALID_PERSISTED_STATE");
    for (let taskIndex = 0; taskIndex < item.taskTemplates.length; taskIndex += 1) {
      const task = item.taskTemplates[taskIndex];
      if (!isRecord(task)) throw new DomainError(`Task template ${taskIndex} must be an object.`, "INVALID_PERSISTED_STATE");
      assertString(task.id, `taskTemplate[${taskIndex}].id`);
      assertString(task.title, `taskTemplate[${taskIndex}].title`);
      assertString(task.category, `taskTemplate[${taskIndex}].category`);
      assertFiniteNumber(task.durationMinutes, `taskTemplate[${taskIndex}].durationMinutes`, Number.MIN_VALUE);
      assertStringArray(task.dependencies, `taskTemplate[${taskIndex}].dependencies`);
      assertFiniteNumber(task.dueOffsetMinutes, `taskTemplate[${taskIndex}].dueOffsetMinutes`, 0);
    }
  }
  validateMenu(value as unknown as Menu);
}

function validatePersistedInventory(value: unknown, key: string): asserts value is InventoryItem {
  if (!isRecord(value)) throw new DomainError(`state.inventory.${key} must be an object.`, "INVALID_PERSISTED_STATE");
  assertString(value.itemId, `state.inventory.${key}.itemId`);
  if (value.itemId !== key) throw new DomainError(`Inventory map key ${key} does not match itemId ${value.itemId}.`, "INVALID_PERSISTED_STATE");
  assertString(value.name, `state.inventory.${key}.name`);
  assertFiniteNumber(value.quantity, `state.inventory.${key}.quantity`, 0);
  assertString(value.unit, `state.inventory.${key}.unit`);
  assertDate(value.confirmedAt, `state.inventory.${key}.confirmedAt`);
  assertString(value.source, `state.inventory.${key}.source`);
  if (!INVENTORY_SOURCES.has(value.source)) throw new DomainError(`state.inventory.${key}.source is invalid.`, "INVALID_PERSISTED_STATE");
}

function validatePersistedShopping(value: unknown, index: number, currency: string): asserts value is ShoppingItem {
  if (!isRecord(value)) throw new DomainError(`state.shopping[${index}] must be an object.`, "INVALID_PERSISTED_STATE");
  assertString(value.itemId, `state.shopping[${index}].itemId`);
  assertString(value.name, `state.shopping[${index}].name`);
  assertFiniteNumber(value.requiredQuantity, `state.shopping[${index}].requiredQuantity`, 0);
  assertFiniteNumber(value.onHandQuantity, `state.shopping[${index}].onHandQuantity`, 0);
  assertFiniteNumber(value.toBuyQuantity, `state.shopping[${index}].toBuyQuantity`, 0);
  assertString(value.unit, `state.shopping[${index}].unit`);
  assertString(value.status, `state.shopping[${index}].status`);
  if (!SHOPPING_STATUSES.has(value.status)) throw new DomainError(`state.shopping[${index}].status is invalid.`, "INVALID_PERSISTED_STATE");
  if (!Array.isArray(value.candidateProducts)) throw new DomainError(`state.shopping[${index}].candidateProducts must be an array.`, "INVALID_PERSISTED_STATE");
  for (let candidateIndex = 0; candidateIndex < value.candidateProducts.length; candidateIndex += 1) {
    const candidate = value.candidateProducts[candidateIndex];
    if (!isRecord(candidate)) throw new DomainError(`Candidate product ${candidateIndex} must be an object.`, "INVALID_PERSISTED_STATE");
    assertString(candidate.id, `candidateProducts[${candidateIndex}].id`);
    assertString(candidate.name, `candidateProducts[${candidateIndex}].name`);
    assertFiniteNumber(candidate.price, `candidateProducts[${candidateIndex}].price`, 0);
    assertString(candidate.currency, `candidateProducts[${candidateIndex}].currency`);
    if (candidate.currency !== currency) throw new DomainError(`candidateProducts[${candidateIndex}].currency does not match event currency.`, "INVALID_PERSISTED_STATE");
  }
  if (value.selectedProductId !== undefined) assertString(value.selectedProductId, `state.shopping[${index}].selectedProductId`);
  const candidateIds = new Set<string>();
  for (const candidate of value.candidateProducts as unknown as Array<{ id: string }>) {
    if (candidateIds.has(candidate.id)) throw new DomainError(`state.shopping[${index}] contains duplicate candidate ${candidate.id}.`, "INVALID_PERSISTED_STATE");
    candidateIds.add(candidate.id);
  }
  if ((value.status === "selected" || value.status === "simulated_purchased")) {
    if (typeof value.selectedProductId !== "string" || !candidateIds.has(value.selectedProductId)) {
      throw new DomainError(`state.shopping[${index}] requires a valid selected product for status ${value.status}.`, "INVALID_PERSISTED_STATE");
    }
    if (value.toBuyQuantity <= 0) throw new DomainError(`state.shopping[${index}] cannot be ${value.status} without a deficit.`, "INVALID_PERSISTED_STATE");
  }
  const expectedDeficit = Math.max(value.requiredQuantity - value.onHandQuantity, 0);
  if (value.toBuyQuantity !== expectedDeficit) {
    throw new DomainError(`state.shopping[${index}] violates shopping deficit invariant.`, "INVALID_PERSISTED_STATE");
  }
  if (value.status === "covered" && value.toBuyQuantity !== 0) {
    throw new DomainError(`state.shopping[${index}] is covered but still has a deficit.`, "INVALID_PERSISTED_STATE");
  }
  if (value.status === "needed" && value.toBuyQuantity === 0) {
    throw new DomainError(`state.shopping[${index}] is needed but has no deficit.`, "INVALID_PERSISTED_STATE");
  }
}

function validatePersistedTask(value: unknown, key: string, eventRevision: number): asserts value is PreparationTask {
  if (!isRecord(value)) throw new DomainError(`state.tasks.${key} must be an object.`, "INVALID_PERSISTED_STATE");
  assertString(value.id, `state.tasks.${key}.id`);
  if (value.id !== key) throw new DomainError(`Task map key ${key} does not match task id ${value.id}.`, "INVALID_PERSISTED_STATE");
  assertString(value.title, `state.tasks.${key}.title`);
  assertString(value.category, `state.tasks.${key}.category`);
  assertFiniteNumber(value.durationMinutes, `state.tasks.${key}.durationMinutes`, Number.MIN_VALUE);
  assertDate(value.dueBy, `state.tasks.${key}.dueBy`);
  assertStringArray(value.dependencies, `state.tasks.${key}.dependencies`);
  assertString(value.status, `state.tasks.${key}.status`);
  if (!TASK_STATUSES.has(value.status)) throw new DomainError(`state.tasks.${key}.status is invalid.`, "INVALID_PERSISTED_STATE");
  if (value.completedAt !== undefined) assertDate(value.completedAt, `state.tasks.${key}.completedAt`);
  assertStringArray(value.sourceMenuItemIds, `state.tasks.${key}.sourceMenuItemIds`);
  assertPositiveInteger(value.revision, `state.tasks.${key}.revision`);
  if (value.revision > eventRevision) throw new DomainError(`Task ${key} revision exceeds event revision.`, "INVALID_PERSISTED_STATE");
  if (value.status === "done" && value.completedAt === undefined) {
    throw new DomainError(`Done task ${key} must have completedAt.`, "INVALID_PERSISTED_STATE");
  }
  if (value.status !== "done" && value.completedAt !== undefined) {
    throw new DomainError(`Only done task ${key} may have completedAt.`, "INVALID_PERSISTED_STATE");
  }
}

function validatePersistedReceipt(value: unknown, index: number): asserts value is ActionReceipt {
  if (!isRecord(value)) throw new DomainError(`state.receipts[${index}] must be an object.`, "INVALID_PERSISTED_STATE");
  assertString(value.id, `state.receipts[${index}].id`);
  assertString(value.actionType, `state.receipts[${index}].actionType`);
  assertDate(value.requestedAt, `state.receipts[${index}].requestedAt`);
  assertBoolean(value.confirmationRequired, `state.receipts[${index}].confirmationRequired`);
  if (value.confirmedAt !== undefined) assertDate(value.confirmedAt, `state.receipts[${index}].confirmedAt`);
  if (value.executedAt !== undefined) assertDate(value.executedAt, `state.receipts[${index}].executedAt`);
  assertString(value.status, `state.receipts[${index}].status`);
  if (!RECEIPT_STATUSES.has(value.status)) throw new DomainError(`state.receipts[${index}].status is invalid.`, "INVALID_PERSISTED_STATE");
  assertString(value.resultSummary, `state.receipts[${index}].resultSummary`, true);
  if (value.errorCode !== undefined) assertString(value.errorCode, `state.receipts[${index}].errorCode`);
  assertBoolean(value.reversible, `state.receipts[${index}].reversible`);
  if (value.confirmationRequired && value.status === "succeeded" && value.confirmedAt === undefined) {
    throw new DomainError(`Succeeded confirmed action receipt ${value.id} is missing confirmedAt.`, "INVALID_PERSISTED_STATE");
  }
  if (value.status === "succeeded" && value.executedAt === undefined) {
    throw new DomainError(`Succeeded action receipt ${value.id} is missing executedAt.`, "INVALID_PERSISTED_STATE");
  }
}

function validateUndoSnapshot(value: unknown, field: string, currentEvent: EventRecord): void {
  if (!isRecord(value)) throw new DomainError(`${field}.snapshot must be an object.`, "INVALID_PERSISTED_STATE");
  const hasSurface = ["event", "menus", "inventory", "shopping", "tasks"].some((key) => value[key] !== undefined);
  if (!hasSurface) throw new DomainError(`${field}.snapshot must contain at least one restorable state surface.`, "INVALID_PERSISTED_STATE");

  let snapshotEvent = currentEvent;
  if (value.event !== undefined) {
    validatePersistedEvent(value.event);
    snapshotEvent = value.event as EventRecord;
    if (snapshotEvent.id !== currentEvent.id) throw new DomainError(`${field}.snapshot.event belongs to another event.`, "INVALID_PERSISTED_STATE");
    if (snapshotEvent.revision > currentEvent.revision) throw new DomainError(`${field}.snapshot.event revision exceeds current revision.`, "INVALID_PERSISTED_STATE");
  }
  if (value.menus !== undefined) {
    if (!isRecord(value.menus)) throw new DomainError(`${field}.snapshot.menus must be an object map.`, "INVALID_PERSISTED_STATE");
    for (const [key, menu] of Object.entries(value.menus)) validatePersistedMenu(menu, key);
  }
  if (value.inventory !== undefined) {
    if (!isRecord(value.inventory)) throw new DomainError(`${field}.snapshot.inventory must be an object map.`, "INVALID_PERSISTED_STATE");
    for (const [key, item] of Object.entries(value.inventory)) validatePersistedInventory(item, key);
  }
  if (value.shopping !== undefined) {
    if (!Array.isArray(value.shopping)) throw new DomainError(`${field}.snapshot.shopping must be an array.`, "INVALID_PERSISTED_STATE");
    value.shopping.forEach((item, index) => validatePersistedShopping(item, index, snapshotEvent.currency));
  }
  if (value.tasks !== undefined) {
    if (!isRecord(value.tasks)) throw new DomainError(`${field}.snapshot.tasks must be an object map.`, "INVALID_PERSISTED_STATE");
    for (const [key, task] of Object.entries(value.tasks)) validatePersistedTask(task, key, snapshotEvent.revision);
    validateTaskGraph(value.tasks as Record<string, PreparationTask>);
  }
}

function validatePersistedUndo(
  value: unknown,
  key: string,
  currentEvent: EventRecord,
  receipts: ActionReceipt[],
): asserts value is UndoRecord {
  if (!isRecord(value)) throw new DomainError(`state.undo.${key} must be an object.`, "INVALID_PERSISTED_STATE");
  assertString(value.receiptId, `state.undo.${key}.receiptId`);
  if (value.receiptId !== key) throw new DomainError(`Undo map key ${key} does not match receiptId ${value.receiptId}.`, "INVALID_PERSISTED_STATE");
  assertString(value.actionType, `state.undo.${key}.actionType`);
  assertPositiveInteger(value.appliedRevision, `state.undo.${key}.appliedRevision`);
  if (value.appliedRevision > currentEvent.revision) throw new DomainError(`Undo record ${key} revision exceeds current event revision.`, "INVALID_PERSISTED_STATE");
  assertDate(value.createdAt, `state.undo.${key}.createdAt`);
  if (value.reversedAt !== undefined) assertDate(value.reversedAt, `state.undo.${key}.reversedAt`);
  validateUndoSnapshot(value.snapshot, `state.undo.${key}`, currentEvent);

  const receipt = receipts.find((candidate) => candidate.id === key);
  if (!receipt) throw new DomainError(`Undo record ${key} has no matching receipt.`, "INVALID_PERSISTED_STATE");
  if (!receipt.reversible) throw new DomainError(`Undo record ${key} points to a non-reversible receipt.`, "INVALID_PERSISTED_STATE");
  if (receipt.actionType !== value.actionType) throw new DomainError(`Undo record ${key} action type does not match its receipt.`, "INVALID_PERSISTED_STATE");
  if (value.reversedAt !== undefined && receipt.status !== "reversed") {
    throw new DomainError(`Undo record ${key} is marked reversed but its receipt is not.`, "INVALID_PERSISTED_STATE");
  }
  if (receipt.status === "reversed" && value.reversedAt === undefined) {
    throw new DomainError(`Reversed receipt ${key} is missing undo reversal metadata.`, "INVALID_PERSISTED_STATE");
  }
  if (receipt.status !== "succeeded" && receipt.status !== "reversed") {
    throw new DomainError(`Undo record ${key} points to receipt status ${receipt.status}.`, "INVALID_PERSISTED_STATE");
  }
}

function validatePersistedAudit(value: unknown, index: number, eventId: string): asserts value is AuditEvent {
  if (!isRecord(value)) throw new DomainError(`state.audit[${index}] must be an object.`, "INVALID_PERSISTED_STATE");
  assertString(value.id, `state.audit[${index}].id`);
  assertString(value.eventId, `state.audit[${index}].eventId`);
  if (value.eventId !== eventId) throw new DomainError(`Audit event ${value.id} belongs to another event.`, "INVALID_PERSISTED_STATE");
  assertString(value.actor, `state.audit[${index}].actor`);
  if (!AUDIT_ACTORS.has(value.actor)) throw new DomainError(`state.audit[${index}].actor is invalid.`, "INVALID_PERSISTED_STATE");
  assertString(value.action, `state.audit[${index}].action`);
  if (typeof value.beforeRevision !== "number" || !Number.isInteger(value.beforeRevision) || value.beforeRevision < 0) {
    throw new DomainError(`state.audit[${index}].beforeRevision is invalid.`, "INVALID_PERSISTED_STATE");
  }
  if (typeof value.afterRevision !== "number" || !Number.isInteger(value.afterRevision) || value.afterRevision < 0) {
    throw new DomainError(`state.audit[${index}].afterRevision is invalid.`, "INVALID_PERSISTED_STATE");
  }
  assertDate(value.timestamp, `state.audit[${index}].timestamp`);
  assertString(value.result, `state.audit[${index}].result`);
  if (!AUDIT_RESULTS.has(value.result)) throw new DomainError(`state.audit[${index}].result is invalid.`, "INVALID_PERSISTED_STATE");
  assertString(value.delta, `state.audit[${index}].delta`, true);
  if (value.result === "succeeded" && value.afterRevision !== value.beforeRevision + 1) {
    throw new DomainError(`Succeeded audit event ${value.id} must advance revision by exactly one.`, "INVALID_PERSISTED_STATE");
  }
  if (value.result === "failed" && value.afterRevision !== value.beforeRevision) {
    throw new DomainError(`Failed audit event ${value.id} must not advance revision.`, "INVALID_PERSISTED_STATE");
  }
}

function assertUniqueIds(values: { id: string }[], field: string): void {
  const ids = new Set<string>();
  for (const value of values) {
    if (ids.has(value.id)) throw new DomainError(`${field} contains duplicate id ${value.id}.`, "INVALID_PERSISTED_STATE");
    ids.add(value.id);
  }
}

function validateTaskGraph(tasks: Record<string, PreparationTask>): void {
  for (const task of Object.values(tasks)) {
    for (const dependency of task.dependencies) {
      if (!tasks[dependency]) throw new DomainError(`Task ${task.id} depends on missing task ${dependency}.`, "INVALID_PERSISTED_STATE");
    }
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (taskId: string): void => {
    if (visiting.has(taskId)) throw new DomainError(`Persisted task dependency cycle detected at ${taskId}.`, "INVALID_PERSISTED_STATE");
    if (visited.has(taskId)) return;
    visiting.add(taskId);
    for (const dependency of tasks[taskId]?.dependencies ?? []) visit(dependency);
    visiting.delete(taskId);
    visited.add(taskId);
  };
  for (const taskId of Object.keys(tasks)) visit(taskId);

  for (const task of Object.values(tasks)) {
    const dependenciesDone = task.dependencies.every((dependency) => tasks[dependency]?.status === "done");
    if (task.status === "ready" && !dependenciesDone) {
      throw new DomainError(`Ready task ${task.id} has incomplete dependencies.`, "INVALID_PERSISTED_STATE");
    }
    if (task.status === "blocked" && dependenciesDone) {
      throw new DomainError(`Blocked task ${task.id} has no incomplete dependency.`, "INVALID_PERSISTED_STATE");
    }
    if (task.status === "done" && !dependenciesDone) {
      throw new DomainError(`Done task ${task.id} has incomplete dependencies.`, "INVALID_PERSISTED_STATE");
    }
  }
}

function validateAuditChain(audit: AuditEvent[], event: EventRecord): void {
  if (audit.length === 0) throw new DomainError("state.audit must contain the create_event record.", "INVALID_PERSISTED_STATE");
  const first = audit[0];
  if (!first || first.action !== "create_event" || first.beforeRevision !== 0 || first.afterRevision !== 1 || first.result !== "succeeded") {
    throw new DomainError("state.audit must begin with a successful create_event 0 -> 1 record.", "INVALID_PERSISTED_STATE");
  }
  let committedRevision = 0;
  for (const item of audit) {
    if (item.beforeRevision !== committedRevision) {
      throw new DomainError(`Audit event ${item.id} does not continue from revision ${committedRevision}.`, "INVALID_PERSISTED_STATE");
    }
    if (item.result === "succeeded") committedRevision = item.afterRevision;
  }
  if (committedRevision !== event.revision) {
    throw new DomainError(`Audit chain ends at revision ${committedRevision}, event is revision ${event.revision}.`, "INVALID_PERSISTED_STATE");
  }
}

function validateShoppingAgainstCommittedMenu(state: HostState): void {
  const selectedMenuId = state.event.selectedMenuId;
  if (!selectedMenuId) {
    if (state.shopping.length > 0 || Object.keys(state.tasks).length > 0) {
      throw new DomainError("Shopping/tasks cannot exist without a committed menu.", "INVALID_PERSISTED_STATE");
    }
    return;
  }
  const menu = state.menus[selectedMenuId];
  if (!menu) throw new DomainError("Selected menu is missing from persisted menus.", "INVALID_PERSISTED_STATE");
  assertMenuSatisfiesConstraints(menu, state.event.constraints);
  assertMenuServesGuestCount(menu, state.event.guestCount);

  if (state.shopping.length > 0) {
    const expected = new Map(buildShoppingPlan(menu, state.inventory).map((item) => [item.itemId, item]));
    if (expected.size !== state.shopping.length) {
      throw new DomainError("Persisted shopping plan does not match committed menu requirements.", "INVALID_PERSISTED_STATE");
    }
    for (const actual of state.shopping) {
      const baseline = expected.get(actual.itemId);
      if (!baseline) throw new DomainError(`Unexpected persisted shopping item ${actual.itemId}.`, "INVALID_PERSISTED_STATE");
      if (
        baseline.requiredQuantity !== actual.requiredQuantity
        || baseline.onHandQuantity !== actual.onHandQuantity
        || baseline.toBuyQuantity !== actual.toBuyQuantity
        || baseline.unit !== actual.unit
      ) {
        throw new DomainError(`Persisted shopping quantities for ${actual.itemId} do not match committed state.`, "INVALID_PERSISTED_STATE");
      }
    }
  }
}

export function validateHostState(value: unknown): asserts value is HostState {
  if (!isRecord(value)) throw new DomainError("Persisted Host state must be an object.", "INVALID_PERSISTED_STATE");
  validatePersistedEvent(value.event);
  const event = value.event as unknown as EventRecord;

  if (!isRecord(value.menus)) throw new DomainError("state.menus must be an object map.", "INVALID_PERSISTED_STATE");
  for (const [key, menu] of Object.entries(value.menus)) validatePersistedMenu(menu, key);

  if (!isRecord(value.inventory)) throw new DomainError("state.inventory must be an object map.", "INVALID_PERSISTED_STATE");
  for (const [key, item] of Object.entries(value.inventory)) validatePersistedInventory(item, key);

  if (!Array.isArray(value.shopping)) throw new DomainError("state.shopping must be an array.", "INVALID_PERSISTED_STATE");
  value.shopping.forEach((item, index) => validatePersistedShopping(item, index, event.currency));
  const shoppingIds = new Set<string>();
  for (const item of value.shopping as unknown as ShoppingItem[]) {
    if (shoppingIds.has(item.itemId)) throw new DomainError(`Duplicate shopping item ${item.itemId}.`, "INVALID_PERSISTED_STATE");
    shoppingIds.add(item.itemId);
  }

  if (!isRecord(value.tasks)) throw new DomainError("state.tasks must be an object map.", "INVALID_PERSISTED_STATE");
  for (const [key, task] of Object.entries(value.tasks)) validatePersistedTask(task, key, event.revision);

  if (!Array.isArray(value.receipts)) throw new DomainError("state.receipts must be an array.", "INVALID_PERSISTED_STATE");
  value.receipts.forEach((receipt, index) => validatePersistedReceipt(receipt, index));
  assertUniqueIds(value.receipts as unknown as ActionReceipt[], "state.receipts");

  if (!isRecord(value.undo)) throw new DomainError("state.undo must be an object map.", "INVALID_PERSISTED_STATE");
  const receipts = value.receipts as unknown as ActionReceipt[];
  for (const [key, undo] of Object.entries(value.undo)) validatePersistedUndo(undo, key, event, receipts);

  if (!Array.isArray(value.audit)) throw new DomainError("state.audit must be an array.", "INVALID_PERSISTED_STATE");
  value.audit.forEach((audit, index) => validatePersistedAudit(audit, index, event.id));
  assertUniqueIds(value.audit as unknown as AuditEvent[], "state.audit");

  const state = value as unknown as HostState;
  validateTaskGraph(state.tasks);
  validateAuditChain(state.audit, state.event);
  validateShoppingAgainstCommittedMenu(state);
}
