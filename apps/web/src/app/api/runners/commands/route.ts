import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { listCommands } from "@/server/runners/runners";

/** GET /api/runners/commands — the caller's command history (?runnerId= ?taskId=). */
export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;
  const url = new URL(req.url);
  const commands = await listCommands(auth.id, {
    runnerId: url.searchParams.get("runnerId") ?? undefined,
    taskId: url.searchParams.get("taskId") ?? undefined,
    limit: 50,
  });
  return NextResponse.json({ ok: true, commands });
}
