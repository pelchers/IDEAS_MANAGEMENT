/**
 * Capture validation screenshots for a completed phase.
 *
 * Usage:
 *   node capture-validation-screenshots.js <session> <phase> [baseUrl]
 *
 * Arguments:
 *   session  - Session key (e.g. "1_APP_FOUNDATIONS")
 *   phase    - Phase number (e.g. "2")
 *   baseUrl  - Base URL to capture (default: "http://localhost:3005")
 *
 * Output:
 *   .docs/validation/screenshots/<session>/phase_<phase>/
 *     desktop-viewport.png   (1536x960)
 *     mobile-viewport.png    (390x844)
 *     report.json
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SESSION = process.argv[2];
const PHASE = process.argv[3];
const BASE_URL = process.argv[4] || 'http://localhost:3005';

if (!SESSION || !PHASE) {
  console.error('Usage: node capture-validation-screenshots.js <session> <phase> [baseUrl]');
  process.exit(1);
}

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const OUTPUT_DIR = path.join(
  PROJECT_ROOT,
  '.docs',
  'validation',
  'screenshots',
  SESSION,
  `phase_${PHASE}`
);

const VIEWPORTS = [
  { name: 'desktop-viewport', width: 1536, height: 960 },
  { name: 'mobile-viewport', width: 390, height: 844 },
];

async function captureScreenshots() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();

    try {
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      const filepath = path.join(OUTPUT_DIR, `${vp.name}.png`);
      await page.screenshot({ path: filepath, fullPage: false });
      results.push({
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        path: path.relative(PROJECT_ROOT, filepath),
        status: 'captured',
      });
      console.log(`Captured ${vp.name} (${vp.width}x${vp.height})`);
    } catch (err) {
      results.push({
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        status: 'failed',
        error: err.message,
      });
      console.error(`Failed ${vp.name}: ${err.message}`);
    }

    await context.close();
  }

  await browser.close();

  const report = {
    session: SESSION,
    phase: parseInt(PHASE, 10),
    baseUrl: BASE_URL,
    timestamp: new Date().toISOString(),
    outputDir: path.relative(PROJECT_ROOT, OUTPUT_DIR),
    viewports: results,
  };

  const reportPath = path.join(OUTPUT_DIR, 'report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Report written to ${path.relative(PROJECT_ROOT, reportPath)}`);
}

captureScreenshots().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
