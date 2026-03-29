import { z } from "zod";
import { prisma } from "@/server/db";
import { readArtifact, writeArtifact } from "./artifact-helpers";
import type { Prisma } from "@prisma/client";

/* ══════════════════════════════════════════════════════════════════════
   read_artifact — Read any project artifact
   ══════════════════════════════════════════════════════════════════════ */

export const readArtifactSchema = z.object({
  projectId: z.string().min(1),
  artifactPath: z.string().min(1).describe("e.g. ideas/ideas.json, kanban/board.json, schema/schema.graph.json, whiteboard/board.json, directory-tree/tree.plan.json"),
});

export async function executeReadArtifact(input: z.infer<typeof readArtifactSchema>) {
  const { projectId, artifactPath } = readArtifactSchema.parse(input);
  const content = await readArtifact(projectId, artifactPath);
  return { success: true, projectId, artifactPath, content, message: content ? `Read artifact ${artifactPath}` : `Artifact ${artifactPath} not found (empty)` };
}

/* ══════════════════════════════════════════════════════════════════════
   list_projects — List user's projects
   ══════════════════════════════════════════════════════════════════════ */

export const listProjectsSchema = z.object({});

export async function executeListProjects(_input: z.infer<typeof listProjectsSchema>, userId: string) {
  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    include: { project: { select: { id: true, name: true, slug: true, status: true, description: true, tags: true } } },
  });
  const projects = memberships.map((m) => ({ ...m.project, role: m.role }));
  return { success: true, projects, message: `Found ${projects.length} project(s).` };
}

/* ══════════════════════════════════════════════════════════════════════
   manage_project — Create or update a project
   ══════════════════════════════════════════════════════════════════════ */

export const manageProjectSchema = z.object({
  action: z.enum(["create", "update"]),
  projectId: z.string().optional().describe("Required for update"),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(["PLANNING", "ACTIVE", "PAUSED", "ARCHIVED"]).optional(),
  tags: z.array(z.string()).optional(),
});

export async function executeManageProject(input: z.infer<typeof manageProjectSchema>, userId: string) {
  const v = manageProjectSchema.parse(input);
  if (v.action === "create") {
    if (!v.name) throw new Error("name required for create");
    const slug = v.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now().toString(36).slice(-4);
    const project = await prisma.project.create({
      data: { name: v.name, slug, description: v.description || "", status: v.status || "PLANNING", tags: v.tags || [], members: { create: { userId, role: "OWNER" } } },
    });
    return { success: true, projectId: project.id, message: `Project "${v.name}" created.` };
  } else {
    if (!v.projectId) throw new Error("projectId required for update");
    const data: Prisma.ProjectUpdateInput = {};
    if (v.name) data.name = v.name;
    if (v.description !== undefined) data.description = v.description;
    if (v.status) data.status = v.status;
    if (v.tags) data.tags = v.tags;
    await prisma.project.update({ where: { id: v.projectId }, data });
    return { success: true, projectId: v.projectId, message: `Project updated.` };
  }
}

/* ══════════════════════════════════════════════════════════════════════
   update_ideas — Read/merge/write ideas artifact
   ══════════════════════════════════════════════════════════════════════ */

export const updateIdeasSchema = z.object({
  projectId: z.string().min(1),
  action: z.enum(["add", "edit", "delete"]),
  ideaId: z.string().optional().describe("Required for edit/delete"),
  title: z.string().max(200).optional().describe("The idea title"),
  body: z.string().max(2000).optional().describe("A detailed description of the idea. ALWAYS generate a relevant description based on the title — never leave empty."),
  category: z.string().optional().describe("Category like FEATURE, BUG FIX, RESEARCH, DESIGN, IMPROVEMENT. Interpret from context."),
  priority: z.enum(["low", "medium", "high"]).optional().describe("Priority level. Interpret from context — security/auth items are usually high."),
  tags: z.array(z.string()).optional().describe("Relevant tags. Always generate 2-4 tags based on the idea topic."),
});

export async function executeUpdateIdeas(input: z.infer<typeof updateIdeasSchema>, userId: string) {
  const v = updateIdeasSchema.parse(input);
  const path = "ideas/ideas.json";
  const existing = (await readArtifact(v.projectId, path) as { ideas?: Array<Record<string, unknown>> } | null) || { ideas: [] };
  const ideas: Array<Record<string, unknown>> = existing.ideas || [];
  const now = new Date().toISOString();

  if (v.action === "add") {
    if (!v.title) throw new Error("title required for add");
    const id = `idea-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    ideas.unshift({ id, title: v.title, body: v.body || "", tags: v.tags || [], category: v.category || "FEATURE", priority: v.priority || "medium", createdAt: now, modifiedAt: now });
    await writeArtifact(v.projectId, path, { ideas } as unknown as Prisma.InputJsonValue);
    return { success: true, ideaId: id, message: `Idea "${v.title}" added.` };
  } else if (v.action === "edit") {
    if (!v.ideaId) throw new Error("ideaId required for edit");
    const idx = ideas.findIndex((i) => i.id === v.ideaId);
    if (idx === -1) throw new Error("Idea not found");
    if (v.title) ideas[idx].title = v.title;
    if (v.body !== undefined) ideas[idx].body = v.body;
    if (v.category) ideas[idx].category = v.category;
    if (v.priority) ideas[idx].priority = v.priority;
    if (v.tags) ideas[idx].tags = v.tags;
    ideas[idx].modifiedAt = now;
    await writeArtifact(v.projectId, path, { ideas } as unknown as Prisma.InputJsonValue);
    return { success: true, ideaId: v.ideaId, message: `Idea updated.` };
  } else {
    if (!v.ideaId) throw new Error("ideaId required for delete");
    const filtered = ideas.filter((i) => i.id !== v.ideaId);
    await writeArtifact(v.projectId, path, { ideas: filtered } as unknown as Prisma.InputJsonValue);
    return { success: true, ideaId: v.ideaId, message: `Idea deleted.` };
  }
}

/* ══════════════════════════════════════════════════════════════════════
   update_kanban — Read/merge/write kanban artifact
   ══════════════════════════════════════════════════════════════════════ */

export const updateKanbanArtifactSchema = z.object({
  projectId: z.string().min(1),
  action: z.enum(["add_card", "move_card", "update_card", "delete_card", "add_column"]),
  cardId: z.string().optional(),
  column: z.string().optional().describe("Column name, e.g. TODO, IN PROGRESS, DONE"),
  title: z.string().optional(),
  description: z.string().optional(),
  labels: z.array(z.string()).optional(),
  columnName: z.string().optional().describe("For add_column action"),
});

export async function executeUpdateKanbanArtifact(input: z.infer<typeof updateKanbanArtifactSchema>, userId: string) {
  const v = updateKanbanArtifactSchema.parse(input);
  const path = "kanban/board.json";
  const existing = (await readArtifact(v.projectId, path) as { columns?: Array<{ name: string; cards: Array<Record<string, unknown>> }> } | null) || { columns: [{ name: "TODO", cards: [] }, { name: "IN PROGRESS", cards: [] }, { name: "DONE", cards: [] }] };
  const columns = existing.columns || [];
  const now = new Date().toISOString();

  if (v.action === "add_column") {
    if (!v.columnName) throw new Error("columnName required");
    columns.push({ name: v.columnName, cards: [] });
    await writeArtifact(v.projectId, path, { columns } as unknown as Prisma.InputJsonValue);
    return { success: true, message: `Column "${v.columnName}" added.` };
  }
  if (v.action === "add_card") {
    if (!v.title) throw new Error("title required");
    const col = columns.find((c) => c.name.toUpperCase() === (v.column || "TODO").toUpperCase()) || columns[0];
    if (!col) throw new Error("No columns exist");
    const id = `card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    col.cards.push({ id, title: v.title, description: v.description || "", labels: v.labels || [], createdAt: now });
    await writeArtifact(v.projectId, path, { columns } as unknown as Prisma.InputJsonValue);
    return { success: true, cardId: id, message: `Card "${v.title}" added to ${col.name}.` };
  }
  if (v.action === "move_card" && v.cardId && v.column) {
    let card: Record<string, unknown> | undefined;
    for (const col of columns) {
      const idx = col.cards.findIndex((c) => c.id === v.cardId);
      if (idx !== -1) { card = col.cards.splice(idx, 1)[0]; break; }
    }
    if (!card) throw new Error("Card not found");
    const targetCol = columns.find((c) => c.name.toUpperCase() === v.column!.toUpperCase());
    if (!targetCol) throw new Error("Target column not found");
    targetCol.cards.push(card);
    await writeArtifact(v.projectId, path, { columns } as unknown as Prisma.InputJsonValue);
    return { success: true, message: `Card moved to ${v.column}.` };
  }
  if (v.action === "delete_card" && v.cardId) {
    for (const col of columns) { col.cards = col.cards.filter((c) => c.id !== v.cardId); }
    await writeArtifact(v.projectId, path, { columns } as unknown as Prisma.InputJsonValue);
    return { success: true, message: `Card deleted.` };
  }
  throw new Error("Invalid action or missing parameters");
}

/* ══════════════════════════════════════════════════════════════════════
   update_schema — Read/merge/write schema artifact
   ══════════════════════════════════════════════════════════════════════ */

export const updateSchemaSchema = z.object({
  projectId: z.string().min(1),
  action: z.enum(["add_entity", "add_field", "add_relation", "add_enum", "delete_entity"]),
  entityName: z.string().optional(),
  entityId: z.string().optional(),
  fieldName: z.string().optional(),
  fieldType: z.string().optional(),
  isPK: z.boolean().optional(),
  isFK: z.boolean().optional(),
  required: z.boolean().optional(),
  fromEntity: z.string().optional(),
  toEntity: z.string().optional(),
  relationType: z.enum(["1:1", "1:N", "N:N"]).optional(),
  enumName: z.string().optional(),
  enumValues: z.array(z.string()).optional(),
});

export async function executeUpdateSchema(input: z.infer<typeof updateSchemaSchema>, userId: string) {
  const v = updateSchemaSchema.parse(input);
  const path = "schema/schema.graph.json";
  const existing = (await readArtifact(v.projectId, path) as { entities?: unknown[]; relations?: unknown[]; enumTypes?: unknown[] } | null) || { entities: [], relations: [], enumTypes: [] };
  const graph = { entities: (existing.entities || []) as Array<Record<string, unknown>>, relations: (existing.relations || []) as Array<Record<string, unknown>>, enumTypes: (existing.enumTypes || []) as Array<Record<string, unknown>> };
  const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  if (v.action === "add_entity") {
    if (!v.entityName) throw new Error("entityName required");
    const id = uid();
    const offset = graph.entities.length;
    graph.entities.push({ id, name: v.entityName.toUpperCase(), fields: [{ id: uid(), name: "id", type: "string", required: true, unique: true, isPK: true, isFK: false }], x: 40 + (offset % 3) * 340, y: 40 + Math.floor(offset / 3) * 300 });
    await writeArtifact(v.projectId, path, graph as unknown as Prisma.InputJsonValue);
    return { success: true, entityId: id, message: `Entity "${v.entityName}" added to schema.` };
  }
  if (v.action === "add_field") {
    if (!v.entityName || !v.fieldName) throw new Error("entityName and fieldName required");
    const entity = graph.entities.find((e) => (e.name as string).toUpperCase() === v.entityName!.toUpperCase()) as Record<string, unknown> | undefined;
    if (!entity) throw new Error(`Entity "${v.entityName}" not found`);
    const fields = entity.fields as Array<Record<string, unknown>>;
    fields.push({ id: uid(), name: v.fieldName, type: v.fieldType || "string", required: v.required !== false, unique: false, isPK: !!v.isPK, isFK: !!v.isFK });
    await writeArtifact(v.projectId, path, graph as unknown as Prisma.InputJsonValue);
    return { success: true, message: `Field "${v.fieldName}" added to ${v.entityName}.` };
  }
  if (v.action === "add_relation") {
    if (!v.fromEntity || !v.toEntity) throw new Error("fromEntity and toEntity required");
    const from = graph.entities.find((e) => (e.name as string).toUpperCase() === v.fromEntity!.toUpperCase());
    const to = graph.entities.find((e) => (e.name as string).toUpperCase() === v.toEntity!.toUpperCase());
    if (!from || !to) throw new Error("Entities not found");
    graph.relations.push({ id: uid(), fromEntityId: from.id, toEntityId: to.id, type: v.relationType || "1:N" });
    await writeArtifact(v.projectId, path, graph as unknown as Prisma.InputJsonValue);
    return { success: true, message: `Relation ${v.fromEntity} → ${v.toEntity} (${v.relationType || "1:N"}) added.` };
  }
  if (v.action === "add_enum") {
    if (!v.enumName || !v.enumValues?.length) throw new Error("enumName and enumValues required");
    graph.enumTypes.push({ id: uid(), name: v.enumName, values: v.enumValues });
    await writeArtifact(v.projectId, path, graph as unknown as Prisma.InputJsonValue);
    return { success: true, message: `Enum "${v.enumName}" added with values: ${v.enumValues.join(", ")}.` };
  }
  if (v.action === "delete_entity") {
    if (!v.entityName) throw new Error("entityName required");
    graph.entities = graph.entities.filter((e) => (e.name as string).toUpperCase() !== v.entityName!.toUpperCase());
    await writeArtifact(v.projectId, path, graph as unknown as Prisma.InputJsonValue);
    return { success: true, message: `Entity "${v.entityName}" deleted.` };
  }
  throw new Error("Invalid action");
}

/* ══════════════════════════════════════════════════════════════════════
   update_whiteboard — Add stickies to whiteboard artifact
   ══════════════════════════════════════════════════════════════════════ */

export const updateWhiteboardSchema = z.object({
  projectId: z.string().min(1),
  action: z.enum(["add_sticky"]),
  title: z.string().min(1),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  color: z.enum(["lemon", "watermelon", "malachite", "amethyst"]).optional(),
});

export async function executeUpdateWhiteboard(input: z.infer<typeof updateWhiteboardSchema>) {
  const v = updateWhiteboardSchema.parse(input);
  const path = "whiteboard/board.json";
  const existing = (await readArtifact(v.projectId, path) as { stickies?: unknown[] } | null) || { stickies: [] };
  const stickies = (existing.stickies || []) as Array<Record<string, unknown>>;
  const uid = () => `sticky-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const colorMap: Record<string, { bg: string; border: string }> = { lemon: { bg: "#FFE459", border: "#E6CD00" }, watermelon: { bg: "#FF5E54", border: "#CC4B43" }, malachite: { bg: "#2BBF5D", border: "#229A4A" }, amethyst: { bg: "#A259FF", border: "#8247CC" } };
  const c = colorMap[v.color || "lemon"] || colorMap.lemon;

  stickies.push({ id: uid(), title: v.title, description: v.description || "", tags: v.tags || [], color: v.color || "lemon", bgColor: c.bg, borderColor: c.border, x: 100 + Math.random() * 400, y: 100 + Math.random() * 300, width: 180, height: 0 });
  await writeArtifact(v.projectId, path, { ...existing, stickies } as unknown as Prisma.InputJsonValue);
  return { success: true, message: `Sticky note "${v.title}" added to whiteboard.` };
}

/* ══════════════════════════════════════════════════════════════════════
   update_directory_tree — Add/remove nodes in directory tree
   ══════════════════════════════════════════════════════════════════════ */

export const updateDirectoryTreeSchema = z.object({
  projectId: z.string().min(1),
  action: z.enum(["add_node", "delete_node"]),
  nodeName: z.string().min(1),
  nodeType: z.enum(["folder", "file"]).optional(),
  parentPath: z.string().optional().describe("e.g. src/components — adds under this folder"),
});

export async function executeUpdateDirectoryTree(input: z.infer<typeof updateDirectoryTreeSchema>) {
  const v = updateDirectoryTreeSchema.parse(input);
  const path = "directory-tree/tree.plan.json";
  const existing = (await readArtifact(v.projectId, path) as { tree?: unknown[] } | null) || { tree: [] };
  const tree = (existing.tree || []) as Array<Record<string, unknown>>;
  const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  if (v.action === "add_node") {
    const newNode: Record<string, unknown> = { id: uid(), name: v.nodeName, type: v.nodeType || "file" };
    if (v.nodeType === "folder") newNode.children = [];

    if (v.parentPath) {
      const parts = v.parentPath.split("/");
      let current = tree;
      for (const part of parts) {
        const found = current.find((n) => n.name === part && n.type === "folder") as Record<string, unknown> | undefined;
        if (found) { current = (found.children || []) as Array<Record<string, unknown>>; }
        else break;
      }
      current.push(newNode);
    } else {
      tree.push(newNode);
    }
    await writeArtifact(v.projectId, path, { ...existing, tree } as unknown as Prisma.InputJsonValue);
    return { success: true, message: `Node "${v.nodeName}" added to directory tree.` };
  }

  // delete_node: find and remove by name recursively
  function removeNode(nodes: Array<Record<string, unknown>>, name: string): boolean {
    const idx = nodes.findIndex((n) => n.name === name);
    if (idx !== -1) { nodes.splice(idx, 1); return true; }
    for (const n of nodes) {
      if (n.children && removeNode(n.children as Array<Record<string, unknown>>, name)) return true;
    }
    return false;
  }
  removeNode(tree, v.nodeName);
  await writeArtifact(v.projectId, path, { ...existing, tree } as unknown as Prisma.InputJsonValue);
  return { success: true, message: `Node "${v.nodeName}" removed from directory tree.` };
}
