import { NextResponse } from "next/server";
import { CredentialsSchema } from "@/server/auth/credentials";
import { prisma } from "@/server/db";
import { hashPassword } from "@/server/auth/password";
import { issueSession } from "@/server/auth/session";
import { setAuthCookies } from "@/server/auth/cookies";
import { issueEmailVerificationToken } from "@/server/auth/email-verification";
import { auditLog } from "@/server/audit";
import { rateLimit, getClientIp, rateLimitResponse, PRESETS } from "@/server/rate-limit";

function reqMeta(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;
  return { ip, userAgent };
}

export async function POST(req: Request) {
  try {
    // Rate limit: 5 signup attempts per 15 min per IP
    const clientIp = getClientIp(req);
    const limitResult = rateLimit(`signup:${clientIp}`, PRESETS.authStrict.limit, PRESETS.authStrict.windowMs);
    if (!limitResult.allowed) return rateLimitResponse(limitResult);

    const body = await req.json().catch(() => null);
    const parsed = CredentialsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ ok: false, error: "email_in_use" }, { status: 409 });
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await prisma.user.create({
      data: {
        email,
        credential: {
          create: {
            passwordHash,
            passwordAlgo: "argon2id"
          }
        }
      },
      select: { id: true, email: true, role: true, createdAt: true }
    });

    // Issue email verification token (stub: would send email in production)
    const verification = await issueEmailVerificationToken(user.id);

    const session = await issueSession(user.id);

    const res = NextResponse.json(
      {
        ok: true,
        user,
        // Dev-only: include verification token in response for local testing.
        // NEVER exposed in production.
        ...(process.env.NODE_ENV !== "production"
          ? { _dev: { verificationToken: verification.token } }
          : {}),
      },
      { status: 201 }
    );
    setAuthCookies(res, { sessionToken: session.sessionToken, refreshToken: session.refreshToken });

    const meta = reqMeta(req);
    await auditLog({
      actorUserId: user.id,
      action: "auth.signup",
      ip: meta.ip,
      userAgent: meta.userAgent,
      metadata: { emailVerificationIssued: true }
    });

    return res;
  } catch (err) {
    console.error("[Signup] Unexpected error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}

