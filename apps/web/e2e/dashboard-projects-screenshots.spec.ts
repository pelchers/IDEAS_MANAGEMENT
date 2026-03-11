import { test } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const SCREENSHOT_DIR = path.resolve(__dirname, '../../../.docs/validation/4_dashboard-and-projects/screenshots');
const DESKTOP = { width: 1536, height: 960 };
const MOBILE = { width: 390, height: 844 };

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@idea.management';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '2322';

async function signInViaUI(page: import('@playwright/test').Page) {
  await page.goto('/signin');
  await page.waitForLoadState('networkidle');
  await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').click();
  // Wait for redirect to dashboard
  await page.waitForURL(/\/(dashboard|projects)/, { timeout: 15_000 });
  await page.waitForLoadState('networkidle');
}

test.describe('Dashboard & Projects screenshots', () => {
  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  });

  // Dashboard screenshots
  test('dashboard - desktop', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await signInViaUI(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'dashboard-desktop.png'), fullPage: true });
  });

  test('dashboard - mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await signInViaUI(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'dashboard-mobile.png'), fullPage: true });
  });

  // Projects list screenshots
  test('projects - desktop', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await signInViaUI(page);
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'projects-desktop.png'), fullPage: true });
  });

  test('projects - mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await signInViaUI(page);
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'projects-mobile.png'), fullPage: true });
  });

  // Workspace (project detail) screenshots
  test('workspace - desktop', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await signInViaUI(page);
    await page.goto('/projects/1');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'workspace-desktop.png'), fullPage: true });
  });

  test('workspace - mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await signInViaUI(page);
    await page.goto('/projects/1');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'workspace-mobile.png'), fullPage: true });
  });
});
