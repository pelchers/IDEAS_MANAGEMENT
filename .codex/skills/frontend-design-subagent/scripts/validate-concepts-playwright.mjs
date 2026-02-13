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

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await context.newPage();

const styles = (await fs.readdir(conceptRoot, { withFileTypes: true })).filter((d) => d.isDirectory());
const aggregate = [];

for (const style of styles) {
  const stylePath = path.join(conceptRoot, style.name);
  const passes = (await fs.readdir(stylePath, { withFileTypes: true })).filter(
    (d) => d.isDirectory() && d.name.startsWith("pass-")
  );

  for (const pass of passes) {
    const passPath = path.join(stylePath, pass.name);
    const indexPath = path.join(passPath, "index.html");
    if (!(await exists(indexPath))) continue;

    const validationDir = path.join(passPath, "validation");
    const screenshotsDir = path.join(validationDir, "screenshots");
    await fs.mkdir(screenshotsDir, { recursive: true });

    const fileUrl = `file:///${indexPath.replace(/\\/g, "/")}`;
    await page.goto(fileUrl);

    const screenshots = [];
    for (const view of requiredViews) {
      const selector = `button[data-view='${view}']`;
      const button = page.locator(selector);
      if ((await button.count()) === 0) {
        throw new Error(`Missing nav button for view '${view}' in ${style.name}/${pass.name}`);
      }
      await button.first().click();
      await page.waitForTimeout(120);
      const shotPath = path.join(screenshotsDir, `${view}.png`);
      await page.screenshot({ path: shotPath, fullPage: true });
      screenshots.push(path.relative(passPath, shotPath).replace(/\\/g, "/"));
    }

    const report = {
      style: style.name,
      pass: pass.name,
      requiredViews,
      screenshots,
      timestamp: new Date().toISOString()
    };

    await fs.writeFile(
      path.join(validationDir, "report.playwright.json"),
      JSON.stringify(report, null, 2),
      "utf8"
    );
    aggregate.push(report);
  }
}

await fs.writeFile(path.join(conceptRoot, "validation-report.json"), JSON.stringify(aggregate, null, 2), "utf8");
await browser.close();
console.log(`Validated ${aggregate.length} pass folders.`);
