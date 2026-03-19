import { prisma } from "@/server/db";
import type { Prisma } from "@prisma/client";

/**
 * Read a project artifact by path. Returns the content JSON or null.
 */
export async function readArtifact(projectId: string, artifactPath: string): Promise<Prisma.JsonValue | null> {
  const artifact = await prisma.projectArtifact.findUnique({
    where: { projectId_artifactPath: { projectId, artifactPath } },
  });
  return artifact?.content ?? null;
}

/**
 * Write (upsert) a project artifact. Increments revision on update.
 */
export async function writeArtifact(projectId: string, artifactPath: string, content: Prisma.InputJsonValue): Promise<void> {
  await prisma.projectArtifact.upsert({
    where: { projectId_artifactPath: { projectId, artifactPath } },
    create: { projectId, artifactPath, content, revision: 1 },
    update: { content, revision: { increment: 1 } },
  });
}
