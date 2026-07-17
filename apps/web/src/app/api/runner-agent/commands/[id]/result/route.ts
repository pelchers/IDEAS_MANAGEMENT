import { NextResponse } from "next/server";
import { authRunner, finishCommand } from "@/server/runners/runners";

type RouteParams = { params: Promise<{ id: string }> };

/** POST /api/runner-agent/commands/:id/result — report exit code + finish (token auth). */
export async function POST(req: Request, { params }: RouteParams) {
  const runner = await authRunner(req);
  if (!runner) return NextResponse.json({ ok: false, error: "invalid_runner_token" }, { status: 401 });
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { exitCode?: number };
  const exitCode = typeof body.exitCode === "number" ? body.exitCode : 1;
  const ok = await finishCommand(id, runner.id, exitCode);
  if (!ok) return NextResponse.json({ ok: false, error: "command_not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
