import type { AttentionContext, OperatingProjection } from "../application/index.js";
import type { HostToolCall, HostToolResult } from "../tools/types.js";

export type WorkflowGoal = "advance_event_preparation";

export type AutomaticWorkflowTool =
  | "build_shopping_plan"
  | "build_preparation_plan";

export type WorkflowStopReason =
  | "missing_event"
  | "missing_input"
  | "customer_choice"
  | "confirmation_required"
  | "change_review"
  | "failure"
  | "stale_revision_limit"
  | "step_limit"
  | "no_low_risk_work";

export interface WorkflowRequiredInput {
  field: "inventory_review";
  prompt: string;
}

export interface WorkflowConfirmationBoundary {
  kind: "explicit_customer_confirmation";
  title: string;
  detail: string;
  relatedId?: string;
}

export interface WorkflowStep {
  tool: AutomaticWorkflowTool;
  expectedRevision: number;
  reason: string;
}

export interface WorkflowExecutionRecord {
  tool: AutomaticWorkflowTool;
  attemptedRevision: number;
  reason: string;
  status: "succeeded" | "failed" | "stale_replanned";
  resultingRevision?: number;
  errorCode?: string;
  data?: unknown;
}

/**
 * Ephemeral, discardable Phase C workflow plan. It deliberately contains both
 * the single currently executable low-risk candidate and the completed attempt
 * history needed to explain/reconstruct how this run reached its boundary.
 * It is never persisted as HostState.
 */
export interface WorkflowPlan {
  goal: WorkflowGoal;
  baseRevision?: number;
  candidateSteps: WorkflowStep[];
  completedSteps: WorkflowExecutionRecord[];
  stopReason?: WorkflowStopReason;
  requiredInput?: WorkflowRequiredInput;
  confirmationBoundary?: WorkflowConfirmationBoundary;
}

export interface WorkflowRunResult {
  goal: WorkflowGoal;
  startRevision?: number;
  finalRevision?: number;
  stopReason: WorkflowStopReason;
  requiredInput?: WorkflowRequiredInput;
  records: WorkflowExecutionRecord[];
  finalPlan: WorkflowPlan;
  projection: OperatingProjection | null;
}

export interface WorkflowToolExecutor {
  execute(call: HostToolCall): Promise<HostToolResult>;
}

export interface WorkflowProjectionReader {
  readProjection(eventId: string, context?: AttentionContext): Promise<OperatingProjection | null>;
}

export interface WorkflowPolicyContext {
  inventoryReviewConfirmed: boolean;
}

export interface WorkflowRunnerOptions {
  maxSuccessfulSteps?: number;
  maxStaleReplans?: number;
}

const DEFAULT_MAX_SUCCESSFUL_STEPS = 4;
const DEFAULT_MAX_STALE_REPLANS = 2;

function copyRecords(records: readonly WorkflowExecutionRecord[]): WorkflowExecutionRecord[] {
  return records.map((record) => ({ ...record }));
}

function stop(
  reason: WorkflowStopReason,
  projection: OperatingProjection | null,
  completedSteps: readonly WorkflowExecutionRecord[] = [],
  requiredInput?: WorkflowRequiredInput,
  confirmationBoundary?: WorkflowConfirmationBoundary,
): WorkflowPlan {
  return {
    goal: "advance_event_preparation",
    ...(projection?.event ? { baseRevision: projection.event.revision } : {}),
    candidateSteps: [],
    completedSteps: copyRecords(completedSteps),
    stopReason: reason,
    ...(requiredInput ? { requiredInput } : {}),
    ...(confirmationBoundary ? { confirmationBoundary } : {}),
  };
}

function candidate(
  baseRevision: number,
  completedSteps: readonly WorkflowExecutionRecord[],
  step: WorkflowStep,
): WorkflowPlan {
  return {
    goal: "advance_event_preparation",
    baseRevision,
    candidateSteps: [step],
    completedSteps: copyRecords(completedSteps),
  };
}

/**
 * Pure deterministic planning over the Phase B projection. This planner cannot
 * select a material or transaction-like tool because AutomaticWorkflowTool is
 * intentionally restricted to the two approved low-risk derived-work steps.
 */
export function planLowRiskWorkflow(
  projection: OperatingProjection | null,
  policy: WorkflowPolicyContext,
  completedSteps: readonly WorkflowExecutionRecord[] = [],
): WorkflowPlan {
  if (!projection?.event) return stop("missing_event", projection, completedSteps);
  const baseRevision = projection.event.revision;

  if (projection.attention.kind === "confirmation") {
    return stop(
      "confirmation_required",
      projection,
      completedSteps,
      undefined,
      {
        kind: "explicit_customer_confirmation",
        title: projection.attention.title,
        detail: projection.attention.detail,
        ...(projection.attention.relatedId ? { relatedId: projection.attention.relatedId } : {}),
      },
    );
  }
  if (projection.attention.kind === "failure") return stop("failure", projection, completedSteps);
  if (projection.attention.kind === "change_review") return stop("change_review", projection, completedSteps);
  if (projection.attention.kind === "missing_input") return stop("missing_input", projection, completedSteps);

  if (!projection.menu) return stop("customer_choice", projection, completedSteps);

  if (projection.shopping.totalLines === 0) {
    if (!policy.inventoryReviewConfirmed) {
      return stop("missing_input", projection, completedSteps, {
        field: "inventory_review",
        prompt: "Before I calculate shopping, tell me what required ingredients you already have. If you have none of them, say that explicitly. Host will not guess quantities.",
      });
    }
    return candidate(baseRevision, completedSteps, {
      tool: "build_shopping_plan",
      expectedRevision: baseRevision,
      reason: "The menu is committed and inventory review is explicitly complete, so authoritative shopping can be reconciled.",
    });
  }

  if (projection.preparation.totalTasks === 0) {
    return candidate(baseRevision, completedSteps, {
      tool: "build_preparation_plan",
      expectedRevision: baseRevision,
      reason: "The shopping plan exists and no preparation graph exists, so the dependency-aware run sheet can be built without a material customer decision.",
    });
  }

  return stop("no_low_risk_work", projection, completedSteps);
}

function validateLimit(value: number | undefined, fallback: number, name: string): number {
  const resolved = value ?? fallback;
  if (!Number.isInteger(resolved) || resolved <= 0 || resolved > 20) {
    throw new RangeError(`${name} must be an integer from 1 to 20.`);
  }
  return resolved;
}

function runResult(params: {
  startRevision: number | undefined;
  projection: OperatingProjection | null;
  stopReason: WorkflowStopReason;
  records: WorkflowExecutionRecord[];
  finalPlan: WorkflowPlan;
}): WorkflowRunResult {
  return {
    goal: "advance_event_preparation",
    ...(params.startRevision !== undefined ? { startRevision: params.startRevision } : {}),
    ...(params.projection?.event ? { finalRevision: params.projection.event.revision } : {}),
    stopReason: params.stopReason,
    ...(params.finalPlan.requiredInput ? { requiredInput: params.finalPlan.requiredInput } : {}),
    records: copyRecords(params.records),
    finalPlan: params.finalPlan,
    projection: params.projection,
  };
}

/**
 * Executes only planner-approved low-risk steps. Every successful mutation is
 * followed by a fresh OperatingProjection read before another step is planned.
 * STALE_REVISION is never blindly retried: the projection is refreshed and the
 * planner is run again against current state. Other failures stop immediately.
 */
export async function runLowRiskWorkflow(params: {
  eventId: string;
  tools: WorkflowToolExecutor;
  projectionReader: WorkflowProjectionReader;
  policy: WorkflowPolicyContext;
  options?: WorkflowRunnerOptions;
}): Promise<WorkflowRunResult> {
  if (!params.eventId.trim()) throw new TypeError("eventId is required.");
  const maxSuccessfulSteps = validateLimit(params.options?.maxSuccessfulSteps, DEFAULT_MAX_SUCCESSFUL_STEPS, "maxSuccessfulSteps");
  const maxStaleReplans = validateLimit(params.options?.maxStaleReplans, DEFAULT_MAX_STALE_REPLANS, "maxStaleReplans");
  const attentionContext: AttentionContext = { inventoryConfirmed: params.policy.inventoryReviewConfirmed };

  let projection = await params.projectionReader.readProjection(params.eventId, attentionContext);
  const startRevision = projection?.event?.revision;
  const records: WorkflowExecutionRecord[] = [];
  let successfulSteps = 0;
  let staleReplans = 0;

  while (successfulSteps < maxSuccessfulSteps) {
    const plan = planLowRiskWorkflow(projection, params.policy, records);
    const step = plan.candidateSteps[0];
    if (!step) {
      return runResult({
        startRevision,
        projection,
        stopReason: plan.stopReason ?? "no_low_risk_work",
        records,
        finalPlan: plan,
      });
    }

    const result = await params.tools.execute({
      name: step.tool,
      input: { eventId: params.eventId, expectedRevision: step.expectedRevision },
    });

    if (result.ok) {
      records.push({
        tool: step.tool,
        attemptedRevision: step.expectedRevision,
        reason: step.reason,
        status: "succeeded",
        ...(result.revision !== undefined ? { resultingRevision: result.revision } : {}),
        data: result.data,
      });
      successfulSteps += 1;
      projection = await params.projectionReader.readProjection(params.eventId, attentionContext);
      continue;
    }

    if (result.error.code === "STALE_REVISION") {
      records.push({
        tool: step.tool,
        attemptedRevision: step.expectedRevision,
        reason: step.reason,
        status: "stale_replanned",
        errorCode: result.error.code,
      });
      staleReplans += 1;
      projection = await params.projectionReader.readProjection(params.eventId, attentionContext);
      if (staleReplans > maxStaleReplans) {
        const finalPlan = stop("stale_revision_limit", projection, records);
        return runResult({ startRevision, projection, stopReason: "stale_revision_limit", records, finalPlan });
      }
      continue;
    }

    records.push({
      tool: step.tool,
      attemptedRevision: step.expectedRevision,
      reason: step.reason,
      status: "failed",
      errorCode: result.error.code,
    });
    projection = await params.projectionReader.readProjection(params.eventId, attentionContext);
    const finalPlan = stop("failure", projection, records);
    return runResult({ startRevision, projection, stopReason: "failure", records, finalPlan });
  }

  projection = await params.projectionReader.readProjection(params.eventId, attentionContext);
  const finalPlan = stop("step_limit", projection, records);
  return runResult({ startRevision, projection, stopReason: "step_limit", records, finalPlan });
}
