import type { Constraint } from "../domain/types.js";
import type { HostIntentSlots, IntentContext, IntentInterpreter, InterpretedHostIntent } from "./types.js";

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
};

function countFromText(text: string): number | undefined {
  const digit = text.match(/\b(\d{1,3})\s+(?:people|guests?)\b/i);
  if (digit) return Number(digit[1]);
  for (const [word, value] of Object.entries(NUMBER_WORDS)) {
    if (new RegExp(`\\b${word}\\s+(?:people|guests?)\\b`, "i").test(text)) return value;
  }
  return undefined;
}

function budgetFromText(text: string): number | undefined {
  const currency = text.match(/£\s*(\d+(?:\.\d{1,2})?)/);
  if (currency) return Number(currency[1]);
  const budget = text.match(/\bbudget(?:\s+(?:is|of|around|about))?\s*(\d+(?:\.\d{1,2})?)/i);
  return budget ? Number(budget[1]) : undefined;
}

function constraint(id: string, type: Constraint["type"], value: string, scope = "guest"): Constraint {
  return { id, type, value, scope, source: "user", confirmed: true };
}

export function constraintsFromText(text: string): Constraint[] {
  const lower = text.toLowerCase();
  const constraints: Constraint[] = [];
  if (/\bvegan\b/.test(lower)) constraints.push(constraint("diet-vegan", "dietary", "vegan guest"));
  if (/\bvegetarian\b/.test(lower)) constraints.push(constraint("diet-vegetarian", "dietary", "vegetarian guest"));
  if (/\bnut(?:s)?\s+(?:allergy|allergic)|allergic\s+to\s+nuts?/.test(lower)) {
    constraints.push(constraint("allergen-nuts", "allergen", "nuts", "all guests"));
  }
  return constraints;
}

function hasDateSignal(text: string): boolean {
  return /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|today|tomorrow|january|february|march|april|may|june|july|august|september|october|november|december)\b|\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/i.test(text);
}

function eventNameFromText(text: string): string | undefined {
  if (/birthday/i.test(text)) return "Birthday gathering";
  if (/brunch/i.test(text)) return "Brunch at home";
  if (/lunch/i.test(text)) return "Lunch at home";
  if (/dinner|supper/i.test(text)) return "Dinner at home";
  if (/party/i.test(text)) return "Party at home";
  return undefined;
}

function baseSlots(text: string): HostIntentSlots {
  const slots: HostIntentSlots = {};
  const guestCount = countFromText(text);
  if (guestCount !== undefined) slots.guestCount = guestCount;
  const budget = budgetFromText(text);
  if (budget !== undefined) slots.budget = budget;
  const constraints = constraintsFromText(text);
  if (constraints.length) slots.constraints = constraints;
  if (hasDateSignal(text)) slots.startText = text;
  const name = eventNameFromText(text);
  if (name) slots.name = name;
  if (/limited same[- ]day cooking|not much cooking on the day|minimal cooking on the day/i.test(text)) {
    slots.preferences = ["limited same-day cooking"];
  }
  if (/\bGBP\b|£/i.test(text)) slots.currency = "GBP";
  return slots;
}

function result(kind: InterpretedHostIntent["kind"], confidence: number, slots: HostIntentSlots = {}): InterpretedHostIntent {
  return { kind, confidence, slots };
}

export class HeuristicIntentInterpreter implements IntentInterpreter {
  async interpret(text: string, context: IntentContext): Promise<InterpretedHostIntent> {
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();
    if (!trimmed) return result("unknown", 0, {});

    if (/^(yes|yep|yeah|confirm|confirmed|do it|go ahead|okay|ok|please do)$/i.test(trimmed)) return result("confirm", 0.99);
    if (/^(no|nope|cancel|stop|leave it|never mind|nevermind)$/i.test(trimmed)) return result("cancel", 0.99);

    if (/\bundo\b|\brevert\b|\bgo back\b/.test(lower)) return result("undo", 0.98);
    if (/\b(?:checkout|purchase|place (?:the )?order|buy (?:them|it|these))\b/.test(lower)) return result("checkout", 0.96);
    if (/\b(?:history|activity|what changed|what did you change|did you actually|action log)\b/.test(lower)) return result("history", 0.95);
    if (/\b(?:what(?:'s| is) next|next action|what should i do next)\b/.test(lower)) return result("next_action", 0.95);
    if (/\b(?:status|how(?:'s| is) it going|what(?:'s| is) still left|what remains|are we ready)\b/.test(lower)) return result("status", 0.94);
    if (/\b(?:shopping list|what (?:do )?i need to buy|make (?:the|my) shopping|build (?:the|my) shopping)\b/.test(lower)) return result("shopping", 0.96);
    if (/\b(?:find products|product choices|choose products|prepare (?:the )?cart|show products)\b/.test(lower)) return result("products", 0.96);
    if (/\b(?:prep plan|preparation plan|plan my prep|plan the prep|prep schedule|preparation schedule)\b/.test(lower)) return result("prep", 0.96);

    if (context.hasEvent && context.hasMenuOptions && /\b(?:choose|pick|select|use)\b/.test(lower)) {
      const numbered = lower.match(/\b(?:option|menu)?\s*(1|2|3)\b/);
      const wordIndex = /\b(?:first|one)\b/.test(lower) ? 1 : /\b(?:second|two)\b/.test(lower) ? 2 : /\b(?:third|three)\b/.test(lower) ? 3 : undefined;
      const menuIndex = numbered ? Number(numbered[1]) : wordIndex;
      return result("choose_menu", 0.97, menuIndex ? { menuIndex } : {});
    }

    if (/\b(?:menu|meal ideas|food ideas|what should we eat|show.*meals)\b/.test(lower)) return result("menu_options", 0.95);

    const changeSlots = baseSlots(trimmed);
    if (context.hasEvent && /\b(?:another guest|one more guest|extra guest|now \d+ guests?|change|actually|vegan|vegetarian|allergy)\b/.test(lower)) {
      if (/\b(?:another|one more|extra) guest\b/.test(lower)) {
        delete changeSlots.guestCount;
        changeSlots.guestDelta = 1;
      }
      return result("change", 0.94, changeSlots);
    }

    if (/\b(?:done|finished|complete)\b/.test(lower) && context.hasEvent) return result("mark_task_complete", 0.72, baseSlots(trimmed));

    if (!context.hasEvent && /\b(?:hosting|host|dinner|supper|party|brunch|lunch|people coming|guests coming)\b/.test(lower)) {
      return result("create_event", 0.93, baseSlots(trimmed));
    }

    if (/\bhelp\b|what can you do/.test(lower)) return result("help", 0.95);
    return result("unknown", 0.35, baseSlots(trimmed));
  }
}
