import { chromium } from "@playwright/test";
import { mkdir, copyFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const BASE_URL = process.env.HOST_URL ?? "http://127.0.0.1:4173";
const OUT = "submission/video-source";
const PRIMARY_REQUEST = "I'm hosting dinner for six people on Saturday at 7pm with a £120 budget, one vegetarian guest and a nut allergy, with limited same-day cooking";

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  colorScheme: "dark",
  recordVideo: { dir: `${OUT}/raw`, size: { width: 1280, height: 800 } },
});
const page = await context.newPage();
const video = page.video();
const started = Date.now();

async function pause(ms = 1600) { await page.waitForTimeout(ms); }

async function caption(text) {
  await page.evaluate((value) => {
    let el = document.getElementById("stage10-demo-caption");
    if (!el) {
      el = document.createElement("div");
      el.id = "stage10-demo-caption";
      Object.assign(el.style, {
        position: "fixed",
        left: "24px",
        bottom: "24px",
        zIndex: "99999",
        maxWidth: "760px",
        padding: "13px 17px",
        borderRadius: "14px",
        background: "rgba(9, 12, 18, .90)",
        color: "#f5f7fa",
        font: "700 20px/1.35 system-ui, sans-serif",
        boxShadow: "0 12px 36px rgba(0,0,0,.35)",
        border: "1px solid rgba(255,255,255,.18)",
        pointerEvents: "none",
      });
      document.body.appendChild(el);
    }
    el.textContent = value;
  }, text);
  await pause(1700);
}

async function send(text, typeSlowly = false) {
  const input = page.getByLabel("Message Host");
  await input.fill("");
  if (typeSlowly) await input.pressSequentially(text, { delay: 18 });
  else await input.fill(text);
  await page.getByRole("button", { name: "Send" }).click();
}

try {
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.evaluate(() => window.localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await caption("HOST — Alexa+ event execution simulation");
  await caption("One rule: language never becomes execution truth by itself.");

  await send(PRIMARY_REQUEST, true);
  await page.getByRole("button", { name: "Show menu ideas" }).waitFor();
  await caption("Natural request → authoritative event state");

  await page.getByRole("button", { name: "Show menu ideas" }).click();
  await page.getByRole("button", { name: "Choose this menu" }).first().waitFor();
  await caption("Menu ideas stay proposals until the host confirms.");
  await page.getByRole("button", { name: "Choose this menu" }).first().click();
  await page.getByText("Your confirmation is required").waitFor();
  await pause();
  await page.getByRole("button", { name: "Confirm" }).click();
  await page.getByRole("button", { name: "Build shopping list" }).waitFor();

  await page.getByRole("button", { name: "Build shopping list" }).click();
  await page.getByText("Authoritative quantities").waitFor();
  await caption("Shopping uses required − confirmed on-hand quantities.");
  await page.getByRole("button", { name: "Find demo products" }).click();
  await page.getByText("Simulation only — no real order").waitFor();
  await caption("Demo products and checkout are explicitly simulation-only.");
  await page.getByRole("button", { name: "Simulate checkout" }).click();
  await page.getByText("Your confirmation is required").waitFor();
  await pause(1200);
  await page.getByRole("button", { name: "Confirm" }).click();
  await page.getByRole("button", { name: "Build prep plan" }).waitFor();

  await page.getByRole("button", { name: "Build prep plan" }).click();
  await page.getByText("Dependency-aware plan").waitFor();
  await page.getByRole("button", { name: "Live" }).click();
  await page.getByRole("heading", { name: "Live Mode" }).waitFor();
  await caption("Live Mode shows the authoritative next ready task.");
  await page.getByRole("button", { name: "Mark complete" }).click();
  await page.getByText(/Next:/).waitFor();
  await pause(1500);

  await page.getByRole("button", { name: "Plan" }).click();
  await send("We have another guest and they're vegan", true);
  await page.getByText("Checked — not applied yet").waitFor();
  await page.getByText("Completed work kept").waitFor();
  await caption("Late change: impact is analysed before anything changes.");
  await pause(1200);
  await page.getByRole("button", { name: "Confirm" }).click();
  await page.getByLabel("Host conversation").getByText(/Updated\. I kept unaffected work/).waitFor();
  await caption("After confirmation, Host replans while preserving unaffected work.");

  await page.getByRole("button", { name: "Activity" }).click();
  await page.getByRole("heading", { name: "Activity", exact: true }).waitFor();
  await page.locator(".history-row").first().waitFor();
  await caption("Activity receipts show what actually succeeded, failed or was reversed.");

  await page.getByRole("button", { name: "Plan" }).click();
  await caption("Touch, keyboard and browser voice all terminate in the same controlled execution path.");
  await caption("74 backend tests + 26 Chromium browser cases passed on the verified release.");
  await caption("From ‘people are coming over’ to ‘everything is actually ready.’");
  await pause(1400);
} finally {
  await page.close();
  await context.close();
  await browser.close();
}

if (!video) throw new Error("Playwright did not create a video handle.");
const rawPath = await video.path();
const target = `${OUT}/host-stage10-uninterrupted-source.webm`;
await mkdir(dirname(target), { recursive: true });
await copyFile(rawPath, target);
const elapsed = (Date.now() - started) / 1000;
await writeFile(`${OUT}/SOURCE_RUN_MANIFEST.txt`, [
  `file=${target}`,
  `resolution=1280x800`,
  `wall_clock_seconds=${elapsed.toFixed(2)}`,
  `source_branch=stage10-submission`,
  `note=Uninterrupted automated browser recording of the working Host application. Silent source run with in-app demo captions; not the final public narrated upload.`,
  "",
].join("\n"));
console.log(`Recorded ${target} in ${elapsed.toFixed(2)}s wall-clock time.`);
