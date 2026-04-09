import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { checkProjectAccess } from "@/server/projects/helpers";
import { createSnapshot } from "@/server/sync/snapshot";
import { validateBody, isValidationError } from "@/server/api-validation";

const ForceSyncSchema = z.object({
  projectId: z.string().min(1),
  direction: z.enum(["push", "pull"]),
  artifactPath: z.string().optional(),
  content: z.unknown().optional(),
});

/**
 * POST /api/sync/force
 * Force push or pull for a project artifact. Requires OWNER role.
 * Body: { projectId, direction: "push" | "pull", artifactPath?, content? }
 */
export async function POST(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  const parsed = await validateBody(req, ForceSyncSchema);
  if (isValidationError(parsed)) return parsed;

  const access = await checkProjectAccess(parsed.projectId, user, "OWNER");
  if (!access) {
    return NextResponse.json(
      { ok: false, error: "forbidden" },
      { status: 403 }
    );
  }

  if (parsed.direction === "push") {
    // Force push: overwrite server artifact with provided content
    if (!parsed.artifactPath || parsed.content === undefined) {
      return NextResponse.json(
        { ok: false, error: "artifactPath_and_content_required_for_push" },
        { status: 400 }
      );
    }

    // Snapshot before overwrite
    const existing = await prisma.projectArtifact.findUnique({
      where: {
        projectId_artifactPath: {
          projectId: parsed.projectId,
          artifactPath: parsed.artifactPath,
        },
      },
    });

    if (existing) {
      await createSnapshot(
        parsed.projectId,
        parsed.artifactPath,
        existing.content,
        existing.revision,
        "pre-force-push"
      );
    }

    const newRevision = (existing?.revision ?? 0) + 1;

    const artifact = await prisma.projectArtifact.upsert({
      where: {
        projectId_artifactPath: {
          projectId: parsed.projectId,
          artifactPath: parsed.artifactPath,
        },
      },
      create: {
        projectId: parsed.projectId,
        artifactPath: parsed.artifactPath,
        content: parsed.content as any,
        revision: 1,
      },
      update: {
        content: parsed.content as any,
        revision: newRevision,
      },
    });

    return NextResponse.json({
      ok: true,
      direction: "push",
      artifact: {
        artifactPath: artifact.artifactPath,
        revision: artifact.revision,
      },
    });
  }

  // Force pull: return current server artifact for client to overwrite local
  if (parsed.artifactPath) {
    // Single artifact
    const artifact = await prisma.projectArtifact.findUnique({
      where: {
        projectId_artifactPath: {
          projectId: parsed.projectId,
          artifactPath: parsed.artifactPath,
        },
      },
    });

    if (!artifact) {
      return NextResponse.json(
        { ok: false, error: "artifact_not_found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      direction: "pull",
      artifacts: [
        {
          artifactPath: artifact.artifactPath,
          content: artifact.content,
          revision: artifact.revision,
        },
      ],
    });
  }

  // All artifacts for the project
  const artifacts = await prisma.projectArtifact.findMany({
    where: { projectId: parsed.projectId },
    select: {
      artifactPath: true,
      content: true,
      revision: true,
    },
  });

  return NextResponse.json({
    ok: true,
    direction: "pull",
    artifacts,
  });
}
