import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";

/**
 * GET /api/auth/me/export
 * Export all user data as JSON.
 */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  const [
    fullUser,
    projects,
    aiSessions,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true, email: true, role: true, displayName: true, bio: true,
        avatarUrl: true, tags: true, preferences: true, createdAt: true,
      },
    }),
    prisma.project.findMany({
      where: { members: { some: { userId: user.id } } },
      include: {
        artifacts: { select: { artifactPath: true, content: true, revision: true, updatedAt: true } },
        members: { select: { userId: true, role: true } },
      },
    }),
    prisma.aiChatSession.findMany({
      where: { userId: user.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    }),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: fullUser,
    projects: projects.map((p) => ({
      id: p.id, name: p.name, slug: p.slug, description: p.description,
      status: p.status, tags: p.tags, createdAt: p.createdAt, updatedAt: p.updatedAt,
      members: p.members,
      artifacts: p.artifacts,
    })),
    aiChatSessions: aiSessions.map((s) => ({
      id: s.id, title: s.title, createdAt: s.createdAt,
      messages: s.messages.map((m) => ({
        role: m.role, content: m.content, createdAt: m.createdAt,
      })),
    })),
  };

  return NextResponse.json({ ok: true, data: exportData });
}
