import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/auth/admin";
import { getUserEntitlements } from "@/server/billing/entitlements";

/**
 * GET /api/auth/me
 * Returns the current authenticated user or 401.
 * Used by the desktop app for session validation on startup.
 * Includes entitlement data for feature gating.
 */
export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const entitlements = await getUserEntitlements(user.id, user.role);

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: !!user.emailVerifiedAt
    },
    entitlements: {
      plan: entitlements.plan,
      features: entitlements.features,
      isAdmin: entitlements.isAdmin,
    }
  });
}
