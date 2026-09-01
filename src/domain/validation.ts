import { DomainError } from "./errors.js";
import type { Constraint, EventCreateInput, IngredientRequirement, Menu, PreparationTaskTemplate } from "./types.js";

function assertNonEmpty(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new DomainError(`${field} must not be empty.`, "INVALID_INPUT");
  }
}

function assertPositive(value: number, field: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new DomainError(`${field} must be a positive finite number.`, "INVALID_INPUT");
  }
}

function assertNonNegative(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new DomainError(`${field} must be a non-negative finite number.`, "INVALID_INPUT");
  }
}

export function validateConstraint(constraint: Constraint): void {
  assertNonEmpty(constraint.id, "constraint.id");
  assertNonEmpty(constraint.value, "constraint.value");
  assertNonEmpty(constraint.scope, "constraint.scope");
}

export function validateEventCreateInput(input: EventCreateInput): void {
  assertNonEmpty(input.id, "event.id");
  assertNonEmpty(input.name, "event.name");
  assertNonEmpty(input.timezone, "event.timezone");
  assertNonEmpty(input.currency, "event.currency");
  assertPositive(input.guestCount, "event.guestCount");
  assertNonNegative(input.budget, "event.budget");
  if (Number.isNaN(Date.parse(input.startAt))) {
    throw new DomainError("event.startAt must be a valid date/time string.", "INVALID_INPUT");
  }
  for (const constraint of input.constraints ?? []) validateConstraint(constraint);
}

function validateIngredient(ingredient: IngredientRequirement): void {
  assertNonEmpty(ingredient.itemId, "ingredient.itemId");
  assertNonEmpty(ingredient.name, "ingredient.name");
  assertPositive(ingredient.quantity, `ingredient(${ingredient.itemId}).quantity`);
  assertNonEmpty(ingredient.unit, `ingredient(${ingredient.itemId}).unit`);
}

function validateTaskTemplate(template: PreparationTaskTemplate): void {
  assertNonEmpty(template.id, "taskTemplate.id");
  assertNonEmpty(template.title, "taskTemplate.title");
  assertNonEmpty(template.category, "taskTemplate.category");
  assertPositive(template.durationMinutes, `taskTemplate(${template.id}).durationMinutes`);
  assertNonNegative(template.dueOffsetMinutes, `taskTemplate(${template.id}).dueOffsetMinutes`);
}

export function validateMenu(menu: Menu): void {
  assertNonEmpty(menu.id, "menu.id");
  assertNonEmpty(menu.name, "menu.name");
  if (menu.items.length === 0) {
    throw new DomainError("menu.items must contain at least one item.", "INVALID_INPUT");
  }
  const taskIds = new Set<string>();
  for (const item of menu.items) {
    assertNonEmpty(item.id, "menuItem.id");
    assertNonEmpty(item.name, "menuItem.name");
    assertPositive(item.servings, `menuItem(${item.id}).servings`);
    for (const ingredient of item.ingredients) validateIngredient(ingredient);
    for (const template of item.taskTemplates) {
      validateTaskTemplate(template);
      if (taskIds.has(template.id)) {
        throw new DomainError(`Duplicate task template id: ${template.id}.`, "DUPLICATE_TASK_ID");
      }
      taskIds.add(template.id);
    }
  }
  for (const item of menu.items) {
    for (const template of item.taskTemplates) {
      for (const dependency of template.dependencies) {
        if (!taskIds.has(dependency)) {
          throw new DomainError(
            `Task ${template.id} depends on unknown task ${dependency}.`,
            "UNKNOWN_TASK_DEPENDENCY",
          );
        }
      }
    }
  }

  const dependencyMap = new Map<string, string[]>();
  for (const item of menu.items) {
    for (const template of item.taskTemplates) dependencyMap.set(template.id, template.dependencies);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (taskId: string): void => {
    if (visiting.has(taskId)) {
      throw new DomainError(`Preparation dependency cycle detected at ${taskId}.`, "TASK_DEPENDENCY_CYCLE");
    }
    if (visited.has(taskId)) return;
    visiting.add(taskId);
    for (const dependency of dependencyMap.get(taskId) ?? []) visit(dependency);
    visiting.delete(taskId);
    visited.add(taskId);
  };
  for (const taskId of taskIds) visit(taskId);
}

function normalizeTagValue(value: string): string {
  const token = value.toLowerCase().match(/[a-z]+/)?.[0] ?? value.toLowerCase();
  return token.endsWith("s") ? token.slice(0, -1) : token;
}

export function assertMenuSatisfiesConstraints(menu: Menu, constraints: Constraint[]): void {
  const confirmed = constraints.filter((constraint) => constraint.confirmed);
  for (const constraint of confirmed) {
    if (constraint.type === "allergen") {
      const allergen = normalizeTagValue(constraint.value);
      const requiredTag = `${allergen}-free`;
      const violating = menu.items.filter((item) => !item.constraintTags.map((tag) => tag.toLowerCase()).includes(requiredTag));
      if (violating.length > 0) {
        throw new DomainError(
          `Menu ${menu.id} does not satisfy allergen constraint ${constraint.id}; missing ${requiredTag} on: ${violating.map((item) => item.id).join(", ")}.`,
          "MENU_CONSTRAINT_CONFLICT",
        );
      }
    }

    if (constraint.type === "dietary") {
      const value = constraint.value.toLowerCase();
      if (value.includes("vegan")) {
        const hasSuitableItem = menu.items.some((item) => item.constraintTags.map((tag) => tag.toLowerCase()).includes("vegan"));
        if (!hasSuitableItem) {
          throw new DomainError(
            `Menu ${menu.id} does not provide a vegan-compatible item required by ${constraint.id}.`,
            "MENU_CONSTRAINT_CONFLICT",
          );
        }
      } else if (value.includes("vegetarian")) {
        const hasSuitableItem = menu.items.some((item) => {
          const tags = item.constraintTags.map((tag) => tag.toLowerCase());
          return tags.includes("vegetarian") || tags.includes("vegan");
        });
        if (!hasSuitableItem) {
          throw new DomainError(
            `Menu ${menu.id} does not provide a vegetarian-compatible item required by ${constraint.id}.`,
            "MENU_CONSTRAINT_CONFLICT",
          );
        }
      }
    }
  }
}
