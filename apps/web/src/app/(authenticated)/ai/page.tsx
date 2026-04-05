"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { detectOllama, type OllamaStatus } from "@/lib/ollama-client";
import { streamOllamaChat, type OllamaChatMessage, type OllamaToolDef } from "@/lib/ollama-chat";

/* ── Types ── */
interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
}

interface ChatMessage {
  role: "user" | "ai" | "tool";
  text: string;
  reasoning?: string;
  toolCalls?: ToolCall[];
  isStreaming?: boolean;
}

/* ── Slash command handler ── */
function isSlashCommand(text: string): boolean {
  return /^\/(new|clear|rename|export|help|project)\b/.test(text.trim());
}

export default function AiPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<{ id: string; title: string; messageCount: number; updatedAt: string }[]>([]);
  const [aiStatus, setAiStatus] = useState<"checking" | "connected" | "local" | "not_configured">("checking");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [showReasoning, setShowReasoning] = useState(() => typeof window !== "undefined" ? localStorage.getItem("ai_show_reasoning") !== "false" : true);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [useClientOllama, setUseClientOllama] = useState(false);
  const [projectContext, setProjectContext] = useState<{ name: string; contextSummary: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ── Check AI config on mount ── */
  useEffect(() => {
    fetch("/api/ai/config")
      .then((res) => res.json())
      .then(async (data) => {
        if (data.provider === "OLLAMA_LOCAL") {
          // Provider is set to local Ollama — check if it's reachable from browser
          const status = await detectOllama();
          setOllamaStatus(status);
          if (status.running) {
            setAiStatus("local");
            setUseClientOllama(true);
          } else {
            // Ollama configured but not running — fall back to server-side
            setAiStatus("local");
            setUseClientOllama(false);
          }
        } else if (data.provider !== "NONE") {
          setAiStatus("connected");
        } else {
          // Auto-detect Ollama from browser
          const status = await detectOllama();
          setOllamaStatus(status);
          if (status.running) {
            setAiStatus("local");
            setUseClientOllama(true);
          } else {
            setAiStatus("not_configured");
          }
        }
      })
      .catch(() => setAiStatus("not_configured"));
  }, []);

  /* ── Load projects + auto-select from localStorage ── */
  useEffect(() => {
    fetch("/api/projects").then((r) => r.json()).then((d) => {
      if (d.ok && d.projects) {
        setProjects(d.projects.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })));
        if (!activeProjectId) {
          // Try to restore last used project from localStorage
          const saved = typeof window !== "undefined" ? localStorage.getItem("im_selected_project") : null;
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (parsed.id && d.projects.some((p: { id: string }) => p.id === parsed.id)) {
                setActiveProjectId(parsed.id);
                return;
              }
            } catch { /* ignore */ }
          }
          // Default to first project
          if (d.projects.length > 0) setActiveProjectId(d.projects[0].id);
        }
      }
    }).catch(() => {});
  }, [activeProjectId]);

  /* ── Fetch project context for client-side Ollama ── */
  useEffect(() => {
    if (!activeProjectId || !useClientOllama) { setProjectContext(null); return; }
    fetch(`/api/ai/context/${activeProjectId}`)
      .then((r) => r.json())
      .then((d) => { if (d.ok) setProjectContext({ name: d.project.name, contextSummary: d.contextSummary }); })
      .catch(() => {});
  }, [activeProjectId, useClientOllama]);

  /* ── Load sessions ── */
  const loadSessions = useCallback(() => {
    fetch("/api/ai/sessions").then((r) => r.json()).then((d) => {
      if (d.ok && d.sessions) setSessions(d.sessions);
    }).catch(() => {});
  }, []);
  useEffect(() => { loadSessions(); }, [loadSessions]);

  const switchSession = useCallback(async (sid: string) => {
    setSessionId(sid);
    try {
      const res = await fetch(`/api/ai/sessions/${sid}`);
      const data = await res.json();
      if (data.ok && data.session?.messages) {
        setMessages(data.session.messages.map((m: { role: string; content: string; toolCalls?: unknown; toolResults?: unknown }) => {
          if (m.role === "TOOL") {
            return {
              role: "tool" as const,
              text: m.content,
              toolCalls: m.toolCalls ? [{ name: (m.toolCalls as Record<string, unknown>).toolName as string || m.content, args: (m.toolCalls as Record<string, unknown>).args as Record<string, unknown> || {}, result: m.toolResults }] : undefined,
            };
          }
          return {
            role: m.role === "USER" ? "user" as const : "ai" as const,
            text: m.content,
          };
        }));
      }
    } catch { setMessages([]); }
  }, []);

  const newChat = useCallback(() => { setSessionId(null); setMessages([]); setInput(""); }, []);

  const clearSession = useCallback(async () => {
    if (!sessionId) return;
    if (!window.confirm("Clear all messages in this session?")) return;
    await fetch(`/api/ai/sessions/${sessionId}/messages`, { method: "DELETE" }).catch(() => {});
    setMessages([]);
    loadSessions();
  }, [sessionId, loadSessions]);

  const deleteAllSessions = useCallback(async () => {
    if (!window.confirm("Delete ALL chat sessions? This cannot be undone.")) return;
    await fetch("/api/ai/sessions", { method: "DELETE" }).catch(() => {});
    setSessionId(null);
    setMessages([]);
    setSessions([]);
  }, []);

  const deleteSession = useCallback(async (sid: string) => {
    await fetch(`/api/ai/sessions/${sid}`, { method: "DELETE" }).catch(() => {});
    if (sessionId === sid) { setSessionId(null); setMessages([]); }
    loadSessions();
  }, [sessionId, loadSessions]);

  const renameSession = useCallback(async (sid: string, title: string) => {
    await fetch(`/api/ai/sessions/${sid}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) }).catch(() => {});
    setEditingSessionId(null);
    loadSessions();
  }, [loadSessions]);

  const exportSession = useCallback(() => {
    let md = `# AI Chat Session\n\n`;
    messages.forEach((m) => {
      if (m.role === "user") md += `**You:** ${m.text}\n\n`;
      else if (m.role === "tool") md += `> **Tool:** ${m.text}\n\n`;
      else md += `**AI:** ${m.text}\n\n`;
    });
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "chat-session.md"; a.click();
    URL.revokeObjectURL(url);
  }, [messages]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* ── Slash commands ── */
  const handleSlashCommand = useCallback((cmd: string) => {
    const parts = cmd.trim().split(/\s+/);
    const command = parts[0];
    switch (command) {
      case "/new": newChat(); setMessages((prev) => [...prev, { role: "ai", text: "Started a new session." }]); break;
      case "/clear": clearSession(); break;
      case "/rename": if (sessionId && parts[1]) renameSession(sessionId, parts.slice(1).join(" ")); break;
      case "/export": exportSession(); setMessages((prev) => [...prev, { role: "ai", text: "Session exported as markdown." }]); break;
      case "/help":
        setMessages((prev) => [...prev, { role: "ai", text: "**Available commands:**\n- `/new` — Start new session\n- `/clear` — Clear messages\n- `/rename <title>` — Rename session\n- `/export` — Download as markdown\n- `/help` — Show this help" }]);
        break;
      default: setMessages((prev) => [...prev, { role: "ai", text: `Unknown command: ${command}. Type /help for available commands.` }]);
    }
  }, [newChat, sessionId, renameSession, exportSession]);

  /* ── Build system prompt for client-side Ollama ── */
  const buildClientSystemPrompt = useCallback(() => {
    const parts = [
      "You are an AI assistant for the IDEA-MANAGEMENT application.",
      "You help users manage their projects, ideas, kanban boards, schemas, whiteboards, and directory trees.",
      "When users ask you to perform actions, use the available tools. You can use tools from ANY page.",
      "",
      "RULES:",
      "1. CONVERSATION vs ACTION: Most messages are just conversation — respond naturally. ONLY use tools when the user EXPLICITLY asks to add, create, update, delete, or modify something.",
      "2. WHEN TO USE TOOLS: Only when the user says things like 'add an idea', 'create a card', 'delete that', 'update the schema', etc.",
      "3. INTERPRETIVE DETAILS: When you DO use a tool, fill in all fields intelligently.",
      "4. DESTRUCTIVE ACTIONS: Before deleting anything, ask for confirmation.",
      "5. Be concise, friendly, and conversational.",
    ];
    if (activeProjectId && projectContext) {
      parts.push(`\nCurrent project: "${projectContext.name}" (ID: ${activeProjectId}). ALWAYS use this projectId when calling tools.`);
      if (projectContext.contextSummary) {
        parts.push(`\nCurrent project state:\n${projectContext.contextSummary}`);
      }
    }
    parts.push("\n/no_think");
    return parts.join("\n");
  }, [activeProjectId, projectContext]);

  /* ── Tool definitions for client-side Ollama (OpenAI function calling format) ── */
  const ollamaTools: OllamaToolDef[] = [
    { type: "function", function: { name: "read_artifact", description: "Read any project artifact by path", parameters: { type: "object", properties: { projectId: { type: "string" }, artifactPath: { type: "string" } }, required: ["projectId", "artifactPath"] } } },
    { type: "function", function: { name: "list_projects", description: "List all projects the user has access to", parameters: { type: "object", properties: {} } } },
    { type: "function", function: { name: "update_ideas_artifact", description: "Add, edit, or delete ideas in a project", parameters: { type: "object", properties: { projectId: { type: "string" }, action: { type: "string", enum: ["add", "edit", "delete"] }, ideaId: { type: "string" }, title: { type: "string" }, body: { type: "string" }, category: { type: "string" }, priority: { type: "string", enum: ["low", "medium", "high"] }, tags: { type: "array", items: { type: "string" } } }, required: ["projectId", "action"] } } },
    { type: "function", function: { name: "update_kanban_artifact", description: "Add, move, or delete kanban cards", parameters: { type: "object", properties: { projectId: { type: "string" }, action: { type: "string", enum: ["add_card", "move_card", "update_card", "delete_card", "add_column"] }, cardId: { type: "string" }, column: { type: "string" }, title: { type: "string" }, description: { type: "string" }, labels: { type: "array", items: { type: "string" } }, columnName: { type: "string" } }, required: ["projectId", "action"] } } },
    { type: "function", function: { name: "update_schema_artifact", description: "Add entities, fields, or relations to a schema", parameters: { type: "object", properties: { projectId: { type: "string" }, action: { type: "string", enum: ["add_entity", "add_field", "add_relation", "add_enum", "delete_entity"] }, entityName: { type: "string" }, fieldName: { type: "string" }, fieldType: { type: "string" }, fromEntity: { type: "string" }, toEntity: { type: "string" }, relationType: { type: "string", enum: ["1:1", "1:N", "N:N"] }, enumName: { type: "string" }, enumValues: { type: "array", items: { type: "string" } } }, required: ["projectId", "action"] } } },
    { type: "function", function: { name: "update_whiteboard_artifact", description: "Add sticky notes to whiteboard", parameters: { type: "object", properties: { projectId: { type: "string" }, action: { type: "string", enum: ["add_sticky"] }, title: { type: "string" }, description: { type: "string" }, color: { type: "string", enum: ["lemon", "watermelon", "malachite", "amethyst"] } }, required: ["projectId", "action", "title"] } } },
    { type: "function", function: { name: "update_directory_tree_artifact", description: "Add or remove files/folders in directory tree", parameters: { type: "object", properties: { projectId: { type: "string" }, action: { type: "string", enum: ["add_node", "delete_node"] }, nodeName: { type: "string" }, nodeType: { type: "string", enum: ["folder", "file"] }, parentPath: { type: "string" } }, required: ["projectId", "action", "nodeName"] } } },
    { type: "function", function: { name: "manage_project", description: "Create or update a project", parameters: { type: "object", properties: { action: { type: "string", enum: ["create", "update"] }, projectId: { type: "string" }, name: { type: "string" }, description: { type: "string" }, status: { type: "string", enum: ["PLANNING", "ACTIVE", "PAUSED", "ARCHIVED"] }, tags: { type: "array", items: { type: "string" } } }, required: ["action"] } } },
  ];

  /* ── Send via client-side Ollama ── */
  const sendViaClientOllama = useCallback(async (userText: string, allMessages: ChatMessage[]) => {
    const systemPrompt = buildClientSystemPrompt();
    const ollamaMessages: OllamaChatMessage[] = [{ role: "system", content: systemPrompt }];

    for (const m of allMessages) {
      if (m.role === "user") ollamaMessages.push({ role: "user", content: m.text });
      else if (m.role === "ai") ollamaMessages.push({ role: "assistant", content: m.text });
    }

    setMessages((prev) => [...prev, { role: "ai", text: "", isStreaming: true }]);
    setIsTyping(false);

    let aiText = "";
    let aiReasoning = "";
    const pendingToolCalls: ToolCall[] = [];

    const updateMsg = () => {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "ai", text: aiText,
          reasoning: aiReasoning || undefined,
          toolCalls: pendingToolCalls.length > 0 ? [...pendingToolCalls] : undefined,
          isStreaming: true,
        };
        return updated;
      });
    };

    try {
      await streamOllamaChat(ollamaMessages, ollamaTools, ollamaStatus?.hasCustomModel || false, {
        onToken: (token) => { aiText += token; updateMsg(); },
        onReasoning: (r) => { aiReasoning += r; updateMsg(); },
        onToolCall: (name, args) => {
          pendingToolCalls.push({ name, args });
          aiReasoning += `\n▶ Calling: ${name.replace(/_/g, " ")}...`;
          updateMsg();
        },
        onToolResult: (name, result) => {
          const tc = pendingToolCalls.find((t) => t.name === name && !t.result);
          if (tc) tc.result = result;
          const resultMsg = typeof result === "object" && result !== null && "message" in (result as Record<string,unknown>)
            ? String((result as Record<string,unknown>).message) : "completed";
          aiReasoning += `\n✅ ${resultMsg}`;
          if (!aiText) aiText = resultMsg;
          updateMsg();
        },
        onComplete: () => {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], isStreaming: false };
            return updated;
          });
        },
        onError: (err) => {
          aiReasoning += `\n❌ Error: ${err}`;
          if (!aiText) aiText = `Error: ${err}`;
          updateMsg();
        },
      });

      // Save to server DB
      await fetch("/api/ai/chat/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          userMessage: userText,
          aiMessage: aiText,
          toolCalls: pendingToolCalls.filter((tc) => tc.result !== undefined).map((tc) => ({ name: tc.name, args: tc.args, result: tc.result })),
          provider: "ollama-local",
        }),
      }).then((r) => r.json()).then((d) => {
        if (d.ok && d.sessionId && !sessionId) { setSessionId(d.sessionId); loadSessions(); }
      }).catch(() => {});

    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Local Ollama connection failed";
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "ai", text: `Error: ${errMsg}. Try checking that Ollama is running.`, isStreaming: false };
        return updated;
      });
    }
    setIsTyping(false);
  }, [buildClientSystemPrompt, ollamaStatus, sessionId, loadSessions]);

  /* ── Send message ── */
  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;
    setInput("");

    // Handle slash commands
    if (isSlashCommand(trimmed)) { handleSlashCommand(trimmed); return; }

    const userMessage: ChatMessage = { role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // ── Client-side Ollama path ──
    if (useClientOllama && ollamaStatus?.running) {
      await sendViaClientOllama(trimmed, [...messages, userMessage]);
      return;
    }

    // ── Server-side path (Groq / BYOK / server Ollama) ──
    const apiMessages = [...messages, userMessage]
      .filter((m) => m.role !== "tool")
      .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, sessionId, projectId: activeProjectId }),
      });

      const newSessionId = res.headers.get("X-Session-Id");
      if (newSessionId) { setSessionId(newSessionId); loadSessions(); }

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        if (res.status === 401) {
          window.location.href = "/signin";
          return;
        }
        if (res.status === 503) {
          setMessages((prev) => [...prev, { role: "ai", text: "AI not available. Install [Ollama](https://ollama.com) for free local AI, or go to Settings to add an API key." }]);
          setIsTyping(false);
          return;
        }
        if (res.status === 429) {
          // Monthly limit reached — try auto-fallback to Local AI
          if (ollamaStatus?.running) {
            setMessages((prev) => [...prev, { role: "ai", text: "Monthly AI limit reached. Switching to Local AI (your GPU)..." }]);
            setUseClientOllama(true);
            // Re-send via client-side Ollama
            await sendViaClientOllama(trimmed, [...messages, userMessage]);
            return;
          }
          const limitMsg = errorData?.message || "Monthly AI limit reached.";
          setMessages((prev) => [...prev, { role: "ai", text: `${limitMsg}\n\nOptions:\n1. Install [Ollama](https://ollama.com) for free unlimited Local AI\n2. Upgrade your plan in Settings\n3. Purchase a token pack in Settings > Billing` }]);
          setIsTyping(false);
          return;
        }
        if (res.status === 403) {
          setMessages((prev) => [...prev, { role: "ai", text: "Built-in AI requires a subscription. You can:\n1. Subscribe to a Pro or Team plan for built-in AI access\n2. Add your own API key (OpenAI, Anthropic, Google) in Settings — no subscription needed\n3. If you're an admin, enable AI access in Settings > AI Configuration" }]);
          setIsTyping(false);
          return;
        }
        const errMsg = errorData?.message || errorData?.error || `Server error (${res.status})`;
        throw new Error(errMsg);
      }

      // Stream the response — parse text + tool calls + reasoning
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let aiText = "";
      let aiReasoning = "";
      const pendingToolCalls: ToolCall[] = [];

      const updateMsg = () => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "ai", text: aiText,
            reasoning: aiReasoning || undefined,
            toolCalls: pendingToolCalls.length > 0 ? [...pendingToolCalls] : undefined,
            isStreaming: true,
          };
          return updated;
        });
      };

      setMessages((prev) => [...prev, { role: "ai", text: "", isStreaming: true }]);
      setIsTyping(false);
      let stepComplete = false; // Track if we should stop after first step

      while (true) {
        const { done, value } = await reader.read();
        if (done || stepComplete) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          const trimmed = line.trim();

          if (trimmed.startsWith("data: ")) {
            try {
              const evt = JSON.parse(trimmed.slice(6));

              // Text delta
              if (evt.type === "text-delta" && typeof evt.delta === "string") {
                aiText += evt.delta;
                updateMsg();
              }

              // Reasoning delta (qwen3 thinking mode)
              if (evt.type === "reasoning" || evt.type === "reasoning-delta") {
                aiReasoning += (evt.delta || evt.text || "");
                updateMsg();
              }

              // Some models send reasoning as a metadata field on text-start
              if (evt.type === "text-start" && evt.providerMetadata?.openai?.reasoning) {
                aiReasoning += evt.providerMetadata.openai.reasoning;
                updateMsg();
              }

              // Tool call start
              if ((evt.type === "tool-call" || evt.type === "tool-input-start") && evt.toolName) {
                pendingToolCalls.push({ name: evt.toolName, args: {} });
                aiReasoning += `\n▶ Calling: ${evt.toolName.replace(/_/g, " ")}...`;
                updateMsg();
              }

              // Tool input available (full args)
              if (evt.type === "tool-input-available" && pendingToolCalls.length > 0) {
                pendingToolCalls[pendingToolCalls.length - 1].args = evt.input || {};
                updateMsg();
              }

              // Tool result
              if ((evt.type === "tool-result" || evt.type === "tool-output-available") && pendingToolCalls.length > 0) {
                const lastTc = pendingToolCalls[pendingToolCalls.length - 1];
                lastTc.result = evt.output || evt.result || evt;
                const resultMsg = typeof lastTc.result === "object" && lastTc.result !== null && "message" in (lastTc.result as Record<string,unknown>)
                  ? String((lastTc.result as Record<string,unknown>).message) : "completed";
                aiReasoning += `\n✅ ${resultMsg}`;
                // If no text yet, show tool result as the text
                if (!aiText) aiText = resultMsg;
                updateMsg();
                // Dispatch for live reactivity
                window.dispatchEvent(new CustomEvent("artifact-updated", { detail: { tool: lastTc.name, result: lastTc.result } }));
              }

              // Error
              if (evt.type === "error") {
                aiReasoning += `\n❌ Error: ${evt.errorText || "Unknown"}`;
                if (!aiText) aiText = `Error: ${evt.errorText || "Unknown error"}`;
                updateMsg();
              }

              // Step finish (marks end of a step in multi-step)
              // Step finish — if no tools were called, stop processing
              // to prevent the double-write bug where step 2 overwrites step 1 text
              if (evt.type === "finish-step") {
                if (pendingToolCalls.length === 0 && aiText) {
                  // Simple conversation — no tools used, text already generated
                  // Stop here to prevent step 2 from overwriting
                  stepComplete = true;
                }
                if (aiReasoning) aiReasoning += "\n—";
                updateMsg();
              }
            } catch { /* skip */ }
          }

          // Legacy format fallback
          if (trimmed.startsWith("0:")) {
            try {
              const text = JSON.parse(trimmed.slice(2));
              if (typeof text === "string") { aiText += text; updateMsg(); }
            } catch { /* skip */ }
          }
        }
      }

      // Mark streaming complete
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], isStreaming: false };
        return updated;
      });

      // If nothing was generated at all
      if (!aiText && !aiReasoning && pendingToolCalls.length === 0) {
        const actionWords = /\b(add|create|make|build|delete|remove|update|move|change)\b/i;
        const fallbackText = actionWords.test(trimmed)
          ? "I wasn't able to perform that action. Please try being more specific, or check that a project is selected."
          : "I received your message but couldn't generate a response. Please try again.";
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "ai", text: fallbackText, isStreaming: false };
          return updated;
        });
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong";
      setMessages((prev) => [...prev, { role: "ai", text: `Error: ${errMsg}` }]);
      setIsTyping(false);
    }
  }, [input, isTyping, messages, sessionId, handleSlashCommand, loadSessions, useClientOllama, ollamaStatus, sendViaClientOllama, activeProjectId]);

  /* ── Keyboard ── */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    // Show slash menu
    setShowSlashMenu(input.startsWith("/") && !input.includes(" "));
  };

  const filteredSessions = searchQuery
    ? sessions.filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : sessions;

  const statusLabel = aiStatus === "connected" ? "CONNECTED" : aiStatus === "local" ? (useClientOllama ? "LOCAL AI (YOUR GPU)" : "LOCAL AI") : aiStatus === "not_configured" ? "NOT CONFIGURED" : "CHECKING...";
  const statusColor = aiStatus === "connected" ? "text-malachite border-malachite" : aiStatus === "local" ? "text-cornflower border-cornflower" : aiStatus === "not_configured" ? "text-watermelon border-watermelon" : "text-gray-mid border-gray-mid";

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      {/* View header */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <h1 className="nb-view-title">AI CHAT</h1>
        <div className="flex items-center gap-2">
          {/* Project selector */}
          {projects.length > 0 && (
            <select
              className="nb-input text-[0.75rem] py-1 px-2 font-mono"
              value={activeProjectId || ""}
              onChange={(e) => setActiveProjectId(e.target.value || null)}
            >
              <option value="">No project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          {messages.length > 0 && (
            <button onClick={exportSession} className="nb-btn nb-btn--small font-mono text-[0.7rem]">EXPORT</button>
          )}
          <label className="flex items-center gap-1 font-mono text-[0.65rem] uppercase cursor-pointer select-none" title="Show AI reasoning and tool use under messages">
            <input
              type="checkbox"
              checked={showReasoning}
              onChange={(e) => { setShowReasoning(e.target.checked); localStorage.setItem("ai_show_reasoning", String(e.target.checked)); }}
              className="w-3 h-3"
            />
            SHOW REASONING
          </label>
          <span className={`font-mono text-[0.8rem] px-3 py-1 border-2 ${statusColor}`}>
            ● {statusLabel}
          </span>
        </div>
      </div>

      {/* Not configured banner */}
      {aiStatus === "not_configured" && (
        <div className="mb-4 p-3 border-2 border-watermelon bg-watermelon/10 font-mono text-[0.8rem]">
          AI not available. Install <a href="https://ollama.com" target="_blank" rel="noopener" className="underline font-bold">Ollama</a> for free local AI, or go to{" "}
          <a href="/settings" className="underline font-bold">Settings</a> to add an API key.
        </div>
      )}

      {/* Chat layout: sidebar + main */}
      <div className="flex gap-4" style={{ maxHeight: "calc(100vh - 200px)" }}>
        {/* Session sidebar */}
        <div className="w-[240px] min-w-[240px] border-4 border-signal-black bg-white flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b-2 border-signal-black bg-signal-black text-creamy-milk font-bold text-[0.75rem] uppercase tracking-wider flex items-center justify-between">
            <span>SESSIONS</span>
            <div className="flex gap-1">
              <button onClick={newChat} className="text-[0.65rem] px-2 py-0.5 bg-malachite text-white border border-malachite font-bold cursor-pointer hover:opacity-80" title="New session">+</button>
              {sessions.length > 0 && <button onClick={deleteAllSessions} className="text-[0.65rem] px-2 py-0.5 bg-watermelon text-white border border-watermelon font-bold cursor-pointer hover:opacity-80" title="Delete all sessions">CLR</button>}
            </div>
          </div>
          {/* Search */}
          <div className="px-2 py-1 border-b border-signal-black/20">
            <input
              type="text"
              className="w-full font-mono text-[0.7rem] px-2 py-1 border border-signal-black/30 outline-none bg-transparent"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredSessions.map((s) => (
              <div
                key={s.id}
                onClick={() => switchSession(s.id)}
                className={`px-3 py-2 cursor-pointer border-b border-dashed border-black/10 font-mono text-[0.75rem] hover:bg-creamy-milk transition-colors ${sessionId === s.id ? "bg-creamy-milk font-bold" : ""}`}
              >
                {editingSessionId === s.id ? (
                  <input
                    className="w-full font-mono text-[0.75rem] px-1 border border-signal-black bg-white"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") renameSession(s.id, editTitle); if (e.key === "Escape") setEditingSessionId(null); }}
                    onBlur={() => renameSession(s.id, editTitle)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                ) : (
                  <div className="truncate">{s.title}</div>
                )}
                <div className="text-[0.6rem] text-[#999] flex justify-between mt-0.5">
                  <span>{s.messageCount} msgs</span>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { setEditingSessionId(s.id); setEditTitle(s.title); }} className="text-signal-black font-bold hover:opacity-70">R</button>
                    <button onClick={() => deleteSession(s.id)} className="text-watermelon font-bold hover:opacity-70">X</button>
                  </div>
                </div>
              </div>
            ))}
            {filteredSessions.length === 0 && (
              <div className="px-3 py-4 font-mono text-[0.7rem] text-[#999] text-center">
                {searchQuery ? "No matches" : "No sessions yet"}
              </div>
            )}
          </div>
        </div>

        {/* Chat container */}
        <div className="flex-1 border-4 border-signal-black shadow-nb bg-white flex flex-col min-h-[400px]">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="flex-1 flex items-center justify-center flex-col gap-3">
                <p className="font-mono text-gray-mid text-[0.9rem]">Start a conversation...</p>
                <p className="font-mono text-[0.7rem] text-[#bbb]">Type /help for available commands</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i}>
                {msg.role !== "tool" && (
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "self-end flex-row-reverse" : "self-start"}`}>
                    <div className={`w-9 h-9 min-w-[36px] border-2 border-signal-black flex items-center justify-center font-mono font-semibold text-[0.8rem] ${msg.role === "user" ? "bg-watermelon text-white" : "bg-signal-black text-malachite"}`}>
                      {msg.role === "user" ? "U" : "AI"}
                    </div>
                    <div className="flex flex-col gap-0 flex-1">
                      {/* Main message bubble */}
                      <div className={`border-3 border-signal-black p-4 text-[0.9rem] leading-relaxed ${msg.role === "user" ? "bg-watermelon text-white shadow-nb" : "bg-white shadow-nb"}`}>
                        <div style={{ whiteSpace: "pre-wrap" }}>{msg.text || (msg.isStreaming ? "" : "")}</div>
                      </div>

                      {/* Provider badge */}
                      {msg.role === "ai" && !msg.isStreaming && msg.text && (
                        <div className="font-mono text-[0.6rem] text-[#aaa] mt-1 ml-1">
                          {useClientOllama ? "via Local AI" : aiStatus === "connected" ? "via Groq" : aiStatus === "local" ? "via Local AI" : ""}
                        </div>
                      )}

                      {/* Reasoning + Tool area (gray, below message) */}
                      {msg.role === "ai" && showReasoning && (msg.reasoning || (msg.toolCalls && msg.toolCalls.length > 0)) && (
                        <details className="border-2 border-dashed border-signal-black/30 bg-creamy-milk/50 mt-[-2px]">
                          <summary className="px-3 py-1 cursor-pointer font-mono text-[0.65rem] uppercase text-[#999] tracking-wider select-none">
                            {msg.isStreaming ? "⚙ Working..." : `${msg.toolCalls?.length || 0} tool(s) · reasoning`}
                          </summary>
                          <div className="px-3 py-2 font-mono text-[0.7rem] text-[#777] leading-relaxed" style={{ whiteSpace: "pre-wrap" }}>
                            {/* Reasoning text */}
                            {msg.reasoning && (
                              <div className="italic mb-2">{msg.reasoning}</div>
                            )}
                            {/* Tool call details */}
                            {msg.toolCalls && msg.toolCalls.map((tc, j) => (
                              <div key={j} className="border-l-2 border-signal-black/20 pl-2 mb-1">
                                <div className="flex items-center gap-1">
                                  <span className={`w-1.5 h-1.5 rounded-full ${tc.result ? "bg-malachite" : "bg-lemon"}`} />
                                  <span className="font-bold uppercase text-[0.65rem]">{tc.name.replace(/_/g, " ")}</span>
                                </div>
                                {tc.args && Object.keys(tc.args).length > 0 && (
                                  <div className="text-[0.6rem] text-[#aaa] ml-3">{JSON.stringify(tc.args)}</div>
                                )}
                                {tc.result != null && (
                                  <div className="text-[0.65rem] text-malachite ml-3">
                                    {typeof tc.result === "object" && tc.result !== null && "message" in (tc.result as Record<string,unknown>)
                                      ? String((tc.result as Record<string,unknown>).message)
                                      : String(typeof tc.result === "object" ? JSON.stringify(tc.result) : tc.result)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3 max-w-[80%] self-start">
                <div className="w-9 h-9 min-w-[36px] border-2 border-signal-black flex items-center justify-center font-mono font-semibold text-[0.8rem] bg-signal-black text-malachite">AI</div>
                <div className="border-3 border-signal-black p-4 text-[0.9rem] bg-white shadow-nb">
                  <span className="font-mono text-gray-mid animate-pulse">THINKING...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Slash command menu */}
          {showSlashMenu && (
            <div className="mx-4 mb-1 border-2 border-signal-black bg-white shadow-nb">
              {["/new — Start new session", "/clear — Clear messages", "/rename — Rename session", "/export — Download as markdown", "/help — Show commands"].map((cmd) => (
                <div
                  key={cmd.split(" ")[0]}
                  className="px-3 py-1.5 font-mono text-[0.75rem] cursor-pointer hover:bg-creamy-milk border-b border-signal-black/10"
                  onClick={() => { setInput(cmd.split(" ")[0] + " "); setShowSlashMenu(false); textareaRef.current?.focus(); }}
                >
                  {cmd}
                </div>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className="flex gap-2 p-4 border-t-4 border-signal-black bg-creamy-milk">
            <textarea
              ref={textareaRef}
              className="flex-1 font-mono text-[0.9rem] border-3 border-signal-black py-2 px-4 resize-none outline-none focus:shadow-nb bg-white"
              placeholder="Type a message or /help for commands..."
              rows={2}
              value={input}
              onChange={(e) => { setInput(e.target.value); setShowSlashMenu(e.target.value.startsWith("/") && !e.target.value.includes(" ")); }}
              onKeyDown={handleKeyDown}
            />
            <button
              className="nb-btn nb-btn--primary self-end whitespace-nowrap"
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
            >
              SEND ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
