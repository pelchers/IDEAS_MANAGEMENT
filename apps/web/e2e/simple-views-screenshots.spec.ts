import { test } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const SCREENSHOT_DIR = path.resolve(__dirname, '../../../.docs/validation/8_simple-views/screenshots');
const DESKTOP = { width: 1536, height: 960 };
const MOBILE = { width: 390, height: 844 };

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@idea.management';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPass123!';

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/signin');
  await page.waitForLoadState('networkidle');
  await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(dashboard|projects)/, { timeout: 15_000 });
  await page.waitForLoadState('networkidle');
}

test.describe('Simple views screenshots', () => {
  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  });

  /* ── Ideas ── */
  test('ideas - desktop', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await signIn(page);
    await page.goto('/projects/1/ideas');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'ideas-desktop.png'), fullPage: true });
  });

  test('ideas - mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await signIn(page);
    await page.goto('/projects/1/ideas');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'ideas-mobile.png'), fullPage: true });
  });

  /* ── Directory Tree ── */
  test('directory tree - desktop', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await signIn(page);
    await page.goto('/projects/1/directory-tree');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'directory-tree-desktop.png'), fullPage: true });
  });

  test('directory tree - mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await signIn(page);
    await page.goto('/projects/1/directory-tree');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'directory-tree-mobile.png'), fullPage: true });
  });

  /* ── Settings ── */
  test('settings - desktop', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await signIn(page);
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'settings-desktop.png'), fullPage: true });
  });

  test('settings - mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await signIn(page);
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'settings-mobile.png'), fullPage: true });
  });
});
