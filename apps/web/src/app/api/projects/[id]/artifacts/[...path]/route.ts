import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { auditLog } from "@/server/audit";
import { checkProjectAccess } from "@/server/projects/helpers";

type RouteParams = { params: Promise<{ id: string; path: string[] }> };

/**
 * GET /api/projects/[id]/artifacts/[...path]
 * Return artifact content by path.
 */
export async function GET(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id: projectId, path: pathSegments } = await params;
  const artifactPath = pathSegments.join("/");

  const access = await checkProjectAccess(projectId, user);
  if (!access) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 }
    );
  }

  const artifact = await prisma.projectArtifact.findUnique({
    where: { projectId_artifactPath: { projectId, artifactPath } },
  });

  if (!artifact) {
    return NextResponse.json(
      { ok: false, error: "artifact_not_found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    artifact: {
      id: artifact.id,
      artifactPath: artifact.artifactPath,
      content: artifact.content,
      revision: artifact.revision,
      createdAt: artifact.createdAt,
      updatedAt: artifact.updatedAt,
    },
  });
}

/**
 * PUT /api/projects/[id]/artifacts/[...path]
 * Upsert artifact content and increment revision.
 */
export async function PUT(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id: projectId, path: pathSegments } = await params;
  const artifactPath = pathSegments.join("/");

  const access = await checkProjectAccess(projectId, user, "EDITOR");
  if (!access) {
    return NextResponse.json(
      { ok: false, error: "forbidden" },
      { status: 403 }
    );
  }

  let body: { content?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_body" },
      { status: 400 }
    );
  }

  if (body.content === undefined) {
    return NextResponse.json(
      { ok: false, error: "content_required" },
      { status: 400 }
    );
  }

  // Check if artifact already exists to determine revision
  const existing = await prisma.projectArtifact.findUnique({
    where: { projectId_artifactPath: { projectId, artifactPath } },
  });

  const newRevision = existing ? existing.revision + 1 : 1;

  const artifact = await prisma.projectArtifact.upsert({
    where: { projectId_artifactPath: { projectId, artifactPath } },
    create: {
      projectId,
      artifactPath,
      content: body.content as any,
      revision: 1,
    },
    update: {
      content: body.content as any,
      revision: newRevision,
    },
  });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;

  await auditLog({
    actorUserId: user.id,
    action: "artifact.updated",
    targetType: "ProjectArtifact",
    targetId: artifact.id,
    ip,
    userAgent,
    metadata: { projectId, artifactPath, revision: artifact.revision },
  });

  return NextResponse.json({
    ok: true,
    artifact: {
      id: artifact.id,
      artifactPath: artifact.artifactPath,
      content: artifact.content,
      revision: artifact.revision,
      createdAt: artifact.createdAt,
      updatedAt: artifact.updatedAt,
    },
  });
}
