import { test, expect, signInViaUI } from './helpers';

test.describe('Settings → Integrations', () => {
  test.beforeEach(async ({ page }) => {
    await signInViaUI(page);
    await page.goto('/settings');
    await expect(page.getByTestId('integrations-panel')).toBeVisible();
  });

  test('providers without server credentials show a disabled Connect', async ({ page }) => {
    for (const id of ['EMAIL', 'GMAIL', 'GOOGLE_CALENDAR']) {
      await expect(page.getByTestId(`integration-connect-${id}`)).toBeDisabled();
      await expect(page.getByTestId(`integration-status-${id}`)).toContainText('Not configured');
    }
  });

  test('VS Code (no creds) connects and disconnects', async ({ page }) => {
    // Wait for the panel to finish loading before inspecting connection state.
    await expect(page.getByTestId('integration-status-VSCODE')).toBeVisible();

    // Normalise to a disconnected starting state.
    const disconnect = page.getByTestId('integration-disconnect-VSCODE');
    if (await disconnect.isVisible().catch(() => false)) {
      await disconnect.click();
      await expect(page.getByTestId('integration-connect-VSCODE')).toBeVisible({ timeout: 10_000 });
    }

    const connect = page.getByTestId('integration-connect-VSCODE');
    await expect(connect).toBeEnabled();
    await connect.click();

    await expect(page.getByTestId('integration-disconnect-VSCODE')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('integration-status-VSCODE')).toContainText('Connected');

    await page.getByTestId('integration-disconnect-VSCODE').click();
    await expect(page.getByTestId('integration-connect-VSCODE')).toBeVisible({ timeout: 10_000 });

    // Persisted across reload.
    await page.reload();
    await expect(page.getByTestId('integration-connect-VSCODE')).toBeEnabled();
  });
});
