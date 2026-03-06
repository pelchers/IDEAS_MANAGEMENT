import { contextBridge, ipcRenderer } from "electron";

export type DirEntry = {
  name: string;
  path: string;
  isDir: boolean;
};

contextBridge.exposeInMainWorld("ideaApi", {
  selectDirectory: () => ipcRenderer.invoke("selectDirectory"),
  listDirectory: (dirPath: string) => ipcRenderer.invoke("listDirectory", dirPath),
  appendSyncOp: (projectRoot: string, op: Record<string, unknown>) =>
    ipcRenderer.invoke("appendSyncOp", { projectRoot, op }),

  // Auth IPC methods
  auth: {
    storeTokens: (args: { sessionToken: string; refreshToken: string; apiBaseUrl: string }) =>
      ipcRenderer.invoke("auth:storeTokens", args),
    validateSession: () =>
      ipcRenderer.invoke("auth:validateSession") as Promise<{
        valid: boolean;
        user?: { id: string; email: string; role: string; emailVerified: boolean };
      }>,
    logout: (args?: { allDevices?: boolean }) =>
      ipcRenderer.invoke("auth:logout", args),
    hasStoredTokens: () =>
      ipcRenderer.invoke("auth:hasStoredTokens") as Promise<{ hasTokens: boolean }>
  }
});
