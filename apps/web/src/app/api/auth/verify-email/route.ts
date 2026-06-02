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

/**
 * GET /api/auth/verify-email?token=...
 * One-click verification target for email links. Verifies the token and
 * returns a simple HTML confirmation.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token")?.trim() || "";
  if (!token) return htmlPage("Invalid verification link.", 400);

  const userId = await verifyEmailToken(token);
  if (!userId) return htmlPage("This verification link is invalid or has expired.", 400);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;
  await auditLog({ actorUserId: userId, action: "auth.email_verified", ip, userAgent });

  return htmlPage("Your email has been verified. You can return to the app.", 200);
}

function htmlPage(message: string, status: number) {
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Verify Email</title></head>
     <body style="font-family:monospace;max-width:600px;margin:48px auto;padding:24px;border:3px solid #282828">
       <h1 style="text-transform:uppercase">Email Verification</h1>
       <p>${message}</p>
     </body></html>`,
    { status, headers: { "Content-Type": "text/html" } }
  );
}
