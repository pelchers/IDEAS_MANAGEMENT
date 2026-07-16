import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { validateBody, isValidationError } from "@/server/api-validation";
import { checkProjectAccess } from "@/server/projects/helpers";
import { listTasks, createTask, TASK_STATUSES, TASK_PRIORITIES } from "@/server/tasks/tasks";
import type { TaskStatus } from "@/generated/prisma";

/**
 * GET /api/tasks — list tasks.
 * Query: ?projectId=  ?status=  ?includeDone=1  ?mine=0
 * Without projectId, returns the caller's personal tasks (created-by/assigned-to).
 * With projectId, requires project access and returns that project's tasks.
 */
export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;

  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId") ?? undefined;
  const statusParam = url.searchParams.get("status") ?? undefined;
  const includeDone = url.searchParams.get("includeDone") === "1";
  const mine = url.searchParams.get("mine") !== "0";
  const status = statusParam && TASK_STATUSES.includes(statusParam as TaskStatus) ? (statusParam as TaskStatus) : undefined;

  if (projectId) {
    const access = await checkProjectAccess(projectId, auth);
    if (!access) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    const tasks = await listTasks(auth.id, { projectId, status, includeDone, mine: false });
    return NextResponse.json({ ok: true, tasks });
  }

  const tasks = await listTasks(auth.id, { status, includeDone, mine });
  return NextResponse.json({ ok: true, tasks });
}

const CreateTaskSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional(),
  status: z.enum(TASK_STATUSES as [TaskStatus, ...TaskStatus[]]).optional(),
  priority: z.enum(TASK_PRIORITIES as [string, ...string[]]).optional(),
  dueDate: z.string().datetime().nullish(),
  labels: z.array(z.string().max(40)).max(20).optional(),
  projectId: z.string().nullish(),
  columnId: z.string().nullish(),
  assigneeId: z.string().nullish(),
  order: z.number().int().optional(),
  externalRefs: z.record(z.string(), z.unknown()).nullish(),
});

/**
 * POST /api/tasks — create a task. A projectId requires EDITOR+ access; without
 * one the task is a personal/inbox task owned by the caller.
 */
export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;

  const parsed = await validateBody(req, CreateTaskSchema);
  if (isValidationError(parsed)) return parsed;

  if (parsed.projectId) {
    const access = await checkProjectAccess(parsed.projectId, auth, "EDITOR");
    if (!access) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const task = await createTask(auth.id, {
    ...parsed,
    priority: parsed.priority as never,
    source: "manual",
  });
  return NextResponse.json({ ok: true, task }, { status: 201 });
}
