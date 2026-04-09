import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { auditLog } from "@/server/audit";
import { checkProjectAccess } from "@/server/projects/helpers";
import { validateBody, isValidationError } from "@/server/api-validation";

const AddMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.string().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

/**
 * POST /api/projects/[id]/members
 * Add a member to the project. Requires OWNER role.
 */
export async function POST(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id: projectId } = await params;

  const access = await checkProjectAccess(projectId, user, "OWNER");
  if (!access) {
    return NextResponse.json(
      { ok: false, error: "forbidden" },
      { status: 403 }
    );
  }

  const parsed = await validateBody(req, AddMemberSchema);
  if (isValidationError(parsed)) return parsed;

  // Verify the target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: parsed.userId },
  });
  if (!targetUser) {
    return NextResponse.json(
      { ok: false, error: "user_not_found" },
      { status: 404 }
    );
  }

  // Check if already a member
  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: parsed.userId } },
  });
  if (existing) {
    return NextResponse.json(
      { ok: false, error: "already_member" },
      { status: 409 }
    );
  }

  const validRoles = ["OWNER", "EDITOR", "VIEWER"];
  const role = parsed.role && validRoles.includes(parsed.role.toUpperCase())
    ? parsed.role.toUpperCase()
    : "EDITOR";

  const member = await prisma.projectMember.create({
    data: {
      projectId,
      userId: parsed.userId,
      role: role as any,
    },
  });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;

  await auditLog({
    actorUserId: user.id,
    action: "project.member_added",
    targetType: "ProjectMember",
    targetId: member.id,
    ip,
    userAgent,
    metadata: { projectId, addedUserId: parsed.userId, role },
  });

  return NextResponse.json(
    {
      ok: true,
      member: {
        id: member.id,
        projectId: member.projectId,
        userId: member.userId,
        role: member.role,
        createdAt: member.createdAt,
      },
    },
    { status: 201 }
  );
}
