#!/usr/bin/env node
/**
 * IDEA Management — Terminal Runner Agent (bridge).
 *
 * A self-contained Node CLI (Node 18+; uses global fetch + child_process, no deps)
 * that connects your machine to the app as a runner: it polls for dispatched
 * commands, runs them in a shell (AUTO-RUN), streams stdout/stderr back live, and
 * reports the exit code.
 *
 * It runs YOUR commands on YOUR machine using a per-runner token you created in the
 * app (Orchestrator page). Keep the token secret.
 *
 * Usage:
 *   node runner-agent.mjs --url http://localhost:3001 --token <RUNNER_TOKEN> [--cwd <dir>] [--shell <shell>]
 *   IM_URL=... IM_TOKEN=... IM_CWD=... node runner-agent.mjs
 */
import { spawn } from "node:child_process";
import process from "node:process";

function arg(name, envName, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  if (envName && process.env[envName]) return process.env[envName];
  return fallback;
}

const URL_BASE = (arg("url", "IM_URL", "http://localhost:3001")).replace(/\/$/, "");
const TOKEN = arg("token", "IM_TOKEN");
const CWD = arg("cwd", "IM_CWD", process.cwd());
const SHELL = arg("shell", "IM_SHELL", process.platform === "win32" ? "powershell.exe" : "/bin/sh");
const POLL_MS = Number(arg("poll", "IM_POLL_MS", "2000"));

if (!TOKEN) {
  console.error("Missing --token (or IM_TOKEN). Create a runner in the app to get one.");
  process.exit(1);
}

const headers = { "Content-Type": "application/json", "X-Runner-Token": TOKEN };

async function api(path, init = {}) {
  const res = await fetch(`${URL_BASE}${path}`, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  return res;
}

async function postOutput(commandId, chunk) {
  try {
    await api(`/api/runner-agent/commands/${commandId}/output`, { method: "POST", body: JSON.stringify({ chunk }) });
  } catch { /* best-effort streaming */ }
}

function runCommand(cmd) {
  return new Promise((resolve) => {
    const shellArgs = process.platform === "win32"
      ? ["-NoProfile", "-NonInteractive", "-Command", cmd.command]
      : ["-c", cmd.command];
    const child = spawn(SHELL, shellArgs, { cwd: cmd.cwd || CWD, env: process.env });

    let buffer = "";
    let flushTimer = null;
    const flush = async () => {
      if (!buffer) return;
      const chunk = buffer;
      buffer = "";
      await postOutput(cmd.id, chunk);
    };
    const onData = (data) => {
      buffer += data.toString();
      if (buffer.length > 4000) { void flush(); return; }
      if (!flushTimer) flushTimer = setTimeout(() => { flushTimer = null; void flush(); }, 300);
    };

    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.on("error", (err) => { buffer += `\n[agent] spawn error: ${err.message}\n`; });
    child.on("close", async (code) => {
      if (flushTimer) clearTimeout(flushTimer);
      await flush();
      try {
        await api(`/api/runner-agent/commands/${cmd.id}/result`, { method: "POST", body: JSON.stringify({ exitCode: code ?? 1 }) });
      } catch { /* ignore */ }
      resolve();
    });
  });
}

let alive = true;
process.on("SIGINT", () => { alive = false; console.log("\n[agent] stopping…"); process.exit(0); });

async function loop() {
  console.log(`[agent] connected to ${URL_BASE} · cwd=${CWD} · shell=${SHELL}`);
  console.log("[agent] AUTO-RUN mode — dispatched commands execute immediately. Ctrl+C to stop.");
  while (alive) {
    try {
      const res = await api("/api/runner-agent/poll");
      if (res.status === 401) { console.error("[agent] invalid runner token — exiting."); process.exit(1); }
      const data = await res.json().catch(() => ({}));
      if (data && data.command) {
        const c = data.command;
        console.log(`[agent] ▶ ${c.command}`);
        await runCommand(c);
        console.log(`[agent] ✓ done`);
        continue; // poll again immediately for the next queued command
      }
    } catch (err) {
      console.error(`[agent] poll error: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
}

loop();
