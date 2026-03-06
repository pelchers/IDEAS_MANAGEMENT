import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function capture() {
  const browser = await chromium.launch();
  const htmlPath = path.join(__dirname, "validation-page.html");
  const fileUrl = `file:///${htmlPath.replace(/\\/g, "/")}`;

  // Desktop viewport
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto(fileUrl, { waitUntil: "networkidle" });

  // Full page screenshot
  await desktopPage.screenshot({
    path: path.join(__dirname, "phase5-full-desktop.png"),
    fullPage: true,
  });

  // Individual section screenshots
  const sections = ["dashboard", "workspace", "sync-status", "conflict-resolver"];
  for (const id of sections) {
    const el = desktopPage.locator(`#${id}`);
    await el.screenshot({
      path: path.join(__dirname, `phase5-${id}-desktop.png`),
    });
  }

  await desktopContext.close();

  // Mobile viewport
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(fileUrl, { waitUntil: "networkidle" });

  await mobilePage.screenshot({
    path: path.join(__dirname, "phase5-full-mobile.png"),
    fullPage: true,
  });

  for (const id of sections) {
    const el = mobilePage.locator(`#${id}`);
    await el.screenshot({
      path: path.join(__dirname, `phase5-${id}-mobile.png`),
    });
  }

  await mobileContext.close();
  await browser.close();

  console.log("Screenshots captured successfully!");
}

capture().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
