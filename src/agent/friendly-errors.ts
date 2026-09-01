import type { HostToolFailure } from "../tools/types.js";

interface FriendlyFailure { message: string; retryable: boolean; }

const MESSAGES: Record<string, string> = {
  EVENT_ALREADY_EXISTS: "That event already exists, so I didn't create a duplicate.",
  EVENT_NOT_FOUND: "I can't find that event yet.",
  STALE_REVISION: "The plan changed while I was working. I refreshed it instead of overwriting newer information.",
  MENU_CONSTRAINT_CONFLICT: "That menu no longer fits the confirmed guest requirements.",
  MENU_SERVINGS_INSUFFICIENT: "That menu does not cover everyone on the current guest list.",
  NO_COMPATIBLE_MENU: "I couldn't find a menu that fits the confirmed requirements yet.",
  CART_NOT_READY: "The demo cart isn't ready yet. I need to finish the product choices first.",
  SIMULATED_CHECKOUT_FAILED: "The simulated checkout didn't go through. Nothing was marked as purchased.",
  SIMULATED_CHECKOUT_ADAPTER_ERROR: "The simulated checkout hit a temporary problem. Nothing was marked as purchased.",
  CART_RESULT_INVALID: "The simulated checkout returned inconsistent information, so I rejected it and left the shopping list unchanged.",
  UNKNOWN_CHANGE_IMPACT: "That proposed change is no longer current. I need to check the plan again before applying it.",
  PERSISTENCE_CHECKPOINT_FAILED: "I couldn't save that change safely, so I rolled it back.",
  TOOL_NOT_FOUND: "That action isn't available in Host.",
  INVALID_TOOL_INPUT: "I couldn't use that information as entered. Please check it and try again.",
};

export function friendlyToolFailure(result: HostToolFailure): FriendlyFailure {
  return {
    message: MESSAGES[result.error.code] ?? (result.error.retryable
      ? "That didn't complete, and I haven't treated it as done. Please try again."
      : "I couldn't complete that safely, so I left the plan unchanged."),
    retryable: result.error.retryable,
  };
}
