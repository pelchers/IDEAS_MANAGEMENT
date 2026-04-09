import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser, requireAuth, isErrorResponse } from "@/server/auth/admin";
import { getUserEntitlements } from "@/server/billing/entitlements";
import { prisma } from "@/server/db";
import { validateBody, isValidationError } from "@/server/api-validation";

const UpdateProfileSchema = z.object({
  email: z.string().email().max(320).optional(),
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().max(2048).nullable().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
});

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

  const parsed = await validateBody(req, UpdateProfileSchema);
  if (isValidationError(parsed)) return parsed;

  const updates: Record<string, unknown> = {};

  // Email
  if (parsed.email) {
    const email = parsed.email.trim().toLowerCase();
    if (email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ ok: false, error: "email_in_use" }, { status: 409 });
      }
      updates.email = email;
    }
  }

  // Display name
  if (parsed.displayName !== undefined) {
    updates.displayName = parsed.displayName.trim() || null;
  }

  // Bio
  if (parsed.bio !== undefined) {
    updates.bio = parsed.bio.trim() || null;
  }

  // Avatar URL
  if (parsed.avatarUrl !== undefined) {
    updates.avatarUrl = parsed.avatarUrl || null;
  }

  // Tags
  if (parsed.tags !== undefined) {
    updates.tags = parsed.tags.map((t) => t.trim()).filter(Boolean);
  }

  // Preferences
  if (parsed.preferences !== undefined) {
    updates.preferences = parsed.preferences;
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
