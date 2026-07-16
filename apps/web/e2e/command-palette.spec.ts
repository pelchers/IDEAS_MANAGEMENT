import { test, expect, signInViaUI } from './helpers';

test.describe('Command palette (Cmd-K)', () => {
  test.beforeEach(async ({ page }) => {
    await signInViaUI(page);
    await page.goto('/dashboard');
  });

  test('opens from the top-bar search trigger and navigates', async ({ page }) => {
    await page.getByTestId('command-search-trigger').click();
    await expect(page.getByTestId('command-input')).toBeVisible();

    await page.getByTestId('command-input').fill('settings');
    await page.getByTestId('command-item-nav.settings').click();

    await page.waitForURL(/\/settings/, { timeout: 10_000 });
  });

  test('opens with the Ctrl+K shortcut', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await expect(page.getByTestId('command-input')).toBeVisible();
  });

  test('Escape closes the palette', async ({ page }) => {
    await page.getByTestId('command-search-trigger').click();
    await expect(page.getByTestId('command-input')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('command-input')).toHaveCount(0);
  });

  test('New project action opens the create form', async ({ page }) => {
    await page.getByTestId('command-search-trigger').click();
    await page.getByTestId('command-input').fill('new project');
    await page.getByTestId('command-item-action.new-project').click();
    await page.waitForURL(/\/projects\?new=1/, { timeout: 10_000 });
    await expect(page.getByTestId('create-project-name')).toBeVisible();
  });
});
