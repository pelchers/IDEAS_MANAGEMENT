import { NextResponse } from "next/server";
import { readSessionCookie } from "./cookies";
import { validateSession } from "./session";
import { auditLog } from "../audit";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  emailVerifiedAt: Date | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  tags: string[];
  preferences: Record<string, unknown> | null;
  profileVisibility: Record<string, boolean> | null;
};

/**
 * Extract and validate the authenticated user from a request.
 * Returns null if there is no valid session.
 */
export async function getAuthenticatedUser(req: Request): Promise<AuthenticatedUser | null> {
  const token = readSessionCookie(req);
  if (!token) return null;
  const session = await validateSession(token);
  if (!session) return null;
  return session.user as AuthenticatedUser;
}

/**
 * Require that the request is from an authenticated user.
 * Returns the user or a 401 response.
 */
export async function requireAuth(req: Request): Promise<AuthenticatedUser | NextResponse> {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return user;
}

/**
 * Require that the request is from an authenticated admin.
 * Returns the admin user or an error response (401 or 403).
 */
export async function requireAdmin(req: Request): Promise<AuthenticatedUser | NextResponse> {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;
  if (result.role !== "ADMIN") {
    // Log unauthorized admin access attempt
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const userAgent = req.headers.get("user-agent") ?? null;
    await auditLog({
      actorUserId: result.id,
      action: "admin.access_denied",
      ip,
      userAgent,
      metadata: { attemptedPath: new URL(req.url).pathname }
    });
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  return result;
}

/**
 * Helper to check if a NextResponse was returned (error case) vs a user object.
 */
export function isErrorResponse(result: AuthenticatedUser | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
