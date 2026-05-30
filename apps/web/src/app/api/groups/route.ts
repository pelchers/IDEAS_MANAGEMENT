import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { generateSlug } from "@/server/projects/helpers";
import { validateBody, isValidationError } from "@/server/api-validation";

const CreateGroupSchema = z.object({
  name: z.string().min(1).max(120).transform((s) => s.trim()),
  description: z.string().max(2000).optional().default("").transform((s) => s.trim()),
  avatarUrl: z.string().max(2048).nullable().optional(),
});

/**
 * GET /api/groups?q=...&mine=1
 * List groups. With mine=1, only the authenticated user's groups.
 */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() || "";
  const mine = url.searchParams.get("mine") === "1";
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "30", 10)));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (mine) {
    where.members = { some: { userId: user.id, status: "active" } };
  }

  const groups = await prisma.group.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      avatarUrl: true,
      createdAt: true,
      _count: { select: { members: true, projects: true } },
      members: {
        where: { userId: user.id },
        select: { role: true, status: true },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const results = groups.map((g) => ({
    id: g.id,
    name: g.name,
    slug: g.slug,
    description: g.description,
    avatarUrl: g.avatarUrl,
    memberCount: g._count.members,
    projectCount: g._count.projects,
    myRole: g.members[0]?.role ?? null,
    myStatus: g.members[0]?.status ?? null,
    createdAt: g.createdAt,
  }));

  return NextResponse.json({ ok: true, groups: results });
}

/**
 * POST /api/groups
 * Create a group. The creator becomes the OWNER.
 */
export async function POST(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  const parsed = await validateBody(req, CreateGroupSchema);
  if (isValidationError(parsed)) return parsed;

  // Unique slug
  const base = generateSlug(parsed.name) || "group";
  let slug = base;
  let n = 1;
  while (await prisma.group.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }

  const group = await prisma.group.create({
    data: {
      name: parsed.name,
      slug,
      description: parsed.description,
      avatarUrl: parsed.avatarUrl ?? null,
      createdById: user.id,
      members: {
        create: { userId: user.id, role: "OWNER", status: "active" },
      },
    },
    select: { id: true, name: true, slug: true },
  });

  return NextResponse.json({ ok: true, group }, { status: 201 });
}
