import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/auth/admin";

/**
 * GET /api/auth/me
 * Returns the current authenticated user or 401.
 * Used by the desktop app for session validation on startup.
 */
export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: !!user.emailVerifiedAt
    }
  });
}
