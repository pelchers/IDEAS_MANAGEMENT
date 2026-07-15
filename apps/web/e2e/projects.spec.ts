import {
  test,
  expect,
  signInViaUI,
  waitForPageReady,
  type Page,
} from './helpers';

async function createProject(page: Page, name: string, desc = ''): Promise<void> {
  await page.getByTestId('new-project-toggle').click();
  await page.getByTestId('create-project-name').fill(name);
  if (desc) {
    await page.getByPlaceholder('What is this project about?').fill(desc);
  }
  await page.getByTestId('create-project-submit').click();
  await expect(page.getByText(name).first()).toBeVisible({ timeout: 10_000 });
}

test.describe('Project CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await signInViaUI(page);
    await page.goto('/projects');
    await waitForPageReady(page);
  });

  test('create a new project', async ({ page }) => {
    const name = `E2E Test ${Date.now()}`;
    await createProject(page, name, 'E2E test project description');
  });

  test('project appears in the list', async ({ page }) => {
    const name = `List Test ${Date.now()}`;
    await createProject(page, name);
    await expect(page.getByRole('heading', { name }).first()).toBeVisible();
  });

  test('open project detail page', async ({ page }) => {
    const name = `Detail Test ${Date.now()}`;
    await createProject(page, name);

    // The newest project sorts first; open it via its OPEN link.
    await page.getByRole('link', { name: 'OPEN' }).first().click();
    await page.waitForURL(/\/projects\/[a-zA-Z0-9-]+$/, { timeout: 10_000 });
    await waitForPageReady(page);
    await expect(page.getByText(name).first()).toBeVisible();
  });

  test('navigate to each project subview', async ({ page }) => {
    const name = `Nav Test ${Date.now()}`;
    await createProject(page, name);
    await page.getByRole('link', { name: 'OPEN' }).first().click();
    await page.waitForURL(/\/projects\/[a-zA-Z0-9-]+$/, { timeout: 10_000 });
    const projectUrl = page.url();

    for (const path of ['kanban', 'ideas', 'whiteboard', 'schema', 'directory-tree', 'conflicts']) {
      await page.goto(`${projectUrl}/${path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(new RegExp(path));
    }
  });
});
