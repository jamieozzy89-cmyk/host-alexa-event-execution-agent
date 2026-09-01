import type {
  CandidateProduct,
  ChangeImpact,
  Constraint,
  EventCreateInput,
  HostState,
  InventoryItem,
  Menu,
  PreparationTask,
} from "../domain/types.js";

export type HostToolName =
  | "create_event"
  | "update_event_constraints"
  | "propose_menu"
  | "commit_menu"
  | "record_inventory"
  | "build_shopping_plan"
  | "prepare_cart"
  | "confirm_cart_action"
  | "build_preparation_plan"
  | "mark_task_complete"
  | "advance_event_status"
  | "get_next_action"
  | "get_event_status"
  | "analyse_change_impact"
  | "apply_confirmed_change"
  | "get_action_history"
  | "undo_reversible_action";

export type ToolRisk = "read_only" | "low_risk_mutation" | "material_mutation" | "transaction_like";
export type ToolExecutionStatus = "succeeded" | "failed" | "needs_attention";

export interface ToolInputSchema {
  type: "object";
  required: string[];
  properties: Record<string, { type: string; description: string }>;
  additionalProperties: false;
}

export interface HostToolDescriptor {
  name: HostToolName;
  description: string;
  risk: ToolRisk;
  mutatesCommittedState: boolean;
  requiresExplicitConfirmation: boolean;
  inputSchema: ToolInputSchema;
}

export interface HostToolCall {
  name: HostToolName;
  input: unknown;
}

export interface HostToolSuccess<T = unknown> {
  ok: true;
  tool: HostToolName;
  status: "succeeded";
  stateChanged: boolean;
  eventId?: string;
  revision?: number;
  data: T;
}

export interface HostToolFailure {
  ok: false;
  tool: HostToolName;
  status: "failed" | "needs_attention";
  stateChanged: boolean;
  eventId?: string;
  revision?: number;
  error: {
    code: string;
    message: string;
    retryable: boolean;
  };
  data?: unknown;
}

export type HostToolResult<T = unknown> = HostToolSuccess<T> | HostToolFailure;

export interface MenuProposalAdapter {
  proposeMenus(state: HostState, maxOptions: number): Promise<Menu[]>;
}

export interface ProductCatalogueAdapter {
  getCandidates(params: {
    eventId: string;
    itemId: string;
    name: string;
    quantity: number;
    unit: string;
    currency: string;
  }): Promise<CandidateProduct[]>;
}

export interface SimulatedCartLine {
  itemId: string;
  productId: string;
  productName: string;
  quantityNeeded: number;
  unit: string;
  linePrice: number;
  currency: string;
}

export type CartCheckoutResult =
  | { ok: true; reference: string; total: number; currency: string }
  | { ok: false; errorCode: string; message: string };

export interface CartActionAdapter {
  checkout(params: {
    eventId: string;
    revision: number;
    idempotencyKey: string;
    lines: SimulatedCartLine[];
    currency: string;
  }): Promise<CartCheckoutResult>;
}

export interface ToolRuntimeDependencies {
  menuProposals: MenuProposalAdapter;
  productCatalogue: ProductCatalogueAdapter;
  cartActions: CartActionAdapter;
}

export interface EventStatusView {
  event: HostState["event"];
  shopping: {
    totalLines: number;
    unresolvedLines: number;
    selectedLines: number;
    purchasedLines: number;
  };
  tasks: {
    total: number;
    blocked: number;
    ready: number;
    done: number;
  };
  nextAction?: PreparationTask;
}

export interface ActionHistoryView {
  receipts: HostState["receipts"];
  audit: HostState["audit"];
  reversibleReceiptIds: string[];
}

export interface ProposedMenusView {
  menus: Menu[];
  eventRevision: number;
}

export interface ChangeImpactView {
  impact: ChangeImpact;
}

export interface CreateEventToolInput extends EventCreateInput {}
export interface UpdateConstraintsToolInput { eventId: string; expectedRevision: number; constraints: Constraint[] }
export interface RecordInventoryToolInput { eventId: string; expectedRevision: number; items: InventoryItem[] }
