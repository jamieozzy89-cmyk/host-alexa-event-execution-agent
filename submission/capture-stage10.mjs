import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const BASE_URL = process.env.HOST_URL ?? "http://127.0.0.1:4173";
const OUT = "submission/screenshots";
const PRIMARY_REQUEST = "I'm hosting dinner for six people on Saturday at 7pm with a £120 budget, one vegetarian guest and a nut allergy, with limited same-day cooking";

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: "dark" });
const page = await context.newPage();

async function send(text) {
  await page.getByLabel("Message Host").fill(text);
  await page.getByRole("button", { name: "Send" }).click();
}

async function shot(name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
}

try {
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.evaluate(() => window.localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });

  await send(PRIMARY_REQUEST);
  await page.getByRole("button", { name: "Show menu ideas" }).waitFor();
  await shot("01-hero-event-created");

  await page.getByRole("button", { name: "Show menu ideas" }).click();
  await page.getByRole("button", { name: "Choose this menu" }).first().waitFor();
  await page.getByRole("button", { name: "Choose this menu" }).first().click();
  await page.getByText("Your confirmation is required").waitFor();
  await shot("02-menu-confirmation");
  await page.getByRole("button", { name: "Confirm" }).click();

  await page.getByRole("button", { name: "Build shopping list" }).click();
  await page.getByRole("article", { name: "Authoritative shopping list" }).waitFor();
  await shot("03-authoritative-shopping");

  await page.getByRole("button", { name: "Find demo products" }).click();
  await page.getByText("Simulation only — no real order").waitFor();
  await page.getByRole("button", { name: "Simulate checkout" }).click();
  await page.getByText("Your confirmation is required").waitFor();
  await page.getByRole("button", { name: "Confirm" }).click();
  await page.getByRole("button", { name: "Build prep plan" }).waitFor();
  await page.getByRole("button", { name: "Build prep plan" }).click();
  await page.getByRole("article", { name: "Preparation plan" }).waitFor();

  await page.getByRole("button", { name: "Live" }).click();
  await page.getByRole("heading", { name: "Live Mode" }).waitFor();
  await shot("04-live-mode");

  await page.getByRole("button", { name: "Plan" }).click();
  await send("We have another guest and they're vegan");
  await page.getByText("Checked — not applied yet").waitFor();
  await page.getByText("Completed work kept").waitFor();
  await shot("05-late-change-impact");
  await page.getByRole("button", { name: "Confirm" }).click();
  await page.getByLabel("Host conversation").getByText(/Updated\. I kept unaffected work/).waitFor();

  await page.getByRole("button", { name: "Activity" }).click();
  await page.getByRole("heading", { name: "Activity", exact: true }).waitFor();
  await page.locator(".history-row").first().waitFor();
  await shot("06-activity-receipts");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Live" }).click();
  await page.getByRole("heading", { name: "Live Mode" }).waitFor();
  await shot("07-mobile-live");

  console.log("Captured 7 Stage 10 screenshots from the working Host application.");
} finally {
  await browser.close();
}
