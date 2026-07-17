import { test, expect, signInViaUI, waitForPageReady } from './helpers';

test.describe('Terminal orchestration', () => {
  test.beforeEach(async ({ page }) => {
    await signInViaUI(page);
  });

  test('orchestrator: create a runner (token revealed) and dispatch a command', async ({ page }) => {
    await page.goto('/orchestrator');
    await waitForPageReady(page);

    await page.getByRole('button', { name: '+ NEW RUNNER' }).click();
    await page.getByTestId('runner-name').fill(`e2e-runner-${Date.now()}`);
    await page.getByTestId('runner-create').click();
    // One-time token panel appears.
    await expect(page.getByTestId('runner-token-panel')).toBeVisible({ timeout: 10_000 });

    // Reload so the new runner is auto-selected in the console, then dispatch.
    await page.reload();
    await waitForPageReady(page);
    await page.locator('select[aria-label="Runner"]').selectOption({ index: 1 });
    await page.getByTestId('command-textarea').fill('echo hello');
    await page.getByTestId('dispatch-btn').click();

    // The command shows in history (QUEUED — no bridge attached in this test).
    await expect(page.getByTestId('command-history-item').first()).toBeVisible({ timeout: 10_000 });
  });

  test('snippets: create then delete', async ({ page }) => {
    await page.goto('/snippets');
    await waitForPageReady(page);
    const name = `snip-${Date.now()}`;
    await page.getByTestId('snippet-name').fill(name);
    await page.getByTestId('snippet-command').fill('pnpm test');
    await page.getByTestId('snippet-create').click();

    const item = page.locator('[data-testid="snippet-item"]', { hasText: name });
    await expect(item).toBeVisible({ timeout: 10_000 });
    await item.getByTestId('snippet-delete').click();
    await expect(page.locator('[data-testid="snippet-item"]', { hasText: name })).toHaveCount(0);
  });

  test('automations: create a rule, toggle, delete', async ({ page }) => {
    // Ensure the caller has a runner (share the page's session via page.request).
    await page.request.post('/api/runners', { data: { name: `auto-runner-${Date.now()}` } });

    await page.goto('/automations');
    await waitForPageReady(page);
    const name = `rule-${Date.now()}`;
    await page.getByTestId('rule-name').fill(name);
    await page.locator('[data-testid="rule-runner"]').selectOption({ index: 1 });
    await page.getByTestId('rule-command').fill('pnpm test');
    await page.getByTestId('rule-create').click();

    const item = page.locator('[data-testid="rule-item"]', { hasText: name });
    await expect(item).toBeVisible({ timeout: 10_000 });
    await item.getByTestId('rule-toggle').click();
    await item.getByTestId('rule-delete').click();
    await expect(page.locator('[data-testid="rule-item"]', { hasText: name })).toHaveCount(0);
  });

  test('activity page renders', async ({ page }) => {
    await page.goto('/activity');
    await waitForPageReady(page);
    await expect(page.locator('h1', { hasText: 'ACTIVITY' })).toBeVisible();
  });
});
