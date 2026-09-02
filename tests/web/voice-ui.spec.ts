import { expect, test, type Page } from "@playwright/test";

const PRIMARY_REQUEST = "I'm hosting dinner for six people on Saturday at 7pm with a £120 budget, one vegetarian guest and a nut allergy, with limited same-day cooking";

async function installVoiceFakes(page: Page): Promise<void> {
  await page.addInitScript(() => {
    type FakeUtterance = {
      text: string;
      lang: string;
      rate: number;
      onend: (() => void) | null;
      onerror: (() => void) | null;
    };

    class FakeSpeechRecognition {
      lang = "";
      continuous = false;
      interimResults = false;
      maxAlternatives = 1;
      onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null = null;
      onerror: ((event: { error: string }) => void) | null = null;
      onend: (() => void) | null = null;

      start(): void {
        (window as any).__hostRecognition = this;
      }

      abort(): void {
        if ((window as any).__hostRecognition === this) (window as any).__hostRecognition = undefined;
      }
    }

    class FakeSpeechSynthesisUtterance implements FakeUtterance {
      lang = "";
      rate = 1;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(public text: string) {}
    }

    (window as any).__hostSpoken = [] as string[];
    (window as any).__hostRecognition = undefined;
    (window as any).__emitHostVoice = (text: string) => {
      const recognition = (window as any).__hostRecognition as FakeSpeechRecognition | undefined;
      if (!recognition?.onresult) throw new Error("Host is not listening.");
      (window as any).__hostRecognition = undefined;
      recognition.onresult({ results: [[{ transcript: text }]] });
    };

    Object.defineProperty(window, "SpeechRecognition", { configurable: true, value: FakeSpeechRecognition });
    Object.defineProperty(window, "webkitSpeechRecognition", { configurable: true, value: FakeSpeechRecognition });
    Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: FakeSpeechSynthesisUtterance });
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        cancel() {},
        speak(utterance: FakeUtterance) {
          (window as any).__hostSpoken.push(utterance.text);
          queueMicrotask(() => utterance.onend?.());
        },
      },
    });
  });
}

async function openVoiceClean(page: Page): Promise<void> {
  await installVoiceFakes(page);
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByRole("button", { name: "Start voice" })).toBeVisible();
}

async function startVoice(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Start voice" }).click();
  await expect(page.getByRole("button", { name: "Stop voice" })).toBeVisible();
  await expect(page.locator('[data-voice-status="listening"]')).toBeVisible();
}

async function spokenCount(page: Page): Promise<number> {
  return page.evaluate(() => ((window as any).__hostSpoken as string[]).length);
}

async function lastSpoken(page: Page): Promise<string> {
  return page.evaluate(() => ((window as any).__hostSpoken as string[]).at(-1) ?? "");
}

async function say(page: Page, text: string, expected: RegExp): Promise<void> {
  await expect(page.locator('[data-voice-status="listening"]')).toBeVisible();
  const before = await spokenCount(page);
  await page.evaluate((spokenText) => (window as any).__emitHostVoice(spokenText), text);
  await expect.poll(() => spokenCount(page)).toBeGreaterThan(before);
  await expect.poll(() => lastSpoken(page)).toMatch(expected);
  await expect(page.locator('[data-voice-status="listening"]')).toBeVisible();
}

test("voice-only Phase C journey reaches goal-directed execution, late-change confirmation and receipts after one activation", async ({ page }) => {
  await openVoiceClean(page);
  await startVoice(page);

  await say(page, PRIMARY_REQUEST, /Done\. I've set up.*Option 1:.*choose option one/i);
  await say(page, "choose option one", /Use .* as the committed menu\?/i);
  await say(page, "yes", /Menu saved\..*required ingredients do you already have/i);
  await say(page, "I don't have any of them", /reconciled shopping.*built the run sheet/i);
  await say(page, "find products", /Nothing has been purchased/i);
  await say(page, "checkout", /simulated checkout/i);
  await say(page, "yes", /Simulated checkout complete/i);
  await say(page, "what's next", /Next:/i);
  await say(page, "done", /Done\./i);
  await say(page, "We have another guest and they're vegan", /checked the change without applying it/i);
  await say(page, "yes", /Updated\. I kept unaffected work/i);
  await say(page, "did you actually", /Latest:/i);

  await expect(page.locator(".message.user")).toHaveCount(12);
  await expect(page.getByRole("button", { name: "Stop voice" })).toBeVisible();
});

test("spoken no cancels a pending material action without requiring touch confirmation", async ({ page }) => {
  await openVoiceClean(page);
  await startVoice(page);

  await say(page, PRIMARY_REQUEST, /Option 1:/i);
  await say(page, "choose option one", /committed menu\?/i);
  await say(page, "no", /Cancelled\. I haven't changed the plan/i);
  await say(page, "shopping list", /menu/i);
});

test("voice unavailability is explicit and leaves the complete touch path available", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "SpeechRecognition", { configurable: true, value: undefined });
    Object.defineProperty(window, "webkitSpeechRecognition", { configurable: true, value: undefined });
    Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: undefined });
  });
  await page.goto("/");
  const unavailable = page.getByRole("button", { name: "Voice unavailable" });
  await expect(unavailable).toHaveAttribute("aria-disabled", "true");
  await unavailable.focus();
  await expect(unavailable).toBeFocused();
  await expect(page.getByRole("button", { name: "Plan a dinner" })).toBeVisible();
  await expect(page.getByText(/Touch and keyboard controls still work/i)).toBeAttached();
});
