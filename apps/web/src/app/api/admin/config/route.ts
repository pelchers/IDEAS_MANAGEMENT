import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { getAllAdminConfig, setAdminConfig, getAiUsageStats, type AdminConfigKey } from "@/server/admin/config";

/**
 * GET /api/admin/config
 * Returns all admin configuration values + usage stats. Admin only.
 */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  if (user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Admin access required" }, { status: 403 });
  }

  try {
    const [config, stats] = await Promise.all([
      getAllAdminConfig(),
      getAiUsageStats(),
    ]);

    return NextResponse.json({ ok: true, config, stats });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get config";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/config
 * Update an admin configuration value. Admin only.
 */
export async function PUT(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  if (user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Admin access required" }, { status: 403 });
  }

  let body: { key: string; value: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.key || typeof body.value !== "string") {
    return NextResponse.json({ ok: false, error: "key and value required" }, { status: 400 });
  }

  try {
    await setAdminConfig(body.key as AdminConfigKey, body.value);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update config";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
