import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pages = [
  {
    html: "test-results-summary.html",
    desktopPng: "test-results-desktop.png",
    mobilePng: "test-results-mobile.png",
  },
  {
    html: "security-audit-checklist.html",
    desktopPng: "security-audit-desktop.png",
    mobilePng: "security-audit-mobile.png",
  },
  {
    html: "performance-metrics.html",
    desktopPng: "performance-metrics-desktop.png",
    mobilePng: "performance-metrics-mobile.png",
  },
];

async function main() {
  const browser = await chromium.launch();

  for (const entry of pages) {
    const htmlPath = path.resolve(__dirname, entry.html);
    const fileUrl = `file:///${htmlPath.replace(/\\/g, "/")}`;

    // Desktop viewport
    const desktopPage = await browser.newPage({
      viewport: { width: 1536, height: 960 },
    });
    await desktopPage.goto(fileUrl, { waitUntil: "networkidle" });
    await desktopPage.screenshot({
      path: path.resolve(__dirname, entry.desktopPng),
      fullPage: true,
    });
    await desktopPage.close();
    console.log(`Captured: ${entry.desktopPng}`);

    // Mobile viewport
    const mobilePage = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    await mobilePage.goto(fileUrl, { waitUntil: "networkidle" });
    await mobilePage.screenshot({
      path: path.resolve(__dirname, entry.mobilePng),
      fullPage: true,
    });
    await mobilePage.close();
    console.log(`Captured: ${entry.mobilePng}`);
  }

  await browser.close();
  console.log("All screenshots captured.");
}

main().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
