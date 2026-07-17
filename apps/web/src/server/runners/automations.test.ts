import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/server/db", () => ({
  prisma: {
    automationRule: { findMany: vi.fn() },
    runner: { findFirst: vi.fn() },
    runnerCommand: { create: vi.fn() },
  },
}));

import { runAutomations } from "./automations";
import { prisma } from "@/server/db";

const mockRules = (prisma as unknown as { automationRule: { findMany: ReturnType<typeof vi.fn> } }).automationRule.findMany;
const mockRunnerFind = (prisma as unknown as { runner: { findFirst: ReturnType<typeof vi.fn> } }).runner.findFirst;
const mockCmdCreate = (prisma as unknown as { runnerCommand: { create: ReturnType<typeof vi.fn> } }).runnerCommand.create;

describe("runAutomations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRunnerFind.mockResolvedValue({ id: "runner-1" }); // runner belongs to user
    mockCmdCreate.mockResolvedValue({ id: "cmd-1", runnerId: "runner-1", userId: "u1", command: "x", cwd: null, taskId: "t1", status: "QUEUED", exitCode: null, output: "", source: "automation", createdAt: new Date(), startedAt: null, finishedAt: null });
  });

  it("dispatches only rules whose status condition matches", async () => {
    mockRules.mockResolvedValue([
      { id: "r1", runnerId: "runner-1", command: "test", conditionJson: { status: "IN_PROGRESS" } },
      { id: "r2", runnerId: "runner-1", command: "deploy", conditionJson: { status: "DONE" } },
      { id: "r3", runnerId: "runner-1", command: "lint", conditionJson: {} }, // no status → always matches
    ]);

    const fired = await runAutomations("u1", "TASK_STATUS_CHANGED", { taskId: "t1", status: "IN_PROGRESS", projectId: null });

    // r1 (IN_PROGRESS) + r3 (no condition) fire; r2 (DONE) does not.
    expect(fired).toBe(2);
    expect(mockCmdCreate).toHaveBeenCalledTimes(2);
  });

  it("respects a projectId condition", async () => {
    mockRules.mockResolvedValue([
      { id: "r1", runnerId: "runner-1", command: "test", conditionJson: { projectId: "p1" } },
    ]);
    const noMatch = await runAutomations("u1", "TASK_STATUS_CHANGED", { taskId: "t1", status: "DONE", projectId: "p2" });
    expect(noMatch).toBe(0);
    const match = await runAutomations("u1", "TASK_STATUS_CHANGED", { taskId: "t1", status: "DONE", projectId: "p1" });
    expect(match).toBe(1);
  });

  it("skips rules with no runner and never throws", async () => {
    mockRules.mockResolvedValue([{ id: "r1", runnerId: null, command: "x", conditionJson: {} }]);
    await expect(runAutomations("u1", "TASK_CREATED", { taskId: "t1" })).resolves.toBe(0);
  });
});
