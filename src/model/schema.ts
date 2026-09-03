import type {
  CandidateConstraintType,
  CustomerIntentKind,
  CustomerUnderstanding,
  InventoryEvidenceKind,
  InventoryReviewMode,
  ReferenceKind,
} from "./types.js";

const MAX_TEXT = 500;
const MAX_INTENTS = 8;
const MAX_CONSTRAINTS = 16;
const MAX_PREFERENCES = 16;
const MAX_INVENTORY = 64;
const MAX_REFERENCES = 16;
const MAX_AMBIGUITIES = 8;

const INTENTS: readonly CustomerIntentKind[] = [
  "create_event", "status", "next_action", "menu_options", "choose_menu", "shopping", "products", "checkout",
  "prep", "history", "change", "mark_task_complete", "undo", "confirm", "cancel", "help", "provide_inventory",
  "update_preference", "unknown",
];
const CONSTRAINT_TYPES: readonly CandidateConstraintType[] = ["dietary", "allergen", "budget", "prep_time", "equipment"];
const INVENTORY_MODES: readonly InventoryReviewMode[] = ["none", "items", "unspecified"];
const INVENTORY_EVIDENCE: readonly InventoryEvidenceKind[] = ["stated_quantity", "enough", "identity_only"];
const REFERENCE_KINDS: readonly ReferenceKind[] = ["current_event", "menu_option", "current_task", "previous_change", "inventory_requirement"];

const nullableString = { type: ["string", "null"], maxLength: MAX_TEXT } as const;
const nullableNumber = { type: ["number", "null"] } as const;
const nullableInteger = { type: ["integer", "null"] } as const;
const boundedString = { type: "string", minLength: 1, maxLength: MAX_TEXT } as const;
const confidenceSchema = { type: "number", minimum: 0, maximum: 1 } as const;

export const CUSTOMER_UNDERSTANDING_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    intents: {
      type: "array", minItems: 1, maxItems: MAX_INTENTS,
      items: {
        type: "object", additionalProperties: false,
        properties: { kind: { type: "string", enum: INTENTS }, confidence: confidenceSchema, evidence: boundedString },
        required: ["kind", "confidence", "evidence"],
      },
    },
    eventFacts: {
      type: "object", additionalProperties: false,
      properties: {
        name: nullableString, guestCount: nullableInteger, guestDelta: nullableInteger, budget: nullableNumber,
        currency: nullableString, startText: nullableString, timezone: nullableString,
      },
      required: ["name", "guestCount", "guestDelta", "budget", "currency", "startText", "timezone"],
    },
    constraints: {
      type: "array", maxItems: MAX_CONSTRAINTS,
      items: {
        type: "object", additionalProperties: false,
        properties: {
          type: { type: "string", enum: CONSTRAINT_TYPES }, value: boundedString, scope: boundedString,
          confidence: confidenceSchema, evidence: boundedString,
        },
        required: ["type", "value", "scope", "confidence", "evidence"],
      },
    },
    preferences: {
      type: "array", maxItems: MAX_PREFERENCES,
      items: {
        type: "object", additionalProperties: false,
        properties: { value: boundedString, confidence: confidenceSchema, evidence: boundedString },
        required: ["value", "confidence", "evidence"],
      },
    },
    inventory: {
      type: "object", additionalProperties: false,
      properties: {
        mode: { type: "string", enum: INVENTORY_MODES },
        evidence: nullableString,
        items: {
          type: "array", maxItems: MAX_INVENTORY,
          items: {
            type: "object", additionalProperties: false,
            properties: {
              name: boundedString,
              evidenceKind: { type: "string", enum: INVENTORY_EVIDENCE },
              quantity: nullableNumber,
              unit: nullableString,
              confidence: confidenceSchema,
              evidence: boundedString,
            },
            required: ["name", "evidenceKind", "quantity", "unit", "confidence", "evidence"],
          },
        },
      },
      required: ["mode", "evidence", "items"],
    },
    references: {
      type: "array", maxItems: MAX_REFERENCES,
      items: {
        type: "object", additionalProperties: false,
        properties: {
          kind: { type: "string", enum: REFERENCE_KINDS }, text: boundedString, ordinal: nullableInteger,
          name: nullableString, confidence: confidenceSchema, evidence: boundedString,
        },
        required: ["kind", "text", "ordinal", "name", "confidence", "evidence"],
      },
    },
    ambiguities: {
      type: "array", maxItems: MAX_AMBIGUITIES,
      items: {
        type: "object", additionalProperties: false,
        properties: { field: boundedString, reason: boundedString, question: boundedString, evidence: nullableString },
        required: ["field", "reason", "question", "evidence"],
      },
    },
    overallConfidence: confidenceSchema,
  },
  required: ["intents", "eventFacts", "constraints", "preferences", "inventory", "references", "ambiguities", "overallConfidence"],
} as const;

function record(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new TypeError(`${label} must be an object.`);
  return value as Record<string, unknown>;
}
function exactKeys(value: Record<string, unknown>, allowed: readonly string[], label: string): void {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new TypeError(`${label} contains unsupported field ${key}.`);
}
function text(value: unknown, label: string): string {
  if (typeof value !== "string") throw new TypeError(`${label} must be a string.`);
  const normalized = value.trim();
  if (!normalized) throw new TypeError(`${label} must not be empty.`);
  if (normalized.length > MAX_TEXT) throw new RangeError(`${label} exceeds ${MAX_TEXT} characters.`);
  return normalized;
}
function optionalText(value: unknown, label: string): string | undefined {
  if (value === undefined || value === null) return undefined;
  return text(value, label);
}
function numberValue(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new TypeError(`${label} must be a finite number.`);
  return value;
}
function optionalNumber(value: unknown, label: string): number | undefined {
  if (value === undefined || value === null) return undefined;
  return numberValue(value, label);
}
function confidence(value: unknown, label: string): number {
  const parsed = numberValue(value, label);
  if (parsed < 0 || parsed > 1) throw new RangeError(`${label} must be between 0 and 1.`);
  return parsed;
}
function integer(value: unknown, label: string): number {
  const parsed = numberValue(value, label);
  if (!Number.isInteger(parsed)) throw new TypeError(`${label} must be an integer.`);
  return parsed;
}
function optionalInteger(value: unknown, label: string): number | undefined {
  if (value === undefined || value === null) return undefined;
  return integer(value, label);
}
function array(value: unknown, max: number, label: string, min = 0): unknown[] {
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array.`);
  if (value.length < min) throw new RangeError(`${label} must contain at least ${min} item(s).`);
  if (value.length > max) throw new RangeError(`${label} exceeds ${max} items.`);
  return value;
}
function enumValue<T extends string>(value: unknown, allowed: readonly T[], label: string): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) throw new TypeError(`${label} is unsupported.`);
  return value as T;
}

export function parseCustomerUnderstanding(value: unknown): CustomerUnderstanding {
  const root = record(value, "CustomerUnderstanding");
  exactKeys(root, ["intents", "eventFacts", "constraints", "preferences", "inventory", "references", "ambiguities", "overallConfidence"], "CustomerUnderstanding");

  const intents = array(root.intents, MAX_INTENTS, "intents", 1).map((entry, index) => {
    const item = record(entry, `intents[${index}]`);
    exactKeys(item, ["kind", "confidence", "evidence"], `intents[${index}]`);
    return { kind: enumValue(item.kind, INTENTS, `intents[${index}].kind`), confidence: confidence(item.confidence, `intents[${index}].confidence`), evidence: text(item.evidence, `intents[${index}].evidence`) };
  });

  const eventRecord = record(root.eventFacts, "eventFacts");
  exactKeys(eventRecord, ["name", "guestCount", "guestDelta", "budget", "currency", "startText", "timezone"], "eventFacts");
  const guestCount = optionalInteger(eventRecord.guestCount, "eventFacts.guestCount");
  if (guestCount !== undefined && guestCount <= 0) throw new RangeError("eventFacts.guestCount must be positive.");
  const guestDelta = optionalInteger(eventRecord.guestDelta, "eventFacts.guestDelta");
  if (guestDelta === 0) throw new RangeError("eventFacts.guestDelta must not be zero.");
  const budget = optionalNumber(eventRecord.budget, "eventFacts.budget");
  if (budget !== undefined && budget < 0) throw new RangeError("eventFacts.budget must not be negative.");
  const eventName = optionalText(eventRecord.name, "eventFacts.name");
  const currency = optionalText(eventRecord.currency, "eventFacts.currency");
  const startText = optionalText(eventRecord.startText, "eventFacts.startText");
  const timezone = optionalText(eventRecord.timezone, "eventFacts.timezone");
  const eventFacts = {
    ...(eventName ? { name: eventName } : {}),
    ...(guestCount !== undefined ? { guestCount } : {}),
    ...(guestDelta !== undefined ? { guestDelta } : {}),
    ...(budget !== undefined ? { budget } : {}),
    ...(currency ? { currency } : {}),
    ...(startText ? { startText } : {}),
    ...(timezone ? { timezone } : {}),
  };

  const constraints = array(root.constraints, MAX_CONSTRAINTS, "constraints").map((entry, index) => {
    const item = record(entry, `constraints[${index}]`);
    exactKeys(item, ["type", "value", "scope", "confidence", "evidence"], `constraints[${index}]`);
    return { type: enumValue(item.type, CONSTRAINT_TYPES, `constraints[${index}].type`), value: text(item.value, `constraints[${index}].value`), scope: text(item.scope, `constraints[${index}].scope`), confidence: confidence(item.confidence, `constraints[${index}].confidence`), evidence: text(item.evidence, `constraints[${index}].evidence`) };
  });

  const preferences = array(root.preferences, MAX_PREFERENCES, "preferences").map((entry, index) => {
    const item = record(entry, `preferences[${index}]`);
    exactKeys(item, ["value", "confidence", "evidence"], `preferences[${index}]`);
    return { value: text(item.value, `preferences[${index}].value`), confidence: confidence(item.confidence, `preferences[${index}].confidence`), evidence: text(item.evidence, `preferences[${index}].evidence`) };
  });

  const inventoryRecord = record(root.inventory, "inventory");
  exactKeys(inventoryRecord, ["mode", "evidence", "items"], "inventory");
  const mode = enumValue(inventoryRecord.mode, INVENTORY_MODES, "inventory.mode");
  const inventoryEvidence = optionalText(inventoryRecord.evidence, "inventory.evidence");
  const inventoryItems = array(inventoryRecord.items, MAX_INVENTORY, "inventory.items").map((entry, index) => {
    const item = record(entry, `inventory.items[${index}]`);
    exactKeys(item, ["name", "evidenceKind", "quantity", "unit", "confidence", "evidence"], `inventory.items[${index}]`);
    const evidenceKind = enumValue(item.evidenceKind, INVENTORY_EVIDENCE, `inventory.items[${index}].evidenceKind`);
    const quantity = optionalNumber(item.quantity, `inventory.items[${index}].quantity`);
    const unit = optionalText(item.unit, `inventory.items[${index}].unit`);
    if (evidenceKind === "stated_quantity") {
      if (quantity === undefined || quantity <= 0 || !unit) throw new TypeError(`inventory.items[${index}] stated_quantity requires positive quantity and unit.`);
    } else if (quantity !== undefined || unit !== undefined) {
      throw new TypeError(`inventory.items[${index}] ${evidenceKind} must not invent quantity or unit.`);
    }
    return { name: text(item.name, `inventory.items[${index}].name`), evidenceKind, ...(quantity !== undefined ? { quantity } : {}), ...(unit ? { unit } : {}), confidence: confidence(item.confidence, `inventory.items[${index}].confidence`), evidence: text(item.evidence, `inventory.items[${index}].evidence`) };
  });
  if (mode === "unspecified" && (inventoryEvidence !== undefined || inventoryItems.length > 0)) throw new TypeError("inventory unspecified mode must not carry evidence or items.");
  if (mode === "none" && (!inventoryEvidence || inventoryItems.length !== 0)) throw new TypeError("inventory none mode requires evidence and zero items.");
  if (mode === "items" && (!inventoryEvidence || inventoryItems.length === 0)) throw new TypeError("inventory items mode requires evidence and at least one item.");

  const references = array(root.references, MAX_REFERENCES, "references").map((entry, index) => {
    const item = record(entry, `references[${index}]`);
    exactKeys(item, ["kind", "text", "ordinal", "name", "confidence", "evidence"], `references[${index}]`);
    const ordinal = optionalInteger(item.ordinal, `references[${index}].ordinal`);
    if (ordinal !== undefined && ordinal <= 0) throw new RangeError(`references[${index}].ordinal must be positive.`);
    const name = optionalText(item.name, `references[${index}].name`);
    return { kind: enumValue(item.kind, REFERENCE_KINDS, `references[${index}].kind`), text: text(item.text, `references[${index}].text`), ...(ordinal !== undefined ? { ordinal } : {}), ...(name ? { name } : {}), confidence: confidence(item.confidence, `references[${index}].confidence`), evidence: text(item.evidence, `references[${index}].evidence`) };
  });

  const ambiguities = array(root.ambiguities, MAX_AMBIGUITIES, "ambiguities").map((entry, index) => {
    const item = record(entry, `ambiguities[${index}]`);
    exactKeys(item, ["field", "reason", "question", "evidence"], `ambiguities[${index}]`);
    const evidence = optionalText(item.evidence, `ambiguities[${index}].evidence`);
    return { field: text(item.field, `ambiguities[${index}].field`), reason: text(item.reason, `ambiguities[${index}].reason`), question: text(item.question, `ambiguities[${index}].question`), ...(evidence ? { evidence } : {}) };
  });

  return {
    intents,
    eventFacts,
    constraints,
    preferences,
    inventory: { mode, ...(inventoryEvidence ? { evidence: inventoryEvidence } : {}), items: inventoryItems },
    references,
    ambiguities,
    overallConfidence: confidence(root.overallConfidence, "overallConfidence"),
  };
}
