import { NextResponse } from "next/server";
import { clearAuthCookies, readRefreshCookie, readSessionCookie } from "@/server/auth/cookies";
import {
  revokeRefreshByToken,
  revokeSessionByToken,
  revokeAllSessionsForUser,
  revokeAllRefreshTokensForUser,
  validateSession
} from "@/server/auth/session";
import { auditLog } from "@/server/audit";

/**
 * POST /api/auth/signout
 * Body: { allDevices?: boolean }
 *
 * Default: revokes only the current session + refresh token (single device).
 * If allDevices: true, revokes ALL sessions and refresh tokens for the user.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const allDevices = body?.allDevices === true;

  const sessionToken = readSessionCookie(req);
  const refreshToken = readRefreshCookie(req);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;

  if (allDevices && sessionToken) {
    // Validate the session to find the userId
    const session = await validateSession(sessionToken);
    if (session) {
      await Promise.all([
        revokeAllSessionsForUser(session.userId),
        revokeAllRefreshTokensForUser(session.userId)
      ]);

      await auditLog({
        actorUserId: session.userId,
        action: "auth.signout_all_devices",
        ip,
        userAgent
      });
    }
  } else {
    // Single-device sign out
    let userId: string | undefined;
    if (sessionToken) {
      const session = await validateSession(sessionToken);
      userId = session?.userId;
      await revokeSessionByToken(sessionToken);
    }
    if (refreshToken) {
      await revokeRefreshByToken(refreshToken);
    }

    if (userId) {
      await auditLog({
        actorUserId: userId,
        action: "auth.signout",
        ip,
        userAgent
      });
    }
  }

  const res = NextResponse.json({ ok: true }, { status: 200 });
  clearAuthCookies(res);
  return res;
}
