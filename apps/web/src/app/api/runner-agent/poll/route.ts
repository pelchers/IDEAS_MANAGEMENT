import { NextResponse } from "next/server";
import { authRunner, heartbeat, claimNextCommand } from "@/server/runners/runners";

/**
 * GET /api/runner-agent/poll — runner claims the next queued command (token auth).
 * Also refreshes the heartbeat. Returns { command: null } when nothing is queued.
 */
export async function GET(req: Request) {
  const runner = await authRunner(req);
  if (!runner) return NextResponse.json({ ok: false, error: "invalid_runner_token" }, { status: 401 });
  await heartbeat(runner.id);
  const command = await claimNextCommand(runner.id);
  return NextResponse.json({ ok: true, command });
}
