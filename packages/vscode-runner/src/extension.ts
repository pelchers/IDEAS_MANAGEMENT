import * as vscode from "vscode";

/**
 * IDEA Management — VS Code Terminal Runner (scaffold).
 *
 * Polls the app for dispatched commands and "pokes" them into a VS Code terminal
 * via terminal.sendText(). This is the truest "run in a VS Code terminal" path.
 *
 * NOTE (output capture): VS Code's terminal API does not expose the output of a
 * running shell (`Terminal` has no onData). To stream real output back to the app
 * you must instead run the command through a *pseudoterminal* you own
 * (`vscode.window.createTerminal({ pty })`) or via the Task API and capture the
 * child process yourself — see runOwnedPty() below (stubbed). Until then, this
 * scaffold sends the command to the terminal and reports a best-effort result so
 * the app's command lifecycle still completes.
 */

let pollTimer: ReturnType<typeof setInterval> | undefined;
let terminal: vscode.Terminal | undefined;
let output: vscode.OutputChannel;

function cfg() {
  const c = vscode.workspace.getConfiguration("imRunner");
  return {
    url: (c.get<string>("url") || "http://localhost:3001").replace(/\/$/, ""),
    token: c.get<string>("token") || "",
    autoConnect: c.get<boolean>("autoConnect") ?? true,
    terminalName: c.get<string>("terminalName") || "IM Runner",
  };
}

async function api(path: string, init: RequestInit = {}): Promise<Response> {
  const { url, token } = cfg();
  return fetch(`${url}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", "X-Runner-Token": token, ...(init.headers || {}) },
  });
}

function getTerminal(): vscode.Terminal {
  const { terminalName } = cfg();
  if (!terminal || terminal.exitStatus !== undefined) {
    terminal = vscode.window.createTerminal({ name: terminalName });
  }
  terminal.show(true);
  return terminal;
}

interface Command { id: string; command: string; cwd?: string | null }

async function handleCommand(cmd: Command) {
  output.appendLine(`▶ ${cmd.command}`);
  const term = getTerminal();
  if (cmd.cwd) term.sendText(`cd "${cmd.cwd}"`, true);
  term.sendText(cmd.command, true);

  // Best-effort result so the app's lifecycle completes. Real output capture
  // requires an owned pseudoterminal (see runOwnedPty).
  try {
    await api(`/api/runner-agent/commands/${cmd.id}/output`, {
      method: "POST",
      body: JSON.stringify({ chunk: `[vscode] sent to terminal '${cfg().terminalName}'\n` }),
    });
    await api(`/api/runner-agent/commands/${cmd.id}/result`, { method: "POST", body: JSON.stringify({ exitCode: 0 }) });
  } catch (e) {
    output.appendLine(`result report failed: ${String(e)}`);
  }
}

async function pollOnce() {
  const { token } = cfg();
  if (!token) return;
  try {
    const res = await api("/api/runner-agent/poll");
    if (res.status === 401) {
      output.appendLine("Invalid runner token — disconnecting.");
      disconnect();
      return;
    }
    const data = (await res.json()) as { command?: Command | null };
    if (data.command) await handleCommand(data.command);
  } catch (e) {
    output.appendLine(`poll error: ${String(e)}`);
  }
}

function connect() {
  const { token, url } = cfg();
  if (!token) {
    vscode.window.showWarningMessage("IM Runner: set imRunner.token in settings (create a runner in the app).");
    return;
  }
  disconnect();
  output.appendLine(`Connected to ${url}. Polling for commands…`);
  pollTimer = setInterval(pollOnce, 2000);
  vscode.window.showInformationMessage("IM Runner connected.");
}

function disconnect() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = undefined; }
}

/**
 * TODO (real output capture): create a terminal backed by a pseudoterminal we
 * control, spawn the command as a child_process, forward child stdout/stderr to
 * both the pty (so the user sees it) and the app's /output endpoint, and report
 * the real exit code to /result. This gives true VS-Code-terminal streaming.
 */
// async function runOwnedPty(cmd: Command) { /* ... */ }

export function activate(context: vscode.ExtensionContext) {
  output = vscode.window.createOutputChannel("IM Runner");
  context.subscriptions.push(
    vscode.commands.registerCommand("imRunner.connect", connect),
    vscode.commands.registerCommand("imRunner.disconnect", () => { disconnect(); vscode.window.showInformationMessage("IM Runner disconnected."); }),
    vscode.commands.registerCommand("imRunner.status", () => {
      vscode.window.showInformationMessage(pollTimer ? "IM Runner: connected" : "IM Runner: not connected");
    }),
    { dispose: disconnect }
  );
  if (cfg().autoConnect && cfg().token) connect();
}

export function deactivate() {
  disconnect();
}
