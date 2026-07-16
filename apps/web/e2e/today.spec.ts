import { test, expect, signInViaUI } from './helpers';

test.describe('Today / My Work', () => {
  test.beforeEach(async ({ page }) => {
    await signInViaUI(page);
    await page.goto('/today');
  });

  test('quick-capture creates a task that appears in the list', async ({ page }) => {
    const title = `Capture ${Date.now()}`;
    await page.getByTestId('capture-input').fill(title);
    await page.getByTestId('capture-submit').click();

    const row = page.locator('[data-testid="task-row"]', { hasText: title });
    await expect(row).toBeVisible({ timeout: 10_000 });
  });

  test('completing a task removes it from the list (optimistic)', async ({ page }) => {
    const title = `Complete me ${Date.now()}`;
    await page.getByTestId('capture-input').fill(title);
    await page.getByTestId('capture-submit').click();

    const row = page.locator('[data-testid="task-row"]', { hasText: title });
    await expect(row).toBeVisible({ timeout: 10_000 });

    await row.getByTestId('task-complete').click();
    await expect(row).toHaveCount(0, { timeout: 10_000 });

    // Stays gone after a reload (persisted as DONE).
    await page.reload();
    await expect(page.locator('[data-testid="task-row"]', { hasText: title })).toHaveCount(0);
  });

  test('Cmd-K Quick capture focuses the capture input', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByTestId('command-search-trigger').click();
    await page.getByTestId('command-input').fill('quick capture');
    await page.getByTestId('command-item-action.capture').click();
    await page.waitForURL(/\/today\?capture=1/, { timeout: 10_000 });
    await expect(page.getByTestId('capture-input')).toBeFocused();
  });
});
