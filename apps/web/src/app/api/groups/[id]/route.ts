import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { validateBody, isValidationError } from "@/server/api-validation";
import { getGroupMembership, hasGroupRole } from "@/server/social/groups";

const PatchGroupSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).optional(),
  avatarUrl: z.string().max(2048).nullable().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/groups/[id]
 * Group detail: members, linked projects, viewer's membership.
 */
export async function GET(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id } = await params;

  const group = await prisma.group.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      avatarUrl: true,
      createdAt: true,
      createdById: true,
      members: {
        select: {
          id: true,
          role: true,
          status: true,
          createdAt: true,
          user: { select: { id: true, displayName: true, avatarUrl: true, email: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      projects: {
        select: { id: true, name: true, status: true, visibility: true, _count: { select: { members: true } } },
      },
    },
  });

  if (!group) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const myMembership = await getGroupMembership(id, user.id);

  return NextResponse.json({
    ok: true,
    group: {
      id: group.id,
      name: group.name,
      slug: group.slug,
      description: group.description,
      avatarUrl: group.avatarUrl,
      createdAt: group.createdAt,
      members: group.members.filter((m) => m.status === "active"),
      pendingMembers: group.members.filter((m) => m.status === "pending"),
      projects: group.projects.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        visibility: p.visibility,
        memberCount: p._count.members,
      })),
      myRole: myMembership?.status === "active" ? myMembership.role : null,
      myStatus: myMembership?.status ?? null,
    },
  });
}

/**
 * PATCH /api/groups/[id]
 * Update group metadata. Requires ADMIN or OWNER.
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id } = await params;

  if (!(await hasGroupRole(id, user.id, "ADMIN"))) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const parsed = await validateBody(req, PatchGroupSchema);
  if (isValidationError(parsed)) return parsed;

  const data: Record<string, unknown> = {};
  if (parsed.name !== undefined) data.name = parsed.name.trim();
  if (parsed.description !== undefined) data.description = parsed.description.trim();
  if (parsed.avatarUrl !== undefined) data.avatarUrl = parsed.avatarUrl || null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: false, error: "no_changes" }, { status: 400 });
  }

  const updated = await prisma.group.update({ where: { id }, data });
  return NextResponse.json({ ok: true, group: { id: updated.id, name: updated.name, description: updated.description, avatarUrl: updated.avatarUrl } });
}

/**
 * DELETE /api/groups/[id]
 * Delete a group. Requires OWNER.
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id } = await params;

  if (!(await hasGroupRole(id, user.id, "OWNER"))) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  await prisma.group.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
