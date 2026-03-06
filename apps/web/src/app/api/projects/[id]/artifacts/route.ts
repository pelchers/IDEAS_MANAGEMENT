import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { checkProjectAccess } from "@/server/projects/helpers";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]/artifacts
 * List all artifacts for a project with paths and revisions.
 */
export async function GET(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id: projectId } = await params;

  const access = await checkProjectAccess(projectId, user);
  if (!access) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 }
    );
  }

  const artifacts = await prisma.projectArtifact.findMany({
    where: { projectId },
    select: {
      id: true,
      artifactPath: true,
      revision: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { artifactPath: "asc" },
  });

  return NextResponse.json({ ok: true, artifacts });
}
