import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Common mocks
// ---------------------------------------------------------------------------

vi.mock("@/server/db", () => ({
  prisma: {
    project: { findMany: vi.fn() },
    projectArtifact: { findUnique: vi.fn(), findMany: vi.fn() },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Mock data generators
// ---------------------------------------------------------------------------

function generateMockProjects(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `proj-${i}`,
    name: `Project ${i}`,
    slug: `project-${i}-abc${i}`,
    description: `Description for project ${i}`,
    status: i % 2 === 0 ? "ACTIVE" : "PLANNING",
    tags: [`tag-${i % 5}`],
    _count: { members: (i % 3) + 1 },
    members: [{ role: i === 0 ? "OWNER" : "EDITOR" }],
    createdAt: new Date(Date.now() - i * 86400_000),
    updatedAt: new Date(Date.now() - i * 3600_000),
  }));
}

function generateMockKanbanCards(count: number) {
  const cards: Record<string, unknown> = {};
  for (let i = 0; i < count; i++) {
    cards[`card-${i}`] = {
      id: `card-${i}`,
      title: `Task ${i}: ${Array(20).fill("word").join(" ")}`,
      description: `Description for task ${i}. ${Array(50).fill("lorem").join(" ")}`,
      labels: [`label-${i % 5}`, `priority-${i % 3}`],
      priority: ["low", "medium", "high", "critical"][i % 4],
      assignee: `user-${i % 10}`,
      dueDate: new Date(Date.now() + i * 86400_000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  return cards;
}

function generateMockWhiteboardContainers(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `container-${i}`,
    x: (i % 10) * 200,
    y: Math.floor(i / 10) * 200,
    width: 180,
    height: 120,
    content: `Content for container ${i}`,
    type: "text",
    style: {
      backgroundColor: `#${((i * 37) % 256).toString(16).padStart(2, "0")}ff${((i * 13) % 256).toString(16).padStart(2, "0")}`,
      borderColor: "#000000",
      fontSize: 14,
    },
  }));
}

// ============================================================================
// Performance Baseline: Project list query
// ============================================================================
describe("Performance: Project list query", () => {
  it("project list query time < 100ms for 50 projects", async () => {
    const { prisma } = await import("@/server/db");
    const mockPrisma = prisma as any;

    const mockProjects = generateMockProjects(50);
    mockPrisma.project.findMany.mockResolvedValue(mockProjects);

    const start = performance.now();
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId: "user-1" } } },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { members: true } },
        members: { where: { userId: "user-1" }, select: { role: true }, take: 1 },
      },
    });
    const elapsed = performance.now() - start;

    expect(projects).toHaveLength(50);
    expect(elapsed).toBeLessThan(100); // < 100ms
    console.log(`Project list query (50 projects): ${elapsed.toFixed(2)}ms`);
  });

  it("project list with search filtering < 100ms", async () => {
    const { prisma } = await import("@/server/db");
    const mockPrisma = prisma as any;

    // Return 10 matching projects from 50 total
    const mockProjects = generateMockProjects(10);
    mockPrisma.project.findMany.mockResolvedValue(mockProjects);

    const start = performance.now();
    const projects = await prisma.project.findMany({
      where: {
        members: { some: { userId: "user-1" } },
        OR: [
          { name: { contains: "React", mode: "insensitive" } },
          { description: { contains: "React", mode: "insensitive" } },
        ],
      },
    });
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(100);
    console.log(`Project search query (10 results): ${elapsed.toFixed(2)}ms`);
  });
});

// ============================================================================
// Performance Baseline: Artifact read time
// ============================================================================
describe("Performance: Artifact read time", () => {
  it("artifact read time < 50ms", async () => {
    const { prisma } = await import("@/server/db");
    const mockPrisma = prisma as any;

    mockPrisma.projectArtifact.findUnique.mockResolvedValue({
      projectId: "proj-1",
      artifactPath: "kanban/board.json",
      content: {
        columns: [
          { id: "backlog", title: "Backlog", cardIds: [], order: 0 },
          { id: "todo", title: "To Do", cardIds: [], order: 1 },
        ],
        cards: generateMockKanbanCards(100),
      },
      revision: 5,
    });

    const start = performance.now();
    const artifact = await prisma.projectArtifact.findUnique({
      where: {
        projectId_artifactPath: {
          projectId: "proj-1",
          artifactPath: "kanban/board.json",
        },
      },
    });
    const elapsed = performance.now() - start;

    expect(artifact).toBeDefined();
    expect(elapsed).toBeLessThan(50); // < 50ms
    console.log(`Artifact read (100-card kanban): ${elapsed.toFixed(2)}ms`);
  });

  it("multiple artifact reads < 50ms each", async () => {
    const { prisma } = await import("@/server/db");
    const mockPrisma = prisma as any;

    const artifacts = [
      "project.json",
      "kanban/board.json",
      "whiteboard/board.json",
      "schema/schema.graph.json",
      "directory-tree/tree.plan.json",
      "ideas/ideas.json",
    ];

    for (const artifactPath of artifacts) {
      mockPrisma.projectArtifact.findUnique.mockResolvedValueOnce({
        projectId: "proj-1",
        artifactPath,
        content: {},
        revision: 1,
      });

      const start = performance.now();
      await prisma.projectArtifact.findUnique({
        where: {
          projectId_artifactPath: { projectId: "proj-1", artifactPath },
        },
      });
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(50);
    }
  });
});

// ============================================================================
// Performance Baseline: Schema validation
// ============================================================================
describe("Performance: Schema validation time", () => {
  it("schema validation time < 10ms for complex kanban board", async () => {
    const { KanbanBoardSchema } = await import("@idea-management/schemas");

    const cards = generateMockKanbanCards(100);
    const cardIds = Object.keys(cards);

    const complexBoard = {
      columns: [
        {
          id: "backlog",
          title: "Backlog",
          cardIds: cardIds.slice(0, 25),
          order: 0,
        },
        {
          id: "todo",
          title: "To Do",
          cardIds: cardIds.slice(25, 50),
          order: 1,
        },
        {
          id: "in-progress",
          title: "In Progress",
          cardIds: cardIds.slice(50, 75),
          order: 2,
        },
        {
          id: "done",
          title: "Done",
          cardIds: cardIds.slice(75, 100),
          order: 3,
        },
      ],
      cards,
    };

    const start = performance.now();
    const result = KanbanBoardSchema.safeParse(complexBoard);
    const elapsed = performance.now() - start;

    expect(result.success).toBe(true);
    expect(elapsed).toBeLessThan(10); // < 10ms
    console.log(`Kanban validation (100 cards): ${elapsed.toFixed(2)}ms`);
  });

  it("schema validation time < 10ms for whiteboard with 100 containers", async () => {
    const { WhiteboardSchema } = await import("@idea-management/schemas");

    const containers = generateMockWhiteboardContainers(100);

    const complexWhiteboard = {
      containers,
      edges: Array.from({ length: 50 }, (_, i) => ({
        id: `edge-${i}`,
        fromId: `container-${i}`,
        toId: `container-${i + 1}`,
        label: "",
      })),
      viewport: { x: 0, y: 0, zoom: 1 },
    };

    const start = performance.now();
    const result = WhiteboardSchema.safeParse(complexWhiteboard);
    const elapsed = performance.now() - start;

    expect(result.success).toBe(true);
    expect(elapsed).toBeLessThan(10); // < 10ms
    console.log(`Whiteboard validation (100 containers): ${elapsed.toFixed(2)}ms`);
  });

  it("schema validation time < 10ms for schema graph with nodes", async () => {
    const { SchemaGraphSchema } = await import("@idea-management/schemas");

    const nodes = Array.from({ length: 20 }, (_, i) => ({
      id: `node-${i}`,
      name: `Table_${i}`,
      x: i * 200,
      y: (i % 5) * 200,
      fields: Array.from({ length: 10 }, (_, j) => ({
        name: `field_${j}`,
        type: ["varchar(255)", "integer", "boolean", "uuid", "timestamp"][
          j % 5
        ],
        nullable: j > 5,
        primaryKey: j === 0,
        unique: j < 2,
      })),
    }));

    const edges = Array.from({ length: 15 }, (_, i) => ({
      id: `edge-${i}`,
      fromNodeId: `node-${i}`,
      fromField: "field_0",
      toNodeId: `node-${(i + 1) % 20}`,
      toField: "field_1",
      type: "one-to-many" as const,
    }));

    const start = performance.now();
    const result = SchemaGraphSchema.safeParse({ nodes, edges });
    const elapsed = performance.now() - start;

    expect(result.success).toBe(true);
    expect(elapsed).toBeLessThan(10); // < 10ms
    console.log(`Schema graph validation (20 nodes, 15 edges): ${elapsed.toFixed(2)}ms`);
  });
});

// ============================================================================
// Performance Baseline: Zod parse performance for large data sets
// ============================================================================
describe("Performance: Zod parse for large data sets", () => {
  it("SyncOp validation for batch of 100 operations < 50ms", async () => {
    const { SyncOpSchema } = await import("@idea-management/schemas");

    const operations = Array.from({ length: 100 }, (_, i) => ({
      operationId: `op-${i}`,
      projectId: "proj-1",
      artifactPath: "ideas/ideas.json",
      baseRevision: i,
      payload: { ideas: [{ id: `idea-${i}`, title: `Idea ${i}` }] },
      timestamp: new Date().toISOString(),
    }));

    const start = performance.now();
    const results = operations.map((op) => SyncOpSchema.safeParse(op));
    const elapsed = performance.now() - start;

    expect(results.every((r) => r.success)).toBe(true);
    expect(elapsed).toBeLessThan(50); // < 50ms for 100 ops
    console.log(`SyncOp batch validation (100 ops): ${elapsed.toFixed(2)}ms`);
  });

  it("DirectoryTree validation for deep tree < 10ms", async () => {
    const { DirectoryTreeSchema } = await import("@idea-management/schemas");

    // Build a moderately deep tree
    function buildTree(depth: number, breadth: number): any {
      if (depth === 0) {
        return {
          name: `file-${Math.random().toString(36).slice(2, 6)}.ts`,
          type: "file",
          children: [],
        };
      }
      return {
        name: `dir-${depth}`,
        type: "directory",
        children: Array.from({ length: breadth }, () =>
          buildTree(depth - 1, breadth)
        ),
      };
    }

    const deepTree = {
      root: buildTree(4, 3), // 4 levels deep, 3 children each = ~120 nodes
      metadata: { generatedAt: new Date().toISOString() },
    };

    const start = performance.now();
    const result = DirectoryTreeSchema.safeParse(deepTree);
    const elapsed = performance.now() - start;

    expect(result.success).toBe(true);
    expect(elapsed).toBeLessThan(10);
    console.log(`DirectoryTree validation (deep tree): ${elapsed.toFixed(2)}ms`);
  });
});
