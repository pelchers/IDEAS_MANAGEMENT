import { z } from "zod";
import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/server/db";
import { auditLog } from "@/server/audit";

const treeNodeSchema: z.ZodType<TreeNode> = z.lazy(() =>
  z.object({
    name: z.string().min(1),
    type: z.enum(["file", "directory"]),
    children: z.array(treeNodeSchema).optional(),
    description: z.string().optional(),
  })
);

interface TreeNode {
  name: string;
  type: "file" | "directory";
  children?: TreeNode[];
  description?: string;
}

export const generateTreeSchema = z.object({
  projectId: z.string().min(1, "projectId is required"),
  structure: treeNodeSchema,
});

export type GenerateTreeInput = z.infer<typeof generateTreeSchema>;

export interface GenerateTreeResult {
  success: boolean;
  id: string;
  projectId: string;
  nodeCount: number;
  message: string;
}

function countNodes(node: TreeNode): number {
  let count = 1;
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child);
    }
  }
  return count;
}

/**
 * Tool handler: generate_tree
 * Creates/updates a directory tree plan and persists as an AiToolOutput record.
 * In Phase 5+ this will write to the actual project file structure.
 */
export async function executeGenerateTree(
  input: GenerateTreeInput,
  userId: string,
  sessionId?: string
): Promise<GenerateTreeResult> {
  const validated = generateTreeSchema.parse(input);
  const nodeCount = countNodes(validated.structure);

  const record = await prisma.aiToolOutput.create({
    data: {
      userId,
      sessionId: sessionId ?? null,
      toolName: "generate_tree",
      projectId: validated.projectId,
      input: validated as unknown as Prisma.InputJsonValue,
      output: {
        structure: validated.structure,
        nodeCount,
        generatedAt: new Date().toISOString(),
      } as unknown as Prisma.InputJsonValue,
    },
  });

  await auditLog({
    actorUserId: userId,
    action: "ai_tool.generate_tree",
    targetType: "AiToolOutput",
    targetId: record.id,
    metadata: {
      projectId: validated.projectId,
      nodeCount,
      rootName: validated.structure.name,
      sessionId,
    },
  });

  return {
    success: true,
    id: record.id,
    projectId: validated.projectId,
    nodeCount,
    message: `Directory tree generated with ${nodeCount} nodes for project ${validated.projectId}.`,
  };
}
