import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { getToday } from "@/server/tasks/tasks";

/**
 * GET /api/tasks/today — the caller's cross-project "Today / My Work" buckets:
 * overdue, due today, upcoming, and someday (no due date). Excludes DONE.
 */
export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;

  const buckets = await getToday(auth.id, new Date());
  return NextResponse.json({ ok: true, ...buckets });
}
