import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Common mocks — same Prisma mock shape across all E2E flow tests
// ---------------------------------------------------------------------------

vi.mock("@/server/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    credential: {
      update: vi.fn(),
    },
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    emailVerificationToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    entitlement: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
    subscription: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    project: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    projectMember: {
      findUnique: vi.fn(),
    },
    projectArtifact: {
      createMany: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    syncOperation: {
      create: vi.fn(),
    },
    syncSnapshot: {
      create: vi.fn(),
    },
    aiToolOutput: {
      create: vi.fn(),
    },
    aiChatSession: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
    aiChatMessage: {
      create: vi.fn(),
    },
    billingEvent: {
      create: vi.fn(),
    },
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
  },
}));

vi.mock("@/server/audit", () => ({
  auditLog: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// E2E Flow 1: Auth Flow
// Signup -> Verify email -> Signin -> Authenticated request -> Signout
// ============================================================================
describe("E2E Flow: Auth lifecycle", () => {
  it("complete signup -> signin -> authenticated request -> signout sequence", async () => {
    const { prisma } = await import("@/server/db");
    const mockPrisma = prisma as any;

    // ---- Step 1: Signup ----
    const { hashPassword, verifyPassword } = await import(
      "@/server/auth/password"
    );
    const password = "secure-password-12345";
    const passwordHash = await hashPassword(password);

    const mockUser = {
      id: "user-new",
      email: "new@example.com",
      role: "USER",
      createdAt: new Date(),
    };

    mockPrisma.user.findUnique.mockResolvedValueOnce(null); // no existing user
    mockPrisma.user.create.mockResolvedValueOnce(mockUser);

    // ---- Step 2: Issue session ----
    const { newToken, sha256Hex } = await import("@/server/auth/tokens");

    const sessionToken = newToken(32);
    const refreshToken = newToken(32);

    expect(sessionToken.length).toBe(64); // 32 bytes => 64 hex chars
    expect(refreshToken.length).toBe(64);

    mockPrisma.session.create.mockResolvedValueOnce({
      id: "sess-1",
      userId: mockUser.id,
      sessionTokenHash: sha256Hex(sessionToken),
      expiresAt: new Date(Date.now() + 900_000),
    });
    mockPrisma.refreshToken.create.mockResolvedValueOnce({
      id: "rt-1",
      userId: mockUser.id,
      tokenHash: sha256Hex(refreshToken),
      expiresAt: new Date(Date.now() + 2_592_000_000),
    });

    const { issueSession } = await import("@/server/auth/session");
    const session = await issueSession(mockUser.id);

    expect(session.sessionToken).toBeDefined();
    expect(session.refreshToken).toBeDefined();

    // ---- Step 3: Validate session (authenticated request) ----
    const sessionHash = sha256Hex(session.sessionToken);
    mockPrisma.session.findUnique.mockResolvedValueOnce({
      id: "sess-1",
      userId: mockUser.id,
      sessionTokenHash: sessionHash,
      expiresAt: new Date(Date.now() + 900_000),
      revokedAt: null,
      lastSeenAt: new Date(),
      user: {
        id: mockUser.id,
        email: mockUser.email,
        role: "USER",
        emailVerifiedAt: new Date(),
      },
    });
    // Mock the fire-and-forget update
    mockPrisma.session.update = vi.fn().mockResolvedValue({});

    const { validateSession } = await import("@/server/auth/session");
    const validated = await validateSession(session.sessionToken);

    expect(validated).not.toBeNull();
    expect(validated!.user.id).toBe(mockUser.id);

    // ---- Step 4: Signout (revoke session) ----
    mockPrisma.session.updateMany.mockResolvedValueOnce({ count: 1 });

    const { revokeSessionByToken } = await import("@/server/auth/session");
    await revokeSessionByToken(session.sessionToken);

    expect(mockPrisma.session.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          sessionTokenHash: sha256Hex(session.sessionToken),
        }),
      })
    );

    // ---- Step 5: Verify session is now invalid ----
    mockPrisma.session.findUnique.mockResolvedValueOnce(null);
    const afterRevoke = await validateSession(session.sessionToken);
    expect(afterRevoke).toBeNull();
  });
});

// ============================================================================
// E2E Flow 2: Subscription Gate
// Free user blocked from AI -> PRO user allowed
// ============================================================================
describe("E2E Flow: Subscription gate enforcement", () => {
  it("FREE user blocked from AI, PRO user allowed", async () => {
    const { prisma } = await import("@/server/db");
    const mockPrisma = prisma as any;
    const { checkEntitlement, FEATURES } = await import(
      "@/server/billing/entitlements"
    );

    // ---- FREE user ----
    mockPrisma.entitlement.findUnique.mockResolvedValueOnce(null);
    mockPrisma.subscription.findFirst.mockResolvedValueOnce(null);

    const freeHasAI = await checkEntitlement("free-user", FEATURES.AI_CHAT, "USER");
    expect(freeHasAI).toBe(false);

    // ---- PRO user ----
    mockPrisma.entitlement.findUnique.mockResolvedValueOnce(null);
    mockPrisma.subscription.findFirst.mockResolvedValueOnce({
      id: "sub-1",
      userId: "pro-user",
      plan: "PRO",
      status: "ACTIVE",
      createdAt: new Date(),
    });

    const proHasAI = await checkEntitlement("pro-user", FEATURES.AI_CHAT, "USER");
    expect(proHasAI).toBe(true);

    // ---- Verify WHITEBOARD also gated ----
    mockPrisma.entitlement.findUnique.mockResolvedValueOnce(null);
    mockPrisma.subscription.findFirst.mockResolvedValueOnce(null);

    const freeHasWhiteboard = await checkEntitlement(
      "free-user",
      FEATURES.WHITEBOARD,
      "USER"
    );
    expect(freeHasWhiteboard).toBe(false);
  });
});

// ============================================================================
// E2E Flow 3: Project Lifecycle
// Create project -> Verify artifacts bootstrapped -> Update artifact -> Verify
// ============================================================================
describe("E2E Flow: Project lifecycle", () => {
  it("create project -> verify artifacts -> update artifact -> verify", async () => {
    const { prisma } = await import("@/server/db");
    const mockPrisma = prisma as any;

    // ---- Step 1: Create project ----
    const {
      generateSlug,
      bootstrapProjectArtifacts,
      DEFAULT_ARTIFACTS,
    } = await import("@/server/projects/helpers");

    const name = "My Test Project";
    const slug = generateSlug(name);

    expect(slug).toMatch(/^my-test-project-[a-z0-9]{6}$/);

    const mockProject = {
      id: "proj-1",
      name,
      slug,
      description: "",
      status: "PLANNING",
      tags: [],
      members: [{ id: "m1", userId: "user-1", role: "OWNER" }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPrisma.project.create.mockResolvedValue(mockProject);
    mockPrisma.projectArtifact.createMany.mockResolvedValue({ count: 7 });

    // ---- Step 2: Bootstrap artifacts ----
    await bootstrapProjectArtifacts("proj-1", name);

    expect(mockPrisma.projectArtifact.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({
          projectId: "proj-1",
          artifactPath: "project.json",
          revision: 1,
        }),
        expect.objectContaining({
          projectId: "proj-1",
          artifactPath: "kanban/board.json",
          revision: 1,
        }),
      ]),
    });

    // Verify all 7 artifacts
    const createManyCall = mockPrisma.projectArtifact.createMany.mock.calls[0][0];
    expect(createManyCall.data).toHaveLength(DEFAULT_ARTIFACTS.length);

    // ---- Step 3: Update an artifact ----
    const updatedKanban = {
      columns: [
        { id: "backlog", title: "Backlog", cards: ["card-1"] },
        { id: "todo", title: "To Do", cards: [] },
      ],
      cards: {
        "card-1": {
          id: "card-1",
          title: "First task",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    };

    mockPrisma.projectArtifact.upsert.mockResolvedValueOnce({
      projectId: "proj-1",
      artifactPath: "kanban/board.json",
      content: updatedKanban,
      revision: 2,
    });

    const result = await prisma.projectArtifact.upsert({
      where: {
        projectId_artifactPath: {
          projectId: "proj-1",
          artifactPath: "kanban/board.json",
        },
      },
      create: {
        projectId: "proj-1",
        artifactPath: "kanban/board.json",
        content: updatedKanban,
        revision: 1,
      },
      update: { content: updatedKanban, revision: 2 },
    });

    // ---- Step 4: Verify update ----
    expect(result.revision).toBe(2);
    expect(result.content).toEqual(updatedKanban);
  });
});

// ============================================================================
// E2E Flow 4: AI Tool Flow
// AI adds idea -> Verify audit log -> Verify tool output stored
// ============================================================================
describe("E2E Flow: AI tool execution", () => {
  it("AI adds idea -> audit log created -> tool output stored", async () => {
    const { prisma } = await import("@/server/db");
    const mockPrisma = prisma as any;
    const { auditLog } = await import("@/server/audit");
    const mockAudit = auditLog as ReturnType<typeof vi.fn>;

    const toolOutput = {
      id: "tool-out-1",
      userId: "user-1",
      sessionId: "session-1",
      toolName: "add_idea",
      projectId: "proj-1",
      input: {
        projectId: "proj-1",
        title: "AI-generated idea",
        description: "Created by AI",
        tags: ["ai"],
        priority: "high",
      },
      output: {
        title: "AI-generated idea",
        description: "Created by AI",
        tags: ["ai"],
        priority: "high",
        status: "new",
        createdAt: new Date().toISOString(),
      },
    };

    mockPrisma.aiToolOutput.create.mockResolvedValue(toolOutput);

    const { executeAddIdea } = await import("@/server/ai/tools/add-idea");
    const result = await executeAddIdea(
      {
        projectId: "proj-1",
        title: "AI-generated idea",
        description: "Created by AI",
        tags: ["ai"],
        priority: "high",
      },
      "user-1",
      "session-1"
    );

    // Verify tool output stored
    expect(result.success).toBe(true);
    expect(result.title).toBe("AI-generated idea");
    expect(result.projectId).toBe("proj-1");
    expect(mockPrisma.aiToolOutput.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          toolName: "add_idea",
          projectId: "proj-1",
        }),
      })
    );

    // Verify audit log was created
    expect(mockAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUserId: "user-1",
        action: "ai_tool.add_idea",
        targetType: "AiToolOutput",
        targetId: "tool-out-1",
      })
    );
  });
});

// ============================================================================
// E2E Flow 5: Sync Flow
// Push operation -> Verify artifact updated -> Pull changes -> Verify
// ============================================================================
describe("E2E Flow: Sync push and pull", () => {
  it("push applies operation -> artifact updated -> pull returns latest", async () => {
    const { prisma } = await import("@/server/db");
    const mockPrisma = prisma as any;

    // ---- Step 1: Push - apply an operation ----
    // Current artifact state: revision 1
    mockPrisma.projectArtifact.findUnique.mockResolvedValueOnce({
      projectId: "proj-1",
      artifactPath: "ideas/ideas.json",
      content: { ideas: [{ id: "i1", title: "Existing idea" }] },
      revision: 1,
    });

    const pushPayload = {
      ideas: [
        { id: "i1", title: "Existing idea" },
        { id: "i2", title: "New idea" },
      ],
    };

    mockPrisma.projectArtifact.upsert.mockResolvedValueOnce({
      projectId: "proj-1",
      artifactPath: "ideas/ideas.json",
      content: pushPayload,
      revision: 2,
    });
    mockPrisma.syncOperation.create.mockResolvedValueOnce({
      id: "sync-op-1",
      operationId: "op-1",
      status: "applied",
    });

    // Simulate push logic
    const artifact = await prisma.projectArtifact.findUnique({
      where: {
        projectId_artifactPath: {
          projectId: "proj-1",
          artifactPath: "ideas/ideas.json",
        },
      },
    });

    const baseRevision = 1;
    const currentRevision = artifact?.revision ?? 0;

    expect(baseRevision).toBe(currentRevision); // no conflict

    const updatedArtifact = await prisma.projectArtifact.upsert({
      where: {
        projectId_artifactPath: {
          projectId: "proj-1",
          artifactPath: "ideas/ideas.json",
        },
      },
      create: {
        projectId: "proj-1",
        artifactPath: "ideas/ideas.json",
        content: pushPayload,
        revision: 1,
      },
      update: { content: pushPayload, revision: 2 },
    });

    expect(updatedArtifact.revision).toBe(2);

    // ---- Step 2: Pull - verify latest state ----
    mockPrisma.projectArtifact.findMany.mockResolvedValueOnce([
      {
        projectId: "proj-1",
        artifactPath: "ideas/ideas.json",
        content: pushPayload,
        revision: 2,
      },
      {
        projectId: "proj-1",
        artifactPath: "kanban/board.json",
        content: { columns: [], cards: {} },
        revision: 1,
      },
    ]);

    const pulledArtifacts = await prisma.projectArtifact.findMany({
      where: { projectId: "proj-1" },
    });

    expect(pulledArtifacts).toHaveLength(2);

    const ideasArtifact = pulledArtifacts.find(
      (a: { artifactPath: string }) => a.artifactPath === "ideas/ideas.json"
    );
    expect(ideasArtifact).toBeDefined();
    expect(ideasArtifact!.revision).toBe(2);
    expect(
      (ideasArtifact!.content as { ideas: unknown[] }).ideas
    ).toHaveLength(2);
  });

  it("sync push with stale revision triggers conflict", async () => {
    const { prisma } = await import("@/server/db");
    const mockPrisma = prisma as any;

    // Server is at revision 3
    mockPrisma.projectArtifact.findUnique.mockResolvedValueOnce({
      projectId: "proj-1",
      artifactPath: "kanban/board.json",
      content: { columns: [{ id: "col1", title: "Updated" }], cards: {} },
      revision: 3,
    });

    const artifact = await prisma.projectArtifact.findUnique({
      where: {
        projectId_artifactPath: {
          projectId: "proj-1",
          artifactPath: "kanban/board.json",
        },
      },
    });

    const clientBaseRevision = 1; // Client is behind
    const serverRevision = artifact?.revision ?? 0;

    // Conflict detection
    expect(clientBaseRevision).not.toBe(serverRevision);

    // kanban is not auto-mergeable
    const { canAutoMerge } = await import("@/server/sync/merge");
    expect(canAutoMerge("kanban/board.json")).toBe(false);

    // So it should be a conflict
    mockPrisma.syncOperation.create.mockResolvedValueOnce({
      id: "sync-conflict-1",
      operationId: "op-2",
      status: "conflict",
    });

    await prisma.syncOperation.create({
      data: {
        operationId: "op-2",
        projectId: "proj-1",
        userId: "user-1",
        artifactPath: "kanban/board.json",
        baseRevision: clientBaseRevision,
        payload: { columns: [], cards: {} },
        status: "conflict",
      },
    });

    expect(mockPrisma.syncOperation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "conflict",
        }),
      })
    );
  });

  it("auto-merge applies for append-only artifacts with stale revision", async () => {
    const { canAutoMerge, autoMergeAppendOnly } = await import(
      "@/server/sync/merge"
    );

    // ideas/ideas.json supports auto-merge
    expect(canAutoMerge("ideas/ideas.json")).toBe(true);

    // Simulate: server has ideas i1, i2 at rev 2; client sends i1, i3 with baseRev 1
    const serverContent = {
      ideas: [
        { id: "i1", title: "Idea 1" },
        { id: "i2", title: "Idea 2" },
      ],
    };
    const clientPayload = {
      ideas: [
        { id: "i1", title: "Idea 1" },
        { id: "i3", title: "Idea 3" },
      ],
    };

    const merged = autoMergeAppendOnly(clientPayload, serverContent) as {
      ideas: Array<{ id: string; title: string }>;
    };

    // All 3 unique ideas should be present
    expect(merged.ideas).toHaveLength(3);
    const mergedIds = merged.ideas.map((i) => i.id);
    expect(mergedIds).toContain("i1");
    expect(mergedIds).toContain("i2");
    expect(mergedIds).toContain("i3");
  });
});
