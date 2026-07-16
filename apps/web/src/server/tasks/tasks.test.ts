import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/server/db", () => ({
  prisma: { task: { findMany: vi.fn() } },
}));

import { prisma } from "@/server/db";
import { getToday } from "./tasks";

const mockFindMany = (prisma as unknown as { task: { findMany: ReturnType<typeof vi.fn> } }).task.findMany;

function row(id: string, dueDate: Date | null) {
  const now = new Date("2026-07-16T12:00:00");
  return {
    id,
    title: id,
    description: null,
    status: "TODO",
    priority: "MEDIUM",
    dueDate,
    labels: [],
    order: 0,
    columnId: null,
    source: "manual",
    externalRefs: null,
    projectId: null,
    project: null,
    assigneeId: null,
    createdById: "u1",
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

describe("getToday bucketing", () => {
  beforeEach(() => vi.clearAllMocks());

  it("splits tasks into overdue / today / upcoming / someday by local day", async () => {
    const now = new Date("2026-07-16T12:00:00"); // local noon
    mockFindMany.mockResolvedValue([
      row("overdue", new Date("2026-07-15T09:00:00")),
      row("today", new Date("2026-07-16T18:00:00")),
      row("upcoming", new Date("2026-07-19T09:00:00")),
      row("someday", null),
    ]);

    const res = await getToday("u1", now);

    expect(res.overdue.map((t) => t.id)).toEqual(["overdue"]);
    expect(res.today.map((t) => t.id)).toEqual(["today"]);
    expect(res.upcoming.map((t) => t.id)).toEqual(["upcoming"]);
    expect(res.someday.map((t) => t.id)).toEqual(["someday"]);
    expect(res.counts).toEqual({ overdue: 1, today: 1, upcoming: 1, someday: 1 });
  });

  it("treats a task due at 00:00 today as today, not overdue", async () => {
    const now = new Date("2026-07-16T23:30:00");
    mockFindMany.mockResolvedValue([row("midnight", new Date("2026-07-16T00:00:00"))]);
    const res = await getToday("u1", now);
    expect(res.today.map((t) => t.id)).toEqual(["midnight"]);
    expect(res.overdue).toHaveLength(0);
  });
});
