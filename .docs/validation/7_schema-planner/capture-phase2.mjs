// Playwright validation screenshots for Schema Planner Phase 2-5
import { chromium } from "playwright";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, "screenshots");
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const BASE = "http://localhost:3000";
const TEST_EMAIL = "schematest@example.com";
const TEST_PASS = "TestPass123!";

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1536, height: 960 } });
  const page = await context.newPage();

  // ── Step 1: Sign up (ignore if already exists) ──
  console.log("Signing up test user...");
  const signupRes = await page.request.post(`${BASE}/api/auth/signup`, {
    data: { email: TEST_EMAIL, password: TEST_PASS },
  });
  const signupData = await signupRes.json();
  console.log("Signup:", signupData.ok ? "created" : signupData.error || "exists");

  // ── Step 2: Sign in via form to get session cookie ──
  console.log("Signing in...");
  await page.goto(`${BASE}/signin`, { waitUntil: "networkidle", timeout: 15000 });
  await page.fill('input[type="email"], input[name="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASS);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard**", { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);

  const url = page.url();
  console.log("After signin, URL:", url);
  if (url.includes("signin")) {
    console.error("Auth failed — still on signin page. Attempting anyway...");
  }

  // ── Step 3: Create a project if needed ──
  console.log("Creating test project...");
  const createRes = await page.request.post(`${BASE}/api/projects`, {
    data: { name: "Schema Test Project", slug: "schema-test-" + Date.now(), description: "Test project for schema validation" },
  });
  let projectId = null;
  if (createRes.ok()) {
    const createData = await createRes.json();
    projectId = createData.project?.id;
    console.log("Project created:", projectId);
  } else {
    // Try to get existing projects
    const listRes = await page.request.get(`${BASE}/api/projects`);
    if (listRes.ok()) {
      const listData = await listRes.json();
      if (listData.projects && listData.projects.length > 0) {
        projectId = listData.projects[0].id;
        console.log("Using existing project:", projectId);
      }
    }
  }

  if (!projectId) {
    console.error("No project available — cannot test schema page");
    await browser.close();
    return;
  }

  // ── Step 4: Navigate to schema page ──
  const schemaUrl = `${BASE}/projects/${projectId}/schema`;
  console.log("Navigating to:", schemaUrl);
  await page.goto(schemaUrl, { waitUntil: "networkidle", timeout: 15000 });
  await page.waitForTimeout(2000);

  // Screenshot 1: Initial state (empty or with data)
  await page.screenshot({ path: join(SCREENSHOTS_DIR, "schema-phase2-initial.png"), fullPage: true });
  console.log("Captured: schema-phase2-initial.png");

  // ── Step 5: Add an entity ──
  const addBtn = page.getByRole("button", { name: /ADD ENTITY/i }).first();
  if (await addBtn.isVisible()) {
    await addBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, "schema-add-entity-modal.png"), fullPage: true });
    console.log("Captured: schema-add-entity-modal.png");

    // Fill name and create
    await page.fill('input[placeholder*="e.g."]', "Products");
    await page.getByRole("button", { name: "CREATE" }).click();
    await page.waitForTimeout(1000);

    // Add another entity
    await page.getByRole("button", { name: /ADD ENTITY/i }).first().click();
    await page.waitForTimeout(300);
    await page.fill('input[placeholder*="e.g."]', "Orders");
    await page.getByRole("button", { name: "CREATE" }).click();
    await page.waitForTimeout(1000);

    // Add a third entity
    await page.getByRole("button", { name: /ADD ENTITY/i }).first().click();
    await page.waitForTimeout(300);
    await page.fill('input[placeholder*="e.g."]', "Categories");
    await page.getByRole("button", { name: "CREATE" }).click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: join(SCREENSHOTS_DIR, "schema-entities-created.png"), fullPage: true });
    console.log("Captured: schema-entities-created.png");
  }

  // ── Step 6: Add a field to first entity ──
  const addFieldBtn = page.getByRole("button", { name: /ADD FIELD/i }).first();
  if (await addFieldBtn.isVisible()) {
    await addFieldBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, "schema-add-field-modal.png"), fullPage: true });
    console.log("Captured: schema-add-field-modal.png");

    await page.fill('input[placeholder*="e.g. email"]', "name");
    await page.getByRole("button", { name: "ADD", exact: true }).click();
    await page.waitForTimeout(500);

    // Add another field
    await addFieldBtn.click();
    await page.waitForTimeout(300);
    await page.fill('input[placeholder*="e.g. email"]', "price");
    await page.locator('.nb-input[value="string"]').selectOption('float').catch(() => page.locator('select.nb-input').first().selectOption('float').catch(() => {}));
    await page.getByRole("button", { name: "ADD", exact: true }).click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: join(SCREENSHOTS_DIR, "schema-fields-added.png"), fullPage: true });
    console.log("Captured: schema-fields-added.png");
  }

  // ── Step 7: Add a relation ──
  const addRelBtn = page.getByRole("button", { name: /ADD RELATION/i });
  if (await addRelBtn.isVisible()) {
    await addRelBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, "schema-add-relation-modal.png"), fullPage: true });
    console.log("Captured: schema-add-relation-modal.png");

    await page.getByRole("button", { name: "CREATE" }).click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, "schema-with-relation.png"), fullPage: true });
    console.log("Captured: schema-with-relation.png");
  }

  // ── Step 8: Import modal ──
  const importBtn = page.getByRole("button", { name: "IMPORT" });
  if (await importBtn.isVisible()) {
    await importBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, "schema-import-github.png"), fullPage: true });
    console.log("Captured: schema-import-github.png");

    // Switch to local tab
    const localTab = page.getByRole("button", { name: "LOCAL FILES" });
    if (await localTab.isVisible()) {
      await localTab.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: join(SCREENSHOTS_DIR, "schema-import-local.png"), fullPage: true });
      console.log("Captured: schema-import-local.png");
    }

    await page.getByRole("button", { name: "CLOSE", exact: true }).click();
    await page.waitForTimeout(300);
  }

  // ── Step 9: Export modals ──
  const prismaBtn = page.getByRole("button", { name: "PRISMA" }).first();
  if (await prismaBtn.isVisible()) {
    await prismaBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, "schema-export-prisma.png"), fullPage: true });
    console.log("Captured: schema-export-prisma.png");
    await page.getByRole("button", { name: "CLOSE", exact: true }).click();
    await page.waitForTimeout(300);
  }

  const sqlBtn = page.getByRole("button", { name: "SQL" });
  if (await sqlBtn.isVisible()) {
    await sqlBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, "schema-export-sql.png"), fullPage: true });
    console.log("Captured: schema-export-sql.png");
    await page.getByRole("button", { name: "CLOSE", exact: true }).click();
    await page.waitForTimeout(300);
  }

  // ── Step 10: Final full view ──
  await page.screenshot({ path: join(SCREENSHOTS_DIR, "schema-phase2-desktop.png"), fullPage: true });
  console.log("Captured: schema-phase2-desktop.png");

  // ── Step 11: Mobile viewport ──
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(SCREENSHOTS_DIR, "schema-phase2-mobile.png"), fullPage: true });
  console.log("Captured: schema-phase2-mobile.png");

  await browser.close();
  console.log("\nDone — all screenshots saved to", SCREENSHOTS_DIR);
}

run().catch((err) => { console.error("Error:", err.message); process.exit(1); });
