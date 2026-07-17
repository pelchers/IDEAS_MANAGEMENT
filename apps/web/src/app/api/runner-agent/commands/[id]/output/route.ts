import { NextResponse } from "next/server";
import { authRunner, appendOutput } from "@/server/runners/runners";

type RouteParams = { params: Promise<{ id: string }> };

/** POST /api/runner-agent/commands/:id/output — append streamed output (token auth). */
export async function POST(req: Request, { params }: RouteParams) {
  const runner = await authRunner(req);
  if (!runner) return NextResponse.json({ ok: false, error: "invalid_runner_token" }, { status: 401 });
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { chunk?: string };
  const chunk = typeof body.chunk === "string" ? body.chunk : "";
  const ok = await appendOutput(id, runner.id, chunk);
  if (!ok) return NextResponse.json({ ok: false, error: "command_not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
