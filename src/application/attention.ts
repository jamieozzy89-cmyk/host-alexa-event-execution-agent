import type { ActionReceipt } from "../domain/types.js";
import type { EventOperatingSource, InventoryCoverageSummary, PreparationSummary, ShoppingSummary } from "./event-operating-state.js";
import type { CustomerEventStage } from "./lifecycle.js";

export type AttentionKind =
  | "confirmation"
  | "failure"
  | "change_review"
  | "missing_input"
  | "menu"
  | "inventory"
  | "shopping"
  | "preparation"
  | "task"
  | "ready"
  | "none";

export interface PendingConfirmationAttention {
  title: string;
  detail: string;
  confirmationId?: string;
}

export interface BlockingFailureAttention {
  title: string;
  detail: string;
  receiptId?: string;
}

export interface PendingChangeAttention {
  title: string;
  detail: string;
  impactId?: string;
}

export interface MissingInputAttention {
  title: string;
  detail: string;
  field?: string;
}

export interface AttentionContext {
  pendingConfirmation?: PendingConfirmationAttention;
  blockingFailure?: BlockingFailureAttention;
  pendingChange?: PendingChangeAttention;
  missingInput?: MissingInputAttention;
  /**
   * Distinguishes "the customer confirmed that nothing is on hand" from
   * "inventory has not been discussed yet". An empty inventory map alone
   * cannot prove which of those states is true.
   */
  inventoryConfirmed?: boolean;
}

export interface AttentionItem {
  kind: AttentionKind;
  priority: number;
  title: string;
  detail: string;
  customerActionRequired: boolean;
  relatedId?: string;
}

function item(
  kind: AttentionKind,
  priority: number,
  title: string,
  detail: string,
  customerActionRequired: boolean,
  relatedId?: string,
): AttentionItem {
  return relatedId
    ? { kind, priority, title, detail, customerActionRequired, relatedId }
    : { kind, priority, title, detail, customerActionRequired };
}

function latestFailedReceipt(source: EventOperatingSource): ActionReceipt | undefined {
  const latest = source.recentReceipts.at(-1);
  return latest?.status === "failed" ? latest : undefined;
}

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return count === 1 ? singular : pluralForm;
}

export interface AttentionDerivationInput {
  source: EventOperatingSource | null;
  stage: CustomerEventStage;
  inventory: InventoryCoverageSummary;
  shopping: ShoppingSummary;
  preparation: PreparationSummary;
  context?: AttentionContext;
}

/**
 * Returns exactly one customer attention item. Priority is deterministic and
 * driven by committed/ephemeral controlled state rather than model prose.
 */
export function deriveAttention(input: AttentionDerivationInput): AttentionItem {
  const { source, stage, inventory, shopping, preparation } = input;
  const context = input.context ?? {};

  if (context.pendingConfirmation) {
    return item(
      "confirmation",
      1,
      context.pendingConfirmation.title,
      context.pendingConfirmation.detail,
      true,
      context.pendingConfirmation.confirmationId,
    );
  }

  if (context.blockingFailure) {
    return item(
      "failure",
      2,
      context.blockingFailure.title,
      context.blockingFailure.detail,
      true,
      context.blockingFailure.receiptId,
    );
  }

  if (source) {
    const failed = latestFailedReceipt(source);
    if (failed) {
      return item(
        "failure",
        2,
        "An action needs attention",
        failed.resultSummary || "The latest action failed and Host did not mark it as completed.",
        true,
        failed.id,
      );
    }
  }

  if (context.pendingChange) {
    return item(
      "change_review",
      3,
      context.pendingChange.title,
      context.pendingChange.detail,
      true,
      context.pendingChange.impactId,
    );
  }

  if (context.missingInput) {
    return item(
      "missing_input",
      4,
      context.missingInput.title,
      context.missingInput.detail,
      true,
      context.missingInput.field,
    );
  }

  if (!source) {
    return item(
      "missing_input",
      4,
      "Tell Host what you're planning",
      "Start with the event, when it is happening and who is coming. Host will ask only for material details that are still missing.",
      true,
    );
  }

  if (stage === "cancelled") {
    return item("none", 99, "Event cancelled", "There is no remaining execution work for this event.", false);
  }

  if (stage === "complete") {
    return item("none", 99, "Event complete", "The event is closed. Receipts remain available as the execution record.", false);
  }

  if (!source.selectedMenu) {
    return item(
      "menu",
      5,
      "Choose the menu",
      "Host needs a committed menu before shopping and preparation can become authoritative.",
      true,
    );
  }

  if (source.shopping.length === 0) {
    if (context.inventoryConfirmed !== true) {
      const coverageDetail = inventory.confirmedItemCount > 0
        ? `${inventory.confirmedItemCount} ${plural(inventory.confirmedItemCount, "inventory item")} are recorded, but Host still needs confirmation that inventory review is complete before shopping is final.`
        : "Tell Host what you already have, or confirm that nothing required is on hand.";
      return item("inventory", 6, "Check what you already have", coverageDetail, true);
    }

    return item(
      "shopping",
      7,
      "Calculate what is still needed",
      "Inventory review is confirmed. Host can now reconcile the committed menu against what is on hand.",
      false,
    );
  }

  if (shopping.unresolvedLines > 0) {
    return item(
      "shopping",
      7,
      `${shopping.unresolvedLines} shopping ${plural(shopping.unresolvedLines, "item")} remain`,
      "Review the remaining acquisition work before the event is ready.",
      true,
    );
  }

  if (preparation.totalTasks === 0) {
    return item(
      "preparation",
      8,
      "Build the preparation run sheet",
      "Shopping is reconciled. Host can turn the committed menu into dependency-aware preparation work.",
      false,
    );
  }

  const currentTask = source.tasks.find((task) => task.status === "in_progress")
    ?? [...source.tasks]
      .filter((task) => task.status === "ready")
      .sort((left, right) => Date.parse(left.dueBy) - Date.parse(right.dueBy))[0];

  if (currentTask) {
    return item(
      "task",
      9,
      currentTask.title,
      `${currentTask.durationMinutes} min · ${currentTask.status === "in_progress" ? "in progress" : "ready now"}`,
      true,
      currentTask.id,
    );
  }

  if (stage === "ready") {
    return item(
      "ready",
      10,
      "You're ready",
      "Required preparation is complete for the current confirmed event plan.",
      false,
    );
  }

  if (preparation.blockedTasks > 0) {
    return item(
      "preparation",
      9,
      "Preparation is waiting on dependencies",
      `${preparation.blockedTasks} ${plural(preparation.blockedTasks, "task")} are blocked until prerequisite work is completed.`,
      false,
    );
  }

  return item("none", 99, "No action needed right now", "Host has no customer action to surface from the current committed state.", false);
}
