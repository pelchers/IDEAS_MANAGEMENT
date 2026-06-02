import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { issuePasswordResetToken } from "@/server/auth/password-reset";
import { auditLog } from "@/server/audit";
import { rateLimit, getClientIp, rateLimitResponse, PRESETS } from "@/server/rate-limit";
import { sendEmail, appBaseUrl } from "@/server/email/send";
import { passwordResetEmail } from "@/server/email/templates";

const RequestResetSchema = z.object({
  email: z.string().email().max(320)
});

/**
 * POST /api/auth/password-reset
 * Request a password reset. Always returns 200 to avoid email enumeration.
 */
export async function POST(req: Request) {
  // Rate limit: 3 password-reset requests per hour per IP
  const clientIp = getClientIp(req);
  const limitResult = rateLimit(`pwreset:${clientIp}`, PRESETS.passwordReset.limit, PRESETS.passwordReset.windowMs);
  if (!limitResult.allowed) return rateLimitResponse(limitResult);

  const body = await req.json().catch(() => null);
  const parsed = RequestResetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, displayName: true } });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;

  if (!user) {
    // Do not reveal that the email does not exist.
    // Still log the attempt for security monitoring.
    await auditLog({
      action: "auth.password_reset_requested",
      ip,
      userAgent,
      metadata: { emailFound: false }
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Issue a reset token + send the reset link. Sends via the configured
  // provider (RESEND_API_KEY); logs as a no-op when none is set.
  const reset = await issuePasswordResetToken(user.id);
  const resetUrl = `${appBaseUrl()}/reset-password?token=${reset.token}`;
  const rmsg = passwordResetEmail({ name: user.displayName, email, resetUrl });
  await sendEmail({ to: email, subject: rmsg.subject, html: rmsg.html, text: rmsg.text });

  await auditLog({
    actorUserId: user.id,
    action: "auth.password_reset_requested",
    ip,
    userAgent,
    metadata: { emailFound: true }
  });

  // Dev convenience: include the token only when no email provider is wired
  // (so local testing still works). Never present once RESEND_API_KEY is set.
  const devToken = process.env.RESEND_API_KEY ? {} : { _dev: { resetToken: reset.token } };
  return NextResponse.json({ ok: true, ...devToken }, { status: 200 });
}
