import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { logProjectActivity } from "@/server/projects/activity";

type RouteParams = { params: Promise<{ token: string }> };

/**
 * GET /api/invites/[token]
 * Get invite details (public — so the user can see what they're accepting).
 */
export async function GET(_req: Request, { params }: RouteParams) {
  const { token } = await params;

  const invite = await prisma.projectInvite.findUnique({
    where: { token },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      expiresAt: true,
      project: { select: { id: true, name: true, description: true } },
      invitedBy: { select: { displayName: true, email: true } },
    },
  });

  if (!invite) {
    return NextResponse.json({ ok: false, error: "invite_not_found" }, { status: 404 });
  }

  if (invite.status !== "PENDING") {
    return NextResponse.json({ ok: false, error: `invite_${invite.status.toLowerCase()}` }, { status: 410 });
  }

  if (new Date(invite.expiresAt) < new Date()) {
    await prisma.projectInvite.update({ where: { token }, data: { status: "EXPIRED" } });
    return NextResponse.json({ ok: false, error: "invite_expired" }, { status: 410 });
  }

  return NextResponse.json({ ok: true, invite });
}

/**
 * POST /api/invites/[token]
 * Accept an invite. The authenticated user must match the invite email.
 */
export async function POST(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { token } = await params;

  const invite = await prisma.projectInvite.findUnique({ where: { token } });
  if (!invite) {
    return NextResponse.json({ ok: false, error: "invite_not_found" }, { status: 404 });
  }

  if (invite.status !== "PENDING") {
    return NextResponse.json({ ok: false, error: `invite_${invite.status.toLowerCase()}` }, { status: 410 });
  }

  if (new Date(invite.expiresAt) < new Date()) {
    await prisma.projectInvite.update({ where: { token }, data: { status: "EXPIRED" } });
    return NextResponse.json({ ok: false, error: "invite_expired" }, { status: 410 });
  }

  // Email must match
  if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
    return NextResponse.json({ ok: false, error: "email_mismatch" }, { status: 403 });
  }

  // Check if already a member
  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: invite.projectId, userId: user.id } },
  });
  if (existing) {
    await prisma.projectInvite.update({ where: { token }, data: { status: "ACCEPTED" } });
    return NextResponse.json({ ok: true, message: "already_member", projectId: invite.projectId });
  }

  // Add as member and mark invite accepted
  await prisma.$transaction([
    prisma.projectMember.create({
      data: { projectId: invite.projectId, userId: user.id, role: invite.role },
    }),
    prisma.projectInvite.update({ where: { token }, data: { status: "ACCEPTED" } }),
  ]);

  await logProjectActivity({
    projectId: invite.projectId,
    actorId: user.id,
    action: "member.joined",
    targetType: "User",
    targetId: user.id,
    metadata: { role: invite.role, viaInvite: invite.id },
  });

  return NextResponse.json({ ok: true, projectId: invite.projectId });
}
