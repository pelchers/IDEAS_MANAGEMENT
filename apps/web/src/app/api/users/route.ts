import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

const DEFAULT_VISIBILITY: Record<string, boolean> = {
  displayName: true,
  avatarUrl: true,
  bio: false,
  email: false,
  tags: true,
};

function getVisibility(raw: unknown): Record<string, boolean> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return { ...DEFAULT_VISIBILITY, ...(raw as Record<string, boolean>) };
  }
  return DEFAULT_VISIBILITY;
}

/**
 * GET /api/users?q=...&tags=...&limit=...
 * Search users by name or tags. Returns only public profile fields.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() || "";
  const tagsParam = url.searchParams.get("tags")?.trim() || "";
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));

  const where: Record<string, unknown> = {};

  if (q) {
    where.OR = [
      { displayName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  if (tagsParam) {
    const tags = tagsParam.split(",").map((t) => t.trim()).filter(Boolean);
    if (tags.length > 0) {
      where.tags = { hasSome: tags };
    }
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      tags: true,
      email: true,
      profileVisibility: true,
      _count: { select: { projectMembers: true } },
    },
    take: limit,
    orderBy: { displayName: "asc" },
  });

  // Filter fields based on each user's privacy settings
  const results = users.map((u) => {
    const vis = getVisibility(u.profileVisibility);
    return {
      id: u.id,
      displayName: vis.displayName ? u.displayName : null,
      avatarUrl: vis.avatarUrl ? u.avatarUrl : null,
      bio: vis.bio ? u.bio : null,
      email: vis.email ? u.email : null,
      tags: vis.tags ? u.tags : [],
      projectCount: u._count.projectMembers,
    };
  });

  return NextResponse.json({ ok: true, users: results });
}
