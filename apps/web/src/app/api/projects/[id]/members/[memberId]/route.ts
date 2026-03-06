import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { auditLog } from "@/server/audit";
import { checkProjectAccess } from "@/server/projects/helpers";

type RouteParams = { params: Promise<{ id: string; memberId: string }> };

/**
 * DELETE /api/projects/[id]/members/[memberId]
 * Remove a member from the project. Requires OWNER role.
 * Cannot remove the last OWNER.
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id: projectId, memberId } = await params;

  const access = await checkProjectAccess(projectId, user, "OWNER");
  if (!access) {
    return NextResponse.json(
      { ok: false, error: "forbidden" },
      { status: 403 }
    );
  }

  // Find the member to remove
  const member = await prisma.projectMember.findUnique({
    where: { id: memberId },
  });

  if (!member || member.projectId !== projectId) {
    return NextResponse.json(
      { ok: false, error: "member_not_found" },
      { status: 404 }
    );
  }

  // Prevent removing the last owner
  if (member.role === "OWNER") {
    const ownerCount = await prisma.projectMember.count({
      where: { projectId, role: "OWNER" },
    });
    if (ownerCount <= 1) {
      return NextResponse.json(
        { ok: false, error: "cannot_remove_last_owner" },
        { status: 400 }
      );
    }
  }

  await prisma.projectMember.delete({ where: { id: memberId } });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;

  await auditLog({
    actorUserId: user.id,
    action: "project.member_removed",
    targetType: "ProjectMember",
    targetId: memberId,
    ip,
    userAgent,
    metadata: { projectId, removedUserId: member.userId },
  });

  return NextResponse.json({ ok: true });
}
