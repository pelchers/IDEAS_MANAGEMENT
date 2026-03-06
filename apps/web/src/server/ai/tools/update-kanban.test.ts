import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
vi.mock("@/server/db", () => ({
  prisma: {
    aiToolOutput: {
      create: vi.fn(),
    },
  },
}));

// Mock auditLog
vi.mock("@/server/audit", () => ({
  auditLog: vi.fn(),
}));

import { prisma } from "@/server/db";
import { auditLog } from "@/server/audit";
import { executeUpdateKanban, updateKanbanSchema } from "./update-kanban";

const mockPrisma = prisma as unknown as {
  aiToolOutput: {
    create: ReturnType<typeof vi.fn>;
  };
};

const mockAuditLog = auditLog as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateKanbanSchema", () => {
  it("validates add action without cardId", () => {
    const input = {
      projectId: "proj-1",
      action: "add" as const,
      data: { title: "New Card", column: "todo" },
    };
    const result = updateKanbanSchema.parse(input);
    expect(result.action).toBe("add");
  });

  it("validates move action with cardId", () => {
    const input = {
      projectId: "proj-1",
      cardId: "card-1",
      action: "move" as const,
      data: { column: "done" },
    };
    const result = updateKanbanSchema.parse(input);
    expect(result.cardId).toBe("card-1");
  });

  it("rejects invalid action", () => {
    expect(() =>
      updateKanbanSchema.parse({
        projectId: "proj-1",
        action: "invalid",
        data: {},
      })
    ).toThrow();
  });
});

describe("executeUpdateKanban", () => {
  it("creates tool output record for add action", async () => {
    mockPrisma.aiToolOutput.create.mockResolvedValue({
      id: "output-1",
    });

    const result = await executeUpdateKanban(
      {
        projectId: "proj-1",
        action: "add",
        data: { title: "New Card", column: "todo" },
      },
      "user-1",
      "session-1"
    );

    expect(result.success).toBe(true);
    expect(result.action).toBe("add");
    expect(result.projectId).toBe("proj-1");

    // Verify audit log
    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUserId: "user-1",
        action: "ai_tool.update_kanban.add",
      })
    );
  });

  it("requires cardId for move action", async () => {
    await expect(
      executeUpdateKanban(
        {
          projectId: "proj-1",
          action: "move",
          data: { column: "done" },
        },
        "user-1"
      )
    ).rejects.toThrow('cardId is required for "move" action');
  });

  it("requires cardId for delete action", async () => {
    await expect(
      executeUpdateKanban(
        {
          projectId: "proj-1",
          action: "delete",
          data: {},
        },
        "user-1"
      )
    ).rejects.toThrow('cardId is required for "delete" action');
  });

  it("requires cardId for update action", async () => {
    await expect(
      executeUpdateKanban(
        {
          projectId: "proj-1",
          action: "update",
          data: { title: "Updated" },
        },
        "user-1"
      )
    ).rejects.toThrow('cardId is required for "update" action');
  });

  it("logs audit with correct kanban action type", async () => {
    mockPrisma.aiToolOutput.create.mockResolvedValue({ id: "output-2" });

    await executeUpdateKanban(
      {
        projectId: "proj-1",
        cardId: "card-1",
        action: "move",
        data: { column: "in-progress" },
      },
      "user-1",
      "session-1"
    );

    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "ai_tool.update_kanban.move",
        metadata: expect.objectContaining({
          kanbanAction: "move",
          cardId: "card-1",
        }),
      })
    );
  });
});
