import { DomainError } from "./errors.js";
import type { InventoryItem, Menu, PreparationTask, ShoppingItem } from "./types.js";

interface AggregateRequirement {
  itemId: string;
  name: string;
  quantity: number;
  unit: string;
}

export function aggregateRequirements(menu: Menu): AggregateRequirement[] {
  const totals = new Map<string, AggregateRequirement>();
  for (const menuItem of menu.items) {
    for (const ingredient of menuItem.ingredients) {
      const existing = totals.get(ingredient.itemId);
      if (!existing) {
        totals.set(ingredient.itemId, { ...ingredient });
        continue;
      }
      if (existing.unit !== ingredient.unit) {
        throw new DomainError(`Cannot reconcile required units for ${ingredient.itemId}: ${existing.unit} vs ${ingredient.unit}.`, "UNIT_MISMATCH");
      }
      existing.quantity += ingredient.quantity;
    }
  }
  return [...totals.values()].sort((a, b) => a.itemId.localeCompare(b.itemId));
}

export function buildShoppingPlan(menu: Menu, inventory: Record<string, InventoryItem>): ShoppingItem[] {
  return aggregateRequirements(menu).map((required) => {
    const onHand = inventory[required.itemId];
    if (onHand && onHand.unit !== required.unit) {
      throw new DomainError(`Cannot reconcile inventory unit for ${required.itemId}: ${onHand.unit} vs ${required.unit}.`, "UNIT_MISMATCH");
    }
    const onHandQuantity = onHand?.quantity ?? 0;
    const toBuyQuantity = Math.max(required.quantity - onHandQuantity, 0);
    return {
      itemId: required.itemId,
      name: required.name,
      requiredQuantity: required.quantity,
      onHandQuantity,
      toBuyQuantity,
      unit: required.unit,
      status: toBuyQuantity === 0 ? "covered" : "needed",
      candidateProducts: [],
    };
  });
}

export function buildPreparationTasks(
  menu: Menu,
  eventStartAt: string,
  revision: number,
  previousTasks: Record<string, PreparationTask> = {},
): Record<string, PreparationTask> {
  const eventTime = Date.parse(eventStartAt);
  if (Number.isNaN(eventTime)) throw new DomainError("Event start time is invalid.", "INVALID_EVENT_TIME");

  const tasks: Record<string, PreparationTask> = {};
  const sourceIdsByTask = new Map<string, string[]>();
  for (const item of menu.items) {
    for (const template of item.taskTemplates) {
      const sourceIds = sourceIdsByTask.get(template.id) ?? [];
      sourceIds.push(item.id);
      sourceIdsByTask.set(template.id, sourceIds);
      tasks[template.id] = {
        id: template.id,
        title: template.title,
        category: template.category,
        durationMinutes: template.durationMinutes,
        dueBy: new Date(eventTime - template.dueOffsetMinutes * 60_000).toISOString(),
        dependencies: [...template.dependencies],
        status: template.dependencies.length === 0 ? "ready" : "blocked",
        sourceMenuItemIds: [],
        revision,
      };
    }
  }

  for (const [taskId, task] of Object.entries(tasks)) {
    task.sourceMenuItemIds = [...(sourceIdsByTask.get(taskId) ?? [])].sort();
    const previous = previousTasks[taskId];
    const unchanged = previous !== undefined
      && previous.title === task.title
      && previous.category === task.category
      && previous.durationMinutes === task.durationMinutes
      && previous.dueBy === task.dueBy
      && JSON.stringify([...previous.dependencies].sort()) === JSON.stringify([...task.dependencies].sort())
      && JSON.stringify([...previous.sourceMenuItemIds].sort()) === JSON.stringify(task.sourceMenuItemIds);
    if (unchanged && previous.status === "done") {
      task.status = "done";
      if (previous.completedAt) task.completedAt = previous.completedAt;
    }
  }

  refreshTaskReadiness(tasks);
  return tasks;
}

export function refreshTaskReadiness(tasks: Record<string, PreparationTask>): void {
  let changed = true;
  while (changed) {
    changed = false;
    for (const task of Object.values(tasks)) {
      if (task.status === "done" || task.status === "cancelled" || task.status === "in_progress") continue;
      const dependenciesDone = task.dependencies.every((dependencyId) => tasks[dependencyId]?.status === "done");
      const nextStatus = dependenciesDone ? "ready" : "blocked";
      if (task.status !== nextStatus) {
        task.status = nextStatus;
        changed = true;
      }
    }
  }
}
