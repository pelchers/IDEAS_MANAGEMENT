import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { validateBody, isValidationError } from "@/server/api-validation";
import { hasGroupRole } from "@/server/social/groups";

const PatchSchema = z.object({
  // approve a pending join request, or change role
  action: z.enum(["approve", "set_role"]),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]).optional(),
});

type RouteParams = { params: Promise<{ id: string; memberId: string }> };

/**
 * PATCH /api/groups/[id]/members/[memberId]
 * Approve a pending join request or change a member's role. Requires ADMIN/OWNER.
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id: groupId, memberId } = await params;

  if (!(await hasGroupRole(groupId, user.id, "ADMIN"))) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const parsed = await validateBody(req, PatchSchema);
  if (isValidationError(parsed)) return parsed;

  const member = await prisma.groupMember.findUnique({ where: { id: memberId } });
  if (!member || member.groupId !== groupId) {
    return NextResponse.json({ ok: false, error: "member_not_found" }, { status: 404 });
  }

  if (parsed.action === "approve") {
    const updated = await prisma.groupMember.update({ where: { id: memberId }, data: { status: "active" } });
    return NextResponse.json({ ok: true, member: { id: updated.id, status: updated.status } });
  }

  // set_role — only OWNER can grant/revoke OWNER
  if (!parsed.role) return NextResponse.json({ ok: false, error: "missing_role" }, { status: 400 });
  if (parsed.role === "OWNER" && !(await hasGroupRole(groupId, user.id, "OWNER"))) {
    return NextResponse.json({ ok: false, error: "owner_required" }, { status: 403 });
  }
  // Prevent demoting the last owner
  if (member.role === "OWNER" && parsed.role !== "OWNER") {
    const owners = await prisma.groupMember.count({ where: { groupId, role: "OWNER", status: "active" } });
    if (owners <= 1) return NextResponse.json({ ok: false, error: "cannot_demote_last_owner" }, { status: 400 });
  }

  const updated = await prisma.groupMember.update({ where: { id: memberId }, data: { role: parsed.role } });
  return NextResponse.json({ ok: true, member: { id: updated.id, role: updated.role } });
}

/**
 * DELETE /api/groups/[id]/members/[memberId]
 * Remove a member, decline a join request, or leave the group.
 * Admins/owners can remove others; a member can remove themselves.
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id: groupId, memberId } = await params;

  const member = await prisma.groupMember.findUnique({ where: { id: memberId } });
  if (!member || member.groupId !== groupId) {
    return NextResponse.json({ ok: false, error: "member_not_found" }, { status: 404 });
  }

  const isSelf = member.userId === user.id;
  const isAdmin = await hasGroupRole(groupId, user.id, "ADMIN");
  if (!isSelf && !isAdmin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  // Prevent removing the last owner
  if (member.role === "OWNER" && member.status === "active") {
    const owners = await prisma.groupMember.count({ where: { groupId, role: "OWNER", status: "active" } });
    if (owners <= 1) return NextResponse.json({ ok: false, error: "cannot_remove_last_owner" }, { status: 400 });
  }

  await prisma.groupMember.delete({ where: { id: memberId } });
  return NextResponse.json({ ok: true });
}
