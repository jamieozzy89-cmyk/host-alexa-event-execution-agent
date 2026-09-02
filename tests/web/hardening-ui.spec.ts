import { AxeBuilder } from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const PRIMARY_REQUEST = "I'm hosting dinner for six people on Saturday at 7pm with a £120 budget, one vegetarian guest and a nut allergy, with limited same-day cooking";

async function openClean(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByRole("button", { name: "Plan a dinner" })).toBeVisible();
}

async function send(page: Page, text: string): Promise<void> {
  const input = page.getByLabel("Message Host");
  await input.fill(text);
  await page.getByRole("button", { name: "Send" }).click();
}

async function createEvent(page: Page): Promise<void> {
  await send(page, PRIMARY_REQUEST);
  await expect(page.getByRole("button", { name: "Choose this menu" }).first()).toBeVisible();
}

async function commitFirstMenu(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Choose this menu" }).first().click();
  await expect(page.getByText("Your confirmation is required")).toBeVisible();
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByLabel("Host conversation").getByText(/What required ingredients do you already have/i)).toBeVisible();
}

async function completeInventoryReview(page: Page): Promise<void> {
  await send(page, "I don't have any of them");
  await expect(page.getByRole("article", { name: "Authoritative shopping list" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Preparation plan" })).toBeVisible();
}

async function expectWcagAa(page: Page): Promise<void> {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(result.violations, result.violations.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
}

test("core Phase C surfaces pass automated WCAG A and AA checks", async ({ page }) => {
  await openClean(page);
  await expectWcagAa(page);

  await createEvent(page);
  await expectWcagAa(page);

  await page.getByRole("button", { name: "Choose this menu" }).first().click();
  await expect(page.getByText("Your confirmation is required")).toBeVisible();
  await expectWcagAa(page);

  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByLabel("Host conversation").getByText(/What required ingredients do you already have/i)).toBeVisible();
  await expectWcagAa(page);

  await completeInventoryReview(page);
  await expectWcagAa(page);

  await page.getByRole("button", { name: "Activity" }).click();
  await expectWcagAa(page);
});

test("keyboard focus remains usable after composer and dialog operations", async ({ page }) => {
  await openClean(page);
  const composer = page.getByLabel("Message Host");
  await composer.focus();
  await composer.fill(PRIMARY_REQUEST);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Choose this menu" }).first()).toBeVisible();
  await expect(composer).toBeFocused();

  await page.getByRole("button", { name: "Choose this menu" }).first().click();
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByLabel("Host conversation").getByText(/What required ingredients do you already have/i)).toBeVisible();
  await composer.fill("I don't have any of them");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("article", { name: "Authoritative shopping list" })).toBeVisible();

  const openDialog = page.getByRole("button", { name: /View all .* items/ });
  await openDialog.focus();
  await openDialog.click();
  const dialog = page.getByRole("dialog", { name: "Full shopping list" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(openDialog).toBeFocused();
});

test("unrecoverable saved state is reported safely instead of leaving a blank application", async ({ page }) => {
  await openClean(page);
  await createEvent(page);
  await page.evaluate(() => {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith("host:v1:event:")) window.localStorage.setItem(key, "{broken");
    }
  });
  await page.reload();
  await expect(page.getByText(/couldn't safely restore the saved plan/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Plan a dinner" })).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem("host:ui:active-event"))).toBeNull();
  expect(await page.evaluate(() => Object.keys(window.localStorage).filter((key) => key.startsWith("host:v1:event:")).length)).toBeGreaterThan(0);
});

test("Host falls back to memory when persistent browser storage is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key.startsWith("host:")) throw new DOMException("blocked", "SecurityError");
      return original.call(this, key, value);
    };
  });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Plan a dinner" })).toBeVisible();
  await page.getByRole("button", { name: "Activity" }).click();
  await expect(page.getByText(/saved only until this page closes/i)).toBeVisible();
});

test("local Host event data can be reviewed, cancelled, then deleted without clearing theme preference", async ({ page }) => {
  await openClean(page);
  await createEvent(page);
  await page.getByRole("button", { name: "Switch light or dark theme" }).click();
  const themeBefore = await page.evaluate(() => window.localStorage.getItem("host:ui:theme"));
  await page.getByRole("button", { name: "Activity" }).click();
  await page.getByRole("button", { name: "Clear saved Host data" }).click();
  await expect(page.getByText(/delete the saved Host event data from this browser/i)).toBeVisible();
  await page.getByRole("button", { name: "Cancel data deletion" }).click();
  expect(await page.evaluate(() => Object.keys(window.localStorage).some((key) => key.startsWith("host:v1:event:")))).toBe(true);

  await page.getByRole("button", { name: "Clear saved Host data" }).click();
  await page.getByRole("button", { name: "Delete saved Host data" }).click();
  await page.waitForLoadState("domcontentloaded");
  await expect(page.getByRole("button", { name: "Plan a dinner" })).toBeVisible();
  expect(await page.evaluate(() => Object.keys(window.localStorage).some((key) => key.startsWith("host:v1:event:")))).toBe(false);
  expect(await page.evaluate(() => window.localStorage.getItem("host:ui:theme"))).toBe(themeBefore);
});

test("current deterministic Phase C journey makes no unexpected cross-origin application requests", async ({ page }) => {
  const external = new Set<string>();
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin !== "http://127.0.0.1:4173") external.add(url.origin);
  });
  await openClean(page);
  await createEvent(page);
  await commitFirstMenu(page);
  await completeInventoryReview(page);
  await page.getByRole("button", { name: "Review demo products" }).click();
  expect([...external]).toEqual([]);
});
