import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { getProvider } from "@/server/integrations/registry";
import { disconnectIntegration } from "@/server/integrations/store";

type RouteParams = { params: Promise<{ provider: string }> };

/** POST /api/integrations/:provider/disconnect — remove the connection + wipe secrets. */
export async function POST(req: Request, { params }: RouteParams) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;
  const { provider: providerId } = await params;

  const provider = getProvider(providerId);
  if (!provider) return NextResponse.json({ ok: false, error: "unknown_provider" }, { status: 404 });

  await disconnectIntegration(auth.id, provider.id);
  return NextResponse.json({ ok: true, connected: false });
}
