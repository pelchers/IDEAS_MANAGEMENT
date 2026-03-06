import { prisma } from "../db";

/**
 * Create a snapshot of an artifact's state before a merge or resolution.
 * Used for rollback and auditing purposes.
 */
export async function createSnapshot(
  projectId: string,
  artifactPath: string,
  content: unknown,
  revision: number,
  reason: string = "pre-merge"
): Promise<string> {
  const snapshot = await prisma.syncSnapshot.create({
    data: {
      projectId,
      artifactPath,
      content: content as any,
      revision,
      reason,
    },
  });

  return snapshot.id;
}
