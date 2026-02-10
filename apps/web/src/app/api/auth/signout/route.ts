import { NextResponse } from "next/server";
import { clearAuthCookies, readRefreshCookie, readSessionCookie } from "@/server/auth/cookies";
import { revokeRefreshByToken, revokeSessionByToken } from "@/server/auth/session";

export async function POST(req: Request) {
  const session = readSessionCookie(req);
  const refresh = readRefreshCookie(req);

  if (session) await revokeSessionByToken(session);
  if (refresh) await revokeRefreshByToken(refresh);

  const res = NextResponse.json({ ok: true }, { status: 200 });
  clearAuthCookies(res);
  return res;
}

