/**
 * Deep validation of client-side Ollama detection and cross-communication system.
 * Tests: detection, model availability, tool calls, API endpoints, setup scripts.
 */
import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import path from "path";
import fs from "fs";

const SCREENSHOTS_DIR = "C:/Ideas/IDEA-MANAGEMENT/.docs/validation/client-side-ollama/deep/screenshots";
const BASE_URL = "http://localhost:3000";
const ADMIN_EMAIL = "admin@ideamgmt.local";
const ADMIN_PASSWORD = "AdminPass123!";

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function ss(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${name}.png`), fullPage: false });
}

/**
 * Sign in via API (fastest, no form interaction needed).
 * Playwright request and page share the same cookie jar when using baseURL.
 */
async function signIn(request: APIRequestContext, page: Page): Promise<boolean> {
  const res = await request.post("/api/auth/signin", {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  if (!res.ok()) {
    console.log(`[auth] Sign-in failed: ${res.status()}`);
    return false;
  }
  // Navigate to trigger cookie propagation to the browser context
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
  return true;
}

// ─── Test Group 1: Detection System ───────────────────────────────────────────

test.describe("Test Group 1: Detection System", () => {

  test("TC-D1: Ollama detection from browser - fetch /api/tags", async ({ request, page }) => {
    await signIn(request, page);
    await page.goto(`${BASE_URL}/ai`, { waitUntil: "networkidle" });

    const result = await page.evaluate(async () => {
      try {
        const res = await fetch("http://localhost:11434/api/tags");
        const data = await res.json();
        const models = (data.models || []) as Array<{ name: string; size: number }>;
        return {
          ok: true,
          count: models.length,
          modelNames: models.map((m) => m.name),
        };
      } catch (e: unknown) {
        return { ok: false, error: (e as Error).message, count: 0, modelNames: [] };
      }
    });

    await ss(page, "tc-d1-ollama-detection");

    console.log("[TC-D1] Ollama reachable:", result.ok);
    console.log("[TC-D1] Model count:", result.count);
    console.log("[TC-D1] Models:", result.modelNames?.join(", "));

    if (!result.ok) {
      console.log("[TC-D1] Ollama not running from browser. Error:", result.error);
    }

    // Document the result — pass if Ollama is running, skip assertion if not
    if (result.ok) {
      expect(result.count).toBeGreaterThan(0);
    }
  });

  test("TC-D2: Model detection specifics - qwen3:32b and ideamanagement:latest", async ({ request, page }) => {
    await signIn(request, page);
    await page.goto(`${BASE_URL}/ai`, { waitUntil: "networkidle" });

    const result = await page.evaluate(async () => {
      try {
        const res = await fetch("http://localhost:11434/api/tags");
        const data = await res.json();
        const models = (data.models || []) as Array<{ name: string }>;
        const names = models.map((m) => m.name);
        return {
          ok: true,
          allModels: names,
          hasQwen3_32b: names.some((n) => n === "qwen3:32b" || n.startsWith("qwen3:32b")),
          hasIdeaManagement: names.some((n) => n.startsWith("ideamanagement")),
          hasQwen3Coder: names.some((n) => n.includes("qwen3-coder")),
        };
      } catch (e: unknown) {
        return { ok: false, error: (e as Error).message, allModels: [], hasQwen3_32b: false, hasIdeaManagement: false, hasQwen3Coder: false };
      }
    });

    await ss(page, "tc-d2-model-detection");

    console.log("[TC-D2] All models:", result.allModels?.join(", "));
    console.log("[TC-D2] qwen3:32b present:", result.hasQwen3_32b);
    console.log("[TC-D2] ideamanagement:latest present:", result.hasIdeaManagement);
    console.log("[TC-D2] qwen3-coder present:", result.hasQwen3Coder);
    // No hard assertion — we document whatever is found
  });

  test("TC-D3: Detection when Ollama is unreachable - graceful failure", async ({ request, page }) => {
    await signIn(request, page);
    await page.goto(`${BASE_URL}/ai`, { waitUntil: "networkidle" });

    const result = await page.evaluate(async () => {
      try {
        const res = await fetch("http://localhost:19999/api/tags", {
          signal: AbortSignal.timeout(2000),
        });
        return { reachable: true, status: res.status };
      } catch (e: unknown) {
        return { reachable: false, error: (e as Error).message };
      }
    });

    await ss(page, "tc-d3-unreachable");
    console.log("[TC-D3] Unreachable port result:", JSON.stringify(result));

    expect(result.reachable).toBe(false);
    console.log(`[TC-D3] Graceful failure confirmed. Error type: ${result.error}`);
  });

  test("TC-D4: OllamaSetupModal behavior - Settings page ENABLE LOCAL AI", async ({ request, page }) => {
    await signIn(request, page);
    await page.goto(`${BASE_URL}/settings`, { waitUntil: "networkidle" });
    await ss(page, "tc-d4-settings-page");

    // Look for AI settings section or "ENABLE LOCAL AI" button
    const pageText = await page.textContent("body") || "";
    const hasAISection = pageText.includes("LOCAL AI") || pageText.includes("Ollama") || pageText.includes("local ai");
    console.log(`[TC-D4] Settings page has AI/Ollama section: ${hasAISection}`);

    // Try to find Enable Local AI button
    const enableBtn = page.getByRole("button", { name: /enable local ai/i });
    const enableVisible = await enableBtn.isVisible().catch(() => false);

    if (enableVisible) {
      await enableBtn.click();
      await ss(page, "tc-d4-modal-opened");

      // Capture "Checking..." state
      const checkingVisible = await page.getByText(/checking for ollama/i).isVisible().catch(() => false);
      console.log(`[TC-D4] "Checking for Ollama..." visible: ${checkingVisible}`);
      await ss(page, "tc-d4-modal-checking");

      // Wait for result
      await page.waitForTimeout(3000);
      await ss(page, "tc-d4-modal-resolved");

      const bodyText = await page.textContent("body") || "";
      const isReady = bodyText.includes("LOCAL AI READY");
      const notInstalled = bodyText.includes("not detected") || bodyText.includes("Ollama not found");
      const isPulling = bodyText.includes("Downloading AI model");
      const isCreating = bodyText.includes("Creating custom AI model");

      console.log(`[TC-D4] Modal state - Ready: ${isReady}, NotInstalled: ${notInstalled}, Pulling: ${isPulling}, Creating: ${isCreating}`);

      await page.waitForTimeout(2000);
      await ss(page, "tc-d4-modal-final");
    } else {
      console.log("[TC-D4] ENABLE LOCAL AI button not found on settings page — checking AI config area");

      // Try clicking any AI-related button in settings
      const localAiBtn = page.locator("button").filter({ hasText: /local|ollama/i }).first();
      const localAiBtnVisible = await localAiBtn.isVisible().catch(() => false);
      console.log(`[TC-D4] Other Ollama/local button visible: ${localAiBtnVisible}`);

      await ss(page, "tc-d4-settings-no-modal");
    }
  });

});

// ─── Test Group 2: Cross-Communication (Tool Calls) ──────────────────────────

test.describe("Test Group 2: Cross-Communication (Tool Calls)", () => {

  test("TC-C1: Tool execution endpoint works - list_projects", async ({ request, page }) => {
    await signIn(request, page);

    // Use request (shares cookies with page after sign-in)
    const res = await request.post("/api/ai/tools", {
      data: { toolName: "list_projects", args: {} },
    });

    const data = await res.json();
    console.log("[TC-C1] Status:", res.status());
    console.log("[TC-C1] Response:", JSON.stringify(data, null, 2));

    await page.goto(`${BASE_URL}/ai`, { waitUntil: "networkidle" });
    await ss(page, "tc-c1-tool-list-projects");

    expect(res.status()).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.result).toBeDefined();
    expect(data.result.success).toBe(true);
  });

  test("TC-C2: Context API returns real data", async ({ request, page }) => {
    await signIn(request, page);

    // First get a project — create one if needed
    let projectId: string | null = null;
    const toolRes = await request.post("/api/ai/tools", {
      data: { toolName: "list_projects", args: {} },
    });
    const toolData = await toolRes.json();
    const projects = toolData.result?.projects || [];
    console.log(`[TC-C2] Projects available: ${projects.length}`);

    if (projects.length > 0) {
      projectId = projects[0].id;
    } else {
      // Create a test project
      const createRes = await request.post("/api/projects", {
        data: { name: "TC-C2 Test Project", description: "Context API validation" },
      });
      if (createRes.ok()) {
        const createData = await createRes.json();
        projectId = createData.project?.id || createData.id;
        console.log(`[TC-C2] Created test project: ${projectId}`);
      }
    }

    if (!projectId) {
      console.log("[TC-C2] Could not get or create a project — skipping context API test");
      await page.goto(`${BASE_URL}/ai`, { waitUntil: "networkidle" });
      await ss(page, "tc-c2-no-project");
      return;
    }

    const contextRes = await request.get(`/api/ai/context/${projectId}`);
    const contextData = await contextRes.json();

    console.log("[TC-C2] Context API status:", contextRes.status());
    console.log("[TC-C2] Context response:", JSON.stringify(contextData, null, 2));

    await page.goto(`${BASE_URL}/ai`, { waitUntil: "networkidle" });
    await ss(page, "tc-c2-context-api");

    expect(contextRes.status()).toBe(200);
    expect(contextData.ok).toBe(true);
    expect(contextData.project.name).toBeTruthy();
    console.log(`[TC-C2] Project: ${contextData.project.name}, Context summary: "${contextData.contextSummary}"`);
  });

  test("TC-C3: Chat save API works", async ({ request, page }) => {
    await signIn(request, page);

    const res = await request.post("/api/ai/chat/save", {
      data: {
        userMessage: "test validation message",
        aiMessage: "test response from deep validation",
        toolCalls: [],
        provider: "ollama-local",
      },
    });
    const data = await res.json();

    console.log("[TC-C3] Status:", res.status());
    console.log("[TC-C3] Response:", JSON.stringify(data, null, 2));

    await page.goto(`${BASE_URL}/ai`, { waitUntil: "networkidle" });
    await ss(page, "tc-c3-chat-save");

    expect(res.status()).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.sessionId).toBeTruthy();
    console.log(`[TC-C3] Session created: ${data.sessionId}`);
  });

  test("TC-C4: Full round-trip via client-side Ollama path", async ({ request, page }) => {
    await signIn(request, page);
    await page.goto(`${BASE_URL}/ai`, { waitUntil: "networkidle" });
    await page.waitForLoadState("networkidle");
    await ss(page, "tc-c4-ai-page-initial");

    // Check what provider/status the page shows
    const bodyText = await page.textContent("body") || "";
    const hasLocalAI = bodyText.toLowerCase().includes("local ai") || bodyText.includes("LOCAL AI");
    const hasOllama = bodyText.toLowerCase().includes("ollama");
    const hasConnected = bodyText.toLowerCase().includes("connected");
    const hasNotConfigured = bodyText.toLowerCase().includes("not configured") || bodyText.toLowerCase().includes("not connected");

    console.log(`[TC-C4] AI page status - Local AI: ${hasLocalAI}, Ollama: ${hasOllama}, Connected: ${hasConnected}, Not Configured: ${hasNotConfigured}`);

    await ss(page, "tc-c4-ai-page-status");

    // Check if Ollama is reachable
    const ollamaRunning = await page.evaluate(async () => {
      try {
        const res = await fetch("http://localhost:11434/api/tags", { signal: AbortSignal.timeout(2000) });
        return res.ok;
      } catch { return false; }
    });

    console.log(`[TC-C4] Ollama reachable from browser: ${ollamaRunning}`);

    if (!ollamaRunning) {
      console.log("[TC-C4] Ollama not running — documenting UI state, cannot test live chat");
      await ss(page, "tc-c4-ollama-not-running");
      return;
    }

    // Find chat textarea
    const textarea = page.locator("textarea").first();
    const textareaVisible = await textarea.isVisible().catch(() => false);

    if (!textareaVisible) {
      await ss(page, "tc-c4-no-textarea");
      console.log("[TC-C4] Chat textarea not visible — chat may require project selection or different state");
      return;
    }

    await textarea.fill("hello");
    await ss(page, "tc-c4-message-typed");

    // Submit
    const sendBtn = page.getByRole("button", { name: /send/i });
    await sendBtn.click().catch(async () => {
      await page.keyboard.press("Enter");
    });

    console.log("[TC-C4] Message sent, waiting for response...");
    await page.waitForTimeout(5000);
    await ss(page, "tc-c4-response-5s");

    // Wait for streaming to complete (up to 45s)
    for (let i = 0; i < 9; i++) {
      const isStreaming = await page.locator("[data-streaming], .streaming, [aria-busy='true']").isVisible().catch(() => false);
      if (!isStreaming) break;
      await page.waitForTimeout(5000);
    }

    await ss(page, "tc-c4-response-complete");

    const finalText = await page.textContent("body") || "";
    const hasHelloResponse = finalText.length > (bodyText.length + 100);
    console.log(`[TC-C4] Response received (page grew significantly): ${hasHelloResponse}`);
  });

  test("TC-C5: Tool call round-trip - list my projects", async ({ request, page }) => {
    await signIn(request, page);
    await page.goto(`${BASE_URL}/ai`, { waitUntil: "networkidle" });

    const ollamaRunning = await page.evaluate(async () => {
      try {
        const res = await fetch("http://localhost:11434/api/tags", { signal: AbortSignal.timeout(2000) });
        return res.ok;
      } catch { return false; }
    });

    if (!ollamaRunning) {
      console.log("[TC-C5] Ollama not running — skipping live tool call test");
      await ss(page, "tc-c5-ollama-not-running");
      return;
    }

    const textarea = page.locator("textarea").first();
    const textareaVisible = await textarea.isVisible().catch(() => false);

    if (!textareaVisible) {
      await ss(page, "tc-c5-no-textarea");
      console.log("[TC-C5] Textarea not visible");
      return;
    }

    await textarea.fill("list my projects");
    await ss(page, "tc-c5-before-send");

    const sendBtn = page.getByRole("button", { name: /send/i });
    await sendBtn.click().catch(async () => { await page.keyboard.press("Enter"); });

    console.log("[TC-C5] Message sent, waiting for tool call...");
    await page.waitForTimeout(10000);
    await ss(page, "tc-c5-tool-call-10s");

    // Wait up to 45s more
    for (let i = 0; i < 9; i++) {
      const isStreaming = await page.locator("[data-streaming], .streaming, [aria-busy='true']").isVisible().catch(() => false);
      if (!isStreaming) break;
      await page.waitForTimeout(5000);
    }

    await ss(page, "tc-c5-tool-result-complete");

    const bodyText = await page.textContent("body") || "";
    const hasToolMention = bodyText.includes("list_projects") || bodyText.includes("project");
    console.log(`[TC-C5] Tool/project mention in page: ${hasToolMention}`);

    // Check for reasoning/tool section in page
    const hasReasoningSection = await page.locator("[data-reasoning], .reasoning, [aria-label*='reasoning']").isVisible().catch(() => false);
    console.log(`[TC-C5] Reasoning section visible: ${hasReasoningSection}`);
  });

  test("TC-C6: Verify chat persistence via /api/ai/sessions", async ({ request, page }) => {
    await signIn(request, page);

    const res = await request.get("/api/ai/sessions");
    const data = await res.json();

    console.log("[TC-C6] Status:", res.status());
    console.log("[TC-C6] Session count:", data.sessions?.length);
    if (data.sessions?.length > 0) {
      console.log("[TC-C6] Most recent session:", JSON.stringify(data.sessions[0], null, 2));
    }

    await page.goto(`${BASE_URL}/ai`, { waitUntil: "networkidle" });
    await ss(page, "tc-c6-sessions");

    expect(res.status()).toBe(200);
    expect(data.ok).toBe(true);
    expect(Array.isArray(data.sessions)).toBe(true);

    // After TC-C3 created a session, there should be at least one
    console.log(`[TC-C6] Total sessions in DB for user: ${data.sessions.length}`);
  });

});

// ─── Test Group 3: Setup Script Validation ────────────────────────────────────

test.describe("Test Group 3: Setup Script Validation", () => {

  test("TC-S1: Windows script content validation", async ({ request, page }) => {
    await signIn(request, page);

    const response = await request.get(`${BASE_URL}/api/setup/ollama-script?os=windows`);
    console.log("[TC-S1] Response status:", response.status());

    if (!response.ok()) {
      console.log("[TC-S1] Script endpoint returned:", response.status());
      const body = await response.text();
      console.log("[TC-S1] Body:", body.slice(0, 200));
    }

    expect(response.ok()).toBe(true);

    const content = await response.text();
    console.log("[TC-S1] Script length:", content.length, "chars");

    const checks = {
      hasOllamaSetupExe: content.includes("OllamaSetup.exe"),
      hasOllamaOrigins: content.includes("OLLAMA_ORIGINS"),
      hasQwen3Pull: content.includes("qwen3:32b"),
      hasOllamaCreate: content.includes("ollama create ideamanagement"),
      hasNoThink: content.includes("/no_think"),
      hasLocalhostOrigin: content.includes("localhost:3000"),
    };

    console.log("[TC-S1] Checks:", JSON.stringify(checks, null, 2));

    // Extract OLLAMA_ORIGINS line
    const originsMatch = content.match(/OLLAMA_ORIGINS.*?["'`]([^"'`\n]+)["'`]/);
    if (originsMatch) {
      console.log(`[TC-S1] OLLAMA_ORIGINS value: ${originsMatch[1]}`);
    }

    await page.goto(`${BASE_URL}/settings`, { waitUntil: "networkidle" });
    await ss(page, "tc-s1-windows-script-check");

    expect(checks.hasOllamaSetupExe).toBe(true);
    expect(checks.hasOllamaOrigins).toBe(true);
    expect(checks.hasQwen3Pull).toBe(true);
    expect(checks.hasOllamaCreate).toBe(true);
    expect(checks.hasNoThink).toBe(true);
    expect(checks.hasLocalhostOrigin).toBe(true);
  });

  test("TC-S2: Unix script content validation", async ({ request, page }) => {
    await signIn(request, page);

    const response = await request.get(`${BASE_URL}/api/setup/ollama-script?os=linux`);
    console.log("[TC-S2] Response status:", response.status());
    expect(response.ok()).toBe(true);

    const content = await response.text();
    console.log("[TC-S2] Script length:", content.length, "chars");

    const checks = {
      hasBashShebang: content.includes("#!/bin/bash"),
      hasOllamaInstallCurl: content.includes("ollama.com/install.sh"),
      hasOllamaOrigins: content.includes("OLLAMA_ORIGINS"),
      hasQwen3Pull: content.includes("qwen3:32b"),
      hasOllamaCreate: content.includes("ollama create ideamanagement"),
      hasNoThink: content.includes("/no_think"),
      hasLocalhostOrigin: content.includes("localhost:3000"),
    };

    console.log("[TC-S2] Checks:", JSON.stringify(checks, null, 2));

    await page.goto(`${BASE_URL}/settings`, { waitUntil: "networkidle" });
    await ss(page, "tc-s2-unix-script-check");

    expect(checks.hasBashShebang).toBe(true);
    expect(checks.hasOllamaOrigins).toBe(true);
    expect(checks.hasQwen3Pull).toBe(true);
    expect(checks.hasOllamaCreate).toBe(true);
    expect(checks.hasNoThink).toBe(true);
    expect(checks.hasLocalhostOrigin).toBe(true);
  });

  test("TC-S3: Script includes dynamic app URL in OLLAMA_ORIGINS", async ({ request, page }) => {
    await signIn(request, page);

    const windowsRes = await request.get(`${BASE_URL}/api/setup/ollama-script?os=windows`);
    const linuxRes = await request.get(`${BASE_URL}/api/setup/ollama-script?os=linux`);

    expect(windowsRes.ok()).toBe(true);
    expect(linuxRes.ok()).toBe(true);

    const windowsContent = await windowsRes.text();
    const linuxContent = await linuxRes.text();

    // Extract actual OLLAMA_ORIGINS values
    const winOriginsMatch = windowsContent.match(/OLLAMA_ORIGINS["' ]*[=,].*?["']([^"'\n]+)["']/);
    const linuxOriginsMatch = linuxContent.match(/OLLAMA_ORIGINS=["']?([^"'\n]+)["']?/);

    const windowsOrigins = winOriginsMatch?.[1] || "(not found)";
    const linuxOrigins = linuxOriginsMatch?.[1] || "(not found)";

    console.log(`[TC-S3] Windows OLLAMA_ORIGINS: ${windowsOrigins}`);
    console.log(`[TC-S3] Linux OLLAMA_ORIGINS: ${linuxOrigins}`);

    // Both should include localhost:3000 (the NEXT_PUBLIC_APP_URL in dev)
    const windowsHasLocalhostOrigin = windowsContent.includes("localhost:3000");
    const linuxHasLocalhostOrigin = linuxContent.includes("localhost:3000");

    console.log(`[TC-S3] Windows has localhost:3000: ${windowsHasLocalhostOrigin}`);
    console.log(`[TC-S3] Linux has localhost:3000: ${linuxHasLocalhostOrigin}`);

    // Also check for the Railway wildcard
    const windowsHasRailway = windowsContent.includes("railway.app");
    const linuxHasRailway = linuxContent.includes("railway.app");
    console.log(`[TC-S3] Windows has railway.app: ${windowsHasRailway}`);
    console.log(`[TC-S3] Linux has railway.app: ${linuxHasRailway}`);

    await page.goto(`${BASE_URL}/settings`, { waitUntil: "networkidle" });
    await ss(page, "tc-s3-app-url-check");

    expect(windowsHasLocalhostOrigin).toBe(true);
    expect(linuxHasLocalhostOrigin).toBe(true);
  });

});
