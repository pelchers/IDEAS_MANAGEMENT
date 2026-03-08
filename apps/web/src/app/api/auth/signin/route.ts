import { NextResponse } from "next/server";
import { CredentialsSchema } from "@/server/auth/credentials";
import { prisma } from "@/server/db";
import { verifyPassword } from "@/server/auth/password";
import { issueSession } from "@/server/auth/session";
import { setAuthCookies } from "@/server/auth/cookies";
import { auditLog } from "@/server/audit";

function reqMeta(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;
  return { ip, userAgent };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = CredentialsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      include: { credential: true }
    });
    if (!user?.credential) {
      return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
    }

    const ok = await verifyPassword(user.credential.passwordHash, parsed.data.password);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
    }

    const session = await issueSession(user.id);
    const res = NextResponse.json(
      { ok: true, user: { id: user.id, email: user.email, role: user.role } },
      { status: 200 }
    );
    setAuthCookies(res, { sessionToken: session.sessionToken, refreshToken: session.refreshToken });

    const meta = reqMeta(req);
    await auditLog({
      actorUserId: user.id,
      action: "auth.signin",
      ip: meta.ip,
      userAgent: meta.userAgent
    });

    return res;
  } catch (err) {
    console.error("[Signin] Unexpected error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}

