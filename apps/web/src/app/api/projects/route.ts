import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { auditLog } from "@/server/audit";
import {
  generateSlug,
  bootstrapProjectArtifacts,
} from "@/server/projects/helpers";
import type { ProjectStatus } from "@/generated/prisma";

/**
 * POST /api/projects
 * Create a new project. The authenticated user becomes the OWNER.
 */
export async function POST(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  let body: {
    name?: string;
    description?: string;
    tags?: string[];
    status?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_body" },
      { status: 400 }
    );
  }

  if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
    return NextResponse.json(
      { ok: false, error: "name_required" },
      { status: 400 }
    );
  }

  const name = body.name.trim();
  const slug = generateSlug(name);
  const description = body.description?.trim() ?? "";
  const tags = Array.isArray(body.tags) ? body.tags.filter((t) => typeof t === "string") : [];
  const validStatuses = ["PLANNING", "ACTIVE", "PAUSED", "ARCHIVED"];
  const status = (
    body.status && validStatuses.includes(body.status.toUpperCase())
      ? body.status.toUpperCase()
      : "PLANNING"
  ) as ProjectStatus;

  let project;
  try {
    project = await prisma.project.create({
      data: {
        name,
        slug,
        description,
        status,
        tags,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
      include: {
        members: { select: { id: true, userId: true, role: true } },
      },
    });

    // Bootstrap default artifacts
    await bootstrapProjectArtifacts(project.id, name);
  } catch (err) {
    console.error("[Projects] Create project failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;

  await auditLog({
    actorUserId: user.id,
    action: "project.created",
    targetType: "Project",
    targetId: project.id,
    ip,
    userAgent,
    metadata: { name, slug },
  });

  return NextResponse.json(
    {
      ok: true,
      project: {
        id: project.id,
        name: project.name,
        slug: project.slug,
        description: project.description,
        status: project.status,
        tags: project.tags,
        members: project.members,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    },
    { status: 201 }
  );
}

/**
 * GET /api/projects
 * List projects where the user is a member.
 * Query params: ?search=&sort=name|updated|created&order=asc|desc&status=&tag=
 */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  const url = new URL(req.url);
  const search = url.searchParams.get("search") ?? "";
  const sort = url.searchParams.get("sort") ?? "updated";
  const order = url.searchParams.get("order") === "asc" ? "asc" : "desc";
  const statusFilter = url.searchParams.get("status");
  const tagFilter = url.searchParams.get("tag");

  // Build where clause
  const where: Record<string, unknown> = {};

  // Non-admin users see only their projects
  if (user.role !== "ADMIN") {
    where.members = { some: { userId: user.id } };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (statusFilter) {
    const validStatuses = ["PLANNING", "ACTIVE", "PAUSED", "ARCHIVED"];
    if (validStatuses.includes(statusFilter.toUpperCase())) {
      where.status = statusFilter.toUpperCase();
    }
  }

  if (tagFilter) {
    where.tags = { has: tagFilter };
  }

  // Build orderBy
  let orderBy: Record<string, string>;
  switch (sort) {
    case "name":
      orderBy = { name: order };
      break;
    case "created":
      orderBy = { createdAt: order };
      break;
    case "updated":
    default:
      orderBy = { updatedAt: order };
      break;
  }

  let projects;
  try {
    projects = await prisma.project.findMany({
      where: where as any,
      orderBy: orderBy as any,
      include: {
        _count: { select: { members: true } },
        members: {
          where: { userId: user.id },
          select: { role: true },
          take: 1,
        },
      },
    });
  } catch (err) {
    console.error("[Projects] List projects failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      status: p.status,
      tags: p.tags,
      memberCount: p._count.members,
      userRole: p.members[0]?.role ?? null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
  });
}
