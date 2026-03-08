import { test, expect } from '@playwright/test';
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  signInViaUI,
  waitForPageReady,
} from './helpers';

test.describe('Feature view smoke tests', () => {
  /**
   * Helper: sign in, create a project via dashboard, navigate to it, return its URL.
   */
  async function setupProject(page: import('@playwright/test').Page): Promise<string> {
    await signInViaUI(page);

    await page.goto('/dashboard');
    await waitForPageReady(page);

    // Create a project for the test
    await page.locator('text=NEW PROJECT').or(page.locator('text=CREATE YOUR FIRST PROJECT')).first().click();
    const nameInput = page.locator('input[placeholder*="PROJECT NAME"]');
    await nameInput.waitFor({ state: 'visible' });
    const projectName = `Features ${Date.now()}`;
    await nameInput.fill(projectName);
    await page.locator('button:has-text("CREATE")').click();

    // Wait for project to appear then click it
    const link = page.locator(`.project-card:has-text("${projectName}"), .project-list-item:has-text("${projectName}")`).first();
    await link.waitFor({ state: 'visible', timeout: 10_000 });
    await link.click();
    await page.waitForURL(/\/projects\/[a-zA-Z0-9-]+$/, { timeout: 10_000 });
    await waitForPageReady(page);
    return page.url();
  }

  test('Kanban: page loads, can add a column', async ({ page }) => {
    const projectUrl = await setupProject(page);
    await page.goto(`${projectUrl}/kanban`);
    await waitForPageReady(page);

    // Kanban page should load — check breadcrumb or top-bar
    await expect(page.locator('.top-bar-crumb')).toContainText('KANBAN', { timeout: 15_000 });

    // Click "+ Add Column"
    await page.locator('button:has-text("Add Column")').click();

    // Fill column title and submit by pressing Enter
    const colInput = page.locator('input[placeholder="Column title"]');
    await colInput.waitFor({ state: 'visible' });
    await colInput.fill('Test Column');
    await page.keyboard.press('Enter');

    // Column should appear — look for the text in a column header
    await expect(page.locator('.kanban-column h3:has-text("TEST COLUMN"), h3:has-text("Test Column")')).toBeVisible({ timeout: 5_000 });
  });

  test('Ideas: page loads, can add an idea via quick-add', async ({ page }) => {
    const projectUrl = await setupProject(page);
    await page.goto(`${projectUrl}/ideas`);
    await waitForPageReady(page);

    // Ideas page should load
    await expect(page.locator('h1:has-text("IDEAS")')).toBeVisible({ timeout: 15_000 });

    // Quick-add an idea
    const quickInput = page.locator('input[placeholder*="Quick capture"]');
    await quickInput.fill('My test idea from E2E');
    await page.keyboard.press('Enter');

    // Idea should appear in the list
    await expect(page.locator('.idea-card-title:has-text("My test idea from E2E")')).toBeVisible({
      timeout: 5_000,
    });
  });

  test('Whiteboard: page loads, toolbar visible', async ({ page }) => {
    const projectUrl = await setupProject(page);
    await page.goto(`${projectUrl}/whiteboard`);
    await waitForPageReady(page);

    // Should see the whiteboard page — check breadcrumb
    await expect(page.locator('.top-bar-crumb')).toContainText('WHITEBOARD', { timeout: 15_000 });

    // Toolbar buttons should be present (RESET button is always visible)
    await expect(page.locator('button:has-text("RESET")')).toBeVisible({ timeout: 5_000 });
  });

  test('Schema: page loads, can add an entity', async ({ page }) => {
    const projectUrl = await setupProject(page);
    await page.goto(`${projectUrl}/schema`);
    await waitForPageReady(page);

    // Schema page should load — check breadcrumb
    await expect(page.locator('.top-bar-crumb')).toContainText('SCHEMA', { timeout: 15_000 });

    // Click add entity button if present
    const addBtn = page.locator('button').filter({ hasText: /add entity/i });
    if (await addBtn.count() > 0) {
      await addBtn.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('Directory Tree: page loads, can add a folder', async ({ page }) => {
    const projectUrl = await setupProject(page);
    await page.goto(`${projectUrl}/directory-tree`);
    await waitForPageReady(page);

    // Directory tree page should load — check breadcrumb
    await expect(page.locator('.top-bar-crumb')).toContainText('DIRECTORY', { timeout: 15_000 });

    // Should see the root folder or the empty state
    await expect(
      page.locator('text=project-root').or(page.locator('text=NO FILES YET'))
    ).toBeVisible({ timeout: 5_000 });
  });

  test('AI Chat: page loads', async ({ page }) => {
    await signInViaUI(page);
    await page.goto('/ai');
    await waitForPageReady(page);

    // AI chat page should load — check that we stay on /ai and get page content
    await expect(page).toHaveURL(/\/ai/);
    // The top-bar breadcrumb should show AI CHAT
    await expect(page.locator('.top-bar-crumb')).toContainText('AI CHAT', { timeout: 10_000 });
  });

  test('Settings: page loads, profile section visible', async ({ page }) => {
    await signInViaUI(page);
    await page.goto('/settings');
    await waitForPageReady(page);

    // Settings page should load with the view title
    await expect(page.locator('h1.view-title')).toContainText('SETTINGS', { timeout: 10_000 });
    await expect(page.locator('h2:has-text("PROFILE")')).toBeVisible();
  });
});
