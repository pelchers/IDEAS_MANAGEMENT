# IDEA Management — VS Code Terminal Runner (scaffold)

Connects VS Code to your IDEA Management app as a **terminal runner**. Commands you
dispatch from the app's **Orchestrator** page are "poked" into a VS Code terminal
via `terminal.sendText()`.

## Status: scaffold
- ✅ Manifest, activation, config, connect/disconnect commands.
- ✅ Polls the app and sends dispatched commands to a VS Code terminal.
- ⏳ **Real output capture is a TODO.** VS Code's `Terminal` API doesn't expose the
  running shell's output. To stream real output + the true exit code back to the
  app, run the command through an *owned pseudoterminal*
  (`vscode.window.createTerminal({ pty })`) and capture the child process yourself
  — see `runOwnedPty()` in `src/extension.ts`. Until then it reports a best-effort
  result so the app's command lifecycle completes.

> Prefer real streaming today? Use the zero-setup **Node bridge** instead:
> `apps/web/scripts/runner-agent.mjs` — it runs commands in a shell and streams
> stdout/stderr + exit codes back live.

## Develop / run
```bash
cd packages/vscode-runner
npm install
npm run compile          # or: npm run watch
# Press F5 in VS Code to launch an Extension Development Host.
```

## Configure
Settings → search "imRunner":
- `imRunner.url` — your app (default `http://localhost:3001`)
- `imRunner.token` — a per-runner token (create a runner in the Orchestrator page)
- `imRunner.autoConnect` — connect on startup (default true)
- `imRunner.terminalName` — terminal to send commands to

Then run **IM Runner: Connect** (or it auto-connects when a token is set).
