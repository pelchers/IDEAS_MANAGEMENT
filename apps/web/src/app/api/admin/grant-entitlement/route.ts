import { NextResponse } from "next/server";
import { requireAdmin, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { auditLog } from "@/server/audit";

/**
 * POST /api/admin/grant-entitlement
 * Admin self-grants an entitlement (simulates billing for testing).
 */
export async function POST(req: Request) {
  const authResult = await requireAdmin(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  let body: { feature?: string; targetUserId?: string };
  try { body = await req.json(); } catch { body = {}; }

  const feature = body.feature || "ai_chat";
  const targetUserId = body.targetUserId || user.id;

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
