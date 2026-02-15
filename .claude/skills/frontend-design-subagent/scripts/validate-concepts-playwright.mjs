#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

function arg(name, fallback = null) {
  const i = process.argv.indexOf(name);
  if (i === -1) return fallback;
  return process.argv[i + 1] ?? fallback;
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

const conceptRoot = path.resolve(arg("--concept-root", ".docs/planning/concepts"));
const configPath = path.resolve(
  arg(
    "--config",
    ".codex/skills/planning-frontend-design-orchestrator/references/style-config.json"
  )
);
const styleFilter = arg("--style", null);
const passFilter = arg("--pass", null);

if (!(await exists(conceptRoot))) {
  console.error(`Concept root not found: ${conceptRoot}`);
  process.exit(1);
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Playwright not installed. Run: pnpm add -D playwright");
  process.exit(2);
}

let requiredViews = [
  "dashboard",
  "projects",
  "project-workspace",
  "kanban",
  "whiteboard",
  "schema-planner",
  "directory-tree",
  "ideas",
  "ai-chat",
  "settings"
];

if (await exists(configPath)) {
  try {
    const config = JSON.parse(await fs.readFile(configPath, "utf8"));
    if (Array.isArray(config.requiredViews) && config.requiredViews.length > 0) {
      requiredViews = config.requiredViews;
    }
  } catch (error) {
    console.warn(`Failed to read requiredViews from config: ${error.message}`);
  }
}

const VIEWPORTS = {
  desktop: { width: 1536, height: 960 },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true }
};

async function captureViewport(browser, indexPath, passPath, viewportName, viewportOpts) {
  const context = await browser.newContext({ viewport: viewportOpts });
  const page = await context.newPage();

  const outDir = path.join(passPath, "validation", viewportName);
  await fs.mkdir(outDir, { recursive: true });

  const fileUrl = `file:///${indexPath.replace(/\\/g, "/")}`;
  await page.goto(fileUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(300);

  const screenshots = [];
  for (const view of requiredViews) {
    // Try clicking the nav button directly first
    let clicked = false;
    const selector = `[data-view='${view}']`;
    const el = page.locator(selector).first();
    if ((await el.count()) > 0) {
      const isVisible = await el.isVisible().catch(() => false);
      if (isVisible) {
        try {
          await el.click({ timeout: 3000 });
          clicked = true;
        } catch { /* fall through to JS fallback */ }
      }
    }

    // If button is hidden (mobile hamburger, overflow, etc.), use JS to switch view
    if (!clicked) {
      // First try opening any hamburger/mobile menu toggle
      const hamburger = page.locator(
        '.hamburger, .menu-toggle, .mobile-toggle, .nav-toggle, [data-mobile-menu], .burger'
      ).first();
      if ((await hamburger.count()) > 0 && await hamburger.isVisible().catch(() => false)) {
        try {
          await hamburger.click({ timeout: 2000 });
          await page.waitForTimeout(300);
          // Try clicking the nav button again after hamburger opens
          if ((await el.count()) > 0 && await el.isVisible().catch(() => false)) {
            try {
              await el.click({ timeout: 2000 });
              clicked = true;
            } catch { /* fall through */ }
          }
        } catch { /* fall through */ }
      }
    }

    // Final fallback: use JavaScript to simulate the view switch
    if (!clicked) {
      await page.evaluate((viewId) => {
        // Click the button via JS (bypasses visibility/viewport checks)
        const btn = document.querySelector(`[data-view='${viewId}']`);
        if (btn) {
          btn.click();
          return;
        }
        // Manual view switching as last resort
        document.querySelectorAll('[data-page]').forEach(p => {
          p.style.display = p.dataset.page === viewId ? '' : 'none';
          p.classList.toggle('active', p.dataset.page === viewId);
        });
        document.querySelectorAll('[data-view]').forEach(b => {
          b.classList.toggle('active', b.dataset.view === viewId);
        });
        if (window.location.hash !== `#${viewId}`) {
          window.location.hash = viewId;
        }
      }, view);
    }

    await page.waitForTimeout(250);
    const shotPath = path.join(outDir, `${view}.png`);
    await page.screenshot({ path: shotPath, fullPage: true });
    screenshots.push(`validation/${viewportName}/${view}.png`);
  }

  await context.close();
  return screenshots;
}

const browser = await chromium.launch({ headless: true });

const styleDirs = (await fs.readdir(conceptRoot, { withFileTypes: true }))
  .filter((d) => d.isDirectory() && !d.name.startsWith("_") && !d.name.startsWith("run-"))
  .filter((d) => !styleFilter || d.name === styleFilter);

const aggregate = [];
let errors = 0;

for (const style of styleDirs) {
  const stylePath = path.join(conceptRoot, style.name);
  const passDirs = (await fs.readdir(stylePath, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && d.name.startsWith("pass-"))
    .filter((d) => !passFilter || d.name === `pass-${passFilter}`);

  for (const pass of passDirs) {
    const passPath = path.join(stylePath, pass.name);
    const indexPath = path.join(passPath, "index.html");
    if (!(await exists(indexPath))) continue;

    console.log(`\n📸 ${style.name}/${pass.name}`);

    try {
      const desktopShots = await captureViewport(
        browser, indexPath, passPath, "desktop", VIEWPORTS.desktop
      );
      console.log(`  ✓ Desktop: ${desktopShots.length} screenshots`);

      const mobileShots = await captureViewport(
        browser, indexPath, passPath, "mobile", VIEWPORTS.mobile
      );
      console.log(`  ✓ Mobile: ${mobileShots.length} screenshots`);

      const report = {
        style: style.name,
        pass: pass.name,
        requiredViews,
        desktop: { viewport: VIEWPORTS.desktop, screenshots: desktopShots },
        mobile: { viewport: VIEWPORTS.mobile, screenshots: mobileShots },
        timestamp: new Date().toISOString()
      };

      const validationDir = path.join(passPath, "validation");
      await fs.writeFile(
        path.join(validationDir, "report.playwright.json"),
        JSON.stringify(report, null, 2),
        "utf8"
      );
      aggregate.push(report);
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}`);
      errors += 1;
    }
  }
}

await fs.writeFile(
  path.join(conceptRoot, "validation-report.json"),
  JSON.stringify(aggregate, null, 2),
  "utf8"
);
await browser.close();

console.log(`\nValidated ${aggregate.length} pass folders (${errors} errors).`);
if (errors > 0) process.exit(3);
