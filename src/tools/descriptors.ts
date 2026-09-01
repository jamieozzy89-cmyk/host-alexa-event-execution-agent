import type { HostToolDescriptor, HostToolName, ToolInputSchema } from "./types.js";

function schema(required: string[], properties: ToolInputSchema["properties"]): ToolInputSchema {
  return { type: "object", required, properties, additionalProperties: false };
}

const commonEvent = { eventId: { type: "string", description: "Authoritative Host event id." } };
const revision = { expectedRevision: { type: "integer", description: "Caller-visible event revision; stale values are rejected." } };
const confirmedAt = { confirmedAt: { type: "string", description: "Explicit user-confirmation timestamp." } };

export const HOST_TOOL_DESCRIPTORS: readonly HostToolDescriptor[] = [
  {
    name: "create_event",
    description: "Create and persist a new hosting event with confirmed constraints/preferences.",
    risk: "low_risk_mutation",
    mutatesCommittedState: true,
    requiresExplicitConfirmation: false,
    inputSchema: schema(["id", "name", "startAt", "timezone", "guestCount", "budget", "currency"], {
      id: { type: "string", description: "New event id." },
      name: { type: "string", description: "Human-readable event name." },
      startAt: { type: "string", description: "Event start ISO date/time." },
      timezone: { type: "string", description: "IANA timezone name." },
      guestCount: { type: "number", description: "Positive guest count." },
      budget: { type: "number", description: "Non-negative budget ceiling." },
      currency: { type: "string", description: "Currency code." },
      constraints: { type: "array", description: "Optional confirmed/unconfirmed constraints." },
      preferences: { type: "array", description: "Optional host preferences." },
    }),
  },
  {
    name: "update_event_constraints",
    description: "Add or replace event constraints by id without bypassing menu compatibility rules.",
    risk: "low_risk_mutation",
    mutatesCommittedState: true,
    requiresExplicitConfirmation: false,
    inputSchema: schema(["eventId", "expectedRevision", "constraints"], { ...commonEvent, ...revision, constraints: { type: "array", description: "Constraint objects." } }),
  },
  {
    name: "propose_menu",
    description: "Return constraint-compatible uncommitted menu proposals from the configured proposal adapter.",
    risk: "read_only",
    mutatesCommittedState: false,
    requiresExplicitConfirmation: false,
    inputSchema: schema(["eventId"], { ...commonEvent, maxOptions: { type: "integer", description: "Optional maximum proposals, 1-5." }, guestCount: { type: "number", description: "Optional preview guest count for a proposed change." }, additionalConstraints: { type: "array", description: "Optional preview constraints for a proposed change." } }),
  },
  {
    name: "commit_menu",
    description: "Commit one previously proposed menu after explicit user confirmation.",
    risk: "material_mutation",
    mutatesCommittedState: true,
    requiresExplicitConfirmation: true,
    inputSchema: schema(["eventId", "expectedRevision", "menuId", "confirmedAt"], { ...commonEvent, ...revision, menuId: { type: "string", description: "Menu id from propose_menu or existing state." }, ...confirmedAt }),
  },
  {
    name: "record_inventory",
    description: "Record explicitly confirmed on-hand inventory and reconcile an existing shopping plan if present.",
    risk: "low_risk_mutation",
    mutatesCommittedState: true,
    requiresExplicitConfirmation: false,
    inputSchema: schema(["eventId", "expectedRevision", "items"], { ...commonEvent, ...revision, items: { type: "array", description: "Confirmed inventory items." } }),
  },
  {
    name: "build_shopping_plan",
    description: "Calculate authoritative shopping deficits from committed menu requirements and confirmed inventory.",
    risk: "low_risk_mutation",
    mutatesCommittedState: true,
    requiresExplicitConfirmation: false,
    inputSchema: schema(["eventId", "expectedRevision"], { ...commonEvent, ...revision }),
  },
  {
    name: "prepare_cart",
    description: "Attach simulated product candidates and select a concrete candidate for each unresolved shopping line.",
    risk: "low_risk_mutation",
    mutatesCommittedState: true,
    requiresExplicitConfirmation: false,
    inputSchema: schema(["eventId", "expectedRevision"], { ...commonEvent, ...revision }),
  },
  {
    name: "confirm_cart_action",
    description: "Execute the configured simulated cart/checkout adapter and commit success or a failed action receipt.",
    risk: "transaction_like",
    mutatesCommittedState: true,
    requiresExplicitConfirmation: true,
    inputSchema: schema(["eventId", "expectedRevision", "confirmedAt"], { ...commonEvent, ...revision, ...confirmedAt }),
  },
  {
    name: "build_preparation_plan",
    description: "Build/rebuild the dependency-aware preparation graph for the committed menu.",
    risk: "low_risk_mutation",
    mutatesCommittedState: true,
    requiresExplicitConfirmation: false,
    inputSchema: schema(["eventId", "expectedRevision"], { ...commonEvent, ...revision }),
  },
  {
    name: "mark_task_complete",
    description: "Mark a dependency-valid preparation task complete and unlock affected tasks.",
    risk: "low_risk_mutation",
    mutatesCommittedState: true,
    requiresExplicitConfirmation: false,
    inputSchema: schema(["eventId", "expectedRevision", "taskId"], { ...commonEvent, ...revision, taskId: { type: "string", description: "Preparation task id." }, completedAt: { type: "string", description: "Optional completion timestamp." } }),
  },
  {
    name: "advance_event_status",
    description: "Advance the validated event lifecycle after explicit user confirmation.",
    risk: "material_mutation",
    mutatesCommittedState: true,
    requiresExplicitConfirmation: true,
    inputSchema: schema(["eventId", "expectedRevision", "nextStatus", "confirmedAt"], { ...commonEvent, ...revision, nextStatus: { type: "string", description: "Validated next event status." }, ...confirmedAt }),
  },
  {
    name: "get_next_action",
    description: "Read the earliest ready preparation action from authoritative task state.",
    risk: "read_only",
    mutatesCommittedState: false,
    requiresExplicitConfirmation: false,
    inputSchema: schema(["eventId"], { ...commonEvent }),
  },
  {
    name: "get_event_status",
    description: "Read a compact authoritative event, shopping and preparation status summary.",
    risk: "read_only",
    mutatesCommittedState: false,
    requiresExplicitConfirmation: false,
    inputSchema: schema(["eventId"], { ...commonEvent }),
  },
  {
    name: "analyse_change_impact",
    description: "Compute a read-only bounded replan impact and keep it pending only in the live session.",
    risk: "read_only",
    mutatesCommittedState: false,
    requiresExplicitConfirmation: false,
    inputSchema: schema(["eventId", "expectedRevision"], { ...commonEvent, ...revision, guestCount: { type: "number", description: "Optional replacement guest count." }, addConstraints: { type: "array", description: "Optional constraints to add." }, replacementMenuId: { type: "string", description: "Optional proposed/existing replacement menu id." } }),
  },
  {
    name: "apply_confirmed_change",
    description: "Atomically apply a still-current pending impact after explicit user confirmation.",
    risk: "material_mutation",
    mutatesCommittedState: true,
    requiresExplicitConfirmation: true,
    inputSchema: schema(["eventId", "expectedRevision", "impactId", "confirmedAt"], { ...commonEvent, ...revision, impactId: { type: "string", description: "Impact id returned by analyse_change_impact." }, ...confirmedAt }),
  },
  {
    name: "get_action_history",
    description: "Read recent action receipts, audit events and currently safe reversible receipt ids.",
    risk: "read_only",
    mutatesCommittedState: false,
    requiresExplicitConfirmation: false,
    inputSchema: schema(["eventId"], { ...commonEvent, limit: { type: "integer", description: "Optional history limit, 1-100." } }),
  },
  {
    name: "undo_reversible_action",
    description: "Reverse the latest still-safe reversible action while retaining full receipt/audit history.",
    risk: "material_mutation",
    mutatesCommittedState: true,
    requiresExplicitConfirmation: true,
    inputSchema: schema(["eventId", "expectedRevision", "receiptId", "confirmedAt"], { ...commonEvent, ...revision, receiptId: { type: "string", description: "Reversible action receipt id." }, ...confirmedAt }),
  },
] as const;

export const HOST_TOOL_NAMES = HOST_TOOL_DESCRIPTORS.map((tool) => tool.name) as HostToolName[];
