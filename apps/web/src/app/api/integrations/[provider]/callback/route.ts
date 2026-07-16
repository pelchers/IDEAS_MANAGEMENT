import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { getProvider } from "@/server/integrations/registry";
import { upsertIntegration } from "@/server/integrations/store";
import { appBaseUrl } from "@/server/email/send";

type RouteParams = { params: Promise<{ provider: string }> };

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

function back(path: string) {
  return NextResponse.redirect(`${appBaseUrl()}${path}`);
}

/** GET /api/integrations/:provider/callback — OAuth redirect target. */
export async function GET(req: Request, { params }: RouteParams) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;
  const { provider: providerId } = await params;

  const provider = getProvider(providerId);
  if (!provider || provider.kind !== "oauth" || !provider.exchangeCode) {
    return back(`/settings?integration_error=unknown_provider`);
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expected = readCookie(req, `im_oauth_state_${provider.id}`);

  if (url.searchParams.get("error")) return back(`/settings?integration_error=denied`);
  if (!code || !state || !expected || state !== expected) {
    return back(`/settings?integration_error=state_mismatch`);
  }

  try {
    const redirectUri = `${appBaseUrl()}/api/integrations/${provider.id}/callback`;
    const result = await provider.exchangeCode({ code, redirectUri });
    await upsertIntegration({
      userId: auth.id,
      provider: provider.id,
      status: "CONNECTED",
      config: result.config,
      scopes: result.scopes,
      accountLabel: result.accountLabel ?? null,
    });
    const res = back(`/settings?integration_connected=${provider.id}`);
    res.cookies.delete(`im_oauth_state_${provider.id}`);
    return res;
  } catch {
    return back(`/settings?integration_error=exchange_failed`);
  }
}
