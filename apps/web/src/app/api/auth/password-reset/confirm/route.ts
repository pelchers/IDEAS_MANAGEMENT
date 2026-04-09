import { NextResponse } from "next/server";
import { z } from "zod";
import { PasswordSchema } from "@/server/auth/credentials";
import { resetPasswordWithToken } from "@/server/auth/password-reset";
import {
  revokeAllSessionsForUser,
  revokeAllRefreshTokensForUser
} from "@/server/auth/session";
import { auditLog } from "@/server/audit";
import { rateLimit, getClientIp, rateLimitResponse, PRESETS } from "@/server/rate-limit";

const ConfirmResetSchema = z.object({
  token: z.string().min(1),
  newPassword: PasswordSchema
});

/**
 * POST /api/auth/password-reset/confirm
 * Consume a reset token and set the new password.
 * Also revokes all existing sessions/refresh tokens for security.
 */
export async function POST(req: Request) {
  // Rate limit: 5 confirm attempts per 15 min per IP
  const clientIp = getClientIp(req);
  const limitResult = rateLimit(`pwreset-confirm:${clientIp}`, PRESETS.authStrict.limit, PRESETS.authStrict.windowMs);
  if (!limitResult.allowed) return rateLimitResponse(limitResult);

  const body = await req.json().catch(() => null);
  const parsed = ConfirmResetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  const userId = await resetPasswordWithToken(parsed.data.token, parsed.data.newPassword);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "invalid_or_expired_token" }, { status: 400 });
  }

  // Revoke all sessions and refresh tokens for security after password change
  await Promise.all([
    revokeAllSessionsForUser(userId),
    revokeAllRefreshTokensForUser(userId)
  ]);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;
  await auditLog({
    actorUserId: userId,
    action: "auth.password_reset_completed",
    ip,
    userAgent
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
