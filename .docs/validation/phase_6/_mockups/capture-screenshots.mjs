import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, "..");

const views = ["ideas", "kanban", "whiteboard", "schema", "directory-tree"];

async function main() {
  const browser = await chromium.launch();

  for (const view of views) {
    const htmlPath = path.resolve(__dirname, `${view}.html`).replace(/\\/g, "/");
    const fileUrl = `file:///${htmlPath}`;

    // Desktop
    const desktopPage = await browser.newPage({
      viewport: { width: 1536, height: 960 },
    });
    await desktopPage.goto(fileUrl, { waitUntil: "networkidle" });
    await desktopPage.screenshot({
      path: path.join(outputDir, `${view}-desktop.png`),
      fullPage: true,
    });
    await desktopPage.close();

    // Mobile
    const mobilePage = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    await mobilePage.goto(fileUrl, { waitUntil: "networkidle" });
    await mobilePage.screenshot({
      path: path.join(outputDir, `${view}-mobile.png`),
      fullPage: true,
    });
    await mobilePage.close();

    console.log(`Captured ${view} (desktop + mobile)`);
  }

  await browser.close();
  console.log("All screenshots captured.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
