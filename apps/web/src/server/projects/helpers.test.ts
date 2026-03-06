import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
vi.mock("@/server/db", () => ({
  prisma: {
    projectMember: {
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    projectArtifact: {
      createMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/server/db";
import {
  generateSlug,
  checkProjectAccess,
  bootstrapProjectArtifacts,
  DEFAULT_ARTIFACTS,
} from "./helpers";
import type { AuthenticatedUser } from "@/server/auth/admin";

const mockPrisma = prisma as unknown as {
  projectMember: {
    findUnique: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
  };
  projectArtifact: {
    createMany: ReturnType<typeof vi.fn>;
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("generateSlug", () => {
  it("generates a slug from a project name", () => {
    const slug = generateSlug("My Test Project");
    expect(slug).toMatch(/^my-test-project-[a-z0-9]{6}$/);
  });

  it("removes special characters", () => {
    const slug = generateSlug("Hello!@#$ World & Friends");
    expect(slug).toMatch(/^hello-world-friends-[a-z0-9]{6}$/);
  });

  it("trims leading/trailing hyphens", () => {
    const slug = generateSlug("---test---");
    expect(slug).toMatch(/^test-[a-z0-9]{6}$/);
  });

  it("truncates long names", () => {
    const longName = "a".repeat(100);
    const slug = generateSlug(longName);
    // Base should be at most 60 chars + dash + 6 char suffix
    expect(slug.length).toBeLessThanOrEqual(67);
  });
});

describe("checkProjectAccess", () => {
  const regularUser: AuthenticatedUser = {
    id: "user-1",
    email: "user@example.com",
    role: "USER",
    emailVerifiedAt: new Date(),
  };

  const adminUser: AuthenticatedUser = {
    id: "admin-1",
    email: "admin@example.com",
    role: "ADMIN",
    emailVerifiedAt: new Date(),
  };

  it("grants admin bypass", async () => {
    const result = await checkProjectAccess("proj-1", adminUser);
    expect(result).toEqual({ role: "ADMIN" });
    expect(mockPrisma.projectMember.findUnique).not.toHaveBeenCalled();
  });

  it("returns null for non-member", async () => {
    mockPrisma.projectMember.findUnique.mockResolvedValue(null);
    const result = await checkProjectAccess("proj-1", regularUser);
    expect(result).toBeNull();
  });

  it("grants access for member with sufficient role", async () => {
    mockPrisma.projectMember.findUnique.mockResolvedValue({
      id: "m-1",
      projectId: "proj-1",
      userId: "user-1",
      role: "OWNER",
    });
    const result = await checkProjectAccess("proj-1", regularUser, "EDITOR");
    expect(result).toEqual({ role: "OWNER" });
  });

  it("denies access for insufficient role", async () => {
    mockPrisma.projectMember.findUnique.mockResolvedValue({
      id: "m-1",
      projectId: "proj-1",
      userId: "user-1",
      role: "VIEWER",
    });
    const result = await checkProjectAccess("proj-1", regularUser, "EDITOR");
    expect(result).toBeNull();
  });

  it("grants VIEWER access to a VIEWER member", async () => {
    mockPrisma.projectMember.findUnique.mockResolvedValue({
      id: "m-1",
      projectId: "proj-1",
      userId: "user-1",
      role: "VIEWER",
    });
    const result = await checkProjectAccess("proj-1", regularUser, "VIEWER");
    expect(result).toEqual({ role: "VIEWER" });
  });
});

describe("bootstrapProjectArtifacts", () => {
  it("creates all default artifacts", async () => {
    mockPrisma.projectArtifact.createMany.mockResolvedValue({ count: DEFAULT_ARTIFACTS.length });
    await bootstrapProjectArtifacts("proj-1", "Test Project");

    expect(mockPrisma.projectArtifact.createMany).toHaveBeenCalledTimes(1);
    const call = mockPrisma.projectArtifact.createMany.mock.calls[0][0];
    expect(call.data).toHaveLength(DEFAULT_ARTIFACTS.length);

    // project.json should have the project name
    const projectArtifact = call.data.find(
      (a: { artifactPath: string }) => a.artifactPath === "project.json"
    );
    expect(projectArtifact.content.name).toBe("Test Project");
  });

  it("sets revision to 1 for all artifacts", async () => {
    mockPrisma.projectArtifact.createMany.mockResolvedValue({ count: DEFAULT_ARTIFACTS.length });
    await bootstrapProjectArtifacts("proj-1", "Test");

    const call = mockPrisma.projectArtifact.createMany.mock.calls[0][0];
    for (const artifact of call.data) {
      expect(artifact.revision).toBe(1);
    }
  });
});
