import type { AgentAction, AgentCard, AgentReply } from "../src/application/index.js";

export type ViewMode = "conversation" | "live" | "activity";

export type VoiceSessionStatus = "unavailable" | "idle" | "listening" | "processing" | "speaking" | "error";

export interface VoiceUiState {
  supported: boolean;
  active: boolean;
  status: VoiceSessionStatus;
  message: string;
  lastHeard?: string;
  lastSpoken?: string;
}

export interface TranscriptEntry {
  id: string;
  role: "user" | "assistant";
  text: string;
  reply?: AgentReply;
}

export interface LatestCards {
  event?: Extract<AgentCard, { type: "event_summary" }>;
  menu?: Extract<AgentCard, { type: "menu_options" }>;
  shopping?: Extract<AgentCard, { type: "shopping_list" }>;
  products?: Extract<AgentCard, { type: "product_choices" }>;
  prep?: Extract<AgentCard, { type: "prep_timeline" }>;
  impact?: Extract<AgentCard, { type: "change_impact" }>;
  history?: Extract<AgentCard, { type: "history" }>;
  error?: Extract<AgentCard, { type: "error" }>;
}

export type BrowserStorageMode = "persistent" | "memory";

export interface HostUiState {
  transcript: TranscriptEntry[];
  latest: LatestCards;
  mode: ViewMode;
  busy: boolean;
  voice: VoiceUiState;
  storageMode: BrowserStorageMode;
  clearDataPending: boolean;
  recoveryNotice?: string;
  dialogReturnFocusKey?: string;
  expandedCard?: AgentCard;
  liveReply?: AgentReply;
  activityReply?: AgentReply;
}

export type ActionHandler = (action: AgentAction) => Promise<void>;
