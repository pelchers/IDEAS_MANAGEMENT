import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { getUsage } from "@/server/ai/token-tracking";
import { getUserEntitlements } from "@/server/billing/entitlements";

/**
 * GET /api/ai/usage
 * Returns current period AI usage stats for the authenticated user.
 */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  try {
    const entitlements = await getUserEntitlements(user.id, user.role);
    const usage = await getUsage(user.id, entitlements.plan);

    return NextResponse.json({
      ok: true,
      ...usage,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get usage";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
