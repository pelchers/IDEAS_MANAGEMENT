import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { auditLog } from "@/server/audit";
import { checkProjectAccess } from "@/server/projects/helpers";
import { validateBody, isValidationError } from "@/server/api-validation";

const PatchProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(["PLANNING", "ACTIVE", "PAUSED", "ARCHIVED"]).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]
 * Get project details with members and artifact paths.
 */
export async function GET(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id } = await params;

  const access = await checkProjectAccess(id, user);
  if (!access) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 }
    );
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      members: {
        select: {
          id: true,
          userId: true,
          role: true,
          createdAt: true,
          user: { select: { email: true } },
        },
      },
      artifacts: {
        select: { artifactPath: true, revision: true, updatedAt: true },
        orderBy: { artifactPath: "asc" },
      },
    },
  });

  if (!project) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    project: {
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      status: project.status,
      tags: project.tags,
      members: project.members.map((m) => ({
        id: m.id,
        userId: m.userId,
        email: m.user.email,
        role: m.role,
        createdAt: m.createdAt,
      })),
      artifacts: project.artifacts,
      userRole: access.role,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    },
  });
}

/**
 * PATCH /api/projects/[id]
 * Update project metadata. Requires OWNER or EDITOR role.
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id } = await params;

  const access = await checkProjectAccess(id, user, "EDITOR");
  if (!access) {
    return NextResponse.json(
      { ok: false, error: "forbidden" },
      { status: 403 }
    );
  }

  const parsed = await validateBody(req, PatchProjectSchema);
  if (isValidationError(parsed)) return parsed;

  const data: Record<string, unknown> = {};
  if (parsed.name !== undefined) {
    data.name = parsed.name.trim();
  }
  if (parsed.description !== undefined) {
    data.description = parsed.description.trim();
  }
  if (parsed.tags !== undefined) {
    data.tags = parsed.tags;
  }
  if (parsed.status !== undefined) {
    data.status = parsed.status;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { ok: false, error: "no_changes" },
      { status: 400 }
    );
  }

  const updated = await prisma.project.update({
    where: { id },
    data: data as any,
  });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;

  await auditLog({
    actorUserId: user.id,
    action: "project.updated",
    targetType: "Project",
    targetId: id,
    ip,
    userAgent,
    metadata: { changes: Object.keys(data) },
  });

  return NextResponse.json({
    ok: true,
    project: {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      status: updated.status,
      tags: updated.tags,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    },
  });
}

/**
 * DELETE /api/projects/[id]
 * Soft-delete (archive) a project. Requires OWNER role.
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id } = await params;

  const access = await checkProjectAccess(id, user, "OWNER");
  if (!access) {
    return NextResponse.json(
      { ok: false, error: "forbidden" },
      { status: 403 }
    );
  }

  await prisma.project.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;

  await auditLog({
    actorUserId: user.id,
    action: "project.archived",
    targetType: "Project",
    targetId: id,
    ip,
    userAgent,
  });

  return NextResponse.json({ ok: true });
}
