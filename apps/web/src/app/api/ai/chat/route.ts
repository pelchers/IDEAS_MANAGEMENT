import { streamText, tool, stepCountIs, convertToModelMessages } from "ai";
import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import type { Prisma } from "@prisma/client";
import { getUserModel } from "@/server/ai/get-user-model";
import {
  addIdeaSchema,
  executeAddIdea,
  updateKanbanSchema,
  executeUpdateKanban,
  generateTreeSchema,
  executeGenerateTree,
  createProjectStructureSchema,
  executeCreateProjectStructure,
  readArtifactSchema,
  executeReadArtifact,
  listProjectsSchema,
  executeListProjects,
  manageProjectSchema,
  executeManageProject,
  updateIdeasSchema,
  executeUpdateIdeas,
  updateKanbanArtifactSchema,
  executeUpdateKanbanArtifact,
  updateSchemaSchema,
  executeUpdateSchema,
  updateWhiteboardSchema,
  executeUpdateWhiteboard,
  updateDirectoryTreeSchema,
  executeUpdateDirectoryTree,
} from "@/server/ai/tools";

/**
 * POST /api/ai/chat
 * Streaming AI chat endpoint with tool calling support.
 * Requires authentication and AI_CHAT entitlement (admin bypasses).
 */
export async function POST(req: Request) {
  // Auth (entitlement gate deferred to session 10 billing implementation)
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  // Parse request body
  let body: {
    messages: Array<{ role: string; content: string; parts?: unknown[] }>;
    sessionId?: string;
    projectId?: string;
    pageContext?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const { messages, sessionId, projectId, pageContext } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ ok: false, error: "messages_required" }, { status: 400 });
  }

  // Get or create session
  let activeSessionId = sessionId;
  if (!activeSessionId) {
    // Extract title from first user message text
    const firstUserMsg = messages.find((m) => m.role === "user");
    let title = "New Chat";
    if (firstUserMsg) {
      if (typeof firstUserMsg.content === "string") {
        title = firstUserMsg.content.slice(0, 60);
      }
    }
    const session = await prisma.aiChatSession.create({
      data: {
        userId: user.id,
        projectId: projectId ?? null,
        title,
      },
    });
    activeSessionId = session.id;
  }

  // Persist the latest user message
  const lastUserMessage = messages[messages.length - 1];
  if (lastUserMessage && lastUserMessage.role === "user") {
    const content = typeof lastUserMessage.content === "string"
      ? lastUserMessage.content
      : JSON.stringify(lastUserMessage.content);
    await prisma.aiChatMessage.create({
      data: {
        sessionId: activeSessionId,
        role: "USER",
        content,
      },
    });
  }

  // Build system prompt with context injection
  const systemParts = [
    "You are an AI assistant for the IDEA-MANAGEMENT application.",
    "You help users manage their projects, ideas, kanban boards, schemas, whiteboards, and directory trees.",
    "When users ask you to perform actions, use the available tools. You can use tools from ANY page — cross-page actions are supported.",
    "Always confirm what you did after using a tool with a brief summary.",
    "Be concise and direct. Use tools proactively when the user's intent is clear.",
  ];
  if (projectId) {
    systemParts.push(`\nCurrent project ID: ${projectId}. Use this projectId when calling tools unless the user specifies a different project.`);

    // Auto-inject project artifact state for context
    try {
      const artifacts = await prisma.projectArtifact.findMany({
        where: { projectId, artifactPath: { in: ["ideas/ideas.json", "kanban/board.json", "schema/schema.graph.json"] } },
        select: { artifactPath: true, content: true },
      });
      const contextParts: string[] = [];
      for (const a of artifacts) {
        const c = a.content as Record<string, unknown> | null;
        if (!c) continue;
        if (a.artifactPath === "ideas/ideas.json" && Array.isArray(c.ideas)) {
          const ideas = c.ideas as Array<{ title?: string }>;
          contextParts.push(`Ideas (${ideas.length}): ${ideas.slice(0, 5).map((i) => i.title || "Untitled").join(", ")}${ideas.length > 5 ? "..." : ""}`);
        }
        if (a.artifactPath === "kanban/board.json" && Array.isArray(c.columns)) {
          const cols = c.columns as Array<{ name?: string; cards?: unknown[] }>;
          contextParts.push(`Kanban: ${cols.map((col) => `${col.name || "?"} (${(col.cards || []).length} cards)`).join(", ")}`);
        }
        if (a.artifactPath === "schema/schema.graph.json" && Array.isArray(c.entities)) {
          const ents = c.entities as Array<{ name?: string; fields?: unknown[] }>;
          contextParts.push(`Schema: ${ents.map((e) => `${e.name || "?"} (${(e.fields || []).length} fields)`).join(", ")}`);
        }
      }
      if (contextParts.length > 0) {
        systemParts.push(`\nCurrent project state:\n${contextParts.join("\n")}`);
      }
    } catch { /* silent — don't block chat on context read failure */ }
  }
  if (pageContext) {
    const pageHints: Record<string, string> = {
      "Schema Planner": "The user is on the Schema Planner page. Help them design database schemas, suggest entities and fields, normalize tables, explain relationships.",
      "Ideas": "The user is on the Ideas page. Help them brainstorm, prioritize, and expand on ideas. Use the update_ideas_artifact tool to create ideas.",
      "Kanban Board": "The user is on the Kanban Board. Help them manage tasks, suggest cards, categorize work. Use the update_kanban_artifact tool.",
      "Whiteboard": "The user is on the Whiteboard. Help them brainstorm visually, suggest sticky note content.",
      "Directory Tree": "The user is on the Directory Tree page. Help them plan project structure, suggest file organization.",
      "Dashboard": "The user is on the Dashboard. Help them understand project status, summarize activity, suggest next actions.",
    };
    systemParts.push(`\nCurrent page: ${pageContext}.`);
    if (pageHints[pageContext]) systemParts.push(pageHints[pageContext]);
  }
  const systemPrompt = systemParts.join("\n");

  // Resolve user's AI model (OpenRouter key or fallback to server OpenAI key)
  const userModel = await getUserModel(user.id);
  if (!userModel) {
    return NextResponse.json(
      {
        ok: false,
        error: "ai_not_configured",
        message: "No AI provider configured. Connect your OpenRouter account or add an API key in Settings.",
        sessionId: activeSessionId,
      },
      { status: 503 }
    );
  }

  // Convert UI messages to model messages for streamText
  let modelMessages;
  try {
    modelMessages = await convertToModelMessages(messages as Parameters<typeof convertToModelMessages>[0]);
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_message_format", message: "Could not convert messages to model format." },
      { status: 400 }
    );
  }

  // Stream response with tools
  try {
    const result = streamText({
      model: userModel.model,
      system: systemPrompt,
      messages: modelMessages,
      tools: {
        add_idea: tool({
          description: "Add a new idea to a project. Use this when the user wants to create or capture a new idea.",
          inputSchema: addIdeaSchema,
          execute: async (params) => {
            return executeAddIdea(params, user.id, activeSessionId);
          },
        }),
        update_kanban: tool({
          description: "Update a kanban board. Use this to add, move, update, or delete cards on the kanban board.",
          inputSchema: updateKanbanSchema,
          execute: async (params) => {
            return executeUpdateKanban(params, user.id, activeSessionId);
          },
        }),
        generate_tree: tool({
          description: "Generate a directory tree structure for a project. Use this when the user wants to plan or scaffold a file/folder structure.",
          inputSchema: generateTreeSchema,
          execute: async (params) => {
            return executeGenerateTree(params, user.id, activeSessionId);
          },
        }),
        create_project_structure: tool({
          description: "Create a project structure from a template. Use this to scaffold a new project with default folders and files.",
          inputSchema: createProjectStructureSchema,
          execute: async (params) => {
            return executeCreateProjectStructure(params, user.id, activeSessionId);
          },
        }),
        // ── Cross-page artifact tools ──
        read_artifact: tool({
          description: "Read any project artifact to see its current data. Use this to inspect current ideas, kanban board, schema, whiteboard, or directory tree before making changes. Artifact paths: ideas/ideas.json, kanban/board.json, schema/schema.graph.json, whiteboard/board.json, directory-tree/tree.plan.json",
          inputSchema: readArtifactSchema,
          execute: async (params) => executeReadArtifact(params),
        }),
        list_projects: tool({
          description: "List all projects the user has access to. Use this when the user asks about their projects or you need to find a project ID.",
          inputSchema: listProjectsSchema,
          execute: async () => executeListProjects({}, user.id),
        }),
        manage_project: tool({
          description: "Create a new project or update an existing project's name, description, status, or tags.",
          inputSchema: manageProjectSchema,
          execute: async (params) => executeManageProject(params, user.id),
        }),
        update_ideas_artifact: tool({
          description: "Add, edit, or delete ideas in a project. This writes directly to the project's ideas artifact. Use when the user wants to capture, modify, or remove ideas — works from ANY page.",
          inputSchema: updateIdeasSchema,
          execute: async (params) => executeUpdateIdeas(params, user.id),
        }),
        update_kanban_artifact: tool({
          description: "Add cards, move cards between columns, delete cards, or add columns to a project's kanban board. Writes directly to the kanban artifact. Works from ANY page.",
          inputSchema: updateKanbanArtifactSchema,
          execute: async (params) => executeUpdateKanbanArtifact(params, user.id),
        }),
        update_schema_artifact: tool({
          description: "Add entities, fields, relations, or enum types to a project's database schema. Writes directly to the schema artifact. Works from ANY page.",
          inputSchema: updateSchemaSchema,
          execute: async (params) => executeUpdateSchema(params, user.id),
        }),
        update_whiteboard_artifact: tool({
          description: "Add sticky notes to a project's whiteboard. Writes directly to the whiteboard artifact. Works from ANY page.",
          inputSchema: updateWhiteboardSchema,
          execute: async (params) => executeUpdateWhiteboard(params),
        }),
        update_directory_tree_artifact: tool({
          description: "Add or remove files/folders in a project's directory tree. Writes directly to the directory tree artifact. Works from ANY page.",
          inputSchema: updateDirectoryTreeSchema,
          execute: async (params) => executeUpdateDirectoryTree(params),
        }),
      },
      stopWhen: stepCountIs(5),
      onFinish: async ({ text, toolCalls, toolResults }) => {
        if (!activeSessionId) return;

        // Persist tool calls as TOOL messages
        if (toolCalls && toolCalls.length > 0) {
          for (let i = 0; i < toolCalls.length; i++) {
            const tc = toolCalls[i];
            const tr = toolResults?.[i];
            await prisma.aiChatMessage.create({
              data: {
                sessionId: activeSessionId,
                role: "TOOL",
                content: `Tool: ${tc.toolName}`,
                toolCalls: tc as unknown as Prisma.InputJsonValue,
                toolResults: tr as unknown as Prisma.InputJsonValue ?? null,
              },
            });
          }
        }

        // Persist assistant text response
        if (text) {
          await prisma.aiChatMessage.create({
            data: {
              sessionId: activeSessionId,
              role: "ASSISTANT",
              content: text,
            },
          });
        }
      },
    });

    // Return streaming UI message response with session ID header
    const response = result.toUIMessageStreamResponse();

    // Add session ID to response headers so the client can track it
    response.headers.set("X-Session-Id", activeSessionId);

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown AI error";
    console.error("[AI Chat] streamText error:", message);
    return NextResponse.json(
      {
        ok: false,
        error: "ai_stream_error",
        message,
        sessionId: activeSessionId,
      },
      { status: 502 }
    );
  }
}
