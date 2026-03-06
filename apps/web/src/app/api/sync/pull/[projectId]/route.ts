import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { checkProjectAccess } from "@/server/projects/helpers";

type RouteParams = { params: Promise<{ projectId: string }> };

/**
 * GET /api/sync/pull/[projectId]
 * Pull remote changes for a project since a given revision.
 * Query param: ?since=<revision> (last known revision, defaults to 0)
 */
export async function GET(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { projectId } = await params;

  const access = await checkProjectAccess(projectId, user);
  if (!access) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 }
    );
  }

  const url = new URL(req.url);
  const sinceParam = url.searchParams.get("since");
  const sinceRevision = sinceParam ? parseInt(sinceParam, 10) : 0;

  // Get all applied operations since the specified revision
  const operations = await prisma.syncOperation.findMany({
    where: {
      projectId,
      status: "applied",
      baseRevision: { gte: sinceRevision },
    },
    orderBy: { createdAt: "asc" },
    select: {
      operationId: true,
      artifactPath: true,
      baseRevision: true,
      payload: true,
      userId: true,
      createdAt: true,
    },
  });

  // Get current artifact states
  const artifacts = await prisma.projectArtifact.findMany({
    where: { projectId },
    select: {
      artifactPath: true,
      content: true,
      revision: true,
      updatedAt: true,
    },
  });

  // Get pending conflicts for this user
  const pendingConflicts = await prisma.syncOperation.findMany({
    where: {
      projectId,
      userId: user.id,
      status: "conflict",
    },
    select: {
      id: true,
      operationId: true,
      artifactPath: true,
      baseRevision: true,
      payload: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    ok: true,
    operations,
    artifacts: artifacts.map((a) => ({
      artifactPath: a.artifactPath,
      content: a.content,
      revision: a.revision,
      updatedAt: a.updatedAt,
    })),
    conflicts: pendingConflicts,
  });
}
