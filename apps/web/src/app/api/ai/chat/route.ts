import { streamText, tool, stepCountIs } from "ai";
import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { checkEntitlement, FEATURES } from "@/server/billing/entitlements";
import { prisma } from "@/server/db";
import type { Prisma } from "@prisma/client";
import { getUserModel } from "@/server/ai/get-user-model";
import {
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
  // Auth + AI access check
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  // AI access: admin bypass, BYOK bypass (user pays their own provider), or entitlement required
  if (user.role !== "ADMIN") {
    // Check if user has their own API key (BYOK = they pay their provider, no billing needed from us)
    const userAiConfig = await prisma.user.findUnique({ where: { id: user.id }, select: { aiProvider: true } });
    const isBYOK = userAiConfig?.aiProvider && !["NONE", "OLLAMA_LOCAL"].includes(userAiConfig.aiProvider);
    if (!isBYOK) {
      const hasEntitlement = await checkEntitlement(user.id, FEATURES.AI_CHAT, user.role);
      if (!hasEntitlement) {
        return NextResponse.json(
          { ok: false, error: "ai_subscription_required", message: "Built-in AI requires an active subscription. Go to Settings to subscribe, or add your own API key to use AI for free." },
          { status: 403 }
        );
      }
    }
  }

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
    "",
    "RULES:",
    "1. CONVERSATION vs ACTION: Most messages are just conversation — respond naturally like a helpful assistant. ONLY use tools when the user EXPLICITLY asks to add, create, update, delete, or modify something. Words like 'hello', 'hey', 'thanks', 'what do you think', or general questions are NEVER action requests — just chat normally.",
    "2. WHEN TO USE TOOLS: Only when the user says things like 'add an idea', 'create a card', 'delete that', 'update the schema', etc. The intent to perform an action must be clear and explicit.",
    "3. INTERPRETIVE DETAILS: When you DO use a tool, fill in all fields intelligently — generate a relevant description, appropriate tags, fitting priority and category based on the topic.",
    "4. DESTRUCTIVE ACTIONS: Before deleting anything, ask for confirmation first.",
    "5. Be concise, friendly, and conversational.",
  ];
  if (projectId) {
    // Get project name for natural reference
    const projectInfo = await prisma.project.findUnique({ where: { id: projectId }, select: { name: true } }).catch(() => null);
    const projectName = projectInfo?.name || projectId;
    systemParts.push(`\nCurrent project: "${projectName}" (ID: ${projectId}). ALWAYS use this projectId when calling tools — the user is working in this project. If they want to switch projects or create a new one, use the manage_project or list_projects tools.`);

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
  // Append /no_think for qwen3 models — disables verbose thinking mode
  // so the model responds with direct text instead of empty content + reasoning.
  // Tool calling still works normally without thinking mode.
  systemParts.push("\n/no_think");
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

  // Convert messages to the format streamText expects
  const modelMessages = messages.map((m) => ({
    role: m.role as "user" | "assistant" | "system",
    content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
  }));

  // Stream response with tools
  try {
    const result = streamText({
      model: userModel.model,
      system: systemPrompt,
      messages: modelMessages,
      stopWhen: stepCountIs(3), // Allow: step 1 (tool call) → step 2 (result fed back → text) → step 3 (safety limit)
      tools: {
        // ── Cross-page artifact tools (write to REAL artifacts) ──
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
          description: "Add, edit, or delete ideas in a project. ALWAYS use this tool when the user asks to add/create/capture an idea. Writes directly to the project's ideas list so it appears immediately on the Ideas page.",
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
