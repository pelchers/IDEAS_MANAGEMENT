import { autoUpdater, type UpdateInfo, type ProgressInfo } from "electron-updater";
import { app, BrowserWindow } from "electron";

/**
 * Auto-updater stub configuration.
 * Checks for updates on app launch and notifies the user when an update is available.
 *
 * In production, configure the `publish` field in electron-builder.json
 * to point to your update server / GitHub releases / S3 bucket.
 */
export function initAutoUpdater() {
  // Disable auto-download — user should confirm updates
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () => {
    console.log("[auto-updater] Checking for update...");
  });

  autoUpdater.on("update-available", (info: UpdateInfo) => {
    console.log("[auto-updater] Update available:", info.version);
    // Notify renderer process
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.webContents.send("update-available", {
        version: info.version,
        releaseDate: info.releaseDate,
      });
    }
  });

  autoUpdater.on("update-not-available", () => {
    console.log("[auto-updater] No update available. Current version:", app.getVersion());
  });

  autoUpdater.on("download-progress", (progress: ProgressInfo) => {
    console.log(`[auto-updater] Download progress: ${progress.percent.toFixed(1)}%`);
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.webContents.send("update-download-progress", {
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        transferred: progress.transferred,
        total: progress.total,
      });
    }
  });

  autoUpdater.on("update-downloaded", (info: UpdateInfo) => {
    console.log("[auto-updater] Update downloaded:", info.version);
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.webContents.send("update-downloaded", {
        version: info.version,
      });
    }
  });

  autoUpdater.on("error", (err: Error) => {
    console.error("[auto-updater] Error:", err.message);
  });

  // Check for updates after a short delay (don't block startup)
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err: Error) => {
      console.error("[auto-updater] Failed to check for updates:", err.message);
    });
  }, 5000);
}

/**
 * Trigger download of an available update.
 * Call this when the user confirms they want to update.
 */
export function downloadUpdate() {
  autoUpdater.downloadUpdate().catch((err: Error) => {
    console.error("[auto-updater] Failed to download update:", err.message);
  });
}

/**
 * Install the downloaded update and restart the app.
 */
export function installUpdate() {
  autoUpdater.quitAndInstall(false, true);
}
