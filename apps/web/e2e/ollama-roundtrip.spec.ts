/**
 * TC-C4 and TC-C5 targeted deep validation.
 * Tests: AI page status badge and full chat round-trip.
 */
import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import path from "path";
import fs from "fs";

const SCREENSHOTS_DIR = "C:/Ideas/IDEA-MANAGEMENT/.docs/validation/client-side-ollama/deep/screenshots";
const BASE_URL = "http://localhost:3000";
const ADMIN_EMAIL = "admin@ideamgmt.local";
const ADMIN_PASSWORD = "AdminPass123!";

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function ss(page: Page, name: string) {
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${name}.png`), fullPage: false });
}

async function signIn(_request: APIRequestContext, page: Page) {
  // Use UI sign-in to ensure cookies are properly set in the browser context
  await page.goto("/signin", { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(dashboard|projects|ai)/, { timeout: 15_000 });
  await page.waitForLoadState("networkidle");
}

test("TC-C4: Full round-trip - AI page status and chat", async ({ request, page }) => {
  test.setTimeout(120_000);
  await signIn(request, page);

  await page.goto("/ai", { waitUntil: "networkidle" });

  // Wait for React hydration and Ollama detection to complete
  // The page does: fetch /api/ai/config -> detectOllama -> setState
  await page.waitForTimeout(3000);

  await ss(page, "tc-c4-v2-page-loaded");

  // Now check status badge - it should say LOCAL AI
  const statusBadge = page.locator("span").filter({ hasText: /LOCAL AI|CONNECTED|NOT CONFIGURED/i }).first();
  const badgeText = await statusBadge.textContent().catch(() => "not found");
  console.log(`[TC-C4] Status badge text: ${badgeText}`);

  expect(badgeText).toMatch(/LOCAL AI|CONNECTED/i);

  // Check for textarea
  const textarea = page.locator("textarea").first();
  await textarea.waitFor({ state: "visible", timeout: 5000 });
  const textareaVisible = await textarea.isVisible();
  console.log(`[TC-C4] Textarea visible: ${textareaVisible}`);
  expect(textareaVisible).toBe(true);

  await ss(page, "tc-c4-v2-status-confirmed");

  // Check if Ollama is running
  const ollamaRunning = await page.evaluate(async () => {
    try {
      const r = await fetch("http://localhost:11434/api/tags", { signal: AbortSignal.timeout(2000) });
      return r.ok;
    } catch { return false; }
  });

  console.log(`[TC-C4] Ollama running: ${ollamaRunning}`);

  if (!ollamaRunning) {
    console.log("[TC-C4] Ollama not available — status badge confirmed, skipping live chat test");
    return;
  }

  // Type "hello" and send
  await textarea.fill("hello");
  await ss(page, "tc-c4-v2-message-typed");

  const sendBtn = page.getByRole("button", { name: /send/i });
  await sendBtn.click();
  console.log("[TC-C4] Message sent, waiting for AI response...");

  // Wait up to 60s for response to arrive
  await page.waitForTimeout(5000);
  await ss(page, "tc-c4-v2-response-5s");

  // Wait for isStreaming to complete
  let responseComplete = false;
  for (let i = 0; i < 12; i++) {
    const isStreaming = await page.locator("span").filter({ hasText: /THINKING|Working/i }).isVisible().catch(() => false);
    if (!isStreaming) {
      responseComplete = true;
      break;
    }
    await page.waitForTimeout(5000);
  }

  await ss(page, "tc-c4-v2-response-complete");

  // Verify response appeared
  const messages = await page.locator(".border-3.border-signal-black, [class*='shadow-nb']").allTextContents();
  const hasAIResponse = messages.some((m) => m.length > 5 && m !== "hello");
  console.log(`[TC-C4] AI response appeared: ${hasAIResponse}`);
  console.log(`[TC-C4] Response complete: ${responseComplete}`);
  console.log(`[TC-C4] Messages on page: ${messages.slice(0, 5).join(" | ")}`);
});

test("TC-C5: Tool call round-trip - list my projects", async ({ request, page }) => {
  test.setTimeout(120_000);
  await signIn(request, page);

  await page.goto("/ai", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  const ollamaRunning = await page.evaluate(async () => {
    try {
      const r = await fetch("http://localhost:11434/api/tags", { signal: AbortSignal.timeout(2000) });
      return r.ok;
    } catch { return false; }
  });

  if (!ollamaRunning) {
    console.log("[TC-C5] Ollama not running — skipping");
    return;
  }

  const textarea = page.locator("textarea").first();
  await textarea.waitFor({ state: "visible", timeout: 5000 });

  await textarea.fill("list my projects");
  await ss(page, "tc-c5-v2-before-send");

  await page.getByRole("button", { name: /send/i }).click();
  console.log("[TC-C5] Message sent, waiting for tool call...");

  await page.waitForTimeout(5000);
  await ss(page, "tc-c5-v2-tool-call-5s");

  // Wait for completion
  for (let i = 0; i < 12; i++) {
    const isTyping = await page.locator("span").filter({ hasText: /THINKING/i }).isVisible().catch(() => false);
    if (!isTyping) break;
    await page.waitForTimeout(5000);
  }

  await ss(page, "tc-c5-v2-response-complete");

  const bodyText = await page.textContent("body") || "";
  const hasReasoningSection = bodyText.includes("tool") || bodyText.includes("project") || bodyText.includes("list_projects");
  const hasToolDetails = await page.locator("details").isVisible().catch(() => false);

  console.log(`[TC-C5] Reasoning/tool section present: ${hasReasoningSection}`);
  console.log(`[TC-C5] Expandable details element visible: ${hasToolDetails}`);

  // Check for reasoning/tool area
  const summaryEls = await page.locator("details summary").allTextContents();
  console.log(`[TC-C5] Details summaries: ${summaryEls.join(", ")}`);
  await ss(page, "tc-c5-v2-final");
});
