import { test, expect, signInViaUI } from './helpers';

test.describe('Keyboard shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await signInViaUI(page);
    await page.goto('/dashboard');
    // Ensure focus isn't in an input.
    await page.locator('body').click({ position: { x: 5, y: 5 } });
  });

  test('g then t navigates to Today', async ({ page }) => {
    await page.keyboard.press('g');
    await page.keyboard.press('t');
    await page.waitForURL(/\/today/, { timeout: 5_000 });
  });

  test('? opens the shortcuts help overlay', async ({ page }) => {
    await page.keyboard.press('Shift+Slash'); // "?"
    await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toHaveCount(0);
  });

  test('/ opens the command palette', async ({ page }) => {
    await page.keyboard.press('/');
    await expect(page.getByTestId('command-input')).toBeVisible();
  });
});
