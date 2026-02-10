import { NextResponse } from "next/server";
import { CredentialsSchema } from "@/server/auth/credentials";
import { prisma } from "@/server/db";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { issueSession } from "@/server/auth/session";
import { setAuthCookies } from "@/server/auth/cookies";
import { auditLog } from "@/server/audit";

function reqMeta(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;
  return { ip, userAgent };
}

export async function POST(req: Request) {
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

  const session = await issueSession(user.id);

  const res = NextResponse.json({ ok: true, user }, { status: 201 });
  setAuthCookies(res, { sessionToken: session.sessionToken, refreshToken: session.refreshToken });

  const meta = reqMeta(req);
  await auditLog({
    actorUserId: user.id,
    action: "auth.signup",
    ip: meta.ip,
    userAgent: meta.userAgent
  });

  return res;
}

