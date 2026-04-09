import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { auditLog } from "@/server/audit";
import { validateBody, isValidationError } from "@/server/api-validation";

const GrantEntitlementSchema = z.object({
  feature: z.string().optional().default("ai_chat"),
  targetUserId: z.string().optional(),
});

/**
 * POST /api/admin/grant-entitlement
 * Admin self-grants an entitlement (simulates billing for testing).
 */
export async function POST(req: Request) {
  const authResult = await requireAdmin(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  const parsed = await validateBody(req, GrantEntitlementSchema);
  if (isValidationError(parsed)) return parsed;

  const feature = parsed.feature;
  const targetUserId = parsed.targetUserId || user.id;

  await prisma.entitlement.upsert({
    where: { userId_feature: { userId: targetUserId, feature } },
    create: {
      userId: targetUserId,
      feature,
      grantedAt: new Date(),
      source: "ADMIN_GRANT",
    },
    update: {
      expiresAt: null,
      source: "ADMIN_GRANT",
    },
  });

  await auditLog({
    actorUserId: user.id,
    action: "admin.grant_entitlement",
    targetType: "Entitlement",
    targetId: targetUserId,
    metadata: { feature, grantedBy: user.email },
  });

  return NextResponse.json({ ok: true, feature, userId: targetUserId });
}
