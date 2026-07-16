import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { getProvider } from "@/server/integrations/registry";
import { upsertIntegration } from "@/server/integrations/store";
import { appBaseUrl } from "@/server/email/send";

type RouteParams = { params: Promise<{ provider: string }> };

/**
 * POST /api/integrations/:provider/connect
 * - local / apiKey providers: mark connected immediately.
 * - oauth providers: return { redirectUrl } to the provider's consent screen
 *   (guarded by a short-lived state cookie for CSRF).
 */
export async function POST(req: Request, { params }: RouteParams) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;
  const { provider: providerId } = await params;

  const provider = getProvider(providerId);
  if (!provider) return NextResponse.json({ ok: false, error: "unknown_provider" }, { status: 404 });

  if (!provider.isConfigured()) {
    return NextResponse.json(
      { ok: false, error: "not_configured", message: provider.setupHint ?? "This integration isn't configured yet." },
      { status: 400 }
    );
  }

  if (provider.kind === "oauth") {
    if (!provider.buildAuthUrl) {
      return NextResponse.json({ ok: false, error: "no_auth_url" }, { status: 500 });
    }
    const state = `${provider.id}.${randomBytes(16).toString("hex")}`;
    const redirectUri = `${appBaseUrl()}/api/integrations/${provider.id}/callback`;
    const redirectUrl = provider.buildAuthUrl({ userId: auth.id, redirectUri, state });

    const res = NextResponse.json({ ok: true, redirectUrl });
    res.cookies.set(`im_oauth_state_${provider.id}`, state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 600,
      path: "/",
    });
    return res;
  }

  // local (VS Code) + apiKey (Email, server-configured) → enable for this user.
  await upsertIntegration({ userId: auth.id, provider: provider.id, status: "CONNECTED" });
  return NextResponse.json({ ok: true, connected: true });
}
