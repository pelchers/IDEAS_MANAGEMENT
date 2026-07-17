import { NextResponse } from "next/server";
import { authRunner, heartbeat } from "@/server/runners/runners";

/** POST /api/runner-agent/heartbeat — runner reports it's alive (token auth). */
export async function POST(req: Request) {
  const runner = await authRunner(req);
  if (!runner) return NextResponse.json({ ok: false, error: "invalid_runner_token" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  await heartbeat(runner.id, typeof body === "object" && body ? (body.meta ?? undefined) : undefined);
  return NextResponse.json({ ok: true, runnerId: runner.id });
}
