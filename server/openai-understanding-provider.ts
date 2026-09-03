import { CUSTOMER_UNDERSTANDING_JSON_SCHEMA } from "../src/model/schema.js";
import type { StructuredUnderstandingModel, UnderstandingInput } from "../src/model/types.js";

export interface OpenAIResponsesUnderstandingOptions {
  apiKey: string;
  model: string;
  endpoint?: string;
  timeoutMs?: number;
  maxOutputTokens?: number;
  maxInputCharacters?: number;
  fetchImpl?: typeof fetch;
}

function outputTextFromResponse(value: unknown): string {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("OpenAI response was not an object.");
  const record = value as Record<string, unknown>;
  if (record.error !== undefined && record.error !== null) throw new Error("OpenAI response contained an API error.");
  if (record.status !== "completed") throw new Error(`OpenAI response did not complete successfully (status: ${String(record.status)}).`);
  if (!Array.isArray(record.output)) throw new Error("OpenAI response did not contain output items.");
  const outputTexts: string[] = [];
  for (const item of record.output) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) continue;
    const itemRecord = item as Record<string, unknown>;
    if (itemRecord.type !== "message" || !Array.isArray(itemRecord.content)) continue;
    for (const content of itemRecord.content) {
      if (typeof content !== "object" || content === null || Array.isArray(content)) continue;
      const contentRecord = content as Record<string, unknown>;
      if (contentRecord.type === "refusal") throw new Error("OpenAI model refused the structured understanding request.");
      if (contentRecord.type === "output_text" && typeof contentRecord.text === "string" && contentRecord.text.trim()) outputTexts.push(contentRecord.text);
    }
  }
  if (outputTexts.length === 0) throw new Error("OpenAI response contained no structured output text.");
  if (outputTexts.length !== 1) throw new Error("OpenAI response contained multiple structured output payloads.");
  return outputTexts[0]!;
}

const INSTRUCTIONS = [
  "Extract customer meaning for the Host home-event execution agent.",
  "Return only the requested strict schema.",
  "All outputs are non-authoritative candidates; never invent confirmation, IDs, tool names, purchases, safety claims or quantities.",
  "Use inventory evidenceKind identity_only when an item is named without amount/coverage.",
  "Use enough only when the customer explicitly states they have enough of that item.",
  "Use stated_quantity only when the customer explicitly states a quantity and unit.",
  "Every evidence field and reference text must quote an exact span from the customer input; never paraphrase evidence.",
  "Inventory mode none or items requires inventory evidence quoted from the customer input.",
  "Represent material uncertainty in ambiguities with one bounded clarification question.",
  "Multiple customer intents may be returned in utterance order.",
].join(" ");

export class OpenAIResponsesUnderstandingModel implements StructuredUnderstandingModel {
  private readonly endpoint: string;
  private readonly timeoutMs: number;
  private readonly maxOutputTokens: number;
  private readonly maxInputCharacters: number;
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: OpenAIResponsesUnderstandingOptions) {
    if (!options.apiKey.trim()) throw new Error("OpenAI API key is required.");
    if (!options.model.trim()) throw new Error("OpenAI model is required.");
    this.endpoint = options.endpoint?.trim() || "https://api.openai.com/v1/responses";
    this.timeoutMs = options.timeoutMs ?? 12_000;
    if (!Number.isFinite(this.timeoutMs) || this.timeoutMs <= 0) throw new RangeError("timeoutMs must be positive.");
    this.maxOutputTokens = options.maxOutputTokens ?? 4_000;
    if (!Number.isInteger(this.maxOutputTokens) || this.maxOutputTokens <= 0) throw new RangeError("maxOutputTokens must be a positive integer.");
    this.maxInputCharacters = options.maxInputCharacters ?? 8_000;
    if (!Number.isInteger(this.maxInputCharacters) || this.maxInputCharacters <= 0) throw new RangeError("maxInputCharacters must be a positive integer.");
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async infer(input: UnderstandingInput): Promise<unknown> {
    if (input.text.length > this.maxInputCharacters) throw new Error(`Customer input exceeds the ${this.maxInputCharacters}-character model-understanding limit.`);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImpl(this.endpoint, {
        method: "POST",
        headers: { authorization: `Bearer ${this.options.apiKey}`, "content-type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.options.model,
          store: false,
          max_output_tokens: this.maxOutputTokens,
          instructions: INSTRUCTIONS,
          input: JSON.stringify(input),
          text: { format: { type: "json_schema", name: "host_customer_understanding", strict: true, schema: CUSTOMER_UNDERSTANDING_JSON_SCHEMA } },
        }),
      });
      if (!response.ok) throw new Error(`OpenAI Responses request failed with HTTP ${response.status}.`);
      const text = outputTextFromResponse(await response.json() as unknown);
      try { return JSON.parse(text) as unknown; }
      catch { throw new Error("OpenAI structured output text was not valid JSON."); }
    } finally { clearTimeout(timer); }
  }
}
