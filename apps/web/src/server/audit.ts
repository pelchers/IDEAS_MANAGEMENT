import { prisma } from "./db";

export async function auditLog(args: {
  actorUserId?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId: args.actorUserId ?? null,
      action: args.action,
      targetType: args.targetType ?? null,
      targetId: args.targetId ?? null,
      ip: args.ip ?? null,
      userAgent: args.userAgent ?? null,
      metadata: args.metadata as any
    }
  });
}

