import { NextResponse } from "next/server";
import { getAuthenticatedUser, requireAuth, isErrorResponse } from "@/server/auth/admin";
import { getUserEntitlements } from "@/server/billing/entitlements";
import { prisma } from "@/server/db";

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

/**
 * PUT /api/auth/me
 * Update the current user's profile (email only for now).
 */
export async function PUT(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const updates: { email?: string } = {};
  if (body.email && typeof body.email === "string") {
    const email = body.email.trim().toLowerCase();
    if (!email.includes("@") || email.length > 320) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }
    // Check for duplicate email
    if (email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ ok: false, error: "email_in_use" }, { status: 409 });
      }
      updates.email = email;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true, message: "no_changes" });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updates,
  });

  return NextResponse.json({ ok: true });
}
