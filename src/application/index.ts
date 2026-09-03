export { HOST_TOOL_DESCRIPTORS, HOST_TOOL_NAMES } from "../tools/descriptors.js";
export { ToolInputError, ToolRuntimeError } from "../tools/errors.js";
export { HostToolRuntime } from "../tools/runtime.js";
export type {
  ActionHistoryView,
  CartActionAdapter,
  CartCheckoutResult,
  ChangeImpactView,
  EventStatusView,
  HostToolCall,
  HostToolDescriptor,
  HostToolFailure,
  HostToolName,
  HostToolResult,
  HostToolSuccess,
  MenuProposalAdapter,
  ProductCatalogueAdapter,
  ProposedMenusView,
  SimulatedCartLine,
  ToolRisk,
  ToolRuntimeDependencies,
} from "../tools/types.js";
export { DeterministicSimulatedCartAdapter } from "../simulated-services/cart.js";
export { createDefaultMenuProposalAdapter, DEMO_MENU_TEMPLATES, StaticMenuProposalAdapter } from "../simulated-services/menu-proposals.js";
export { DemoProductCatalogueAdapter } from "../simulated-services/product-catalogue.js";
export { JsonStoragePersistenceAdapter } from "../persistence/storage-adapter.js";
export type { HostPersistenceAdapter, StorageLike } from "../persistence/types.js";

export {
  HostApplicationReadService,
  deriveOperatingProjection,
  summarizeInventory,
  summarizePreparation,
  summarizeShopping,
} from "./event-operating-state.js";
export type {
  EventOperatingSource,
  HostApplicationReadServiceOptions,
  InventoryCoverageSummary,
  MenuOperatingSummary,
  OperatingProjection,
  PreparationSummary,
  ReadinessSummary,
  ShoppingSummary,
  TimingPlaceholder,
} from "./event-operating-state.js";
export { deriveCustomerStage } from "./lifecycle.js";
export type { CustomerEventStage } from "./lifecycle.js";
export { deriveAttention } from "./attention.js";
export type {
  AttentionContext,
  AttentionDerivationInput,
  AttentionItem,
  AttentionKind,
  BlockingFailureAttention,
  MissingInputAttention,
  PendingChangeAttention,
  PendingConfirmationAttention,
} from "./attention.js";

export { HostAgentOrchestrator } from "../agent/orchestrator.js";
export { GoalDirectedHostAgentOrchestrator } from "../agent/goal-orchestrator.js";
export { planLowRiskWorkflow, runLowRiskWorkflow } from "../agent/workflow.js";
export type {
  AutomaticWorkflowTool,
  WorkflowConfirmationBoundary,
  WorkflowExecutionRecord,
  WorkflowGoal,
  WorkflowPlan,
  WorkflowPolicyContext,
  WorkflowProjectionReader,
  WorkflowRequiredInput,
  WorkflowRunResult,
  WorkflowRunnerOptions,
  WorkflowStep,
  WorkflowStopReason,
  WorkflowToolExecutor,
} from "../agent/workflow.js";
export { HeuristicIntentInterpreter, constraintsFromText } from "../agent/interpreter.js";
export { JsonModelProxyAdapter, ModelBackedIntentInterpreter, ResilientIntentInterpreter } from "../agent/model.js";
export type {
  AgentAction,
  AgentCard,
  AgentReply,
  AgentReplyStatus,
  ConversationState,
  HostAgentDependencies,
  HostIntentKind,
  HostIntentSlots,
  IntentContext,
  IntentInterpreter,
  InterpretedHostIntent,
  OperatingProjectionReader,
  StructuredIntentModel,
} from "../agent/types.js";
export {
  CUSTOMER_UNDERSTANDING_JSON_SCHEMA,
  LegacyIntentUnderstandingInterpreter,
  ModelCustomerUnderstandingInterpreter,
  ResilientUnderstandingInterpreter,
  parseCustomerUnderstanding,
} from "../model/index.js";
export type {
  CandidateConstraintType,
  CandidateEventFacts,
  CustomerIntentCandidate,
  CustomerIntentKind,
  CustomerUnderstanding,
  CustomerUnderstandingInterpreter,
  InventoryCandidate,
  InventoryEvidenceKind,
  InventoryReviewMode,
  InventoryUnderstanding,
  PreferenceCandidate,
  ReferenceCandidate,
  ReferenceKind,
  StructuredUnderstandingModel,
  UnderstandingAmbiguity,
  UnderstandingContext,
  UnderstandingInput,
} from "../model/index.js";
