import { NextResponse } from "next/server";
import { readRefreshCookie, setAuthCookies, clearAuthCookies } from "@/server/auth/cookies";
import { rotateRefreshToken } from "@/server/auth/session";
import { auditLog } from "@/server/audit";

export async function POST(req: Request) {
  const refresh = readRefreshCookie(req);
  if (!refresh) {
    const res = NextResponse.json({ ok: false, error: "missing_refresh" }, { status: 401 });
    clearAuthCookies(res);
    return res;
  }

  const rotated = await rotateRefreshToken(refresh);
  if (!rotated) {
    const res = NextResponse.json({ ok: false, error: "invalid_refresh" }, { status: 401 });
    clearAuthCookies(res);
    return res;
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;
  await auditLog({
    actorUserId: rotated.userId,
    action: "auth.token_refreshed",
    ip,
    userAgent
  });

  const res = NextResponse.json({ ok: true }, { status: 200 });
  setAuthCookies(res, { sessionToken: rotated.sessionToken, refreshToken: rotated.refreshToken });
  return res;
}
