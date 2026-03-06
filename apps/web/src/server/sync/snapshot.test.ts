import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/server/db", () => ({
  prisma: {
    syncSnapshot: {
      create: vi.fn(),
    },
  },
}));

import { prisma } from "@/server/db";
import { createSnapshot } from "./snapshot";

const mockPrisma = prisma as unknown as {
  syncSnapshot: {
    create: ReturnType<typeof vi.fn>;
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createSnapshot", () => {
  it("creates a snapshot record", async () => {
    mockPrisma.syncSnapshot.create.mockResolvedValue({
      id: "snap-1",
      projectId: "proj-1",
      artifactPath: "ideas/ideas.json",
      content: { ideas: [] },
      revision: 3,
      reason: "pre-merge",
    });

    const id = await createSnapshot(
      "proj-1",
      "ideas/ideas.json",
      { ideas: [] },
      3,
      "pre-merge"
    );

    expect(id).toBe("snap-1");
    expect(mockPrisma.syncSnapshot.create).toHaveBeenCalledTimes(1);
    const call = mockPrisma.syncSnapshot.create.mock.calls[0][0];
    expect(call.data.projectId).toBe("proj-1");
    expect(call.data.artifactPath).toBe("ideas/ideas.json");
    expect(call.data.revision).toBe(3);
    expect(call.data.reason).toBe("pre-merge");
  });

  it("defaults reason to pre-merge", async () => {
    mockPrisma.syncSnapshot.create.mockResolvedValue({ id: "snap-2" });

    await createSnapshot("proj-1", "test/file.json", {}, 1);

    const call = mockPrisma.syncSnapshot.create.mock.calls[0][0];
    expect(call.data.reason).toBe("pre-merge");
  });
});
