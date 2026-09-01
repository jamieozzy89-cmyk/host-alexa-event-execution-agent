import type { ActionReceipt, AuditEvent, Menu, PreparationTask, ShoppingItem } from "../domain/types.js";
import type { ChangeImpactCard, EventSummaryCard, HistoryCard, MenuOptionsCard, PrepTimelineCard, ProductChoicesCard, ShoppingListCard } from "./types.js";

export function menuCard(menus: Menu[]): MenuOptionsCard {
  return {
    type: "menu_options",
    title: "Menu ideas",
    menus: menus.map((menu) => ({
      id: menu.id,
      name: menu.name,
      itemNames: menu.items.map((item) => item.name),
      prepMinutes: menu.items.reduce((sum, item) => sum + item.estimatedPrepMinutes + item.estimatedCookMinutes, 0),
    })),
  };
}

export function shoppingCard(items: ShoppingItem[]): ShoppingListCard {
  return {
    type: "shopping_list",
    title: "Shopping list",
    items: items.map((item) => ({
      itemId: item.itemId,
      name: item.name,
      requiredQuantity: item.requiredQuantity,
      onHandQuantity: item.onHandQuantity,
      toBuyQuantity: item.toBuyQuantity,
      unit: item.unit,
      status: item.status,
    })),
  };
}

export function productCard(items: ShoppingItem[]): ProductChoicesCard {
  return {
    type: "product_choices",
    title: "Demo product choices",
    items: items.filter((item) => item.toBuyQuantity > 0).map((item) => ({
      itemId: item.itemId,
      name: item.name,
      quantity: item.toBuyQuantity,
      unit: item.unit,
      ...(item.selectedProductId ? { selectedProductId: item.selectedProductId } : {}),
      candidates: item.candidateProducts.map((candidate) => ({ ...candidate })),
    })),
  };
}

export function prepCard(tasks: PreparationTask[]): PrepTimelineCard {
  return {
    type: "prep_timeline",
    title: "Preparation plan",
    tasks: [...tasks]
      .sort((a, b) => Date.parse(a.dueBy) - Date.parse(b.dueBy) || a.title.localeCompare(b.title))
      .map((task) => ({
        id: task.id,
        title: task.title,
        category: task.category,
        durationMinutes: task.durationMinutes,
        dueBy: task.dueBy,
        status: task.status,
        dependencies: [...task.dependencies],
      })),
  };
}

export function historyCard(receipts: ActionReceipt[], audit: AuditEvent[]): HistoryCard {
  return {
    type: "history",
    title: "Recent activity",
    receipts: receipts.map((receipt) => ({
      id: receipt.id,
      action: humanAction(receipt.actionType),
      status: receipt.status,
      summary: customerReceiptSummary(receipt),
      reversible: receipt.reversible,
    })),
    audit: audit.map((event) => ({
      id: event.id,
      action: humanAction(event.action),
      result: event.result,
      delta: event.result === "failed" ? `${humanAction(event.action)} did not complete.` : event.delta,
      beforeRevision: event.beforeRevision,
      afterRevision: event.afterRevision,
    })),
  };
}

export function eventSummaryCard(event: {
  name: string;
  startAt: string;
  guestCount: number;
  budget: number;
  currency: string;
  status: string;
  revision: number;
}): EventSummaryCard {
  return { type: "event_summary", title: event.name, ...event };
}

export function impactCard(impact: {
  id: string;
  baseRevision: number;
  delta: {
    guestCountChanged: boolean;
    constraintsAdded: string[];
    menuChanged: boolean;
    shoppingChangedItemIds: string[];
    addedTaskIds: string[];
    removedTaskIds: string[];
    preservedCompletedTaskIds: string[];
  };
}): ChangeImpactCard {
  return {
    type: "change_impact",
    title: "Proposed update",
    impactId: impact.id,
    baseRevision: impact.baseRevision,
    guestCountChanged: impact.delta.guestCountChanged,
    constraintsAdded: [...impact.delta.constraintsAdded],
    menuChanged: impact.delta.menuChanged,
    shoppingChangedCount: impact.delta.shoppingChangedItemIds.length,
    addedTaskCount: impact.delta.addedTaskIds.length,
    removedTaskCount: impact.delta.removedTaskIds.length,
    preservedCompletedTaskCount: impact.delta.preservedCompletedTaskIds.length,
  };
}

export function customerReceiptSummary(receipt: ActionReceipt): string {
  const action = humanAction(receipt.actionType);
  if (receipt.status === "failed") {
    if (receipt.actionType === "confirm_cart_action") return "Simulated checkout failed; nothing was marked as purchased.";
    return `${action} did not complete.`;
  }
  if (receipt.status === "reversed") return `${action} was reversed.`;
  if (receipt.status === "pending") return `${action} is waiting for confirmation.`;
  return `${action} completed.`;
}

export function humanAction(action: string): string {
  return action.replace(/^undo:/, "Undo ").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
