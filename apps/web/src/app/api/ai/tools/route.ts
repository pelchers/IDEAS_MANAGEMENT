import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import {
  readArtifactSchema, executeReadArtifact,
  listProjectsSchema, executeListProjects,
  manageProjectSchema, executeManageProject,
  updateIdeasSchema, executeUpdateIdeas,
  updateKanbanArtifactSchema, executeUpdateKanbanArtifact,
  updateSchemaSchema, executeUpdateSchema,
  updateWhiteboardSchema, executeUpdateWhiteboard,
  updateDirectoryTreeSchema, executeUpdateDirectoryTree,
} from "@/server/ai/tools";

/**
 * POST /api/ai/tools
 * Execute a single tool call from the client-side Ollama orchestration loop.
 * The browser calls this when Ollama returns a tool_call — we execute it server-side
 * (DB access via Prisma) and return the result so the browser can feed it back to Ollama.
 */
export async function POST(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  let body: { toolName: string; args: Record<string, unknown>; projectId?: string; sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const { toolName, args, sessionId } = body;
  if (!toolName || typeof toolName !== "string") {
    return NextResponse.json({ ok: false, error: "toolName required" }, { status: 400 });
  }

  try {
    const result = await executeTool(toolName, args, user.id);

    // Log to AiToolOutput for audit trail
    if (sessionId) {
      await prisma.aiChatMessage.create({
        data: {
          sessionId,
          role: "TOOL",
          content: `Tool: ${toolName}`,
          toolCalls: { toolName, args } as unknown as import("@prisma/client").Prisma.InputJsonValue,
          toolResults: result as unknown as import("@prisma/client").Prisma.InputJsonValue,
        },
      }).catch(() => { /* non-critical — don't fail the tool on logging error */ });
    }

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Tool execution failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/**
 * Execute a tool by name with the given arguments.
 * Shared logic used by both server-side chat (route.ts) and client-side tool endpoint.
 */
async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  userId: string,
): Promise<unknown> {
  switch (toolName) {
    case "read_artifact":
      return executeReadArtifact(readArtifactSchema.parse(args));
    case "list_projects":
      return executeListProjects(listProjectsSchema.parse(args), userId);
    case "manage_project":
      return executeManageProject(manageProjectSchema.parse(args), userId);
    case "update_ideas_artifact":
      return executeUpdateIdeas(updateIdeasSchema.parse(args), userId);
    case "update_kanban_artifact":
      return executeUpdateKanbanArtifact(updateKanbanArtifactSchema.parse(args), userId);
    case "update_schema_artifact":
      return executeUpdateSchema(updateSchemaSchema.parse(args), userId);
    case "update_whiteboard_artifact":
      return executeUpdateWhiteboard(updateWhiteboardSchema.parse(args));
    case "update_directory_tree_artifact":
      return executeUpdateDirectoryTree(updateDirectoryTreeSchema.parse(args));
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
