import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

/**
 * GET /api/projects/explore?q=...&tags=...&status=...&sort=...&limit=...
 * Returns public projects with owner info and member counts.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() || "";
  const tagsParam = url.searchParams.get("tags")?.trim() || "";
  const status = url.searchParams.get("status")?.trim().toUpperCase() || "";
  const sort = url.searchParams.get("sort")?.trim() || "recent";
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { visibility: "PUBLIC" };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (tagsParam) {
    const tags = tagsParam.split(",").map((t) => t.trim()).filter(Boolean);
    if (tags.length > 0) {
      where.tags = { hasSome: tags };
    }
  }

  if (status && ["PLANNING", "ACTIVE", "PAUSED", "ARCHIVED"].includes(status)) {
    where.status = status;
  }

  let orderBy: Record<string, string>;
  switch (sort) {
    case "name":
      orderBy = { name: "asc" };
      break;
    case "members":
      // Will sort in JS after query since Prisma doesn't support orderBy on _count in all cases
      orderBy = { createdAt: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  const projects = await prisma.project.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      status: true,
      tags: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { members: true } },
      members: {
        where: { role: "OWNER" },
        take: 1,
        select: {
          user: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
    orderBy,
    take: limit,
  });

  let results = projects.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    status: p.status,
    tags: p.tags,
    memberCount: p._count.members,
    owner: p.members[0]?.user
      ? {
          id: p.members[0].user.id,
          displayName: p.members[0].user.displayName,
          avatarUrl: p.members[0].user.avatarUrl,
        }
      : null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));

  if (sort === "members") {
    results = results.sort((a, b) => b.memberCount - a.memberCount);
  }

  return NextResponse.json({ ok: true, projects: results });
}
