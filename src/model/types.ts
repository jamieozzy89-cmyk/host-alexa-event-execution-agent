export type CustomerIntentKind =
  | "create_event"
  | "status"
  | "next_action"
  | "menu_options"
  | "choose_menu"
  | "shopping"
  | "products"
  | "checkout"
  | "prep"
  | "history"
  | "change"
  | "mark_task_complete"
  | "undo"
  | "confirm"
  | "cancel"
  | "help"
  | "provide_inventory"
  | "update_preference"
  | "unknown";

export type CandidateConstraintType = "dietary" | "allergen" | "budget" | "prep_time" | "equipment";
export type InventoryReviewMode = "none" | "items" | "unspecified";
export type InventoryEvidenceKind = "stated_quantity" | "enough" | "identity_only";
export type ReferenceKind = "current_event" | "menu_option" | "current_task" | "previous_change" | "inventory_requirement";

export interface CustomerIntentCandidate {
  kind: CustomerIntentKind;
  confidence: number;
  evidence: string;
}

export interface CandidateEventFacts {
  name?: string;
  guestCount?: number;
  guestDelta?: number;
  budget?: number;
  currency?: string;
  startText?: string;
  timezone?: string;
}

export interface ConstraintCandidate {
  type: CandidateConstraintType;
  value: string;
  scope: string;
  confidence: number;
  evidence: string;
}

export interface PreferenceCandidate {
  value: string;
  confidence: number;
  evidence: string;
}

export interface InventoryCandidate {
  name: string;
  evidenceKind: InventoryEvidenceKind;
  quantity?: number;
  unit?: string;
  confidence: number;
  evidence: string;
}

export interface InventoryUnderstanding {
  mode: InventoryReviewMode;
  evidence?: string;
  items: InventoryCandidate[];
}

export interface ReferenceCandidate {
  kind: ReferenceKind;
  text: string;
  ordinal?: number;
  name?: string;
  confidence: number;
  evidence: string;
}

export interface UnderstandingAmbiguity {
  field: string;
  reason: string;
  question: string;
  evidence?: string;
}

export interface CustomerUnderstanding {
  intents: CustomerIntentCandidate[];
  eventFacts: CandidateEventFacts;
  constraints: ConstraintCandidate[];
  preferences: PreferenceCandidate[];
  inventory: InventoryUnderstanding;
  references: ReferenceCandidate[];
  ambiguities: UnderstandingAmbiguity[];
  overallConfidence: number;
}

export interface UnderstandingContext {
  hasEvent: boolean;
  eventName?: string;
  guestCount?: number;
  awaitingField?: "guestCount" | "startAt" | "budget";
  awaitingWorkflowInput?: "inventory_review";
  hasPendingConfirmation: boolean;
  menuOptions?: Array<{ index: number; name: string }>;
  currentTask?: { title: string };
  inventoryRequirements?: Array<{ name: string; quantity: number; unit: string }>;
}

export interface UnderstandingInput {
  text: string;
  context: UnderstandingContext;
}

export interface StructuredUnderstandingModel {
  infer(input: UnderstandingInput): Promise<unknown>;
}

export interface CustomerUnderstandingInterpreter {
  understand(text: string, context: UnderstandingContext): Promise<CustomerUnderstanding>;
}
