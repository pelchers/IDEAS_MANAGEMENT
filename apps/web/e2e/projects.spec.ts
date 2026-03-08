import { test, expect } from '@playwright/test';
import {
  signInViaUI,
  waitForPageReady,
} from './helpers';

test.describe('Project CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await signInViaUI(page);
  });

  test('create a new project', async ({ page }) => {
    // Should be on dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Click new project button
    await page.locator('text=NEW PROJECT').or(page.locator('text=CREATE YOUR FIRST PROJECT')).first().click();

    // Fill project name
    const nameInput = page.locator('input[placeholder*="PROJECT NAME"]');
    await nameInput.waitFor({ state: 'visible' });
    const projectName = `E2E Test ${Date.now()}`;
    await nameInput.fill(projectName);

    // Fill description
    await page.locator('textarea[placeholder*="DESCRIPTION"]').fill('E2E test project description');

    // Click create
    await page.locator('button:has-text("CREATE")').click();

    // Project should appear in the list
    await expect(page.locator(`text=${projectName}`)).toBeVisible({ timeout: 10_000 });
  });

  test('project appears in dashboard list', async ({ page }) => {
    // Create a project first
    await page.locator('text=NEW PROJECT').or(page.locator('text=CREATE YOUR FIRST PROJECT')).first().click();
    const projectName = `List Test ${Date.now()}`;
    await page.locator('input[placeholder*="PROJECT NAME"]').fill(projectName);
    await page.locator('button:has-text("CREATE")').click();

    // Wait for the project to appear
    await expect(page.locator(`text=${projectName}`)).toBeVisible({ timeout: 10_000 });

    // Verify it shows in the project grid/list
    const projectCard = page.locator('.project-card, .project-list-item').filter({ hasText: projectName });
    await expect(projectCard).toBeVisible();
  });

  test('open project detail page', async ({ page }) => {
    // Create a project
    await page.locator('text=NEW PROJECT').or(page.locator('text=CREATE YOUR FIRST PROJECT')).first().click();
    const projectName = `Detail Test ${Date.now()}`;
    await page.locator('input[placeholder*="PROJECT NAME"]').fill(projectName);
    await page.locator('button:has-text("CREATE")').click();

    // Wait for project to appear, then click it
    const projectLink = page.locator(`text=${projectName}`).first();
    await projectLink.waitFor({ state: 'visible', timeout: 10_000 });
    await projectLink.click();

    // Should navigate to project detail page
    await page.waitForURL(/\/projects\/[a-zA-Z0-9-]+$/, { timeout: 10_000 });
    await waitForPageReady(page);

    // Should show project name and overview
    await expect(page.locator(`text=${projectName}`).first()).toBeVisible();
    await expect(page.locator('text=Project Overview')).toBeVisible();
  });

  test('navigate to each project subview', async ({ page }) => {
    // Create a project and navigate to it
    await page.locator('text=NEW PROJECT').or(page.locator('text=CREATE YOUR FIRST PROJECT')).first().click();
    const projectName = `Nav Test ${Date.now()}`;
    await page.locator('input[placeholder*="PROJECT NAME"]').fill(projectName);
    await page.locator('button:has-text("CREATE")').click();

    const projectLink = page.locator(`text=${projectName}`).first();
    await projectLink.waitFor({ state: 'visible', timeout: 10_000 });
    await projectLink.click();
    await page.waitForURL(/\/projects\/[a-zA-Z0-9-]+$/, { timeout: 10_000 });
    await waitForPageReady(page);

    // Extract project URL
    const projectUrl = page.url();

    // Navigate to each subview
    const subviews = [
      { label: 'Kanban', path: 'kanban', check: /kanban/i },
      { label: 'Ideas', path: 'ideas', check: /ideas/i },
      { label: 'Whiteboard', path: 'whiteboard', check: /whiteboard/i },
      { label: 'Schema', path: 'schema', check: /schema/i },
      { label: 'Directory Tree', path: 'directory-tree', check: /directory-tree/i },
    ];

    for (const view of subviews) {
      await page.goto(`${projectUrl}/${view.path}`);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(new RegExp(view.path));
    }

    // Also check the conflicts page
    await page.goto(`${projectUrl}/conflicts`);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/conflicts/);
  });
});
