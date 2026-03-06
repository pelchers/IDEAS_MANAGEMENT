import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "im_session";

/** Paths that do NOT require authentication. */
const PUBLIC_PATHS = new Set([
  "/",
  "/signin",
  "/signup",
  "/forgot-password",
  "/reset-password"
]);

/** API path prefixes that do NOT require authentication. */
const PUBLIC_API_PREFIXES = [
  "/api/auth/signin",
  "/api/auth/signup",
  "/api/auth/refresh",
  "/api/auth/verify-email",
  "/api/auth/password-reset",
  "/api/health"
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  for (const prefix of PUBLIC_API_PREFIXES) {
    if (pathname.startsWith(prefix)) return true;
  }
  // Static assets and Next.js internals
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/favicon")) return true;
  return false;
}

export function proxy(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const { pathname } = req.nextUrl;

  // Allow public paths through
  if (isPublicPath(pathname)) {
    const res = NextResponse.next();
    res.headers.set("x-request-id", requestId);
    return res;
  }

  // Check for session cookie presence
  const sessionToken = req.cookies.get(SESSION_COOKIE)?.value;

  if (!sessionToken) {
    // For API requests, return 401
    if (pathname.startsWith("/api/")) {
      const res = NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
      res.headers.set("x-request-id", requestId);
      return res;
    }
    // For page requests, redirect to signin
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("redirect", pathname);
    const res = NextResponse.redirect(url);
    res.headers.set("x-request-id", requestId);
    return res;
  }

  // Cookie is present. Full session validation is done in the API routes themselves.
  const res = NextResponse.next();
  res.headers.set("x-request-id", requestId);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
