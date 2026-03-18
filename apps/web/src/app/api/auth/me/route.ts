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
      emailVerified: !!user.emailVerifiedAt,
      displayName: user.displayName ?? null,
      bio: user.bio ?? null,
      avatarUrl: user.avatarUrl ?? null,
      tags: user.tags ?? [],
      preferences: user.preferences ?? {},
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
 * Update the current user's profile.
 */
export async function PUT(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  let body: { email?: string; displayName?: string; bio?: string; avatarUrl?: string; tags?: string[]; preferences?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  // Email
  if (body.email && typeof body.email === "string") {
    const email = body.email.trim().toLowerCase();
    if (!email.includes("@") || email.length > 320) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }
    if (email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ ok: false, error: "email_in_use" }, { status: 409 });
      }
      updates.email = email;
    }
  }

  // Display name
  if (body.displayName !== undefined) {
    if (typeof body.displayName !== "string" || body.displayName.length > 100) {
      return NextResponse.json({ ok: false, error: "invalid_display_name" }, { status: 400 });
    }
    updates.displayName = body.displayName.trim() || null;
  }

  // Bio
  if (body.bio !== undefined) {
    if (typeof body.bio !== "string" || body.bio.length > 500) {
      return NextResponse.json({ ok: false, error: "invalid_bio" }, { status: 400 });
    }
    updates.bio = body.bio.trim() || null;
  }

  // Avatar URL
  if (body.avatarUrl !== undefined) {
    if (body.avatarUrl !== null && (typeof body.avatarUrl !== "string" || body.avatarUrl.length > 2048)) {
      return NextResponse.json({ ok: false, error: "invalid_avatar_url" }, { status: 400 });
    }
    updates.avatarUrl = body.avatarUrl || null;
  }

  // Tags
  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags) || body.tags.length > 10 || body.tags.some((t) => typeof t !== "string" || t.length > 50)) {
      return NextResponse.json({ ok: false, error: "invalid_tags" }, { status: 400 });
    }
    updates.tags = body.tags.map((t) => t.trim()).filter(Boolean);
  }

  // Preferences
  if (body.preferences !== undefined) {
    if (typeof body.preferences !== "object" || body.preferences === null || Array.isArray(body.preferences)) {
      return NextResponse.json({ ok: false, error: "invalid_preferences" }, { status: 400 });
    }
    updates.preferences = body.preferences;
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

/**
 * DELETE /api/auth/me
 * Delete the current user's account and all associated data.
 */
export async function DELETE(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  // Prisma cascade deletes handle all related records
  await prisma.user.delete({ where: { id: user.id } });

  // Clear auth cookies
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("session_token");
  response.cookies.delete("refresh_token");
  return response;
}
