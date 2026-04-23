import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { checkProjectAccess } from "@/server/projects/helpers";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]/activity?limit=...&before=...
 * Returns activity feed for a project. Requires member access.
 */
export async function GET(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id: projectId } = await params;

  const access = await checkProjectAccess(projectId, user);
  if (!access) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "30", 10)));
  const before = url.searchParams.get("before");

  const where: Record<string, unknown> = { projectId };
  if (before) {
    where.createdAt = { lt: new Date(before) };
  }

  const activities = await prisma.projectActivity.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      action: true,
      targetType: true,
      targetId: true,
      metadata: true,
      createdAt: true,
      actor: {
        select: { id: true, displayName: true, avatarUrl: true, email: true },
      },
    },
  });

  return NextResponse.json({ ok: true, activities });
}
