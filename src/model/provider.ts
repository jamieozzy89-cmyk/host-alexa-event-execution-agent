import type { HostIntentKind, IntentContext, IntentInterpreter } from "../agent/types.js";
import { parseCustomerUnderstanding } from "./schema.js";
import type {
  CustomerIntentKind,
  CustomerUnderstanding,
  CustomerUnderstandingInterpreter,
  StructuredUnderstandingModel,
  UnderstandingContext,
} from "./types.js";

const LEGACY_TO_UNDERSTANDING: Record<HostIntentKind, CustomerIntentKind> = {
  create_event: "create_event",
  status: "status",
  next_action: "next_action",
  menu_options: "menu_options",
  choose_menu: "choose_menu",
  shopping: "shopping",
  products: "products",
  checkout: "checkout",
  prep: "prep",
  history: "history",
  change: "change",
  mark_task_complete: "mark_task_complete",
  undo: "undo",
  confirm: "confirm",
  cancel: "cancel",
  help: "help",
  unknown: "unknown",
};

function legacyContext(context: UnderstandingContext): IntentContext {
  return {
    hasEvent: context.hasEvent,
    ...(context.eventName ? { eventName: context.eventName } : {}),
    ...(context.guestCount !== undefined ? { guestCount: context.guestCount } : {}),
    ...(context.awaitingField ? { awaitingField: context.awaitingField } : {}),
    hasPendingConfirmation: context.hasPendingConfirmation,
    hasMenuOptions: Boolean(context.menuOptions?.length),
  };
}


function normalizeEvidenceText(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("en-GB").replace(/\s+/g, " ").trim();
}

function validateModelEvidence(understanding: CustomerUnderstanding, customerText: string): void {
  const normalizedText = normalizeEvidenceText(customerText);
  const evidenceValues = [
    ...understanding.intents.map((candidate) => candidate.evidence),
    ...understanding.constraints.map((candidate) => candidate.evidence),
    ...understanding.preferences.map((candidate) => candidate.evidence),
    ...(understanding.inventory.evidence ? [understanding.inventory.evidence] : []),
    ...understanding.inventory.items.map((candidate) => candidate.evidence),
    ...understanding.references.flatMap((candidate) => [candidate.text, candidate.evidence]),
    ...understanding.ambiguities.flatMap((candidate) => candidate.evidence ? [candidate.evidence] : []),
  ];
  for (const evidence of evidenceValues) {
    const normalizedEvidence = normalizeEvidenceText(evidence);
    if (!normalizedEvidence || !normalizedText.includes(normalizedEvidence)) {
      throw new Error("Model understanding evidence was not grounded in the customer input.");
    }
  }
}

export class ModelCustomerUnderstandingInterpreter implements CustomerUnderstandingInterpreter {
  constructor(private readonly model: StructuredUnderstandingModel) {}

  async understand(text: string, context: UnderstandingContext): Promise<CustomerUnderstanding> {
    const raw = await this.model.infer({ text, context });
    const understanding = parseCustomerUnderstanding(raw);
    validateModelEvidence(understanding, text);
    return understanding;
  }
}

export class LegacyIntentUnderstandingInterpreter implements CustomerUnderstandingInterpreter {
  constructor(private readonly legacy: IntentInterpreter) {}

  async understand(text: string, context: UnderstandingContext): Promise<CustomerUnderstanding> {
    const interpreted = await this.legacy.interpret(text, legacyContext(context));
    const mapped = LEGACY_TO_UNDERSTANDING[interpreted.kind] ?? "unknown";
    return {
      intents: [{ kind: mapped, confidence: interpreted.confidence, evidence: text.trim() || "empty input" }],
      eventFacts: {
        ...(interpreted.slots.name ? { name: interpreted.slots.name } : {}),
        ...(interpreted.slots.guestCount !== undefined ? { guestCount: interpreted.slots.guestCount } : {}),
        ...(interpreted.slots.guestDelta !== undefined ? { guestDelta: interpreted.slots.guestDelta } : {}),
        ...(interpreted.slots.budget !== undefined ? { budget: interpreted.slots.budget } : {}),
        ...(interpreted.slots.currency ? { currency: interpreted.slots.currency } : {}),
        ...(interpreted.slots.startText ? { startText: interpreted.slots.startText } : {}),
        ...(interpreted.slots.timezone ? { timezone: interpreted.slots.timezone } : {}),
      },
      constraints: (interpreted.slots.constraints ?? []).map((constraint) => ({
        type: constraint.type,
        value: constraint.value,
        scope: constraint.scope,
        confidence: interpreted.confidence,
        evidence: text.trim() || constraint.value,
      })),
      preferences: (interpreted.slots.preferences ?? []).map((value) => ({ value, confidence: interpreted.confidence, evidence: text.trim() || value })),
      inventory: { mode: "unspecified", items: [] },
      references: [],
      ambiguities: [],
      overallConfidence: interpreted.confidence,
    };
  }
}

function hasMeaningfulUnderstanding(understanding: CustomerUnderstanding): boolean {
  return (
    understanding.intents.some((intent) => intent.kind !== "unknown") ||
    Object.keys(understanding.eventFacts).length > 0 ||
    understanding.constraints.length > 0 ||
    understanding.preferences.length > 0 ||
    understanding.inventory.mode !== "unspecified" ||
    understanding.inventory.items.length > 0 ||
    understanding.references.length > 0 ||
    understanding.ambiguities.length > 0
  );
}

export class ResilientUnderstandingInterpreter implements CustomerUnderstandingInterpreter {
  constructor(
    private readonly preferred: CustomerUnderstandingInterpreter,
    private readonly fallback: CustomerUnderstandingInterpreter,
    private readonly minimumPreferredConfidence = 0.65,
  ) {
    if (!Number.isFinite(minimumPreferredConfidence) || minimumPreferredConfidence < 0 || minimumPreferredConfidence > 1) {
      throw new RangeError("minimumPreferredConfidence must be between 0 and 1.");
    }
  }

  async understand(text: string, context: UnderstandingContext): Promise<CustomerUnderstanding> {
    try {
      const preferred = await this.preferred.understand(text, context);
      if (preferred.overallConfidence >= this.minimumPreferredConfidence && hasMeaningfulUnderstanding(preferred)) return preferred;
      return this.fallback.understand(text, context);
    } catch {
      return this.fallback.understand(text, context);
    }
  }
}
