/**
 * Capture PNG screenshots from HTML validation files for Phase 3 and Phase 4.
 * Usage: node .docs/validation/capture-html-screenshots.mjs
 */
import { chromium } from 'playwright';
import { readdirSync, existsSync } from 'fs';
import { join, basename, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const phases = [
  {
    dir: join(__dirname, 'phase_3'),
    desktopWidth: 1536,
    desktopHeight: 960,
    mobileWidth: 390,
    mobileHeight: 844,
  },
  {
    dir: join(__dirname, 'phase_4'),
    desktopWidth: 1536,
    desktopHeight: 960,
    mobileWidth: 390,
    mobileHeight: 844,
  },
];

async function main() {
  const browser = await chromium.launch();

  for (const phase of phases) {
    if (!existsSync(phase.dir)) {
      console.log(`Skipping ${phase.dir} — not found`);
      continue;
    }

    const htmlFiles = readdirSync(phase.dir).filter(f => f.endsWith('.html'));
    console.log(`\n=== ${basename(phase.dir)} === (${htmlFiles.length} HTML files)`);

    for (const htmlFile of htmlFiles) {
      const htmlPath = resolve(phase.dir, htmlFile);
      const nameBase = htmlFile.replace('.html', '');
      const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;

      // Desktop screenshot
      const desktopPage = await browser.newPage({
        viewport: { width: phase.desktopWidth, height: phase.desktopHeight },
      });
      await desktopPage.goto(fileUrl, { waitUntil: 'networkidle' });
      await desktopPage.waitForTimeout(500);
      const desktopPath = join(phase.dir, `${nameBase}-desktop.png`);
      await desktopPage.screenshot({ path: desktopPath, fullPage: true });
      console.log(`  [desktop] ${desktopPath}`);
      await desktopPage.close();

      // Mobile screenshot
      const mobilePage = await browser.newPage({
        viewport: { width: phase.mobileWidth, height: phase.mobileHeight, deviceScaleFactor: 2 },
      });
      await mobilePage.goto(fileUrl, { waitUntil: 'networkidle' });
      await mobilePage.waitForTimeout(500);
      const mobilePath = join(phase.dir, `${nameBase}-mobile.png`);
      await mobilePage.screenshot({ path: mobilePath, fullPage: true });
      console.log(`  [mobile]  ${mobilePath}`);
      await mobilePage.close();
    }
  }

  await browser.close();
  console.log('\nDone — all screenshots captured.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
