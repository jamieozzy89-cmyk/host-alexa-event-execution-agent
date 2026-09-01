import type { Constraint, EventStatus, InventoryItem } from "../domain/types.js";
import { ToolInputError } from "./errors.js";

export function asObject(value: unknown, tool: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ToolInputError(`${tool} input must be an object.`);
  }
  return value as Record<string, unknown>;
}

export function requireString(input: Record<string, unknown>, field: string): string {
  const value = input[field];
  if (typeof value !== "string" || value.trim().length === 0) throw new ToolInputError(`${field} must be a non-empty string.`);
  return value;
}

export function optionalString(input: Record<string, unknown>, field: string): string | undefined {
  const value = input[field];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.trim().length === 0) throw new ToolInputError(`${field} must be a non-empty string when provided.`);
  return value;
}

export function requireDateString(input: Record<string, unknown>, field: string): string {
  const value = requireString(input, field);
  if (Number.isNaN(Date.parse(value))) throw new ToolInputError(`${field} must be a valid date/time string.`);
  return value;
}

export function optionalDateString(input: Record<string, unknown>, field: string): string | undefined {
  const value = optionalString(input, field);
  if (value !== undefined && Number.isNaN(Date.parse(value))) throw new ToolInputError(`${field} must be a valid date/time string when provided.`);
  return value;
}

export function requireFiniteNumber(input: Record<string, unknown>, field: string, minimum?: number): number {
  const value = input[field];
  if (typeof value !== "number" || !Number.isFinite(value) || (minimum !== undefined && value < minimum)) {
    throw new ToolInputError(`${field} must be a finite number${minimum !== undefined ? ` >= ${minimum}` : ""}.`);
  }
  return value;
}

export function requirePositiveInteger(input: Record<string, unknown>, field: string): number {
  const value = input[field];
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) throw new ToolInputError(`${field} must be a positive integer.`);
  return value;
}

export function optionalPositiveInteger(input: Record<string, unknown>, field: string): number | undefined {
  if (input[field] === undefined) return undefined;
  return requirePositiveInteger(input, field);
}

function requireBooleanRecordValue(record: Record<string, unknown>, field: string): boolean {
  const value = record[field];
  if (typeof value !== "boolean") throw new ToolInputError(`${field} must be a boolean.`);
  return value;
}

export function parseConstraints(value: unknown, field = "constraints"): Constraint[] {
  if (!Array.isArray(value)) throw new ToolInputError(`${field} must be an array.`);
  return value.map((entry, index) => {
    const record = asObject(entry, `${field}[${index}]`);
    const type = requireString(record, "type");
    if (!["dietary", "allergen", "budget", "prep_time", "equipment"].includes(type)) {
      throw new ToolInputError(`${field}[${index}].type is invalid.`);
    }
    const source = requireString(record, "source");
    if (!["user", "agent", "system"].includes(source)) throw new ToolInputError(`${field}[${index}].source is invalid.`);
    return {
      id: requireString(record, "id"),
      type: type as Constraint["type"],
      value: requireString(record, "value"),
      scope: requireString(record, "scope"),
      source: source as Constraint["source"],
      confirmed: requireBooleanRecordValue(record, "confirmed"),
    };
  });
}

export function parseInventory(value: unknown): InventoryItem[] {
  if (!Array.isArray(value)) throw new ToolInputError("items must be an array.");
  return value.map((entry, index) => {
    const record = asObject(entry, `items[${index}]`);
    const source = requireString(record, "source");
    if (!["user", "system"].includes(source)) throw new ToolInputError(`items[${index}].source is invalid.`);
    const confirmedAt = requireString(record, "confirmedAt");
    if (Number.isNaN(Date.parse(confirmedAt))) throw new ToolInputError(`items[${index}].confirmedAt must be a valid date/time string.`);
    return {
      itemId: requireString(record, "itemId"),
      name: requireString(record, "name"),
      quantity: requireFiniteNumber(record, "quantity", 0),
      unit: requireString(record, "unit"),
      confirmedAt,
      source: source as InventoryItem["source"],
    };
  });
}

export function parseEventStatus(value: unknown): EventStatus {
  if (typeof value !== "string" || !["draft", "planned", "sourcing", "preparing", "live", "complete", "cancelled"].includes(value)) {
    throw new ToolInputError("nextStatus is invalid.");
  }
  return value as EventStatus;
}

export function assertOnlyFields(input: Record<string, unknown>, allowed: string[], tool: string): void {
  const allowedSet = new Set(allowed);
  const extras = Object.keys(input).filter((key) => !allowedSet.has(key));
  if (extras.length > 0) throw new ToolInputError(`${tool} received unsupported field(s): ${extras.join(", ")}.`);
}
