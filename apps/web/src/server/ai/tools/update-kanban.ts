import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { auditLog } from "@/server/audit";

export const updateKanbanSchema = z.object({
  projectId: z.string().min(1, "projectId is required"),
  cardId: z.string().optional(),
  action: z.enum(["add", "move", "update", "delete"]),
  data: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    column: z.string().optional(),
    position: z.number().optional(),
    assignee: z.string().optional(),
    labels: z.array(z.string()).optional(),
  }),
});

export type UpdateKanbanInput = z.infer<typeof updateKanbanSchema>;

export interface UpdateKanbanResult {
  success: boolean;
  id: string;
  action: string;
  projectId: string;
  message: string;
}

/**
 * Tool handler: update_kanban
 * Modifies kanban board state and persists as an AiToolOutput record.
 * In Phase 6 this will write to the proper Kanban tables.
 */
export async function executeUpdateKanban(
  input: UpdateKanbanInput,
  userId: string,
  sessionId?: string
): Promise<UpdateKanbanResult> {
  const validated = updateKanbanSchema.parse(input);

  // For delete/move/update actions, cardId is required
  if (["move", "update", "delete"].includes(validated.action) && !validated.cardId) {
    throw new Error(`cardId is required for "${validated.action}" action`);
  }

  const record = await prisma.aiToolOutput.create({
    data: {
      userId,
      sessionId: sessionId ?? null,
      toolName: "update_kanban",
      projectId: validated.projectId,
      input: validated as unknown as Prisma.InputJsonValue,
      output: {
        action: validated.action,
        cardId: validated.cardId ?? null,
        data: validated.data,
        appliedAt: new Date().toISOString(),
      } as Prisma.InputJsonValue,
    },
  });

  await auditLog({
    actorUserId: userId,
    action: `ai_tool.update_kanban.${validated.action}`,
    targetType: "AiToolOutput",
    targetId: record.id,
    metadata: {
      projectId: validated.projectId,
      cardId: validated.cardId,
      kanbanAction: validated.action,
      data: validated.data,
      sessionId,
    },
  });

  const actionLabels: Record<string, string> = {
    add: "Card added",
    move: "Card moved",
    update: "Card updated",
    delete: "Card deleted",
  };

  return {
    success: true,
    id: record.id,
    action: validated.action,
    projectId: validated.projectId,
    message: `${actionLabels[validated.action]} successfully in project ${validated.projectId}.`,
  };
}
