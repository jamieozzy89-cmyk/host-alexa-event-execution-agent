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
  await expect(page.getByRole("button", { name: "Show menu ideas" })).toBeVisible();
  await expect(page.locator(".surface-card").filter({ hasText: "Current plan" })).toContainText("6");
}

async function commitFirstMenu(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Show menu ideas" }).click();
  await expect(page.getByRole("button", { name: "Choose this menu" }).first()).toBeVisible();
  await page.getByRole("button", { name: "Choose this menu" }).first().click();
  await expect(page.getByText("Your confirmation is required")).toBeVisible();
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByRole("button", { name: "Build shopping list" })).toBeVisible();
}

async function buildPrep(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Build prep plan" }).click();
  await expect(page.getByText("Dependency-aware plan")).toBeVisible();
  await expect(page.getByRole("button", { name: "Done" }).first()).toBeVisible();
}

test("complete core journey works through visible touch/action routes", async ({ page }) => {
  await openClean(page);
  await createEvent(page);
  await commitFirstMenu(page);

  await page.getByRole("button", { name: "Build shopping list" }).click();
  await expect(page.getByText("Authoritative quantities")).toBeVisible();
  await page.getByRole("button", { name: "Find demo products" }).click();
  await expect(page.getByText("Simulation only — no real order")).toBeVisible();
  await page.getByRole("button", { name: "Simulate checkout" }).click();
  await expect(page.getByText("Your confirmation is required")).toBeVisible();
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByRole("button", { name: "Build prep plan" })).toBeVisible();

  await buildPrep(page);
  await page.getByRole("button", { name: "Live" }).click();
  await expect(page.getByRole("heading", { name: "Live Mode" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Mark complete" })).toBeVisible();
  await page.getByRole("button", { name: "Mark complete" }).click();
  await expect(page.getByText(/Next:/)).toBeAttached();

  await page.getByRole("button", { name: "Activity" }).click();
  await expect(page.getByRole("heading", { name: "Activity", exact: true })).toBeVisible();
  await expect(page.getByText("Receipts and safe reversals")).toBeVisible();
  await expect(page.locator(".history-row").first()).toBeVisible();
});

test("late vegan guest is previewed before the confirmed plan update", async ({ page }) => {
  await openClean(page);
  await createEvent(page);
  await commitFirstMenu(page);
  await buildPrep(page);

  await send(page, "We have another guest and they're vegan");
  await expect(page.getByText("Checked — not applied yet")).toBeVisible();
  await expect(page.getByText("Completed work kept")).toBeVisible();
  await expect(page.getByText("Your confirmation is required")).toBeVisible();
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByLabel("Host conversation").getByText(/Updated\. I kept unaffected work/)).toBeVisible();
  const summary = page.locator(".summary-grid");
  await expect(summary).toContainText("Guests");
  await expect(summary).toContainText("7");
});

test("reload resumes authoritative event state and drops stale confirmation UI", async ({ page }) => {
  await openClean(page);
  await createEvent(page);
  await page.getByRole("button", { name: "Show menu ideas" }).click();
  await page.getByRole("button", { name: "Choose this menu" }).first().click();
  await expect(page.getByText("Your confirmation is required")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Host conversation").getByText(/Welcome back\. Dinner at home is restored/)).toBeVisible();
  await expect(page.getByText("Your confirmation is required")).toHaveCount(0);
  await expect(page.locator(".surface-card").filter({ hasText: "Current plan" })).toContainText("6");

  await page.getByRole("button", { name: "Activity" }).click();
  await expect(page.getByRole("heading", { name: "Activity", exact: true })).toBeVisible();
});

test("interactive controls meet touch target floor and the page avoids document overflow", async ({ page }) => {
  await openClean(page);
  await createEvent(page);
  await page.getByRole("button", { name: "Show menu ideas" }).click();
  await expect(page.getByRole("button", { name: "Choose this menu" }).first()).toBeVisible();

  const measurements = await page.locator("button:visible, input:visible").evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return { label: (node.getAttribute("aria-label") || node.textContent || "control").trim(), width: rect.width, height: rect.height };
  }));
  expect(measurements.length).toBeGreaterThan(4);
  for (const measurement of measurements) {
    expect(measurement.width, `${measurement.label} width`).toBeGreaterThanOrEqual(48);
    expect(measurement.height, `${measurement.label} height`).toBeGreaterThanOrEqual(48);
  }

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
