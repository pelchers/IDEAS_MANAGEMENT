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
 * GET /api/users/[id]
 * Returns a user's public profile + their public projects.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      tags: true,
      email: true,
      profileVisibility: true,
      projectMembers: {
        select: {
          role: true,
          project: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              status: true,
              visibility: true,
              tags: true,
              _count: { select: { members: true } },
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ ok: false, error: "user_not_found" }, { status: 404 });
  }

  const vis = getVisibility(user.profileVisibility);

  // Only return public projects
  const publicProjects = user.projectMembers
    .filter((pm) => pm.project.visibility === "PUBLIC")
    .map((pm) => ({
      id: pm.project.id,
      name: pm.project.name,
      slug: pm.project.slug,
      description: pm.project.description,
      status: pm.project.status,
      tags: pm.project.tags,
      memberCount: pm.project._count.members,
      role: pm.role,
      createdAt: pm.project.createdAt,
    }));

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      displayName: vis.displayName ? user.displayName : null,
      avatarUrl: vis.avatarUrl ? user.avatarUrl : null,
      bio: vis.bio ? user.bio : null,
      email: vis.email ? user.email : null,
      tags: vis.tags ? user.tags : [],
    },
    projects: publicProjects,
  });
}
