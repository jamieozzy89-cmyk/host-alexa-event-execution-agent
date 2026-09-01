import type { VoiceUiState } from "./types.js";

type RecognitionResultEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type RecognitionError = {
  error: string;
};

interface RecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: RecognitionError) => void) | null;
  onend: (() => void) | null;
  start(): void;
  abort(): void;
}

type RecognitionConstructor = new () => RecognitionLike;

type SpeechUtteranceLike = {
  text: string;
  lang: string;
  rate: number;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechUtteranceConstructor = new (text: string) => SpeechUtteranceLike;

interface SpeechSynthesisLike {
  cancel(): void;
  speak(utterance: SpeechUtteranceLike): void;
}

export interface VoiceControllerCallbacks {
  onTranscript(text: string): void;
  onState(state: VoiceUiState): void;
}

export interface VoiceController {
  snapshot(): VoiceUiState;
  activate(): void;
  deactivate(): void;
  listen(): void;
  speak(text: string): Promise<void>;
  destroy(): void;
}

function browserRecognitionConstructor(): RecognitionConstructor | undefined {
  const candidate = window as typeof window & {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return candidate.SpeechRecognition ?? candidate.webkitSpeechRecognition;
}

function browserUtteranceConstructor(): SpeechUtteranceConstructor | undefined {
  return (window as typeof window & { SpeechSynthesisUtterance?: SpeechUtteranceConstructor }).SpeechSynthesisUtterance;
}

function browserSynthesis(): SpeechSynthesisLike | undefined {
  return (window as typeof window & { speechSynthesis?: SpeechSynthesisLike }).speechSynthesis;
}

function transcriptFrom(event: RecognitionResultEvent): string {
  const firstResult = event.results[0];
  const firstAlternative = firstResult?.[0];
  return firstAlternative?.transcript?.trim() ?? "";
}

export function createBrowserVoiceController(callbacks: VoiceControllerCallbacks): VoiceController {
  const Recognition = browserRecognitionConstructor();
  const Utterance = browserUtteranceConstructor();
  const synthesis = browserSynthesis();
  const supported = Boolean(Recognition && Utterance && synthesis);

  let current: VoiceUiState = {
    supported,
    active: false,
    status: supported ? "idle" : "unavailable",
    message: supported
      ? "Voice is ready."
      : "Voice input is unavailable in this browser. Touch and keyboard controls still work.",
  };
  let recognition: RecognitionLike | undefined;
  let destroyed = false;

  const publish = (patch: Partial<VoiceUiState>): void => {
    current = { ...current, ...patch };
    callbacks.onState({ ...current });
  };

  const clearRecognition = (): void => {
    if (!recognition) return;
    const existing = recognition;
    recognition = undefined;
    existing.onresult = null;
    existing.onerror = null;
    existing.onend = null;
    try { existing.abort(); } catch { /* Browser may already have ended the session. */ }
  };

  const fail = (message: string): void => {
    clearRecognition();
    current.active = false;
    publish({ status: "error", message, active: false });
  };

  const controller: VoiceController = {
    snapshot: () => ({ ...current }),

    activate: () => {
      if (!supported || destroyed) {
        publish({
          active: false,
          status: "unavailable",
          message: "Voice input is unavailable in this browser. Touch and keyboard controls still work.",
        });
        return;
      }
      synthesis!.cancel();
      current.active = true;
      publish({ active: true, status: "idle", message: "Voice mode is on." });
    },

    deactivate: () => {
      current.active = false;
      clearRecognition();
      synthesis?.cancel();
      publish({ active: false, status: supported ? "idle" : "unavailable", message: supported ? "Voice mode is off." : current.message });
    },

    listen: () => {
      if (!supported || !current.active || destroyed || recognition) return;
      const instance = new Recognition!();
      recognition = instance;
      instance.lang = "en-GB";
      instance.continuous = false;
      instance.interimResults = false;
      instance.maxAlternatives = 1;
      instance.onresult = (event) => {
        const heard = transcriptFrom(event);
        recognition = undefined;
        instance.onend = null;
        if (!heard) {
          publish({ status: "idle", message: "I didn't catch that." });
          if (current.active) setTimeout(() => controller.listen(), 120);
          return;
        }
        publish({ status: "processing", message: `Heard: ${heard}`, lastHeard: heard });
        callbacks.onTranscript(heard);
      };
      instance.onerror = (event) => {
        recognition = undefined;
        instance.onend = null;
        if (event.error === "no-speech") {
          publish({ status: "idle", message: "I didn't hear anything. Listening again." });
          if (current.active) setTimeout(() => controller.listen(), 180);
          return;
        }
        if (event.error === "aborted") return;
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          fail("Microphone permission was denied. Voice mode is off.");
          return;
        }
        if (event.error === "audio-capture") {
          fail("No microphone is available. Voice mode is off.");
          return;
        }
        fail(`Voice recognition failed (${event.error}). Voice mode is off.`);
      };
      instance.onend = () => {
        if (recognition === instance) recognition = undefined;
        if (current.active && current.status === "listening") {
          publish({ status: "idle", message: "Listening paused. Starting again." });
          setTimeout(() => controller.listen(), 180);
        }
      };
      publish({ status: "listening", message: "Listening…" });
      try {
        instance.start();
      } catch {
        recognition = undefined;
        fail("Voice recognition could not start. Voice mode is off.");
      }
    },

    speak: async (text: string) => {
      if (!supported || !current.active || destroyed || !text.trim()) return;
      clearRecognition();
      synthesis!.cancel();
      await new Promise<void>((resolve) => {
        const utterance = new Utterance!(text);
        utterance.lang = "en-GB";
        utterance.rate = 0.98;
        utterance.onend = () => {
          publish({ status: "idle", message: "Ready for the next request.", lastSpoken: text });
          resolve();
        };
        utterance.onerror = () => {
          fail("Speech output failed. Voice mode is off.");
          resolve();
        };
        publish({ status: "speaking", message: "Host is speaking…", lastSpoken: text });
        synthesis!.speak(utterance);
      });
    },

    destroy: () => {
      destroyed = true;
      current.active = false;
      clearRecognition();
      synthesis?.cancel();
    },
  };

  return controller;
}
