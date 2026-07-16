import type { IntegrationProviderDef } from "../types";

export const vscodeProvider: IntegrationProviderDef = {
  id: "VSCODE",
  label: "VS Code",
  description: "Open projects, folders and repos directly in your local VS Code.",
  kind: "local",
  capabilities: ["Open folder", "Clone repo", "Deep links"],
  setupHint: "No setup — links open the VS Code installed on your machine.",
  // Deep links are handled entirely client-side; nothing to configure server-side.
  isConfigured: () => true,
};

/** `vscode://file/<absolute-path>` — opens a file/folder in VS Code. Pure/client-safe. */
export function buildVscodeFileUri(absolutePath: string): string {
  const normalized = absolutePath.replace(/\\/g, "/");
  return `vscode://file/${encodeURI(normalized)}`;
}

/** `vscode://vscode.git/clone?url=<repo>` — clone a repo in VS Code. Pure/client-safe. */
export function buildVscodeCloneUri(repoUrl: string): string {
  return `vscode://vscode.git/clone?url=${encodeURIComponent(repoUrl)}`;
}
