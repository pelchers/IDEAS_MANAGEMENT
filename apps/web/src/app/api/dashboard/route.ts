import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";

/**
 * GET /api/dashboard
 * Returns dashboard stats and recent activity for the authenticated user.
 */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  // Get user's project memberships
  const memberships = await prisma.projectMember.findMany({
    where: { userId: user.id },
    select: { projectId: true },
  });
  const projectIds = memberships.map((m) => m.projectId);

  // Count projects by status
  const projects = await prisma.project.findMany({
    where: { id: { in: projectIds } },
    select: { status: true },
  });
  const activeProjects = projects.filter((p) => p.status === "ACTIVE").length;
  const totalProjects = projects.length;

  // Count ideas (from artifacts)
  const ideaArtifacts = await prisma.projectArtifact.findMany({
    where: {
      projectId: { in: projectIds },
      artifactPath: "ideas/ideas.json",
    },
    select: { content: true },
  });
  let totalIdeas = 0;
  for (const artifact of ideaArtifacts) {
    const content = artifact.content as { ideas?: unknown[] } | null;
    if (content && Array.isArray(content.ideas)) {
      totalIdeas += content.ideas.length;
    }
  }

  // Count kanban tasks in progress
  const kanbanArtifacts = await prisma.projectArtifact.findMany({
    where: {
      projectId: { in: projectIds },
      artifactPath: "kanban/board.json",
    },
    select: { content: true },
  });
  let tasksInProgress = 0;
  let totalTasks = 0;
  let completedTasks = 0;
  for (const artifact of kanbanArtifacts) {
    const content = artifact.content as { columns?: Array<{ id?: string; name?: string; cards?: unknown[] }> } | null;
    if (content && Array.isArray(content.columns)) {
      for (const col of content.columns) {
        const cardCount = Array.isArray(col.cards) ? col.cards.length : 0;
        totalTasks += cardCount;
        const colName = (col.name || col.id || "").toUpperCase();
        if (colName.includes("PROGRESS") || colName.includes("DOING") || colName.includes("WORKING")) {
          tasksInProgress += cardCount;
        }
        if (colName.includes("DONE") || colName.includes("COMPLETE") || colName.includes("FINISHED")) {
          completedTasks += cardCount;
        }
      }
    }
  }
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Recent audit log entries for user's projects
  const recentActivity = await prisma.auditLog.findMany({
    where: {
      OR: [
        { actorUserId: user.id },
        { targetId: { in: projectIds }, targetType: "Project" },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      action: true,
      targetType: true,
      metadata: true,
      createdAt: true,
      actor: { select: { email: true } },
    },
  });

  return NextResponse.json({
    ok: true,
    stats: {
      totalIdeas,
      activeProjects,
      totalProjects,
      tasksInProgress,
      completionRate,
    },
    activity: recentActivity.map((a) => ({
      action: a.action,
      targetType: a.targetType,
      metadata: a.metadata,
      createdAt: a.createdAt.toISOString(),
      actorEmail: a.actor?.email ?? "System",
    })),
  });
}
