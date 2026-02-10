import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "node:path";
import fs from "node:fs/promises";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "../preload/preload.js")
    }
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    void mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    void mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

async function ensureMetaDir(projectRoot: string) {
  const metaDir = path.join(projectRoot, ".meta");
  await fs.mkdir(metaDir, { recursive: true });
  return metaDir;
}

app.whenReady().then(() => {
  ipcMain.handle("selectDirectory", async () => {
    const res = await dialog.showOpenDialog({
      properties: ["openDirectory"],
      title: "Select Project Root Directory"
    });
    if (res.canceled || res.filePaths.length === 0) return null;
    return res.filePaths[0];
  });

  ipcMain.handle("listDirectory", async (_evt, dirPath: string) => {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((e) => !e.name.startsWith("node_modules"))
      .map((e) => ({
        name: e.name,
        path: path.join(dirPath, e.name),
        isDir: e.isDirectory()
      }));
  });

  ipcMain.handle(
    "appendSyncOp",
    async (
      _evt,
      args: { projectRoot: string; op: Record<string, unknown> }
    ) => {
      const metaDir = await ensureMetaDir(args.projectRoot);
      const queuePath = path.join(metaDir, "sync-queue.ndjson");
      const line = JSON.stringify({ ...args.op, _ts: new Date().toISOString() });
      await fs.appendFile(queuePath, line + "\n", "utf8");
      return { ok: true, queuePath };
    }
  );

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
