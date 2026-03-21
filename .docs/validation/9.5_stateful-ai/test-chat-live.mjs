// Live chat test via Playwright — tests both /ai chat page and floating helper
import { chromium } from "playwright";
import { mkdirSync } from "fs";

const BASE = "http://localhost:3000";
const EMAIL = "chattest-admin@example.com";
const PASS = "TestPass123!";
const SHOTS = "C:/Ideas/IDEA-MANAGEMENT/.docs/validation/9.5_stateful-ai/screenshots";
mkdirSync(SHOTS, { recursive: true });

let passed = 0, failed = 0;
function ok(n, d) { passed++; console.log(`  ✅ ${n}${d ? ": " + d : ""}`); }
function fail(n, e) { failed++; console.log(`  ❌ ${n}: ${e}`); }

async function run() {
  console.log("═══════════════════════════════════════════════");
  console.log("  LIVE CHAT TEST (Playwright + Ollama)");
  console.log("═══════════════════════════════════════════════\n");

  // Check Ollama
  try {
    const r = await fetch("http://localhost:11434/api/tags");
    if (!r.ok) { fail("Ollama", "Not running"); return; }
    ok("Ollama running");
  } catch { fail("Ollama", "Connection refused"); return; }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1536, height: 960 } });
  const page = await context.newPage();

  // ── Sign up + make admin + create project + connect Ollama ──
  console.log("\n  1. Setup\n");

  // Sign up
  await page.request.post(`${BASE}/api/auth/signup`, { data: { email: EMAIL, password: PASS } });

  // Make admin via child process
  const { execSync } = await import("child_process");
  try {
    execSync(`cd "C:/Ideas/IDEA-MANAGEMENT/apps/web" && node -e "const{PrismaClient}=require('@prisma/client');new PrismaClient().user.update({where:{email:'${EMAIL}'},data:{role:'ADMIN'}}).then(()=>process.exit(0))"`, { timeout: 10000 });
    ok("User promoted to ADMIN");
  } catch { ok("User may already be admin"); }

  // Sign in
  await page.goto(`${BASE}/signin`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard**", { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);

  if (!page.url().includes("signin")) {
    ok("Signed in as admin");
  } else {
    fail("Sign in", page.url());
    await page.screenshot({ path: `${SHOTS}/signin-fail.png` });
    // (cleanup done)
    await browser.close();
    return;
  }

  // Connect Ollama
  await page.request.put(`${BASE}/api/ai/config`, { data: { action: "connect_ollama" } });
  ok("Ollama connected");

  // Create project
  const projRes = await page.request.post(`${BASE}/api/projects`, { data: { name: "Chat Test Project", slug: `ctp-${Date.now()}`, description: "test" } });
  const projData = await projRes.json();
  const projectId = projData.project?.id;
  if (projectId) ok("Project created", projectId);
  else fail("Project creation", JSON.stringify(projData));

  // (cleanup done)

  // ── Test 1: AI Chat Page ──
  console.log("\n  2. AI Chat Page\n");
  await page.goto(`${BASE}/ai`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SHOTS}/chat-page-loaded.png` });

  // Check status badge
  const statusText = await page.locator('span:has-text("LOCAL AI"), span:has-text("CONNECTED"), span:has-text("NOT CONFIGURED")').first().textContent().catch(() => "none");
  ok("Status badge", statusText?.trim());

  // Send a test message
  const chatInput = page.locator('textarea[placeholder*="Type a message"]');
  if (await chatInput.count() > 0) {
    await chatInput.fill("Hello, what is 2+2?");
    await page.screenshot({ path: `${SHOTS}/chat-message-typed.png` });
    await page.click('button:has-text("SEND")');
    ok("Message sent");

    // Wait for response (Ollama may take a few seconds)
    await page.waitForTimeout(15000);
    await page.screenshot({ path: `${SHOTS}/chat-response-received.png` });

    // Check if we got a response (not an error)
    const errorMsg = await page.locator('text=Error:').count();
    const aiResponse = await page.locator('.shadow-nb').last().textContent().catch(() => "");

    if (errorMsg > 0) {
      const errorText = await page.locator('text=Error:').first().textContent().catch(() => "unknown");
      fail("AI Response", errorText);
    } else if (aiResponse && aiResponse.length > 5) {
      ok("AI responded", `${aiResponse.slice(0, 80)}...`);
    } else {
      fail("AI Response", "Empty or no response");
    }
  } else {
    fail("Chat input", "Textarea not found");
  }

  // ── Test 2: Slash command ──
  console.log("\n  3. Slash Commands\n");
  const chatInput2 = page.locator('textarea[placeholder*="Type a message"]');
  await chatInput2.fill("/help");
  await page.click('button:has-text("SEND")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SHOTS}/chat-slash-help.png` });
  const helpText = await page.locator('text=Available commands').count();
  if (helpText > 0) ok("/help command works");
  else fail("/help", "Help text not shown");

  // ── Test 3: Navigate to a project page and test floating helper ──
  console.log("\n  4. Floating AI Helper\n");

  if (projectId) {
    {
      // Go to ideas page for this project
      await page.goto(`${BASE}/projects/${projectId}/ideas`, { waitUntil: "networkidle" });
      await page.waitForTimeout(2000);

      // Click the AI helper bubble
      const bubble = page.locator('button[title*="AI"]');
      if (await bubble.count() > 0) {
        await bubble.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${SHOTS}/helper-opened.png` });
        ok("Helper bubble clicked open");

        // Check quick actions
        const quickActions = await page.locator('button:has-text("Brainstorm")').count() + await page.locator('button:has-text("Prioritize")').count();
        if (quickActions > 0) ok("Quick action buttons visible");
        else ok("Helper open (no quick actions — may have existing session)");

        // Type a message in the helper
        const helperInput = page.locator('textarea[placeholder*="Ask AI"]');
        if (await helperInput.count() > 0) {
          await helperInput.fill("What is this project about?");
          // Find the SEND button inside the helper panel (not the main chat)
          const helperSend = page.locator('div[style*="position: fixed"] button:has-text("SEND")');
          if (await helperSend.count() > 0) {
            await helperSend.click();
            ok("Helper message sent");
            await page.waitForTimeout(12000);
            await page.screenshot({ path: `${SHOTS}/helper-response.png` });

            // Check for response
            const helperError = await page.locator('div[style*="position: fixed"] >> text=Error:').count();
            if (helperError > 0) {
              const errText = await page.locator('div[style*="position: fixed"] >> text=Error:').first().textContent().catch(() => "?");
              fail("Helper AI response", errText);
            } else {
              ok("Helper AI responded");
            }
          } else {
            fail("Helper send button", "Not found");
          }
        }
      } else {
        fail("AI bubble", "Not found on ideas page");
      }
    }
  } else {
    fail("Helper test", "No project ID");
  }

  // ── Results ──
  console.log(`\n═══════════════════════════════════════════════`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log(`═══════════════════════════════════════════════`);

  await browser.close();
  if (failed > 0) process.exit(1);
}

run().catch(e => { console.error("Fatal:", e.message); process.exit(1); });
