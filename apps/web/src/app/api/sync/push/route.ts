import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { SyncOpSchema } from "@idea-management/schemas";
import { checkProjectAccess } from "@/server/projects/helpers";
import { canAutoMerge, autoMergeAppendOnly } from "@/server/sync/merge";
import { createSnapshot } from "@/server/sync/snapshot";

/**
 * POST /api/sync/push
 * Accept a batch of sync operations from the client.
 * For each operation: validate, check membership, check revision, apply or conflict.
 */
export async function POST(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  let body: { operations?: unknown[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_body" },
      { status: 400 }
    );
  }

  if (!Array.isArray(body.operations) || body.operations.length === 0) {
    return NextResponse.json(
      { ok: false, error: "operations_required" },
      { status: 400 }
    );
  }

  const applied: string[] = [];
  const conflicts: Array<{
    operationId: string;
    currentRevision: number;
    artifactContent: unknown;
  }> = [];
  const errors: Array<{ index: number; error: string }> = [];

  for (let i = 0; i < body.operations.length; i++) {
    const rawOp = body.operations[i];

    // Validate with SyncOpSchema
    const parsed = SyncOpSchema.safeParse(rawOp);
    if (!parsed.success) {
      errors.push({ index: i, error: "invalid_operation" });
      continue;
    }

    const op = parsed.data;

    // Check membership
    const access = await checkProjectAccess(op.projectId, user, "EDITOR");
    if (!access) {
      errors.push({ index: i, error: "forbidden" });
      continue;
    }

    // Get current artifact state
    const artifact = await prisma.projectArtifact.findUnique({
      where: {
        projectId_artifactPath: {
          projectId: op.projectId,
          artifactPath: op.artifactPath,
        },
      },
    });

    const currentRevision = artifact?.revision ?? 0;

    if (op.baseRevision === currentRevision) {
      // Revision matches — apply the operation
      const newRevision = currentRevision + 1;

      await prisma.projectArtifact.upsert({
        where: {
          projectId_artifactPath: {
            projectId: op.projectId,
            artifactPath: op.artifactPath,
          },
        },
        create: {
          projectId: op.projectId,
          artifactPath: op.artifactPath,
          content: op.payload as any,
          revision: 1,
        },
        update: {
          content: op.payload as any,
          revision: newRevision,
        },
      });

      await prisma.syncOperation.create({
        data: {
          operationId: op.operationId,
          projectId: op.projectId,
          userId: user.id,
          artifactPath: op.artifactPath,
          baseRevision: op.baseRevision,
          payload: op.payload as any,
          status: "applied",
        },
      });

      applied.push(op.operationId);
    } else if (canAutoMerge(op.artifactPath) && artifact) {
      // Auto-merge for append-only artifacts
      await createSnapshot(
        op.projectId,
        op.artifactPath,
        artifact.content,
        artifact.revision,
        "pre-auto-merge"
      );

      const merged = autoMergeAppendOnly(op.payload, artifact.content);
      const newRevision = currentRevision + 1;

      await prisma.projectArtifact.update({
        where: {
          projectId_artifactPath: {
            projectId: op.projectId,
            artifactPath: op.artifactPath,
          },
        },
        data: {
          content: merged as any,
          revision: newRevision,
        },
      });

      await prisma.syncOperation.create({
        data: {
          operationId: op.operationId,
          projectId: op.projectId,
          userId: user.id,
          artifactPath: op.artifactPath,
          baseRevision: op.baseRevision,
          payload: op.payload as any,
          status: "applied",
        },
      });

      applied.push(op.operationId);
    } else {
      // Revision mismatch — conflict
      await prisma.syncOperation.create({
        data: {
          operationId: op.operationId,
          projectId: op.projectId,
          userId: user.id,
          artifactPath: op.artifactPath,
          baseRevision: op.baseRevision,
          payload: op.payload as any,
          status: "conflict",
        },
      });

      conflicts.push({
        operationId: op.operationId,
        currentRevision,
        artifactContent: artifact?.content ?? null,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    applied,
    conflicts,
    errors,
  });
}
