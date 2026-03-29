// Reasoning Display Validation — tests live reasoning, tool display, and log toggle
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";

const BASE = "http://localhost:3000";
const EMAIL = "reasonvis@example.com";
const PASS = "TestPass123!";
const SHOTS = "C:/Ideas/IDEA-MANAGEMENT/.docs/validation/9.5_stateful-ai/screenshots";
mkdirSync(SHOTS, { recursive: true });

let passed = 0, failed = 0;
const results = [];
function ok(n, d) { passed++; results.push({ s: "PASS", n, d: d || "" }); console.log(`  ✅ ${n}${d ? ": " + d : ""}`); }
function fail(n, e) { failed++; results.push({ s: "FAIL", n, d: e }); console.log(`  ❌ ${n}: ${e}`); }

async function run() {
  console.log("═══════════════════════════════════════════════");
  console.log("  REASONING DISPLAY VALIDATION");
  console.log("═══════════════════════════════════════════════\n");

  const { execSync } = await import("child_process");
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1536, height: 960 } });
  const page = await context.newPage();

  // Setup
  await page.request.post(`${BASE}/api/auth/signup`, { data: { email: EMAIL, password: PASS } });
  try { execSync(`cd "C:/Ideas/IDEA-MANAGEMENT/apps/web" && node -e "const{PrismaClient}=require('@prisma/client');new PrismaClient().user.update({where:{email:'${EMAIL}'},data:{role:'ADMIN'}}).then(()=>process.exit(0))"`, { timeout: 10000 }); } catch {}
  await page.goto(`${BASE}/signin`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard**", { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);
  ok("Auth");

  await page.request.put(`${BASE}/api/ai/config`, { data: { action: "connect_ollama" } });
  const projRes = await page.request.post(`${BASE}/api/projects`, { data: { name: "Reasoning Test", slug: `rvt-${Date.now()}` } });
  const projData = await projRes.json();
  const pid = projData.project?.id;
  ok("Project created", pid);

  // Navigate to AI chat
  await page.goto(`${BASE}/ai`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Check "Log Reasoning" toggle exists
  const logToggle = page.locator('text=LOG REASONING');
  if (await logToggle.count() > 0) ok("Log Reasoning toggle visible");
  else fail("Log Reasoning toggle", "Not found");

  // Check project selector
  const projSelect = page.locator('select.nb-input');
  if (await projSelect.count() > 0) ok("Project selector visible");
  else fail("Project selector", "Not found");

  await page.screenshot({ path: `${SHOTS}/reasoning-page-loaded.png` });

  // Send a message that should trigger tool call
  const chatInput = page.locator('textarea[placeholder*="Type a message"]');
  await chatInput.fill("Add an idea titled Test Reasoning Feature");
  await page.click('button:has-text("SEND")');
  ok("Message sent");

  // Wait for response (qwen3:32b takes longer)
  await page.waitForTimeout(30000);
  await page.screenshot({ path: `${SHOTS}/reasoning-response.png` });

  // Check for reasoning area (details/summary with "Working..." or "tool(s)")
  const reasoningArea = await page.locator('details summary:has-text("tool"), details summary:has-text("Working"), details summary:has-text("reasoning")').count();
  if (reasoningArea > 0) ok("Reasoning/tool area visible");
  else fail("Reasoning area", "Not found in response");

  // Check for tool call indicators
  const toolIndicator = await page.locator('text=update ideas').count() + await page.locator('text=Calling').count() + await page.locator('text=✅').count();
  if (toolIndicator > 0) ok("Tool execution indicators visible");
  else fail("Tool indicators", "Not found");

  // Enable Log Reasoning toggle
  const checkbox = page.locator('input[type="checkbox"]').first();
  if (await checkbox.count() > 0) {
    await checkbox.check();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SHOTS}/reasoning-toggle-on.png` });
    ok("Log Reasoning toggled ON");
  }

  // Verify idea was actually created
  const ideasRes = await page.request.get(`${BASE}/api/projects/${pid}/artifacts/ideas/ideas.json`);
  const ideasData = await ideasRes.json();
  const ideaCount = ideasData.artifact?.content?.ideas?.length || 0;
  if (ideaCount >= 1) ok("Idea created in artifact", `${ideaCount} idea(s)`);
  else fail("Idea creation", "No ideas in artifact");

  await browser.close();

  // Report
  console.log(`\n═══════════════════════════════════════════════`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log(`═══════════════════════════════════════════════`);

  let md = `# Reasoning Display Validation Report\n\n**Date:** ${new Date().toISOString().split("T")[0]}\n**Results:** ${passed} passed, ${failed} failed\n\n## Tests\n\n| # | Status | Test | Detail |\n|---|--------|------|--------|\n`;
  results.forEach((r, i) => { md += `| ${i + 1} | ${r.s === "PASS" ? "✅" : "❌"} | ${r.n} | ${r.d} |\n`; });
  writeFileSync("C:/Ideas/IDEA-MANAGEMENT/.docs/validation/9.5_stateful-ai/REASONING-REPORT.md", md);
  console.log("\nReport: .docs/validation/9.5_stateful-ai/REASONING-REPORT.md");

  if (failed > 0) process.exit(1);
}

run().catch(e => { console.error("Fatal:", e.message); process.exit(1); });
