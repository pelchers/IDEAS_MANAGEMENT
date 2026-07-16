import { prisma } from "@/server/db";
import type { Prisma, TaskStatus, TaskPriority } from "@/generated/prisma";

export const TASK_STATUSES: TaskStatus[] = ["BACKLOG", "TODO", "IN_PROGRESS", "DONE"];
export const TASK_PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export interface TaskDTO {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  labels: string[];
  order: number;
  columnId: string | null;
  source: string;
  externalRefs: Record<string, unknown> | null;
  projectId: string | null;
  projectName: string | null;
  assigneeId: string | null;
  createdById: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

type TaskWithProject = Prisma.TaskGetPayload<{ include: { project: { select: { name: true } } } }>;

export function toTaskDTO(t: TaskWithProject): TaskDTO {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    labels: t.labels,
    order: t.order,
    columnId: t.columnId,
    source: t.source,
    externalRefs: (t.externalRefs ?? null) as Record<string, unknown> | null,
    projectId: t.projectId,
    projectName: t.project?.name ?? null,
    assigneeId: t.assigneeId,
    createdById: t.createdById,
    completedAt: t.completedAt ? t.completedAt.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

/** Tasks that "belong" to a user for their personal views: created by or assigned to them. */
export function personalTaskWhere(userId: string): Prisma.TaskWhereInput {
  return { OR: [{ createdById: userId }, { assigneeId: userId }] };
}

const INCLUDE_PROJECT = { project: { select: { name: true } } } as const;

export interface ListTasksFilters {
  projectId?: string;
  status?: TaskStatus;
  mine?: boolean; // created-by or assigned-to the user
  includeDone?: boolean;
}

export async function listTasks(userId: string, filters: ListTasksFilters): Promise<TaskDTO[]> {
  const where: Prisma.TaskWhereInput = {};
  const and: Prisma.TaskWhereInput[] = [];

  if (filters.projectId) and.push({ projectId: filters.projectId });
  if (filters.mine !== false) and.push(personalTaskWhere(userId));
  if (filters.status) and.push({ status: filters.status });
  if (!filters.includeDone) and.push({ status: { not: "DONE" } });
  if (and.length) where.AND = and;

  const rows = await prisma.task.findMany({
    where,
    include: INCLUDE_PROJECT,
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(toTaskDTO);
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  labels?: string[];
  projectId?: string | null;
  columnId?: string | null;
  assigneeId?: string | null;
  source?: string;
  order?: number;
  externalRefs?: Record<string, unknown> | null;
}

export async function createTask(userId: string, input: CreateTaskInput): Promise<TaskDTO> {
  const status = input.status ?? "TODO";
  const row = await prisma.task.create({
    data: {
      title: input.title.trim().slice(0, 300),
      description: input.description?.trim() || null,
      status,
      priority: input.priority ?? "MEDIUM",
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      labels: input.labels ?? [],
      projectId: input.projectId ?? null,
      columnId: input.columnId ?? null,
      assigneeId: input.assigneeId ?? null,
      createdById: userId,
      source: input.source ?? "manual",
      order: input.order ?? 0,
      externalRefs: (input.externalRefs ?? undefined) as never,
      completedAt: status === "DONE" ? new Date() : null,
    },
    include: INCLUDE_PROJECT,
  });
  return toTaskDTO(row);
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  labels?: string[];
  columnId?: string | null;
  order?: number;
  assigneeId?: string | null;
  externalRefs?: Record<string, unknown> | null;
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<TaskDTO> {
  const data: Prisma.TaskUpdateInput = {};
  if (input.title !== undefined) data.title = input.title.trim().slice(0, 300);
  if (input.description !== undefined) data.description = input.description?.trim() || null;
  if (input.priority !== undefined) data.priority = input.priority;
  if (input.dueDate !== undefined) data.dueDate = input.dueDate ? new Date(input.dueDate) : null;
  if (input.labels !== undefined) data.labels = input.labels;
  if (input.columnId !== undefined) data.columnId = input.columnId;
  if (input.order !== undefined) data.order = input.order;
  if (input.externalRefs !== undefined) data.externalRefs = (input.externalRefs ?? undefined) as never;
  if (input.assigneeId !== undefined) {
    data.assignee = input.assigneeId ? { connect: { id: input.assigneeId } } : { disconnect: true };
  }
  if (input.status !== undefined) {
    data.status = input.status;
    data.completedAt = input.status === "DONE" ? new Date() : null;
  }

  const row = await prisma.task.update({ where: { id }, data, include: INCLUDE_PROJECT });
  return toTaskDTO(row);
}

/**
 * Today / My Work buckets for a user: overdue, today, upcoming (next 7d), someday
 * (no due date). Excludes DONE. Ordered by due date then priority.
 */
export async function getToday(userId: string, now: Date) {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);
  const in7 = new Date(startOfToday);
  in7.setDate(in7.getDate() + 7);

  const rows = await prisma.task.findMany({
    where: { AND: [personalTaskWhere(userId), { status: { not: "DONE" } }] },
    include: INCLUDE_PROJECT,
    orderBy: [{ dueDate: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
  });
  const tasks = rows.map(toTaskDTO);

  const overdue: TaskDTO[] = [];
  const today: TaskDTO[] = [];
  const upcoming: TaskDTO[] = [];
  const someday: TaskDTO[] = [];
  for (const t of tasks) {
    if (!t.dueDate) {
      someday.push(t);
      continue;
    }
    const d = new Date(t.dueDate);
    if (d < startOfToday) overdue.push(t);
    else if (d < endOfToday) today.push(t);
    else if (d < in7) upcoming.push(t);
    else upcoming.push(t);
  }
  return { overdue, today, upcoming, someday, counts: { overdue: overdue.length, today: today.length, upcoming: upcoming.length, someday: someday.length } };
}
