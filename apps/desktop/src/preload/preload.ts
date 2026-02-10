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
    ipcRenderer.invoke("appendSyncOp", { projectRoot, op })
});
