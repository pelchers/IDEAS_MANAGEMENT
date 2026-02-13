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

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await context.newPage();

const requiredViews = [
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

    const outDir = path.join(passPath, "validation", "playwright");
    await fs.mkdir(outDir, { recursive: true });

    const fileUrl = `file:///${indexPath.replace(/\\/g, "/")}`;
    await page.goto(fileUrl);

    const screenshots = [];
    for (const view of requiredViews) {
      await page.click(`button[data-view='${view}']`);
      await page.waitForTimeout(120);
      const shot = path.join(outDir, `${view}.png`);
      await page.screenshot({ path: shot, fullPage: true });
      screenshots.push(path.basename(shot));
    }

    const report = {
      style: style.name,
      pass: pass.name,
      screenshots,
      timestamp: new Date().toISOString()
    };

    await fs.writeFile(path.join(outDir, "report.json"), JSON.stringify(report, null, 2), "utf8");
    aggregate.push(report);
  }
}

await fs.writeFile(path.join(conceptRoot, "validation-report.json"), JSON.stringify(aggregate, null, 2), "utf8");
await browser.close();
console.log(`Validated ${aggregate.length} pass folders.`);
