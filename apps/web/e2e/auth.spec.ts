import { test, expect } from '@playwright/test';
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  uniqueEmail,
  signInViaUI,
  waitForPageReady,
} from './helpers';

test.describe('Auth flows', () => {
  test('sign up with new email', async ({ page }) => {
    const email = uniqueEmail();
    const password = 'TestPassword123!';

    await page.goto('/signup');
    await expect(page.locator('h1')).toContainText('Create Account');

    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[placeholder*="Password"]').first().fill(password);
    await page.locator('input[placeholder*="Confirm"]').fill(password);
    await page.locator('button[type="submit"]').click();

    // Should see success message or redirect
    await expect(
      page.locator('text=Account created').or(page.locator('text=PROJECTS'))
    ).toBeVisible({ timeout: 15_000 });
  });

  test('sign in with valid credentials', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.locator('h1')).toContainText('Sign In');

    await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').click();

    // Should redirect to dashboard
    await page.waitForURL(/\/(dashboard|projects)/, { timeout: 15_000 });
    await waitForPageReady(page);
    // Verify we are on the dashboard — look for the page title heading
    await expect(page.locator('h1.view-title, h1:has-text("PROJECTS")')).toBeVisible({ timeout: 10_000 });
  });

  test('sign in with wrong password shows error', async ({ page }) => {
    await page.goto('/signin');

    await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill('WrongPassword999!');
    await page.locator('button[type="submit"]').click();

    // Should show error message
    await expect(page.locator('.auth-error')).toBeVisible({ timeout: 10_000 });
  });

  test('sign out redirects to signin', async ({ page }) => {
    // First sign in
    await signInViaUI(page);

    // Open nav drawer (may already be open at desktop width) and click sign out
    const signOutBtn = page.locator('text=SIGN OUT');
    if (!(await signOutBtn.isVisible())) {
      await page.getByLabel('Open navigation menu').click();
    }
    await signOutBtn.click();

    // Should redirect to signin
    await page.waitForURL(/\/signin/, { timeout: 10_000 });
    await expect(page.locator('h1')).toContainText('Sign In');
  });

  test('protected page redirects to signin without auth', async ({ page }) => {
    // Go directly to a protected page without auth
    await page.goto('/dashboard');

    // Should redirect to signin
    await page.waitForURL(/\/signin/, { timeout: 10_000 });
  });
});
