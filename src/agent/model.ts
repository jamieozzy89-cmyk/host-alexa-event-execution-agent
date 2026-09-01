import type { Constraint } from "../domain/types.js";
import type { HostIntentKind, HostIntentSlots, IntentContext, IntentInterpreter, InterpretedHostIntent, StructuredIntentModel } from "./types.js";

const INTENTS: HostIntentKind[] = [
  "create_event", "status", "next_action", "menu_options", "shopping", "products", "checkout", "prep",
  "history", "change", "mark_task_complete", "undo", "confirm", "cancel", "help", "unknown",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function optionalNumber(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function parseConstraint(value: unknown): Constraint | undefined {
  if (!isRecord(value)) return undefined;
  const type = optionalString(value, "type");
  const source = optionalString(value, "source");
  const id = optionalString(value, "id");
  const constraintValue = optionalString(value, "value");
  const scope = optionalString(value, "scope");
  if (!id || !constraintValue || !scope || !type || !["dietary", "allergen", "budget", "prep_time", "equipment"].includes(type)) return undefined;
  if (!source || !["user", "agent", "system"].includes(source) || typeof value.confirmed !== "boolean") return undefined;
  return { id, type: type as Constraint["type"], value: constraintValue, scope, source: source as Constraint["source"], confirmed: value.confirmed };
}

function parseSlots(value: unknown): HostIntentSlots {
  if (!isRecord(value)) return {};
  const slots: HostIntentSlots = {};
  const name = optionalString(value, "name");
  const guestCount = optionalNumber(value, "guestCount");
  const guestDelta = optionalNumber(value, "guestDelta");
  const budget = optionalNumber(value, "budget");
  const currency = optionalString(value, "currency");
  const startText = optionalString(value, "startText");
  const timezone = optionalString(value, "timezone");
  const taskId = optionalString(value, "taskId");
  if (name) slots.name = name;
  if (guestCount !== undefined && Number.isInteger(guestCount) && guestCount > 0) slots.guestCount = guestCount;
  if (guestDelta !== undefined && Number.isInteger(guestDelta) && guestDelta !== 0) slots.guestDelta = guestDelta;
  if (budget !== undefined && budget >= 0) slots.budget = budget;
  if (currency) slots.currency = currency;
  if (startText) slots.startText = startText;
  if (timezone) slots.timezone = timezone;
  if (taskId) slots.taskId = taskId;
  if (Array.isArray(value.preferences)) {
    const preferences = value.preferences.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
    if (preferences.length) slots.preferences = preferences;
  }
  if (Array.isArray(value.constraints)) {
    const constraints = value.constraints.map(parseConstraint).filter((entry): entry is Constraint => Boolean(entry));
    if (constraints.length) slots.constraints = constraints;
  }
  return slots;
}

export class ModelBackedIntentInterpreter implements IntentInterpreter {
  constructor(private readonly model: StructuredIntentModel) {}

  async interpret(text: string, context: IntentContext): Promise<InterpretedHostIntent> {
    const raw = await this.model.infer({ text, context });
    if (!isRecord(raw)) throw new Error("Intent model returned a non-object result.");
    const kind = raw.kind;
    if (typeof kind !== "string" || !INTENTS.includes(kind as HostIntentKind)) throw new Error("Intent model returned an unsupported intent.");
    const confidence = typeof raw.confidence === "number" && Number.isFinite(raw.confidence)
      ? Math.max(0, Math.min(1, raw.confidence))
      : 0.5;
    return { kind: kind as HostIntentKind, confidence, slots: parseSlots(raw.slots) };
  }
}

export class ResilientIntentInterpreter implements IntentInterpreter {
  constructor(private readonly preferred: IntentInterpreter, private readonly fallback: IntentInterpreter) {}

  async interpret(text: string, context: IntentContext): Promise<InterpretedHostIntent> {
    try {
      const preferred = await this.preferred.interpret(text, context);
      if (preferred.kind !== "unknown" && preferred.confidence >= 0.65) return preferred;
      const fallback = await this.fallback.interpret(text, context);
      return fallback.confidence > preferred.confidence ? fallback : preferred;
    } catch {
      return this.fallback.interpret(text, context);
    }
  }
}

export class JsonModelProxyAdapter implements StructuredIntentModel {
  constructor(private readonly endpoint: string, private readonly fetchImpl: typeof fetch = fetch) {
    if (!endpoint.trim()) throw new Error("Model proxy endpoint is required.");
  }

  async infer(input: { text: string; context: IntentContext }): Promise<unknown> {
    const response = await this.fetchImpl(this.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error(`Model proxy request failed with HTTP ${response.status}.`);
    return response.json();
  }
}
