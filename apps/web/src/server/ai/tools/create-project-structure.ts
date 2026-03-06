import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { auditLog } from "@/server/audit";

export const createProjectStructureSchema = z.object({
  projectId: z.string().min(1, "projectId is required"),
  name: z.string().min(1, "project name is required").max(100),
  template: z.enum(["blank", "web-app", "mobile-app", "api", "library"]).optional().default("blank"),
});

export type CreateProjectStructureInput = z.infer<typeof createProjectStructureSchema>;

export interface CreateProjectStructureResult {
  success: boolean;
  id: string;
  projectId: string;
  name: string;
  template: string;
  folders: string[];
  message: string;
}

/**
 * Template definitions for project scaffolding.
 * Each template defines the default folder/file structure.
 */
const TEMPLATES: Record<string, string[]> = {
  blank: [
    "ideas/",
    "kanban/",
    "docs/",
  ],
  "web-app": [
    "src/",
    "src/components/",
    "src/pages/",
    "src/styles/",
    "src/utils/",
    "public/",
    "ideas/",
    "kanban/",
    "docs/",
    "tests/",
  ],
  "mobile-app": [
    "src/",
    "src/screens/",
    "src/components/",
    "src/navigation/",
    "src/services/",
    "assets/",
    "ideas/",
    "kanban/",
    "docs/",
    "tests/",
  ],
  api: [
    "src/",
    "src/routes/",
    "src/middleware/",
    "src/models/",
    "src/services/",
    "src/utils/",
    "ideas/",
    "kanban/",
    "docs/",
    "tests/",
  ],
  library: [
    "src/",
    "src/lib/",
    "src/types/",
    "examples/",
    "ideas/",
    "kanban/",
    "docs/",
    "tests/",
  ],
};

/**
 * Tool handler: create_project_structure
 * Scaffolds default project folders/files and persists as an AiToolOutput record.
 * In Phase 5+ this will create actual files and folders.
 */
export async function executeCreateProjectStructure(
  input: CreateProjectStructureInput,
  userId: string,
  sessionId?: string
): Promise<CreateProjectStructureResult> {
  const validated = createProjectStructureSchema.parse(input);
  const folders = TEMPLATES[validated.template] ?? TEMPLATES.blank;

  const record = await prisma.aiToolOutput.create({
    data: {
      userId,
      sessionId: sessionId ?? null,
      toolName: "create_project_structure",
      projectId: validated.projectId,
      input: validated as unknown as Prisma.InputJsonValue,
      output: {
        name: validated.name,
        template: validated.template,
        folders,
        scaffoldedAt: new Date().toISOString(),
      } as Prisma.InputJsonValue,
    },
  });

  await auditLog({
    actorUserId: userId,
    action: "ai_tool.create_project_structure",
    targetType: "AiToolOutput",
    targetId: record.id,
    metadata: {
      projectId: validated.projectId,
      name: validated.name,
      template: validated.template,
      folderCount: folders.length,
      sessionId,
    },
  });

  return {
    success: true,
    id: record.id,
    projectId: validated.projectId,
    name: validated.name,
    template: validated.template,
    folders,
    message: `Project structure "${validated.name}" scaffolded with ${folders.length} folders using the "${validated.template}" template.`,
  };
}
