import { streamText, tool, stepCountIs, convertToModelMessages } from "ai";
import { NextResponse } from "next/server";
import { isErrorResponse } from "@/server/auth/admin";
import { requireEntitlement } from "@/server/billing/require-entitlement";
import { FEATURES } from "@/server/billing/entitlements";
import { prisma } from "@/server/db";
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
} from "@/server/ai/tools";

/**
 * POST /api/ai/chat
 * Streaming AI chat endpoint with tool calling support.
 * Requires authentication and AI_CHAT entitlement (admin bypasses).
 */
export async function POST(req: Request) {
  // Auth + entitlement gate
  const entitlementResult = await requireEntitlement(req, FEATURES.AI_CHAT);
  if (isErrorResponse(entitlementResult)) return entitlementResult;
  const user = entitlementResult;

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

  // Build system prompt
  const systemParts = [
    "You are an AI assistant for the IDEA-MANAGEMENT application.",
    "You help users manage their projects, ideas, kanban boards, and project structures.",
    "When users ask you to perform actions, use the available tools.",
    "Always confirm what you did after using a tool.",
  ];
  if (projectId) {
    systemParts.push(`The user is currently working in project: ${projectId}.`);
    systemParts.push("Use this projectId when calling tools unless the user specifies a different project.");
  }
  if (pageContext) {
    const pageHints: Record<string, string> = {
      "Schema Planner": "The user is on the Schema Planner page. Help them design database schemas, suggest entities and fields, normalize tables, explain relationships. You can suggest SQL patterns, index strategies, and data modeling best practices.",
      "Ideas": "The user is on the Ideas page. Help them brainstorm, prioritize, and expand on ideas. Use the add_idea tool to create ideas when asked.",
      "Kanban Board": "The user is on the Kanban Board. Help them manage tasks, suggest cards, categorize work, and plan sprints. Use the update_kanban tool to modify the board.",
      "Whiteboard": "The user is on the Whiteboard. Help them brainstorm visually, suggest sticky note content, and organize thinking.",
      "Directory Tree": "The user is on the Directory Tree page. Help them plan project structure, suggest file organization, and explain conventions. Use the generate_tree tool when asked.",
      "Dashboard": "The user is on the Dashboard. Help them understand project status, summarize activity, and suggest next actions.",
    };
    systemParts.push(`Current page: ${pageContext}.`);
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
      },
      stopWhen: stepCountIs(5),
      onFinish: async ({ text }) => {
        // Persist assistant response
        if (text && activeSessionId) {
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
