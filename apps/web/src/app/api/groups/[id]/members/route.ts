import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { validateBody, isValidationError } from "@/server/api-validation";
import { getGroupMembership, hasGroupRole } from "@/server/social/groups";

const PostSchema = z.object({
  // "join" = self join-request; "invite" = admin adds by email/userId
  action: z.enum(["join", "invite"]),
  email: z.string().email().max(320).optional(),
  userId: z.string().optional(),
  role: z.enum(["ADMIN", "MEMBER"]).optional().default("MEMBER"),
});

type RouteParams = { params: Promise<{ id: string }> };

/**
 * POST /api/groups/[id]/members
 * action=join  → current user requests to join (status pending)
 * action=invite → admin/owner adds a user directly (status active)
 */
export async function POST(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id: groupId } = await params;

  const group = await prisma.group.findUnique({ where: { id: groupId }, select: { id: true } });
  if (!group) return NextResponse.json({ ok: false, error: "group_not_found" }, { status: 404 });

  const parsed = await validateBody(req, PostSchema);
  if (isValidationError(parsed)) return parsed;

  if (parsed.action === "join") {
    const existing = await getGroupMembership(groupId, user.id);
    if (existing) {
      return NextResponse.json({ ok: false, error: existing.status === "active" ? "already_member" : "request_pending" }, { status: 409 });
    }
    const m = await prisma.groupMember.create({
      data: { groupId, userId: user.id, role: "MEMBER", status: "pending" },
    });
    return NextResponse.json({ ok: true, member: { id: m.id, status: m.status } }, { status: 201 });
  }

  // invite — requires ADMIN/OWNER
  if (!(await hasGroupRole(groupId, user.id, "ADMIN"))) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let targetUserId = parsed.userId;
  if (!targetUserId && parsed.email) {
    const target = await prisma.user.findUnique({ where: { email: parsed.email.trim().toLowerCase() }, select: { id: true } });
    if (!target) return NextResponse.json({ ok: false, error: "user_not_found" }, { status: 404 });
    targetUserId = target.id;
  }
  if (!targetUserId) {
    return NextResponse.json({ ok: false, error: "missing_target" }, { status: 400 });
  }

  const existing = await getGroupMembership(groupId, targetUserId);
  if (existing) {
    if (existing.status === "active") return NextResponse.json({ ok: false, error: "already_member" }, { status: 409 });
    // Approve a pending request via invite
    const updated = await prisma.groupMember.update({ where: { groupId_userId: { groupId, userId: targetUserId } }, data: { status: "active", role: parsed.role } });
    return NextResponse.json({ ok: true, member: { id: updated.id, status: updated.status } });
  }

  const m = await prisma.groupMember.create({
    data: { groupId, userId: targetUserId, role: parsed.role, status: "active" },
  });
  return NextResponse.json({ ok: true, member: { id: m.id, status: m.status } }, { status: 201 });
}
