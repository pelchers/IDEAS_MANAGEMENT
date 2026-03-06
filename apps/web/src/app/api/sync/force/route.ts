import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { checkProjectAccess } from "@/server/projects/helpers";
import { createSnapshot } from "@/server/sync/snapshot";

/**
 * POST /api/sync/force
 * Force push or pull for a project artifact. Requires OWNER role.
 * Body: { projectId, direction: "push" | "pull", artifactPath?, content? }
 */
export async function POST(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  let body: {
    projectId?: string;
    direction?: string;
    artifactPath?: string;
    content?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_body" },
      { status: 400 }
    );
  }

  if (!body.projectId || !body.direction) {
    return NextResponse.json(
      { ok: false, error: "projectId_and_direction_required" },
      { status: 400 }
    );
  }

  if (body.direction !== "push" && body.direction !== "pull") {
    return NextResponse.json(
      { ok: false, error: "direction_must_be_push_or_pull" },
      { status: 400 }
    );
  }

  const access = await checkProjectAccess(body.projectId, user, "OWNER");
  if (!access) {
    return NextResponse.json(
      { ok: false, error: "forbidden" },
      { status: 403 }
    );
  }

  if (body.direction === "push") {
    // Force push: overwrite server artifact with provided content
    if (!body.artifactPath || body.content === undefined) {
      return NextResponse.json(
        { ok: false, error: "artifactPath_and_content_required_for_push" },
        { status: 400 }
      );
    }

    // Snapshot before overwrite
    const existing = await prisma.projectArtifact.findUnique({
      where: {
        projectId_artifactPath: {
          projectId: body.projectId,
          artifactPath: body.artifactPath,
        },
      },
    });

    if (existing) {
      await createSnapshot(
        body.projectId,
        body.artifactPath,
        existing.content,
        existing.revision,
        "pre-force-push"
      );
    }

    const newRevision = (existing?.revision ?? 0) + 1;

    const artifact = await prisma.projectArtifact.upsert({
      where: {
        projectId_artifactPath: {
          projectId: body.projectId,
          artifactPath: body.artifactPath,
        },
      },
      create: {
        projectId: body.projectId,
        artifactPath: body.artifactPath,
        content: body.content as any,
        revision: 1,
      },
      update: {
        content: body.content as any,
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
  if (body.artifactPath) {
    // Single artifact
    const artifact = await prisma.projectArtifact.findUnique({
      where: {
        projectId_artifactPath: {
          projectId: body.projectId,
          artifactPath: body.artifactPath,
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
    where: { projectId: body.projectId },
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
