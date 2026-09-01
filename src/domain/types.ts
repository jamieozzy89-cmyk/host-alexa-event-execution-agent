export type EventStatus =
  | "draft"
  | "planned"
  | "sourcing"
  | "preparing"
  | "live"
  | "complete"
  | "cancelled";

export type ConstraintType =
  | "dietary"
  | "allergen"
  | "budget"
  | "prep_time"
  | "equipment";

export interface Constraint {
  id: string;
  type: ConstraintType;
  value: string;
  scope: string;
  source: "user" | "agent" | "system";
  confirmed: boolean;
}

export interface IngredientRequirement {
  itemId: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface PreparationTaskTemplate {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  dependencies: string[];
  dueOffsetMinutes: number;
}

export interface MenuItem {
  id: string;
  name: string;
  servings: number;
  estimatedPrepMinutes: number;
  estimatedCookMinutes: number;
  constraintTags: string[];
  ingredients: IngredientRequirement[];
  taskTemplates: PreparationTaskTemplate[];
}

export interface Menu {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface EventRecord {
  id: string;
  name: string;
  startAt: string;
  timezone: string;
  status: EventStatus;
  guestCount: number;
  budget: number;
  currency: string;
  constraints: Constraint[];
  preferences: string[];
  selectedMenuId?: string;
  createdAt: string;
  updatedAt: string;
  revision: number;
}

export interface InventoryItem {
  itemId: string;
  name: string;
  quantity: number;
  unit: string;
  confirmedAt: string;
  source: "user" | "system";
}

export type ShoppingStatus = "needed" | "covered" | "selected" | "simulated_purchased";

export interface CandidateProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
}

export interface ShoppingItem {
  itemId: string;
  name: string;
  requiredQuantity: number;
  onHandQuantity: number;
  toBuyQuantity: number;
  unit: string;
  status: ShoppingStatus;
  candidateProducts: CandidateProduct[];
  selectedProductId?: string;
}

export type PreparationTaskStatus = "blocked" | "ready" | "in_progress" | "done" | "cancelled";

export interface PreparationTask {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  dueBy: string;
  dependencies: string[];
  status: PreparationTaskStatus;
  completedAt?: string;
  sourceMenuItemIds: string[];
  revision: number;
}

export type ReceiptStatus = "pending" | "succeeded" | "failed" | "reversed";

export interface ActionReceipt {
  id: string;
  actionType: string;
  requestedAt: string;
  confirmationRequired: boolean;
  confirmedAt?: string;
  executedAt?: string;
  status: ReceiptStatus;
  resultSummary: string;
  errorCode?: string;
  reversible: boolean;
}

export interface AuditEvent {
  id: string;
  eventId: string;
  actor: "user" | "agent" | "system";
  action: string;
  beforeRevision: number;
  afterRevision: number;
  timestamp: string;
  result: "succeeded" | "failed";
  delta: string;
}

export interface UndoSnapshot {
  event?: EventRecord;
  menus?: Record<string, Menu>;
  inventory?: Record<string, InventoryItem>;
  shopping?: ShoppingItem[];
  tasks?: Record<string, PreparationTask>;
}

export interface UndoRecord {
  receiptId: string;
  actionType: string;
  appliedRevision: number;
  createdAt: string;
  snapshot: UndoSnapshot;
  reversedAt?: string;
}

export interface HostState {
  event: EventRecord;
  menus: Record<string, Menu>;
  inventory: Record<string, InventoryItem>;
  shopping: ShoppingItem[];
  tasks: Record<string, PreparationTask>;
  receipts: ActionReceipt[];
  audit: AuditEvent[];
  undo: Record<string, UndoRecord>;
}

export interface EventCreateInput {
  id: string;
  name: string;
  startAt: string;
  timezone: string;
  guestCount: number;
  budget: number;
  currency: string;
  constraints?: Constraint[];
  preferences?: string[];
}

export interface ChangeRequest {
  guestCount?: number;
  addConstraints?: Constraint[];
  replacementMenu?: Menu;
}

export interface ChangeDelta {
  guestCountChanged: boolean;
  constraintsAdded: string[];
  menuChanged: boolean;
  shoppingChangedItemIds: string[];
  addedTaskIds: string[];
  removedTaskIds: string[];
  preservedCompletedTaskIds: string[];
}

export interface ChangeImpact {
  id: string;
  baseRevision: number;
  request: ChangeRequest;
  proposedEvent: EventRecord;
  proposedMenus: Record<string, Menu>;
  proposedShopping: ShoppingItem[];
  proposedTasks: Record<string, PreparationTask>;
  delta: ChangeDelta;
  requiresConfirmation: true;
  analysedAt: string;
}
