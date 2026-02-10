import { authConfig } from "./config";
import type { NextResponse } from "next/server";

const SESSION_COOKIE = "im_session";
const REFRESH_COOKIE = "im_refresh";

export function setAuthCookies(
  res: NextResponse,
  args: { sessionToken: string; refreshToken: string }
) {
  const base = {
    httpOnly: true,
    secure: authConfig.cookieSecure,
    sameSite: "lax" as const,
    path: "/"
  };

  res.cookies.set(SESSION_COOKIE, args.sessionToken, base);
  res.cookies.set(REFRESH_COOKIE, args.refreshToken, base);
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  res.cookies.set(REFRESH_COOKIE, "", { maxAge: 0, path: "/" });
}

export function readSessionCookie(req: Request) {
  const cookie = req.headers.get("cookie") ?? "";
  const m = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return m?.[1] ?? null;
}

export function readRefreshCookie(req: Request) {
  const cookie = req.headers.get("cookie") ?? "";
  const m = cookie.match(new RegExp(`${REFRESH_COOKIE}=([^;]+)`));
  return m?.[1] ?? null;
}

