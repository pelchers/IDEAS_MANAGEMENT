/**
 * Whiteboard Phase 4 validation — media attachments + resizable content
 * Usage: node .docs/validation/6_whiteboard/whiteboard-phase4-validation.mjs
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, "screenshots");
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const BASE = "http://localhost:3000";

async function main() {
  const browser = await chromium.launch({ headless: true });

  // ── Step 1: Sign up / sign in ──
  console.log("1. Signing in...");
  const authCtx = await browser.newContext({ viewport: { width: 1536, height: 960 } });
  const authPage = await authCtx.newPage();

  // Try signup first, fall back to signin
  await authPage.goto(`${BASE}/signup`, { waitUntil: "commit", timeout: 60000 });
  await authPage.waitForTimeout(2000);

  const emailInput = authPage.getByRole("textbox", { name: "Email" });
  if (await emailInput.isVisible({ timeout: 3000 })) {
    // Check if signup page has confirm password (signup) or not (signin)
    const confirmPwd = authPage.getByRole("textbox", { name: "Confirm Password" });
    if (await confirmPwd.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Try signup via API first (faster, avoids navigation issues)
      const signupRes = await authPage.evaluate(async () => {
        const r = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "pw-validate@test.com", password: "PlaywrightTest1!" }),
        });
        return { status: r.status, data: await r.json() };
      });
      if (signupRes.status === 409) {
        // User exists, sign in via API
        console.log("  User exists, signing in via API...");
        await authPage.evaluate(async () => {
          const r = await fetch("/api/auth/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "pw-validate@test.com", password: "PlaywrightTest1!" }),
          });
          return r.json();
        });
      } else {
        console.log("  Signed up new user via API");
      }
      // Navigate to dashboard after auth cookies are set
      await authPage.goto(`${BASE}/dashboard`, { waitUntil: "commit", timeout: 15000 });
      await authPage.waitForTimeout(2000);
    }
  }
  console.log("  Signed in. URL:", authPage.url());

  // ── Step 2: Create a test project ──
  console.log("2. Creating test project...");
  const projectRes = await authPage.evaluate(async () => {
    const r = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Playwright Test Project", description: "Auto-created for testing" }),
    });
    return r.json();
  });

  let projectId;
  if (projectRes.ok) {
    projectId = projectRes.project.id;
    console.log("  Created project:", projectId);
  } else {
    // Fetch existing projects
    const listRes = await authPage.evaluate(async () => {
      const r = await fetch("/api/projects");
      return r.json();
    });
    if (listRes.ok && listRes.projects?.length > 0) {
      projectId = listRes.projects[0].id;
      console.log("  Using existing project:", projectId);
    } else {
      console.error("  No projects available!");
      await browser.close();
      process.exit(1);
    }
  }

  // ── Step 3: Navigate to whiteboard ──
  console.log("3. Navigating to whiteboard...");
  await authPage.goto(`${BASE}/projects/${projectId}/whiteboard`, { waitUntil: "commit", timeout: 15000 });
  await authPage.waitForTimeout(1000);
  console.log("  URL:", authPage.url());

  // ── Step 4: Validate toolbar ──
  console.log("4. Validating toolbar...");
  const toolButtons = await authPage.locator('button[title]').all();
  const toolTitles = [];
  for (const btn of toolButtons) {
    const title = await btn.getAttribute("title");
    if (title) toolTitles.push(title);
  }
  console.log("  Tool buttons found:", toolTitles);

  const requiredTools = ["Select", "Freehand Draw", "Straight Line", "Place Dot", "Eraser", "Add Sticky Note", "Attach Media"];
  for (const tool of requiredTools) {
    const found = toolTitles.some((t) => t.includes(tool.split(" ")[0]));
    console.log(`  ${found ? "✓" : "✗"} ${tool}`);
  }

  // ── Step 5: Validate hidden file input ──
  console.log("5. Validating file input...");
  const fileInput = authPage.locator('input[type="file"]');
  const fileInputCount = await fileInput.count();
  const accept = fileInputCount > 0 ? await fileInput.getAttribute("accept") : null;
  console.log(`  File input exists: ${fileInputCount > 0}, accept: ${accept}`);

  // ── Step 6: Validate empty state ──
  console.log("6. Validating empty state...");
  const emptyText = await authPage.locator("text=Select a tool to start").textContent().catch(() => null);
  const hasMedia = emptyText?.includes("Media");
  console.log(`  Empty state text: ${emptyText ? "found" : "not found"}, mentions Media: ${hasMedia}`);

  // ── Step 7: Test sticky note creation ──
  console.log("7. Testing sticky note creation...");
  const stickyBtn = authPage.locator('button[title="Add Sticky Note"]');
  await stickyBtn.click();
  // Click on canvas area
  const canvas = authPage.locator("canvas");
  const box = await canvas.boundingBox();
  if (box) {
    await authPage.mouse.click(box.x + 300, box.y + 200);
    await authPage.waitForTimeout(500);
  }

  // Check if sticky settings popup opened
  const stickyPopup = await authPage.locator("text=STICKY SETTINGS").isVisible({ timeout: 2000 }).catch(() => false);
  console.log(`  Sticky settings popup opened: ${stickyPopup}`);

  if (stickyPopup) {
    // Fill in title and save
    const titleInput = authPage.locator('input[type="text"]').first();
    await titleInput.fill("Test Note");
    await authPage.locator("button:text('SAVE')").click();
    await authPage.waitForTimeout(300);
  }

  // ── Step 8: Test media tool activation ──
  console.log("8. Testing media tool...");
  const mediaBtn = authPage.locator('button[title*="Media"]').or(authPage.locator('button[title*="Attach"]'));
  if (await mediaBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await mediaBtn.click();
    await authPage.waitForTimeout(200);
    // Check cursor changed (we can't directly check cursor, but tool should be active)
    console.log("  Media tool clicked (file picker would open on canvas click)");
    // Switch back to select
    await authPage.locator('button[title="Select"]').click();
  }

  // ── Step 9: Take screenshots ──
  console.log("9. Taking screenshots...");

  // Desktop
  await authPage.screenshot({
    path: join(SCREENSHOTS_DIR, "whiteboard-phase4-desktop.png"),
    fullPage: true
  });
  console.log("  ✓ whiteboard-phase4-desktop.png");

  // Toolbar zoom
  const toolbarArea = authPage.locator("h1:text('WHITEBOARD')").locator("xpath=..");
  const toolbarBox = await toolbarArea.boundingBox();
  if (toolbarBox) {
    await authPage.screenshot({
      path: join(SCREENSHOTS_DIR, "whiteboard-toolbar-zoom.png"),
      clip: { x: 0, y: 0, width: 1536, height: toolbarBox.height + toolbarBox.y + 20 },
    });
    console.log("  ✓ whiteboard-toolbar-zoom.png");
  }

  // Mobile
  await authPage.setViewportSize({ width: 390, height: 844 });
  await authPage.waitForTimeout(500);
  await authPage.screenshot({
    path: join(SCREENSHOTS_DIR, "whiteboard-phase4-mobile.png"),
    fullPage: true,
  });
  console.log("  ✓ whiteboard-phase4-mobile.png");

  // ── Step 10: Check console errors ──
  console.log("10. Checking console errors...");
  const errors = [];
  authPage.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await authPage.reload({ waitUntil: "commit", timeout: 10000 });
  await authPage.waitForTimeout(2000);
  if (errors.length > 0) {
    console.log("  Console errors:", errors.slice(0, 5));
  } else {
    console.log("  ✓ No console errors");
  }

  console.log("\n=== Validation complete ===");
  await browser.close();
}

main().catch((err) => {
  console.error("Validation failed:", err.message);
  process.exit(1);
});
