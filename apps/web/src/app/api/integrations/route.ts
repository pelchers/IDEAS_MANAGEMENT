import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { getIntegrationStatuses } from "@/server/integrations/registry";

/** GET /api/integrations — providers + this user's connection status. */
export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;
  const integrations = await getIntegrationStatuses(auth.id);
  return NextResponse.json({ ok: true, integrations });
}
