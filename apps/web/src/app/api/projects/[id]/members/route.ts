import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { auditLog } from "@/server/audit";
import { checkProjectAccess } from "@/server/projects/helpers";

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

  let body: { userId?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_body" },
      { status: 400 }
    );
  }

  if (!body.userId || typeof body.userId !== "string") {
    return NextResponse.json(
      { ok: false, error: "userId_required" },
      { status: 400 }
    );
  }

  // Verify the target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: body.userId },
  });
  if (!targetUser) {
    return NextResponse.json(
      { ok: false, error: "user_not_found" },
      { status: 404 }
    );
  }

  // Check if already a member
  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: body.userId } },
  });
  if (existing) {
    return NextResponse.json(
      { ok: false, error: "already_member" },
      { status: 409 }
    );
  }

  const validRoles = ["OWNER", "EDITOR", "VIEWER"];
  const role = body.role && validRoles.includes(body.role.toUpperCase())
    ? body.role.toUpperCase()
    : "EDITOR";

  const member = await prisma.projectMember.create({
    data: {
      projectId,
      userId: body.userId,
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
    metadata: { projectId, addedUserId: body.userId, role },
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
