import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { checkProjectAccess } from "@/server/projects/helpers";
import { validateBody, isValidationError } from "@/server/api-validation";
import { logProjectActivity } from "@/server/projects/activity";
import { createNotification } from "@/server/notifications/service";

const InviteSchema = z.object({
  email: z.string().email().max(320),
  role: z.enum(["EDITOR", "VIEWER"]).optional().default("EDITOR"),
});

type RouteParams = { params: Promise<{ id: string }> };

/**
 * POST /api/projects/[id]/invite
 * Invite a user to the project by email. Requires OWNER role.
 */
export async function POST(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id: projectId } = await params;

  const access = await checkProjectAccess(projectId, user, "OWNER");
  if (!access) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const parsed = await validateBody(req, InviteSchema);
  if (isValidationError(parsed)) return parsed;

  const email = parsed.email.trim().toLowerCase();

  // Check if user is already a member
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const existingMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: existingUser.id } },
    });
    if (existingMember) {
      return NextResponse.json({ ok: false, error: "already_member" }, { status: 409 });
    }
  }

  // Check for existing pending invite
  const existingInvite = await prisma.projectInvite.findFirst({
    where: { projectId, email, status: "PENDING" },
  });
  if (existingInvite) {
    return NextResponse.json({ ok: false, error: "invite_already_sent" }, { status: 409 });
  }

  const invite = await prisma.projectInvite.create({
    data: {
      projectId,
      email,
      invitedByUserId: user.id,
      role: parsed.role as "EDITOR" | "VIEWER",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  await logProjectActivity({
    projectId,
    actorId: user.id,
    action: "invite.sent",
    targetType: "ProjectInvite",
    targetId: invite.id,
    metadata: { email, role: parsed.role },
  });

  // Notify the invitee if they already have an account
  if (existingUser) {
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { name: true } });
    await createNotification({
      userId: existingUser.id,
      type: "project.invite",
      title: `${user.displayName || user.email} invited you to ${project?.name || "a project"}`,
      sourceType: "Project",
      sourceId: projectId,
      linkPath: `/invites/${invite.token}`,
    });
  }

  return NextResponse.json({ ok: true, invite: { id: invite.id, token: invite.token, email, role: parsed.role, expiresAt: invite.expiresAt } }, { status: 201 });
}

/**
 * GET /api/projects/[id]/invite
 * List pending invites for this project. Requires OWNER role.
 */
export async function GET(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id: projectId } = await params;

  const access = await checkProjectAccess(projectId, user, "OWNER");
  if (!access) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const invites = await prisma.projectInvite.findMany({
    where: { projectId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, role: true, status: true, expiresAt: true, createdAt: true },
  });

  return NextResponse.json({ ok: true, invites });
}
