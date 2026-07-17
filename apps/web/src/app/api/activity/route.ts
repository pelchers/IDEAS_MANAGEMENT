import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";

interface ActivityItem {
  id: string;
  kind: "audit" | "project" | "command";
  title: string;
  subtitle: string | null;
  at: string;
}

/**
 * GET /api/activity — a unified, cross-source timeline for the caller:
 * their audit log, activity in their projects, and their runner commands.
 */
export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;

  const memberships = await prisma.projectMember.findMany({ where: { userId: auth.id }, select: { projectId: true } });
  const projectIds = memberships.map((m) => m.projectId);

  const [audits, projectActs, commands] = await Promise.all([
    prisma.auditLog.findMany({
      where: { actorUserId: auth.id },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: { id: true, action: true, targetType: true, createdAt: true },
    }),
    projectIds.length
      ? prisma.projectActivity.findMany({
          where: { projectId: { in: projectIds } },
          orderBy: { createdAt: "desc" },
          take: 40,
          select: {
            id: true, action: true, targetType: true, createdAt: true,
            actor: { select: { displayName: true, email: true } },
            project: { select: { name: true } },
          },
        })
      : Promise.resolve([]),
    prisma.runnerCommand.findMany({
      where: { userId: auth.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, command: true, status: true, createdAt: true, runner: { select: { name: true } } },
    }),
  ]);

  const items: ActivityItem[] = [
    ...audits.map((a) => ({
      id: `audit-${a.id}`,
      kind: "audit" as const,
      title: a.action.replace(/[._]/g, " "),
      subtitle: a.targetType,
      at: a.createdAt.toISOString(),
    })),
    ...projectActs.map((p) => ({
      id: `proj-${p.id}`,
      kind: "project" as const,
      title: `${p.actor?.displayName || p.actor?.email || "Someone"} — ${p.action.replace(/[._]/g, " ")}`,
      subtitle: p.project?.name ?? p.targetType,
      at: p.createdAt.toISOString(),
    })),
    ...commands.map((c) => ({
      id: `cmd-${c.id}`,
      kind: "command" as const,
      title: `Ran: ${c.command.slice(0, 80)}`,
      subtitle: `${c.runner?.name ?? "runner"} · ${c.status}`,
      at: c.createdAt.toISOString(),
    })),
  ];

  items.sort((a, b) => (a.at < b.at ? 1 : -1));
  return NextResponse.json({ ok: true, items: items.slice(0, 60) });
}
