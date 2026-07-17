import { prisma } from "@/server/db";
import { newToken, sha256Hex } from "@/server/auth/tokens";
import type { Runner, RunnerCommand, CommandStatus } from "@/generated/prisma";

// ── DTOs ──────────────────────────────────────────────────────────────

export interface RunnerDTO {
  id: string;
  name: string;
  status: string;
  workingDir: string | null;
  lastSeenAt: string | null;
  online: boolean;
  createdAt: string;
}

/** A runner is "online" if it heartbeated within the last 45s. */
export function isOnline(lastSeenAt: Date | null): boolean {
  return !!lastSeenAt && Date.now() - lastSeenAt.getTime() < 45_000;
}

export function toRunnerDTO(r: Runner): RunnerDTO {
  const online = isOnline(r.lastSeenAt);
  return {
    id: r.id,
    name: r.name,
    status: online ? "ONLINE" : r.status === "ERROR" ? "ERROR" : "OFFLINE",
    workingDir: r.workingDir,
    lastSeenAt: r.lastSeenAt ? r.lastSeenAt.toISOString() : null,
    online,
    createdAt: r.createdAt.toISOString(),
  };
}

export interface CommandDTO {
  id: string;
  runnerId: string;
  runnerName?: string;
  taskId: string | null;
  command: string;
  cwd: string | null;
  status: CommandStatus;
  exitCode: number | null;
  output: string;
  source: string;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}

export function toCommandDTO(c: RunnerCommand & { runner?: { name: string } }): CommandDTO {
  return {
    id: c.id,
    runnerId: c.runnerId,
    runnerName: c.runner?.name,
    taskId: c.taskId,
    command: c.command,
    cwd: c.cwd,
    status: c.status,
    exitCode: c.exitCode,
    output: c.output,
    source: c.source,
    createdAt: c.createdAt.toISOString(),
    startedAt: c.startedAt ? c.startedAt.toISOString() : null,
    finishedAt: c.finishedAt ? c.finishedAt.toISOString() : null,
  };
}

// ── Runner lifecycle (user-authenticated) ─────────────────────────────

/** Create a runner and return the one-time plaintext token (hash stored). */
export async function createRunner(userId: string, name: string, workingDir?: string) {
  const token = newToken(32);
  const runner = await prisma.runner.create({
    data: { userId, name: name.trim().slice(0, 120) || "runner", tokenHash: sha256Hex(token), workingDir: workingDir || null },
  });
  return { runner, token };
}

export async function listRunners(userId: string): Promise<RunnerDTO[]> {
  const rows = await prisma.runner.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  return rows.map(toRunnerDTO);
}

export async function deleteRunner(userId: string, id: string): Promise<boolean> {
  const r = await prisma.runner.findFirst({ where: { id, userId }, select: { id: true } });
  if (!r) return false;
  await prisma.runner.delete({ where: { id } });
  return true;
}

// ── Runner authentication (token) ─────────────────────────────────────

export function extractRunnerToken(req: Request): string | null {
  const header = req.headers.get("x-runner-token");
  if (header) return header.trim();
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return null;
}

/** Resolve a runner from its token (and refresh its heartbeat). Null if invalid. */
export async function authRunner(req: Request): Promise<Runner | null> {
  const token = extractRunnerToken(req);
  if (!token) return null;
  const runner = await prisma.runner.findUnique({ where: { tokenHash: sha256Hex(token) } });
  if (!runner) return null;
  return runner;
}

export async function heartbeat(runnerId: string, meta?: Record<string, unknown>) {
  await prisma.runner.update({
    where: { id: runnerId },
    data: { status: "ONLINE", lastSeenAt: new Date(), ...(meta ? { meta: meta as never } : {}) },
  });
}

// ── Command lifecycle ─────────────────────────────────────────────────

export interface DispatchInput {
  runnerId: string;
  command: string;
  cwd?: string | null;
  taskId?: string | null;
  source?: string;
}

/** Queue a command for a user's runner. Returns null if the runner isn't theirs. */
export async function dispatchCommand(userId: string, input: DispatchInput): Promise<CommandDTO | null> {
  const runner = await prisma.runner.findFirst({ where: { id: input.runnerId, userId }, select: { id: true } });
  if (!runner) return null;
  const cmd = await prisma.runnerCommand.create({
    data: {
      runnerId: input.runnerId,
      userId,
      command: input.command.slice(0, 8000),
      cwd: input.cwd || null,
      taskId: input.taskId || null,
      source: input.source || "manual",
      status: "QUEUED",
    },
    include: { runner: { select: { name: true } } },
  });
  return toCommandDTO(cmd);
}

/** Runner claims the next queued command (oldest first), marking it RUNNING. */
export async function claimNextCommand(runnerId: string): Promise<CommandDTO | null> {
  // Claim atomically: update the oldest QUEUED row to RUNNING and return it.
  const next = await prisma.runnerCommand.findFirst({
    where: { runnerId, status: "QUEUED" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!next) return null;
  const claimed = await prisma.runnerCommand.updateMany({
    where: { id: next.id, status: "QUEUED" },
    data: { status: "RUNNING", startedAt: new Date() },
  });
  if (claimed.count === 0) return null; // lost the race
  const cmd = await prisma.runnerCommand.findUnique({ where: { id: next.id } });
  return cmd ? toCommandDTO(cmd) : null;
}

export async function appendOutput(commandId: string, runnerId: string, chunk: string): Promise<boolean> {
  const cmd = await prisma.runnerCommand.findFirst({ where: { id: commandId, runnerId }, select: { id: true, output: true } });
  if (!cmd) return false;
  const next = (cmd.output + chunk).slice(-200_000); // cap stored output
  await prisma.runnerCommand.update({ where: { id: commandId }, data: { output: next } });
  return true;
}

export async function finishCommand(commandId: string, runnerId: string, exitCode: number): Promise<boolean> {
  const cmd = await prisma.runnerCommand.findFirst({ where: { id: commandId, runnerId }, select: { id: true } });
  if (!cmd) return false;
  await prisma.runnerCommand.update({
    where: { id: commandId },
    data: { status: exitCode === 0 ? "DONE" : "FAILED", exitCode, finishedAt: new Date() },
  });
  return true;
}

export async function listCommands(userId: string, filter: { runnerId?: string; taskId?: string; limit?: number }): Promise<CommandDTO[]> {
  const rows = await prisma.runnerCommand.findMany({
    where: { userId, ...(filter.runnerId ? { runnerId: filter.runnerId } : {}), ...(filter.taskId ? { taskId: filter.taskId } : {}) },
    include: { runner: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: filter.limit ?? 50,
  });
  return rows.map(toCommandDTO);
}

export async function getCommand(userId: string, id: string): Promise<CommandDTO | null> {
  const c = await prisma.runnerCommand.findFirst({ where: { id, userId }, include: { runner: { select: { name: true } } } });
  return c ? toCommandDTO(c) : null;
}
