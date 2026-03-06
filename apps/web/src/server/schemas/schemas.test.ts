import { describe, it, expect } from "vitest";
import {
  IdeaSchema,
  IdeasListSchema,
  KanbanCardSchema,
  KanbanColumnSchema,
  KanbanBoardSchema,
  WhiteboardContainerSchema,
  WhiteboardEdgeSchema,
  WhiteboardSchema,
  SchemaFieldSchema,
  SchemaNodeSchema,
  SchemaEdgeSchema,
  SchemaGraphSchema,
  TreeNodeSchema,
  DirectoryTreeSchema,
} from "@idea-management/schemas";

/* ------------------------------------------------------------------ */
/*  IdeaSchema                                                         */
/* ------------------------------------------------------------------ */

describe("IdeaSchema", () => {
  it("validates a valid idea", () => {
    const idea = {
      id: "idea-1",
      title: "Test Idea",
      description: "A test idea",
      tags: ["frontend", "ux"],
      priority: "high" as const,
      category: "design",
      status: "captured" as const,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };
    const result = IdeaSchema.parse(idea);
    expect(result.id).toBe("idea-1");
    expect(result.title).toBe("Test Idea");
    expect(result.priority).toBe("high");
    expect(result.status).toBe("captured");
  });

  it("applies defaults for optional fields", () => {
    const idea = {
      id: "idea-2",
      title: "Minimal Idea",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };
    const result = IdeaSchema.parse(idea);
    expect(result.description).toBe("");
    expect(result.tags).toEqual([]);
    expect(result.priority).toBe("medium");
    expect(result.category).toBe("general");
    expect(result.status).toBe("captured");
  });

  it("rejects missing required fields (id)", () => {
    expect(() =>
      IdeaSchema.parse({
        title: "No ID",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      })
    ).toThrow();
  });

  it("rejects missing required fields (title)", () => {
    expect(() =>
      IdeaSchema.parse({
        id: "idea-3",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      })
    ).toThrow();
  });

  it("rejects empty title", () => {
    expect(() =>
      IdeaSchema.parse({
        id: "idea-4",
        title: "",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      })
    ).toThrow();
  });

  it("rejects invalid priority", () => {
    expect(() =>
      IdeaSchema.parse({
        id: "idea-5",
        title: "Bad Priority",
        priority: "extreme",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      })
    ).toThrow();
  });

  it("validates idea with promotedTo", () => {
    const idea = {
      id: "idea-6",
      title: "Promoted Idea",
      promotedTo: { type: "kanban" as const, targetId: "card-1" },
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };
    const result = IdeaSchema.parse(idea);
    expect(result.promotedTo?.type).toBe("kanban");
    expect(result.promotedTo?.targetId).toBe("card-1");
  });
});

describe("IdeasListSchema", () => {
  it("validates a list of ideas", () => {
    const list = {
      ideas: [
        {
          id: "i1",
          title: "First",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
        {
          id: "i2",
          title: "Second",
          createdAt: "2026-01-02T00:00:00Z",
          updatedAt: "2026-01-02T00:00:00Z",
        },
      ],
    };
    const result = IdeasListSchema.parse(list);
    expect(result.ideas).toHaveLength(2);
  });

  it("defaults to empty array", () => {
    const result = IdeasListSchema.parse({});
    expect(result.ideas).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/*  KanbanBoardSchema                                                  */
/* ------------------------------------------------------------------ */

describe("KanbanBoardSchema", () => {
  const now = "2026-01-01T00:00:00Z";

  it("validates a valid board with cards in columns", () => {
    const board = {
      columns: [
        { id: "col-1", title: "Backlog", cardIds: ["card-1"], order: 0 },
        { id: "col-2", title: "Done", cardIds: [], order: 1 },
      ],
      cards: {
        "card-1": {
          id: "card-1",
          title: "Task One",
          createdAt: now,
          updatedAt: now,
        },
      },
    };
    const result = KanbanBoardSchema.parse(board);
    expect(result.columns).toHaveLength(2);
    expect(result.cards["card-1"].title).toBe("Task One");
    expect(result.cards["card-1"].priority).toBe("medium"); // default
  });

  it("defaults to empty columns and cards", () => {
    const result = KanbanBoardSchema.parse({});
    expect(result.columns).toEqual([]);
    expect(result.cards).toEqual({});
  });

  it("validates card movement scenario (card in different column)", () => {
    const board = {
      columns: [
        { id: "col-1", title: "To Do", cardIds: [], order: 0 },
        { id: "col-2", title: "In Progress", cardIds: ["card-1"], order: 1 },
      ],
      cards: {
        "card-1": {
          id: "card-1",
          title: "Moved Card",
          priority: "high" as const,
          createdAt: now,
          updatedAt: now,
        },
      },
    };
    const result = KanbanBoardSchema.parse(board);
    expect(result.columns[0].cardIds).toEqual([]);
    expect(result.columns[1].cardIds).toEqual(["card-1"]);
    expect(result.cards["card-1"].priority).toBe("high");
  });

  it("rejects column with missing title", () => {
    expect(() =>
      KanbanColumnSchema.parse({
        id: "col-bad",
        cardIds: [],
        order: 0,
      })
    ).toThrow();
  });

  it("rejects card with missing title", () => {
    expect(() =>
      KanbanCardSchema.parse({
        id: "card-bad",
        createdAt: now,
        updatedAt: now,
      })
    ).toThrow();
  });
});

/* ------------------------------------------------------------------ */
/*  WhiteboardSchema                                                   */
/* ------------------------------------------------------------------ */

describe("WhiteboardSchema", () => {
  it("validates a valid whiteboard with containers and edges", () => {
    const wb = {
      containers: [
        {
          id: "c1",
          x: 100,
          y: 200,
          width: 200,
          height: 150,
          content: "Hello",
          type: "text" as const,
        },
        {
          id: "c2",
          x: 400,
          y: 200,
          width: 200,
          height: 150,
          content: "",
          type: "text" as const,
        },
      ],
      edges: [
        { id: "e1", fromId: "c1", toId: "c2" },
      ],
    };
    const result = WhiteboardSchema.parse(wb);
    expect(result.containers).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
    expect(result.viewport.zoom).toBe(1); // default
    expect(result.viewport.x).toBe(0);
  });

  it("validates container positioning", () => {
    const container = {
      id: "c-pos",
      x: -50,
      y: 100.5,
      width: 300,
      height: 200,
    };
    const result = WhiteboardContainerSchema.parse(container);
    expect(result.x).toBe(-50);
    expect(result.y).toBe(100.5);
    expect(result.width).toBe(300);
    expect(result.height).toBe(200);
    expect(result.type).toBe("text"); // default
  });

  it("rejects container with zero width", () => {
    expect(() =>
      WhiteboardContainerSchema.parse({
        id: "bad",
        x: 0,
        y: 0,
        width: 0,
        height: 100,
      })
    ).toThrow();
  });

  it("defaults to empty containers and edges", () => {
    const result = WhiteboardSchema.parse({});
    expect(result.containers).toEqual([]);
    expect(result.edges).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/*  SchemaGraphSchema                                                  */
/* ------------------------------------------------------------------ */

describe("SchemaGraphSchema", () => {
  it("validates a valid graph with nodes and edges", () => {
    const graph = {
      nodes: [
        {
          id: "users",
          name: "users",
          x: 0,
          y: 0,
          fields: [
            { name: "id", type: "number", primaryKey: true },
            { name: "email", type: "string", unique: true },
          ],
        },
        {
          id: "posts",
          name: "posts",
          x: 300,
          y: 0,
          fields: [
            { name: "id", type: "number", primaryKey: true },
            { name: "userId", type: "reference", reference: { table: "users", field: "id" } },
            { name: "title", type: "string" },
          ],
        },
      ],
      edges: [
        {
          id: "e1",
          fromNodeId: "users",
          fromField: "id",
          toNodeId: "posts",
          toField: "userId",
          type: "one-to-many" as const,
        },
      ],
    };
    const result = SchemaGraphSchema.parse(graph);
    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
    expect(result.nodes[0].fields[0].primaryKey).toBe(true);
    expect(result.edges[0].type).toBe("one-to-many");
  });

  it("validates a node with fields", () => {
    const node = {
      id: "table-1",
      name: "orders",
      fields: [
        { name: "id", type: "number", primaryKey: true, unique: true, nullable: false },
        { name: "amount", type: "number", nullable: true },
        { name: "status", type: "string", defaultValue: "'pending'" },
      ],
    };
    const result = SchemaNodeSchema.parse(node);
    expect(result.fields).toHaveLength(3);
    expect(result.fields[0].primaryKey).toBe(true);
    expect(result.fields[1].nullable).toBe(true);
    expect(result.fields[2].defaultValue).toBe("'pending'");
    expect(result.x).toBe(0); // default
  });

  it("validates edge types", () => {
    for (const t of ["one-to-one", "one-to-many", "many-to-many"] as const) {
      const edge = {
        id: `e-${t}`,
        fromNodeId: "a",
        fromField: "id",
        toNodeId: "b",
        toField: "aId",
        type: t,
      };
      const result = SchemaEdgeSchema.parse(edge);
      expect(result.type).toBe(t);
    }
  });

  it("defaults to empty graph", () => {
    const result = SchemaGraphSchema.parse({});
    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/*  DirectoryTreeSchema                                                */
/* ------------------------------------------------------------------ */

describe("DirectoryTreeSchema", () => {
  it("validates a valid tree with nested directories", () => {
    const tree = {
      root: {
        name: "project",
        type: "directory" as const,
        children: [
          {
            name: "src",
            type: "directory" as const,
            children: [
              { name: "index.ts", type: "file" as const, children: [] },
            ],
          },
          { name: "package.json", type: "file" as const, children: [] },
        ],
      },
    };
    const result = DirectoryTreeSchema.parse(tree);
    expect(result.root.name).toBe("project");
    expect(result.root.children).toHaveLength(2);
    const src = result.root.children[0] as { name: string; children: unknown[] };
    expect(src.name).toBe("src");
    expect(src.children).toHaveLength(1);
  });

  it("validates deeply nested structure", () => {
    const tree = {
      root: {
        name: "root",
        type: "directory" as const,
        children: [
          {
            name: "a",
            type: "directory" as const,
            children: [
              {
                name: "b",
                type: "directory" as const,
                children: [
                  {
                    name: "c.txt",
                    type: "file" as const,
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    };
    const result = DirectoryTreeSchema.parse(tree);
    expect(result.root.name).toBe("root");
  });

  it("rejects node with empty name", () => {
    expect(() =>
      TreeNodeSchema.parse({
        name: "",
        type: "file",
        children: [],
      })
    ).toThrow();
  });

  it("defaults metadata", () => {
    const tree = {
      root: { name: "r", type: "directory" as const, children: [] },
    };
    const result = DirectoryTreeSchema.parse(tree);
    expect(result.metadata).toEqual({});
  });
});
