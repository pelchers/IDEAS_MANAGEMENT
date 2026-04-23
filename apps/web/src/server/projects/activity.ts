import { prisma } from "@/server/db";
import { Prisma } from "@/generated/prisma";

/**
 * Log a project activity event.
 */
export async function logProjectActivity(opts: {
  projectId: string;
  actorId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.projectActivity.create({
    data: {
      projectId: opts.projectId,
      actorId: opts.actorId,
      action: opts.action,
      targetType: opts.targetType ?? null,
      targetId: opts.targetId ?? null,
      metadata: opts.metadata ? (opts.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
    },
  });
}
