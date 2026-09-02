import type {
  ActionReceipt,
  EventRecord,
  InventoryItem,
  Menu,
  PreparationTask,
  ShoppingItem,
} from "../domain/types.js";
import type { HostPersistenceAdapter, PersistenceSource } from "../persistence/types.js";
import { deriveAttention, type AttentionContext, type AttentionItem } from "./attention.js";
import { deriveCustomerStage, type CustomerEventStage } from "./lifecycle.js";

function clone<T>(value: T): T {
  return structuredClone(value);
}

export interface EventOperatingSource {
  event: EventRecord;
  selectedMenu?: Menu;
  inventory: InventoryItem[];
  shopping: ShoppingItem[];
  tasks: PreparationTask[];
  recentReceipts: ActionReceipt[];
  reversibleReceiptIds: string[];
  persistence: {
    savedAt: string;
    source: PersistenceSource;
    recovered: boolean;
  };
}

export interface InventoryCoverageSummary {
  requiredIngredientLines: number;
  confirmedItemCount: number;
  confirmedPositiveItemCount: number;
  coverageEvaluated: boolean;
  coveredRequirementLines: number;
}

export interface ShoppingSummary {
  totalLines: number;
  coveredLines: number;
  unresolvedLines: number;
  selectedLines: number;
  purchasedLines: number;
}

export interface PreparationSummary {
  totalTasks: number;
  readyTasks: number;
  blockedTasks: number;
  inProgressTasks: number;
  doneTasks: number;
  cancelledTasks: number;
}

export interface ReadinessSummary {
  isReady: boolean;
  shoppingEvaluated: boolean;
  shoppingResolved: boolean;
  preparationExists: boolean;
  preparationComplete: boolean;
}

export interface MenuOperatingSummary {
  id: string;
  name: string;
  itemCount: number;
  itemNames: string[];
}

export interface TimingPlaceholder {
  health: "not_evaluated";
  detail: string;
}

export interface OperatingProjection {
  event?: EventRecord;
  customerStage: CustomerEventStage;
  statusSentence: string;
  menu?: MenuOperatingSummary;
  inventoryCoverage: InventoryCoverageSummary;
  shopping: ShoppingSummary;
  preparation: PreparationSummary;
  nextAction?: PreparationTask;
  timing: TimingPlaceholder;
  attention: AttentionItem;
  readiness: ReadinessSummary;
  latestReceipt?: ActionReceipt;
  reversibleReceiptIds: string[];
  persistence?: EventOperatingSource["persistence"];
}

function requiredIngredientLineCount(menu: Menu | undefined): number {
  if (!menu) return 0;
  const itemIds = new Set<string>();
  for (const menuItem of menu.items) {
    for (const ingredient of menuItem.ingredients) itemIds.add(ingredient.itemId);
  }
  return itemIds.size;
}

export function summarizeInventory(source: EventOperatingSource | null): InventoryCoverageSummary {
  if (!source) {
    return {
      requiredIngredientLines: 0,
      confirmedItemCount: 0,
      confirmedPositiveItemCount: 0,
      coverageEvaluated: false,
      coveredRequirementLines: 0,
    };
  }

  return {
    requiredIngredientLines: requiredIngredientLineCount(source.selectedMenu),
    confirmedItemCount: source.inventory.length,
    confirmedPositiveItemCount: source.inventory.filter((item) => item.quantity > 0).length,
    coverageEvaluated: source.shopping.length > 0,
    coveredRequirementLines: source.shopping.filter((item) => item.status === "covered").length,
  };
}

export function summarizeShopping(source: EventOperatingSource | null): ShoppingSummary {
  const shopping = source?.shopping ?? [];
  return {
    totalLines: shopping.length,
    coveredLines: shopping.filter((item) => item.status === "covered").length,
    unresolvedLines: shopping.filter(
      (item) => item.toBuyQuantity > 0 && item.status !== "simulated_purchased",
    ).length,
    selectedLines: shopping.filter((item) => item.status === "selected").length,
    purchasedLines: shopping.filter((item) => item.status === "simulated_purchased").length,
  };
}

export function summarizePreparation(source: EventOperatingSource | null): PreparationSummary {
  const tasks = source?.tasks ?? [];
  const active = tasks.filter((task) => task.status !== "cancelled");
  return {
    totalTasks: active.length,
    readyTasks: active.filter((task) => task.status === "ready").length,
    blockedTasks: active.filter((task) => task.status === "blocked").length,
    inProgressTasks: active.filter((task) => task.status === "in_progress").length,
    doneTasks: active.filter((task) => task.status === "done").length,
    cancelledTasks: tasks.filter((task) => task.status === "cancelled").length,
  };
}

function deriveNextAction(source: EventOperatingSource | null): PreparationTask | undefined {
  if (!source) return undefined;
  const inProgress = source.tasks
    .filter((task) => task.status === "in_progress")
    .sort((left, right) => Date.parse(left.dueBy) - Date.parse(right.dueBy) || left.id.localeCompare(right.id))[0];
  if (inProgress) return clone(inProgress);

  const ready = source.tasks
    .filter((task) => task.status === "ready")
    .sort((left, right) => Date.parse(left.dueBy) - Date.parse(right.dueBy) || left.id.localeCompare(right.id))[0];
  return ready ? clone(ready) : undefined;
}

function deriveReadiness(
  source: EventOperatingSource | null,
  stage: CustomerEventStage,
  shopping: ShoppingSummary,
  preparation: PreparationSummary,
): ReadinessSummary {
  const shoppingEvaluated = Boolean(source && source.shopping.length > 0);
  const shoppingResolved = shoppingEvaluated && shopping.unresolvedLines === 0;
  const preparationExists = preparation.totalTasks > 0;
  const preparationComplete = preparationExists && preparation.doneTasks === preparation.totalTasks;
  return {
    isReady: stage === "ready" && shoppingResolved && preparationComplete,
    shoppingEvaluated,
    shoppingResolved,
    preparationExists,
    preparationComplete,
  };
}

function statusSentence(
  source: EventOperatingSource | null,
  stage: CustomerEventStage,
  shopping: ShoppingSummary,
  preparation: PreparationSummary,
): string {
  if (!source) return "No event is active yet.";
  if (stage === "cancelled") return "This event is cancelled. The execution record remains available.";
  if (stage === "complete") return "This event is complete. Receipts remain available as the execution record.";
  if (!source.selectedMenu) return "Event details are set. The menu still needs to be chosen.";
  if (source.shopping.length === 0) return "Menu chosen. Shopping has not been reconciled yet.";
  if (stage === "ready") return "Shopping is resolved and required preparation is complete for the current confirmed plan.";
  if (preparation.totalTasks === 0) {
    return shopping.unresolvedLines > 0
      ? `Menu chosen. ${shopping.unresolvedLines} shopping ${shopping.unresolvedLines === 1 ? "item remains" : "items remain"}. Preparation is not built yet.`
      : "Shopping is reconciled. The preparation run sheet is not built yet.";
  }
  return `${preparation.doneTasks} of ${preparation.totalTasks} prep tasks are done. ${shopping.unresolvedLines} shopping ${shopping.unresolvedLines === 1 ? "item remains" : "items remain"}.`;
}

export function deriveOperatingProjection(
  source: EventOperatingSource | null,
  context: AttentionContext = {},
): OperatingProjection {
  const inventoryCoverage = summarizeInventory(source);
  const shopping = summarizeShopping(source);
  const preparation = summarizePreparation(source);
  const customerStage = deriveCustomerStage(source);
  const attention = deriveAttention({
    source,
    stage: customerStage,
    inventory: inventoryCoverage,
    shopping,
    preparation,
    context,
  });
  const nextAction = deriveNextAction(source);
  const readiness = deriveReadiness(source, customerStage, shopping, preparation);
  const latestReceipt = source?.recentReceipts.at(-1);

  const menu = source?.selectedMenu
    ? {
        id: source.selectedMenu.id,
        name: source.selectedMenu.name,
        itemCount: source.selectedMenu.items.length,
        itemNames: source.selectedMenu.items.map((item) => item.name),
      }
    : undefined;

  return {
    ...(source ? { event: clone(source.event) } : {}),
    customerStage,
    statusSentence: statusSentence(source, customerStage, shopping, preparation),
    ...(menu ? { menu } : {}),
    inventoryCoverage,
    shopping,
    preparation,
    ...(nextAction ? { nextAction } : {}),
    timing: {
      health: "not_evaluated",
      detail: "Dependency-aware schedule health is introduced in Phase F; Phase B does not invent wall-clock timing claims.",
    },
    attention,
    readiness,
    ...(latestReceipt ? { latestReceipt: clone(latestReceipt) } : {}),
    reversibleReceiptIds: source ? [...source.reversibleReceiptIds] : [],
    ...(source ? { persistence: clone(source.persistence) } : {}),
  };
}

export interface HostApplicationReadServiceOptions {
  receiptLimit?: number;
}

/**
 * Read-only application service for customer-facing operating state. It reads
 * committed persistence, clones/sanitizes the result, and never exposes raw
 * HostState, audit events, undo snapshots, or runtime pending caches.
 */
export class HostApplicationReadService {
  private readonly receiptLimit: number;

  constructor(
    private readonly persistence: HostPersistenceAdapter,
    options: HostApplicationReadServiceOptions = {},
  ) {
    const receiptLimit = options.receiptLimit ?? 20;
    if (!Number.isInteger(receiptLimit) || receiptLimit <= 0 || receiptLimit > 100) {
      throw new RangeError("receiptLimit must be an integer from 1 to 100.");
    }
    this.receiptLimit = receiptLimit;
  }

  async readSource(eventId: string): Promise<EventOperatingSource | null> {
    if (!eventId.trim()) throw new TypeError("eventId is required.");
    const loaded = await this.persistence.load(eventId);
    if (!loaded) return null;

    const state = clone(loaded.state);
    const selectedMenu = state.event.selectedMenuId
      ? state.menus[state.event.selectedMenuId]
      : undefined;
    if (state.event.selectedMenuId && !selectedMenu) {
      throw new Error(`Committed menu ${state.event.selectedMenuId} is missing from persisted state.`);
    }

    const reversibleReceiptIds = Object.values(state.undo)
      .filter((record) => !record.reversedAt && record.appliedRevision === state.event.revision)
      .map((record) => record.receiptId);

    const tasks = Object.values(state.tasks)
      .map(clone)
      .sort((left, right) => Date.parse(left.dueBy) - Date.parse(right.dueBy) || left.id.localeCompare(right.id));

    return {
      event: clone(state.event),
      ...(selectedMenu ? { selectedMenu: clone(selectedMenu) } : {}),
      inventory: Object.values(state.inventory).map(clone).sort((left, right) => left.name.localeCompare(right.name) || left.itemId.localeCompare(right.itemId)),
      shopping: state.shopping.map(clone),
      tasks,
      recentReceipts: state.receipts.slice(-this.receiptLimit).map(clone),
      reversibleReceiptIds,
      persistence: {
        savedAt: loaded.savedAt,
        source: loaded.source,
        recovered: loaded.recovered,
      },
    };
  }

  async readProjection(eventId: string, context: AttentionContext = {}): Promise<OperatingProjection | null> {
    const source = await this.readSource(eventId);
    return source ? deriveOperatingProjection(source, context) : null;
  }
}
