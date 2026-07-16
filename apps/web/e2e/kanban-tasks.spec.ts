import { test, expect, signInViaUI, waitForPageReady } from './helpers';

test.describe('Kanban on first-class Tasks', () => {
  test('a card added on the board persists as a Task and shows in Today', async ({ page }) => {
    await signInViaUI(page);

    // Fresh project for a clean board.
    await page.goto('/projects');
    await waitForPageReady(page);
    await page.getByTestId('new-project-toggle').click();
    const proj = `Kanban Test ${Date.now()}`;
    await page.getByTestId('create-project-name').fill(proj);
    await page.getByTestId('create-project-submit').click();
    await expect(page.getByText(proj).first()).toBeVisible({ timeout: 10_000 });

    await page.getByRole('link', { name: 'OPEN' }).first().click();
    await page.waitForURL(/\/projects\/[a-zA-Z0-9]+$/, { timeout: 10_000 });
    const projUrl = page.url();
    await page.goto(`${projUrl}/kanban`);
    await waitForPageReady(page);

    // Add a card to the first column.
    const cardTitle = `KTask ${Date.now()}`;
    await page.getByRole('button', { name: '+ ADD' }).first().click();
    await page.getByPlaceholder('Card title...').fill(cardTitle);
    await page.getByRole('button', { name: 'ADD', exact: true }).click();

    // The edit modal opens after creating — dismiss it.
    await page.getByRole('button', { name: 'CANCEL' }).click().catch(() => {});

    // Card is on the board, and survives a reload (now sourced from Tasks).
    await expect(page.getByText(cardTitle).first()).toBeVisible({ timeout: 10_000 });
    await page.reload();
    await waitForPageReady(page);
    await expect(page.getByText(cardTitle).first()).toBeVisible({ timeout: 10_000 });

    // Coherence: the kanban card is a real Task, so it appears in Today / My Work.
    await page.goto('/today');
    await waitForPageReady(page);
    await expect(page.locator('[data-testid="task-row"]', { hasText: cardTitle })).toBeVisible({ timeout: 10_000 });
  });
});
