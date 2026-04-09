import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { getAllAdminConfig, setAdminConfig, getAiUsageStats, type AdminConfigKey } from "@/server/admin/config";
import { validateBody, isValidationError } from "@/server/api-validation";

const UpdateConfigSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

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

  const parsed = await validateBody(req, UpdateConfigSchema);
  if (isValidationError(parsed)) return parsed;

  try {
    await setAdminConfig(parsed.key as AdminConfigKey, parsed.value);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update config";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
