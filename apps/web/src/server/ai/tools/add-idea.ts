import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { auditLog } from "@/server/audit";

export const addIdeaSchema = z.object({
  projectId: z.string().min(1, "projectId is required"),
  title: z.string().min(1, "title is required").max(200),
  description: z.string().max(2000).optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  priority: z.enum(["low", "medium", "high", "critical"]).optional().default("medium"),
});

export type AddIdeaInput = z.infer<typeof addIdeaSchema>;

export interface AddIdeaResult {
  success: boolean;
  id: string;
  title: string;
  projectId: string;
  message: string;
}

/**
 * Tool handler: add_idea
 * Creates a new idea and persists it as an AiToolOutput record.
 * In Phase 5+ this will write to the proper Ideas table.
 */
export async function executeAddIdea(
  input: AddIdeaInput,
  userId: string,
  sessionId?: string
): Promise<AddIdeaResult> {
  const validated = addIdeaSchema.parse(input);

  const record = await prisma.aiToolOutput.create({
    data: {
      userId,
      sessionId: sessionId ?? null,
      toolName: "add_idea",
      projectId: validated.projectId,
      input: validated as unknown as Prisma.InputJsonValue,
      output: {
        title: validated.title,
        description: validated.description,
        tags: validated.tags,
        priority: validated.priority,
        status: "new",
        createdAt: new Date().toISOString(),
      } as Prisma.InputJsonValue,
    },
  });

  await auditLog({
    actorUserId: userId,
    action: "ai_tool.add_idea",
    targetType: "AiToolOutput",
    targetId: record.id,
    metadata: {
      projectId: validated.projectId,
      title: validated.title,
      tags: validated.tags,
      priority: validated.priority,
      sessionId,
    },
  });

  return {
    success: true,
    id: record.id,
    title: validated.title,
    projectId: validated.projectId,
    message: `Idea "${validated.title}" added successfully to project ${validated.projectId}.`,
  };
}
