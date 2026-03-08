import { test, expect } from '@playwright/test';
import {
  signInViaUI,
  createProjectViaAPI,
  waitForPageReady,
} from './helpers';
import * as path from 'path';
import * as fs from 'fs';

const SCREENSHOT_DIR = path.resolve(
  __dirname,
  '../../../.docs/validation/integration-hardening/phase_4/screenshots'
);

const DESKTOP = { width: 1536, height: 960 };
const MOBILE = { width: 390, height: 844 };

test.describe('Validation screenshots', () => {
  let projectId: string;

  test.beforeAll(async ({ request }) => {
    // Ensure screenshot directory exists
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

    // Sign in as admin
    const signinRes = await request.post('/api/auth/signin', {
      data: { email: 'admin@ideamgmt.local', password: 'AdminPass123!' },
    });
    expect(signinRes.ok()).toBeTruthy();

    // Create a sample project
    projectId = await createProjectViaAPI(
      request,
      `Screenshot Project ${Date.now()}`,
      'Project for validation screenshots'
    );
  });

  async function takeScreenshot(
    page: import('@playwright/test').Page,
    name: string,
    viewport: { width: number; height: number }
  ) {
    await page.setViewportSize(viewport);
    await waitForPageReady(page);
    // Small wait for rendering
    await page.waitForTimeout(500);
    const suffix = viewport.width === DESKTOP.width ? 'desktop' : 'mobile';
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `${name}-${suffix}.png`),
      fullPage: false,
    });
  }

  test('capture all views', async ({ page }) => {
    await signInViaUI(page);

    // 1. Dashboard
    await page.goto('/dashboard');
    await waitForPageReady(page);
    await takeScreenshot(page, '01-dashboard', DESKTOP);
    await takeScreenshot(page, '01-dashboard', MOBILE);

    // 2. Project detail
    await page.goto(`/projects/${projectId}`);
    await waitForPageReady(page);
    await takeScreenshot(page, '02-project-detail', DESKTOP);
    await takeScreenshot(page, '02-project-detail', MOBILE);

    // 3. Kanban
    await page.goto(`/projects/${projectId}/kanban`);
    await waitForPageReady(page);
    await takeScreenshot(page, '03-kanban', DESKTOP);
    await takeScreenshot(page, '03-kanban', MOBILE);

    // 4. Ideas
    await page.goto(`/projects/${projectId}/ideas`);
    await waitForPageReady(page);
    await takeScreenshot(page, '04-ideas', DESKTOP);
    await takeScreenshot(page, '04-ideas', MOBILE);

    // 5. Whiteboard
    await page.goto(`/projects/${projectId}/whiteboard`);
    await waitForPageReady(page);
    await takeScreenshot(page, '05-whiteboard', DESKTOP);
    await takeScreenshot(page, '05-whiteboard', MOBILE);

    // 6. Schema
    await page.goto(`/projects/${projectId}/schema`);
    await waitForPageReady(page);
    await takeScreenshot(page, '06-schema', DESKTOP);
    await takeScreenshot(page, '06-schema', MOBILE);

    // 7. Directory Tree
    await page.goto(`/projects/${projectId}/directory-tree`);
    await waitForPageReady(page);
    await takeScreenshot(page, '07-directory-tree', DESKTOP);
    await takeScreenshot(page, '07-directory-tree', MOBILE);

    // 8. AI Chat
    await page.goto('/ai');
    await waitForPageReady(page);
    await takeScreenshot(page, '08-ai-chat', DESKTOP);
    await takeScreenshot(page, '08-ai-chat', MOBILE);

    // 9. Settings
    await page.goto('/settings');
    await waitForPageReady(page);
    await takeScreenshot(page, '09-settings', DESKTOP);
    await takeScreenshot(page, '09-settings', MOBILE);

    // 10. Sign In (while signed out)
    // Navigate to signin directly
    await page.goto('/signin');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '10-signin', DESKTOP);
    await takeScreenshot(page, '10-signin', MOBILE);

    // Verify screenshots were created
    const files = fs.readdirSync(SCREENSHOT_DIR);
    expect(files.length).toBeGreaterThanOrEqual(18);
  });
});
