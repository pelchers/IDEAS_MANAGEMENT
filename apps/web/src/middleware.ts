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

/** API paths that do NOT require authentication. */
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths through
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for session cookie presence
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;

  if (!sessionToken) {
    // For API requests, return 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    // For page requests, redirect to signin
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Cookie is present. Full session validation is done in the API routes themselves
  // (the middleware only checks cookie existence as a fast path).
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ]
};
