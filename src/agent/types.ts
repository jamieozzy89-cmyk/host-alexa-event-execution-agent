import type { Constraint, Menu, ShoppingItem, PreparationTask, ActionReceipt, AuditEvent } from "../domain/types.js";

export type HostIntentKind =
  | "create_event" | "status" | "next_action" | "menu_options" | "shopping" | "products"
  | "checkout" | "prep" | "history" | "change" | "mark_task_complete" | "undo"
  | "confirm" | "cancel" | "help" | "unknown";

export interface HostIntentSlots {
  name?: string;
  guestCount?: number;
  guestDelta?: number;
  budget?: number;
  currency?: string;
  startText?: string;
  timezone?: string;
  constraints?: Constraint[];
  preferences?: string[];
  taskId?: string;
}

export interface InterpretedHostIntent { kind: HostIntentKind; confidence: number; slots: HostIntentSlots; }

export interface IntentContext {
  hasEvent: boolean;
  eventName?: string;
  guestCount?: number;
  awaitingField?: "guestCount" | "startAt" | "budget";
  hasPendingConfirmation: boolean;
}

export interface IntentInterpreter {
  interpret(text: string, context: IntentContext): Promise<InterpretedHostIntent>;
}

export interface StructuredIntentModel {
  infer(input: { text: string; context: IntentContext }): Promise<unknown>;
}

export interface EventSummaryCard {
  type: "event_summary";
  title: string;
  startAt: string;
  guestCount: number;
  budget: number;
  currency: string;
  status: string;
  revision: number;
}

export interface MenuOptionsCard {
  type: "menu_options";
  title: string;
  menus: Array<{ id: string; name: string; itemNames: string[]; prepMinutes: number }>;
}

export interface ShoppingListCard {
  type: "shopping_list";
  title: string;
  items: Array<{
    itemId: string;
    name: string;
    requiredQuantity: number;
    onHandQuantity: number;
    toBuyQuantity: number;
    unit: string;
    status: string;
  }>;
}

export interface ProductChoicesCard {
  type: "product_choices";
  title: string;
  items: Array<{
    itemId: string;
    name: string;
    quantity: number;
    unit: string;
    selectedProductId?: string;
    candidates: Array<{ id: string; name: string; price: number; currency: string }>;
  }>;
}

export interface PrepTimelineCard {
  type: "prep_timeline";
  title: string;
  tasks: Array<{
    id: string;
    title: string;
    category: string;
    durationMinutes: number;
    dueBy: string;
    status: string;
    dependencies: string[];
  }>;
}

export interface ChangeImpactCard {
  type: "change_impact";
  title: string;
  impactId: string;
  baseRevision: number;
  guestCountChanged: boolean;
  constraintsAdded: string[];
  menuChanged: boolean;
  shoppingChangedCount: number;
  addedTaskCount: number;
  removedTaskCount: number;
  preservedCompletedTaskCount: number;
}

export interface HistoryCard {
  type: "history";
  title: string;
  receipts: Array<{ id: string; action: string; status: string; summary: string; reversible: boolean }>;
  audit: Array<{ id: string; action: string; result: string; delta: string; beforeRevision: number; afterRevision: number }>;
}

export interface ConfirmationCard { type: "confirmation"; title: string; body: string; consequence: string; }
export interface ErrorCard { type: "error"; title: string; body: string; retryable: boolean; }

export type AgentCard = EventSummaryCard | MenuOptionsCard | ShoppingListCard | ProductChoicesCard | PrepTimelineCard | ChangeImpactCard | HistoryCard | ConfirmationCard | ErrorCard;

export type AgentAction =
  | { type: "submit_text"; label: string; text: string }
  | { type: "choose_menu"; label: string; menuId: string }
  | { type: "confirm_pending"; label: string }
  | { type: "cancel_pending"; label: string }
  | { type: "complete_task"; label: string; taskId: string }
  | { type: "retry_checkout"; label: string }
  | { type: "request"; label: string; request: "menu" | "shopping" | "products" | "prep" | "status" | "history" | "next" | "undo" | "checkout" };

export type AgentReplyStatus = "ok" | "needs_input" | "needs_confirmation" | "error";

export interface AgentReply {
  status: AgentReplyStatus;
  speech: string;
  displayText: string;
  cards: AgentCard[];
  actions: AgentAction[];
  eventId?: string;
  question?: string;
}

export interface HostAgentDependencies {
  now?: () => Date;
  idFactory?: () => string;
  defaultTimezone?: string;
  defaultCurrency?: string;
}

export interface EventDraft {
  name?: string;
  guestCount?: number;
  budget?: number;
  currency: string;
  timezone: string;
  startAt?: string;
  constraints: Constraint[];
  preferences: string[];
}

export interface PendingConfirmation {
  kind: "commit_menu" | "apply_change" | "checkout" | "undo";
  prompt: string;
  consequence: string;
  tool: "commit_menu" | "apply_confirmed_change" | "confirm_cart_action" | "undo_reversible_action";
  input: Record<string, unknown>;
}

export interface ConversationState {
  eventId?: string;
  draft?: EventDraft;
  awaitingField?: "guestCount" | "startAt" | "budget";
  pending?: PendingConfirmation;
  lastMenus?: Menu[];
  lastShopping?: ShoppingItem[];
  lastTasks?: PreparationTask[];
  lastReceipts?: ActionReceipt[];
  lastAudit?: AuditEvent[];
}
