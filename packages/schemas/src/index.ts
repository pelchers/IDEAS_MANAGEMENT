import { z } from "zod";

export const ProjectStatusSchema = z.enum([
  "planning",
  "active",
  "paused",
  "archived"
]);

export const ProjectJsonSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().default(""),
  status: ProjectStatusSchema,
  tags: z.array(z.string()).default([]),
  ownerId: z.string().min(1),
  collaborators: z.array(z.string()).default([]),
  goals: z.array(z.string()).default([]),
  techStack: z.array(z.string()).default([]),
  links: z.record(z.string(), z.string()).default({}),
  sync: z
    .object({
      cloudProjectId: z.string().default(""),
      lastSyncedAt: z.string().nullable().default(null),
      revision: z.number().int().nonnegative().default(0)
    })
    .default({ cloudProjectId: "", lastSyncedAt: null, revision: 0 }),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type ProjectJson = z.infer<typeof ProjectJsonSchema>;

export const SyncOpSchema = z.object({
  operationId: z.string().min(1),
  projectId: z.string().min(1),
  artifactPath: z.string().min(1),
  baseRevision: z.number().int().nonnegative(),
  payload: z.unknown(),
  timestamp: z.string()
});

export type SyncOp = z.infer<typeof SyncOpSchema>;

// ---------------------------------------------------------------------------
// Ideas
// ---------------------------------------------------------------------------

export const IdeaSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(""),
  tags: z.array(z.string()).default([]),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  category: z.string().default("general"),
  status: z
    .enum(["captured", "exploring", "validated", "promoted", "archived"])
    .default("captured"),
  promotedTo: z
    .object({ type: z.enum(["kanban", "whiteboard"]), targetId: z.string() })
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Idea = z.infer<typeof IdeaSchema>;

export const IdeasListSchema = z.object({
  ideas: z.array(IdeaSchema).default([]),
});
export type IdeasList = z.infer<typeof IdeasListSchema>;

// ---------------------------------------------------------------------------
// Kanban
// ---------------------------------------------------------------------------

export const KanbanCardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(""),
  labels: z.array(z.string()).default([]),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  dueDate: z.string().optional(),
  assignee: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type KanbanCard = z.infer<typeof KanbanCardSchema>;

export const KanbanColumnSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  cardIds: z.array(z.string()).default([]),
  order: z.number().int().nonnegative(),
});
export type KanbanColumn = z.infer<typeof KanbanColumnSchema>;

export const KanbanBoardSchema = z.object({
  columns: z.array(KanbanColumnSchema).default([]),
  cards: z.record(z.string(), KanbanCardSchema).default({}),
});
export type KanbanBoard = z.infer<typeof KanbanBoardSchema>;

// ---------------------------------------------------------------------------
// Whiteboard
// ---------------------------------------------------------------------------

export const WhiteboardContainerSchema = z.object({
  id: z.string().min(1),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  content: z.string().default(""),
  type: z.enum(["text", "image", "group"]).default("text"),
  imageUrl: z.string().optional(),
  style: z
    .object({
      backgroundColor: z.string().default("#ffffff"),
      borderColor: z.string().default("#000000"),
      fontSize: z.number().default(14),
    })
    .default(() => ({ backgroundColor: "#ffffff", borderColor: "#000000", fontSize: 14 })),
  groupId: z.string().optional(),
});
export type WhiteboardContainer = z.infer<typeof WhiteboardContainerSchema>;

export const WhiteboardEdgeSchema = z.object({
  id: z.string().min(1),
  fromId: z.string().min(1),
  toId: z.string().min(1),
  label: z.string().default(""),
});
export type WhiteboardEdge = z.infer<typeof WhiteboardEdgeSchema>;

export const WhiteboardSchema = z.object({
  containers: z.array(WhiteboardContainerSchema).default([]),
  edges: z.array(WhiteboardEdgeSchema).default([]),
  viewport: z
    .object({
      x: z.number().default(0),
      y: z.number().default(0),
      zoom: z.number().default(1),
    })
    .default(() => ({ x: 0, y: 0, zoom: 1 })),
});
export type Whiteboard = z.infer<typeof WhiteboardSchema>;

// ---------------------------------------------------------------------------
// Schema Graph
// ---------------------------------------------------------------------------

export const SchemaFieldSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  nullable: z.boolean().default(false),
  primaryKey: z.boolean().default(false),
  unique: z.boolean().default(false),
  defaultValue: z.string().optional(),
  reference: z
    .object({ table: z.string(), field: z.string() })
    .optional(),
});
export type SchemaField = z.infer<typeof SchemaFieldSchema>;

export const SchemaNodeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  x: z.number().default(0),
  y: z.number().default(0),
  fields: z.array(SchemaFieldSchema).default([]),
});
export type SchemaNode = z.infer<typeof SchemaNodeSchema>;

export const SchemaEdgeSchema = z.object({
  id: z.string().min(1),
  fromNodeId: z.string().min(1),
  fromField: z.string().min(1),
  toNodeId: z.string().min(1),
  toField: z.string().min(1),
  type: z
    .enum(["one-to-one", "one-to-many", "many-to-many"])
    .default("one-to-many"),
});
export type SchemaEdge = z.infer<typeof SchemaEdgeSchema>;

export const SchemaGraphSchema = z.object({
  nodes: z.array(SchemaNodeSchema).default([]),
  edges: z.array(SchemaEdgeSchema).default([]),
});
export type SchemaGraph = z.infer<typeof SchemaGraphSchema>;

// ---------------------------------------------------------------------------
// Directory Tree
// ---------------------------------------------------------------------------

export const TreeNodeSchema: z.ZodType<{
  name: string;
  type: "file" | "directory";
  children: unknown[];
  template?: string;
}> = z.object({
  name: z.string().min(1),
  type: z.enum(["file", "directory"]),
  children: z.lazy(() => z.array(TreeNodeSchema)).default([]),
  template: z.string().optional(),
});
export type TreeNode = z.infer<typeof TreeNodeSchema>;

export const DirectoryTreeSchema = z.object({
  root: TreeNodeSchema,
  metadata: z
    .object({
      generatedAt: z.string().optional(),
      template: z.string().optional(),
    })
    .default({}),
});
export type DirectoryTree = z.infer<typeof DirectoryTreeSchema>;
