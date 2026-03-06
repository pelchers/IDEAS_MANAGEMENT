/**
 * Phase 2 validation screenshot script.
 * Builds the web app, starts it, and captures Playwright screenshots.
 *
 * Usage: npx tsx scripts/validate-phase-2.mts
 */

import { chromium } from "playwright";
import { execSync, spawn } from "node:child_process";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const ROOT = path.resolve(import.meta.dirname, "..");
const WEB_DIR = path.join(ROOT, "apps", "web");
const OUTPUT_DIR = path.join(ROOT, ".docs", "validation", "phase_2");

async function waitForServer(url: string, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 307 || res.status === 302) return;
    } catch {
      // not ready yet
    }
    await delay(500);
  }
  throw new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`);
}

async function main() {
  console.log("Building web app...");
  execSync("pnpm build", { cwd: WEB_DIR, stdio: "inherit" });

  console.log("Starting web app on port 3099...");
  const server = spawn("pnpm", ["start", "-p", "3099"], {
    cwd: WEB_DIR,
    stdio: "pipe",
    shell: true
  });

  server.stdout?.on("data", (d) => process.stdout.write(d));
  server.stderr?.on("data", (d) => process.stderr.write(d));

  try {
    await waitForServer("http://localhost:3099/");

    console.log("Launching Playwright...");
    const browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1536, height: 960 } });
    const page = await context.newPage();

    // Screenshot 1: Home page (should redirect to /signin if middleware works)
    console.log("Capturing: home / signin redirect...");
    await page.goto("http://localhost:3099/", { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "01-home-or-signin-redirect.png"),
      fullPage: true
    });

    // Screenshot 2: Health endpoint (public, should return OK)
    console.log("Capturing: health endpoint...");
    await page.goto("http://localhost:3099/api/health", { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "02-health-endpoint.png"),
      fullPage: true
    });

    // Screenshot 3: Try /api/auth/me without auth (should return 401)
    console.log("Capturing: /api/auth/me unauthenticated...");
    await page.goto("http://localhost:3099/api/auth/me", { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "03-auth-me-unauthenticated.png"),
      fullPage: true
    });

    // Screenshot 4: Try a protected path (should redirect to /signin)
    console.log("Capturing: protected path redirect...");
    await page.goto("http://localhost:3099/dashboard", { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "04-protected-path-redirect.png"),
      fullPage: true
    });

    // Screenshot 5: mobile viewport
    console.log("Capturing: mobile viewport...");
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("http://localhost:3099/", { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "05-mobile-viewport.png"),
      fullPage: true
    });

    await browser.close();
    console.log(`Screenshots saved to ${OUTPUT_DIR}`);
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
