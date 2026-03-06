import { ipcMain, safeStorage } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import { app } from "electron";

/**
 * Desktop auth module.
 * Stores session + refresh tokens in an encrypted file on disk.
 * Provides IPC handlers for session validation and logout.
 */

interface StoredTokens {
  sessionToken: string;
  refreshToken: string;
  apiBaseUrl: string;
}

function getTokenFilePath(): string {
  return path.join(app.getPath("userData"), "auth-tokens.enc");
}

async function saveTokens(tokens: StoredTokens): Promise<void> {
  const data = JSON.stringify(tokens);
  const encrypted = safeStorage.encryptString(data);
  await fs.writeFile(getTokenFilePath(), encrypted);
}

async function loadTokens(): Promise<StoredTokens | null> {
  try {
    const encrypted = await fs.readFile(getTokenFilePath());
    const decrypted = safeStorage.decryptString(Buffer.from(encrypted));
    return JSON.parse(decrypted) as StoredTokens;
  } catch {
    return null;
  }
}

async function clearTokens(): Promise<void> {
  try {
    await fs.unlink(getTokenFilePath());
  } catch {
    // File may not exist, that's fine
  }
}

/**
 * Validate the stored session against the web API.
 * Attempts refresh if the session is expired.
 */
async function validateStoredSession(): Promise<{
  valid: boolean;
  user?: { id: string; email: string; role: string; emailVerified: boolean };
}> {
  const tokens = await loadTokens();
  if (!tokens) return { valid: false };

  // Try /api/auth/me with the session cookie
  try {
    const meRes = await fetch(`${tokens.apiBaseUrl}/api/auth/me`, {
      headers: { cookie: `im_session=${tokens.sessionToken}` }
    });

    if (meRes.ok) {
      const data = (await meRes.json()) as {
        ok: boolean;
        user: { id: string; email: string; role: string; emailVerified: boolean };
      };
      return { valid: true, user: data.user };
    }

    // Session expired, try refresh
    const refreshRes = await fetch(`${tokens.apiBaseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { cookie: `im_refresh=${tokens.refreshToken}` }
    });

    if (!refreshRes.ok) {
      await clearTokens();
      return { valid: false };
    }

    // Extract new cookies from the refresh response
    const setCookies = refreshRes.headers.getSetCookie?.() ?? [];
    let newSession = "";
    let newRefresh = "";
    for (const c of setCookies) {
      const sessionMatch = c.match(/im_session=([^;]+)/);
      const refreshMatch = c.match(/im_refresh=([^;]+)/);
      if (sessionMatch) newSession = sessionMatch[1];
      if (refreshMatch) newRefresh = refreshMatch[1];
    }

    if (newSession && newRefresh) {
      await saveTokens({
        sessionToken: newSession,
        refreshToken: newRefresh,
        apiBaseUrl: tokens.apiBaseUrl
      });

      // Retry /me with new session
      const retryRes = await fetch(`${tokens.apiBaseUrl}/api/auth/me`, {
        headers: { cookie: `im_session=${newSession}` }
      });
      if (retryRes.ok) {
        const data = (await retryRes.json()) as {
          ok: boolean;
          user: { id: string; email: string; role: string; emailVerified: boolean };
        };
        return { valid: true, user: data.user };
      }
    }

    await clearTokens();
    return { valid: false };
  } catch {
    // Network error
    return { valid: false };
  }
}

/**
 * Register all auth-related IPC handlers.
 * Call this once from the main process setup.
 */
export function registerAuthIpc(): void {
  /**
   * auth:storeTokens — Called after successful web-based login.
   * The renderer passes tokens obtained from the login flow.
   */
  ipcMain.handle(
    "auth:storeTokens",
    async (
      _evt,
      args: { sessionToken: string; refreshToken: string; apiBaseUrl: string }
    ) => {
      await saveTokens(args);
      return { ok: true };
    }
  );

  /**
   * auth:validateSession — Validate stored session on app startup.
   * Returns { valid: boolean, user?: {...} }.
   */
  ipcMain.handle("auth:validateSession", async () => {
    return validateStoredSession();
  });

  /**
   * auth:logout — Sign out and revoke tokens on the server, then clear local storage.
   * Optionally revoke all devices.
   */
  ipcMain.handle("auth:logout", async (_evt, args?: { allDevices?: boolean }) => {
    const tokens = await loadTokens();
    if (tokens) {
      try {
        await fetch(`${tokens.apiBaseUrl}/api/auth/signout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            cookie: `im_session=${tokens.sessionToken}; im_refresh=${tokens.refreshToken}`
          },
          body: JSON.stringify({ allDevices: args?.allDevices ?? false })
        });
      } catch {
        // Server may be unreachable; still clear local tokens
      }
    }
    await clearTokens();
    return { ok: true };
  });

  /**
   * auth:hasStoredTokens — Quick check if any tokens are stored locally.
   */
  ipcMain.handle("auth:hasStoredTokens", async () => {
    const tokens = await loadTokens();
    return { hasTokens: tokens !== null };
  });
}
