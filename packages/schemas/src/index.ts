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
