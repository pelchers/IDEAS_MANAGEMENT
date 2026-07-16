import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { validateBody, isValidationError } from "@/server/api-validation";
import { checkProjectAccess } from "@/server/projects/helpers";
import { prisma } from "@/server/db";
import { updateTask, TASK_STATUSES, TASK_PRIORITIES } from "@/server/tasks/tasks";
import type { AuthenticatedUser } from "@/server/auth/admin";
import type { TaskStatus } from "@/generated/prisma";

type RouteParams = { params: Promise<{ id: string }> };

/** A user may mutate a task they own/are assigned, or (for project tasks) with EDITOR+ access. */
async function assertTaskAccess(id: string, user: AuthenticatedUser): Promise<boolean> {
  const task = await prisma.task.findUnique({
    where: { id },
    select: { createdById: true, assigneeId: true, projectId: true },
  });
  if (!task) return false;
  if (user.role === "ADMIN") return true;
  if (task.createdById === user.id || task.assigneeId === user.id) return true;
  if (task.projectId) {
    const access = await checkProjectAccess(task.projectId, user, "EDITOR");
    if (access) return true;
  }
  return false;
}

const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(5000).nullish(),
  status: z.enum(TASK_STATUSES as [TaskStatus, ...TaskStatus[]]).optional(),
  priority: z.enum(TASK_PRIORITIES as [string, ...string[]]).optional(),
  dueDate: z.string().datetime().nullish(),
  labels: z.array(z.string().max(40)).max(20).optional(),
  columnId: z.string().nullish(),
  order: z.number().int().optional(),
  assigneeId: z.string().nullish(),
  externalRefs: z.record(z.string(), z.unknown()).nullish(),
});

export async function PATCH(req: Request, { params }: RouteParams) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;
  const { id } = await params;

  if (!(await assertTaskAccess(id, auth))) {
    return NextResponse.json({ ok: false, error: "not_found_or_forbidden" }, { status: 404 });
  }

  const parsed = await validateBody(req, UpdateTaskSchema);
  if (isValidationError(parsed)) return parsed;

  const task = await updateTask(id, { ...parsed, priority: parsed.priority as never });
  return NextResponse.json({ ok: true, task });
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;
  const { id } = await params;

  if (!(await assertTaskAccess(id, auth))) {
    return NextResponse.json({ ok: false, error: "not_found_or_forbidden" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
