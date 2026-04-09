import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { createSnapshot } from "@/server/sync/snapshot";
import { validateBody, isValidationError } from "@/server/api-validation";

const ResolveConflictSchema = z.object({
  resolution: z.enum(["keep-local", "keep-remote", "merged"]),
  mergedContent: z.unknown().optional(),
});

type RouteParams = { params: Promise<{ operationId: string }> };

/**
 * POST /api/sync/resolve/[operationId]
 * Resolve a conflict for a sync operation.
 * Body: { resolution: "keep-local" | "keep-remote" | "merged", mergedContent?: any }
 */
export async function POST(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { operationId } = await params;

  const parsed = await validateBody(req, ResolveConflictSchema);
  if (isValidationError(parsed)) return parsed;

  // Find the conflicting operation
  const operation = await prisma.syncOperation.findUnique({
    where: { operationId },
  });

  if (!operation) {
    return NextResponse.json(
      { ok: false, error: "operation_not_found" },
      { status: 404 }
    );
  }

  if (operation.status !== "conflict") {
    return NextResponse.json(
      { ok: false, error: "operation_not_in_conflict" },
      { status: 400 }
    );
  }

  // Verify user has access (must be the operation's user or admin)
  if (operation.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json(
      { ok: false, error: "forbidden" },
      { status: 403 }
    );
  }

  // Get current artifact
  const artifact = await prisma.projectArtifact.findUnique({
    where: {
      projectId_artifactPath: {
        projectId: operation.projectId,
        artifactPath: operation.artifactPath,
      },
    },
  });

  // Create snapshot before resolution
  if (artifact) {
    await createSnapshot(
      operation.projectId,
      operation.artifactPath,
      artifact.content,
      artifact.revision,
      "pre-resolution"
    );
  }

  let newContent: unknown;
  switch (parsed.resolution) {
    case "keep-local":
      newContent = operation.payload;
      break;
    case "keep-remote":
      newContent = artifact?.content ?? {};
      break;
    case "merged":
      if (parsed.mergedContent === undefined) {
        return NextResponse.json(
          { ok: false, error: "merged_content_required" },
          { status: 400 }
        );
      }
      newContent = parsed.mergedContent;
      break;
  }

  const newRevision = (artifact?.revision ?? 0) + 1;

  // Update the artifact
  await prisma.projectArtifact.upsert({
    where: {
      projectId_artifactPath: {
        projectId: operation.projectId,
        artifactPath: operation.artifactPath,
      },
    },
    create: {
      projectId: operation.projectId,
      artifactPath: operation.artifactPath,
      content: newContent as any,
      revision: 1,
    },
    update: {
      content: newContent as any,
      revision: newRevision,
    },
  });

  // Mark operation as resolved
  await prisma.syncOperation.update({
    where: { operationId },
    data: { status: "resolved" },
  });

  return NextResponse.json({
    ok: true,
    resolution: parsed.resolution,
    newRevision,
  });
}
