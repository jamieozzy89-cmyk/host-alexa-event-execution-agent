import { HeuristicIntentInterpreter } from "../src/agent/interpreter.js";
import {
  LegacyIntentUnderstandingInterpreter,
  ModelCustomerUnderstandingInterpreter,
  ResilientUnderstandingInterpreter,
} from "../src/model/provider.js";
import type { CustomerUnderstandingInterpreter } from "../src/model/types.js";
import { OpenAIResponsesUnderstandingModel } from "./openai-understanding-provider.js";

export interface HostServerModelConfig {
  provider: "openai";
  apiKey: string;
  model: string;
  endpoint?: string;
  timeoutMs?: number;
  maxOutputTokens?: number;
  maxInputCharacters?: number;
  fetchImpl?: typeof fetch;
}

/** Server-only factory. Do not import this module into the browser runtime. */
export function createServerUnderstandingInterpreter(config: HostServerModelConfig): CustomerUnderstandingInterpreter {
  const preferredModel = new OpenAIResponsesUnderstandingModel({
    apiKey: config.apiKey,
    model: config.model,
    ...(config.endpoint ? { endpoint: config.endpoint } : {}),
    ...(config.timeoutMs !== undefined ? { timeoutMs: config.timeoutMs } : {}),
    ...(config.maxOutputTokens !== undefined ? { maxOutputTokens: config.maxOutputTokens } : {}),
    ...(config.maxInputCharacters !== undefined ? { maxInputCharacters: config.maxInputCharacters } : {}),
    ...(config.fetchImpl ? { fetchImpl: config.fetchImpl } : {}),
  });
  return new ResilientUnderstandingInterpreter(
    new ModelCustomerUnderstandingInterpreter(preferredModel),
    new LegacyIntentUnderstandingInterpreter(new HeuristicIntentInterpreter()),
  );
}
