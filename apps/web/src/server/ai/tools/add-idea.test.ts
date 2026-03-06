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
import { executeAddIdea, addIdeaSchema } from "./add-idea";

const mockPrisma = prisma as unknown as {
  aiToolOutput: {
    create: ReturnType<typeof vi.fn>;
  };
};

const mockAuditLog = auditLog as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("addIdeaSchema", () => {
  it("validates valid input", () => {
    const input = {
      projectId: "proj-1",
      title: "Test Idea",
      description: "A test idea",
      tags: ["frontend", "ux"],
      priority: "high" as const,
    };
    const result = addIdeaSchema.parse(input);
    expect(result.title).toBe("Test Idea");
    expect(result.priority).toBe("high");
  });

  it("rejects empty title", () => {
    expect(() =>
      addIdeaSchema.parse({
        projectId: "proj-1",
        title: "",
      })
    ).toThrow();
  });

  it("rejects missing projectId", () => {
    expect(() =>
      addIdeaSchema.parse({
        title: "Test",
      })
    ).toThrow();
  });

  it("applies defaults for optional fields", () => {
    const result = addIdeaSchema.parse({
      projectId: "proj-1",
      title: "Test",
    });
    expect(result.description).toBe("");
    expect(result.tags).toEqual([]);
    expect(result.priority).toBe("medium");
  });
});

describe("executeAddIdea", () => {
  it("creates tool output record and audit log", async () => {
    mockPrisma.aiToolOutput.create.mockResolvedValue({
      id: "output-1",
      userId: "user-1",
      toolName: "add_idea",
    });

    const result = await executeAddIdea(
      {
        projectId: "proj-1",
        title: "New Idea",
        description: "Description here",
        tags: ["test"],
        priority: "high",
      },
      "user-1",
      "session-1"
    );

    expect(result.success).toBe(true);
    expect(result.id).toBe("output-1");
    expect(result.title).toBe("New Idea");
    expect(result.projectId).toBe("proj-1");

    // Verify DB write
    expect(mockPrisma.aiToolOutput.create).toHaveBeenCalledTimes(1);
    const createArg = mockPrisma.aiToolOutput.create.mock.calls[0][0];
    expect(createArg.data.userId).toBe("user-1");
    expect(createArg.data.toolName).toBe("add_idea");
    expect(createArg.data.projectId).toBe("proj-1");

    // Verify audit log
    expect(mockAuditLog).toHaveBeenCalledTimes(1);
    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUserId: "user-1",
        action: "ai_tool.add_idea",
        targetType: "AiToolOutput",
        targetId: "output-1",
      })
    );
  });

  it("passes sessionId to DB record", async () => {
    mockPrisma.aiToolOutput.create.mockResolvedValue({ id: "output-2" });

    await executeAddIdea(
      {
        projectId: "proj-1",
        title: "Idea",
        description: "",
        tags: [],
        priority: "medium",
      },
      "user-1",
      "session-42"
    );

    const createArg = mockPrisma.aiToolOutput.create.mock.calls[0][0];
    expect(createArg.data.sessionId).toBe("session-42");
  });

  it("handles missing sessionId", async () => {
    mockPrisma.aiToolOutput.create.mockResolvedValue({ id: "output-3" });

    await executeAddIdea(
      {
        projectId: "proj-1",
        title: "Idea",
        description: "",
        tags: [],
        priority: "low",
      },
      "user-1"
    );

    const createArg = mockPrisma.aiToolOutput.create.mock.calls[0][0];
    expect(createArg.data.sessionId).toBeNull();
  });

  it("rejects invalid input", async () => {
    await expect(
      executeAddIdea(
        { projectId: "", title: "", description: "", tags: [], priority: "medium" },
        "user-1"
      )
    ).rejects.toThrow();
  });
});
