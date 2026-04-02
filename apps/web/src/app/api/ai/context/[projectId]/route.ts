import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";

/**
 * GET /api/ai/context/[projectId]
 * Returns project artifacts needed for the system prompt.
 * Used by the browser-side Ollama chat to build context without server-side inference.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;

  const { projectId } = await params;
  if (!projectId) {
    return NextResponse.json({ ok: false, error: "projectId required" }, { status: 400 });
  }

  try {
    // Get project info
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true, description: true, status: true, tags: true },
    });

    if (!project) {
      return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
    }

    // Get key artifacts for context injection
    const artifacts = await prisma.projectArtifact.findMany({
      where: {
        projectId,
        artifactPath: {
          in: [
            "ideas/ideas.json",
            "kanban/board.json",
            "schema/schema.graph.json",
            "whiteboard/board.json",
            "directory-tree/tree.plan.json",
          ],
        },
      },
      select: { artifactPath: true, content: true },
    });

    // Build context summary (capped to avoid huge payloads)
    const contextParts: string[] = [];

    for (const a of artifacts) {
      const c = a.content as Record<string, unknown> | null;
      if (!c) continue;

      if (a.artifactPath === "ideas/ideas.json" && Array.isArray(c.ideas)) {
        const ideas = c.ideas as Array<{ title?: string }>;
        contextParts.push(
          `Ideas (${ideas.length}): ${ideas.slice(0, 5).map((i) => i.title || "Untitled").join(", ")}${ideas.length > 5 ? "..." : ""}`,
        );
      }
      if (a.artifactPath === "kanban/board.json" && Array.isArray(c.columns)) {
        const cols = c.columns as Array<{ name?: string; cards?: unknown[] }>;
        contextParts.push(
          `Kanban: ${cols.map((col) => `${col.name || "?"} (${(col.cards || []).length} cards)`).join(", ")}`,
        );
      }
      if (a.artifactPath === "schema/schema.graph.json" && Array.isArray(c.entities)) {
        const ents = c.entities as Array<{ name?: string; fields?: unknown[] }>;
        contextParts.push(
          `Schema: ${ents.map((e) => `${e.name || "?"} (${(e.fields || []).length} fields)`).join(", ")}`,
        );
      }
    }

    return NextResponse.json({
      ok: true,
      project: {
        id: projectId,
        name: project.name,
        description: project.description,
        status: project.status,
        tags: project.tags,
      },
      contextSummary: contextParts.join("\n"),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Context fetch failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
