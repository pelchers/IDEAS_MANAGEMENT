import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyEmailToken } from "@/server/auth/email-verification";
import { auditLog } from "@/server/audit";

const VerifySchema = z.object({
  token: z.string().min(1)
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = VerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  const userId = await verifyEmailToken(parsed.data.token);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "invalid_or_expired_token" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;
  await auditLog({
    actorUserId: userId,
    action: "auth.email_verified",
    ip,
    userAgent
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
