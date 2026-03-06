import { ipcMain } from "electron";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Desktop sync module.
 * Provides IPC handlers for syncing projects with the web API.
 * Relies on auth tokens stored by the auth module.
 */

// Re-use loadTokens from auth module pattern
interface StoredTokens {
  sessionToken: string;
  refreshToken: string;
  apiBaseUrl: string;
}

async function getTokens(): Promise<StoredTokens | null> {
  // Import dynamically to avoid circular deps
  const { app } = await import("electron");
  const { safeStorage } = await import("electron");
  const tokenPath = path.join(app.getPath("userData"), "auth-tokens.enc");
  try {
    const encrypted = await fs.readFile(tokenPath);
    const decrypted = safeStorage.decryptString(Buffer.from(encrypted));
    return JSON.parse(decrypted) as StoredTokens;
  } catch {
    return null;
  }
}

async function apiGet(
  endpoint: string
): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const tokens = await getTokens();
  if (!tokens) return { ok: false, error: "not_authenticated" };
  try {
    const res = await fetch(`${tokens.apiBaseUrl}${endpoint}`, {
      headers: { cookie: `im_session=${tokens.sessionToken}` },
    });
    if (!res.ok) return { ok: false, error: `http_${res.status}` };
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

async function apiPost(
  endpoint: string,
  body: unknown
): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const tokens = await getTokens();
  if (!tokens) return { ok: false, error: "not_authenticated" };
  try {
    const res = await fetch(`${tokens.apiBaseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `im_session=${tokens.sessionToken}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { ok: false, error: `http_${res.status}` };
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/**
 * Register sync-related IPC handlers.
 */
export function registerSyncIpc(): void {
  /**
   * sync:getProjects — Fetch the user's projects from the server API.
   */
  ipcMain.handle("sync:getProjects", async () => {
    return apiGet("/api/projects");
  });

  /**
   * sync:pushOperations — Push local sync operations to the server.
   * @param args.operations — Array of SyncOp objects
   */
  ipcMain.handle(
    "sync:pushOperations",
    async (_evt, args: { operations: unknown[] }) => {
      return apiPost("/api/sync/push", { operations: args.operations });
    }
  );

  /**
   * sync:pullChanges — Pull remote changes for a project since a revision.
   * @param args.projectId — The project ID
   * @param args.since — Last known revision (default 0)
   */
  ipcMain.handle(
    "sync:pullChanges",
    async (_evt, args: { projectId: string; since?: number }) => {
      const since = args.since ?? 0;
      return apiGet(`/api/sync/pull/${args.projectId}?since=${since}`);
    }
  );

  /**
   * sync:getStatus — Get the sync status for a project.
   * Returns pending conflicts and artifact states.
   */
  ipcMain.handle(
    "sync:getStatus",
    async (_evt, args: { projectId: string }) => {
      return apiGet(`/api/sync/pull/${args.projectId}?since=0`);
    }
  );
}
