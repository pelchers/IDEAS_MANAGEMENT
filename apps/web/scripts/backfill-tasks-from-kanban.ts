/**
 * Backfill first-class Task rows from existing kanban board.json artifacts.
 *
 * Idempotent / re-runnable: for each project it deletes the existing
 * source="kanban" tasks and recreates them from the current board, so running
 * it again re-syncs rather than duplicating.
 *
 *   pnpm exec tsx scripts/backfill-tasks-from-kanban.ts
 */
import { PrismaClient, type TaskStatus } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

function statusForColumn(columnId: string, title: string): TaskStatus {
  const s = `${columnId} ${title}`.toLowerCase();
  if (s.includes("done") || s.includes("complete") || s.includes("finished")) return "DONE";
  if (s.includes("progress") || s.includes("doing") || s.includes("working")) return "IN_PROGRESS";
  if (s.includes("backlog")) return "BACKLOG";
  return "TODO";
}

interface Card {
  id?: string;
  title?: string;
  description?: string;
  tags?: string[];
}
interface Column {
  id?: string;
  title?: string;
  cards?: Card[];
}

async function main() {
  const boards = await prisma.projectArtifact.findMany({
    where: { artifactPath: "kanban/board.json" },
    select: { projectId: true, content: true },
  });

  let projectsTouched = 0;
  let tasksCreated = 0;
  let skippedNoOwner = 0;

  for (const board of boards) {
    const content = board.content as { columns?: Column[] } | null;
    const columns = content?.columns ?? [];
    const cards = columns.flatMap((c) => c.cards ?? []);
    if (cards.length === 0) continue;

    // Determine an owner to attribute the tasks to.
    const owner =
      (await prisma.projectMember.findFirst({
        where: { projectId: board.projectId, role: "OWNER" },
        select: { userId: true },
      })) ??
      (await prisma.projectMember.findFirst({
        where: { projectId: board.projectId },
        select: { userId: true },
      }));

    if (!owner) {
      skippedNoOwner++;
      continue;
    }

    // Re-sync: drop prior kanban-sourced tasks for this project.
    await prisma.task.deleteMany({ where: { projectId: board.projectId, source: "kanban" } });

    const data = columns.flatMap((col) => {
      const columnId = col.id ?? "todo";
      const status = statusForColumn(columnId, col.title ?? "");
      return (col.cards ?? []).map((card, i) => ({
        title: (card.title ?? "Untitled").slice(0, 300),
        description: card.description?.trim() || null,
        status,
        labels: Array.isArray(card.tags) ? card.tags.slice(0, 20) : [],
        order: i,
        columnId,
        source: "kanban",
        externalRefs: card.id ? { kanbanCardId: String(card.id) } : undefined,
        projectId: board.projectId,
        createdById: owner.userId,
        completedAt: status === "DONE" ? new Date() : null,
      }));
    });

    if (data.length > 0) {
      await prisma.task.createMany({ data });
      tasksCreated += data.length;
      projectsTouched++;
    }
  }

  console.log(
    `Backfill complete: ${tasksCreated} tasks across ${projectsTouched} project(s).` +
      (skippedNoOwner ? ` Skipped ${skippedNoOwner} board(s) with no members.` : "")
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
