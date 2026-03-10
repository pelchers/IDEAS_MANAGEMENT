import { test } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const SCREENSHOT_DIR = path.resolve(__dirname, '../../../.docs/validation/3_auth-flow/screenshots');
const DESKTOP = { width: 1536, height: 960 };
const MOBILE = { width: 390, height: 844 };

test.describe('Auth page screenshots', () => {
  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  });

  test('signin page - desktop', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/signin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'signin-desktop.png'), fullPage: false });
  });

  test('signin page - mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/signin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'signin-mobile.png'), fullPage: false });
  });

  test('signup page - desktop', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'signup-desktop.png'), fullPage: false });
  });

  test('signup page - mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'signup-mobile.png'), fullPage: false });
  });
});
