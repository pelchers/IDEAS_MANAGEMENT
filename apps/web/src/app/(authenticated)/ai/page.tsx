"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { useEntitlements } from "@/hooks/use-entitlements";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Session {
  id: string;
  title: string;
  projectId: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ChatMsg {
  id: string;
  role: string;
  content: string;
  parts?: Array<{ type: string; text?: string; toolCallId?: string; toolName?: string; state?: string; input?: unknown; output?: unknown }>;
}

/* ------------------------------------------------------------------ */
/*  Tool definitions (visual only)                                     */
/* ------------------------------------------------------------------ */

const TOOL_ACTIONS = [
  { key: "add_idea", label: "ADD IDEA", icon: "\u2726" },
  { key: "update_kanban", label: "UPDATE KANBAN", icon: "\u2637" },
  { key: "generate_tree", label: "GENERATE TREE", icon: "\u2442" },
  { key: "create_project_structure", label: "CREATE STRUCTURE", icon: "\u2692" },
] as const;

const TOOL_LABELS: Record<string, string> = {
  add_idea: "Add Idea",
  update_kanban: "Update Kanban",
  generate_tree: "Generate Tree",
  create_project_structure: "Create Project Structure",
};

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function AiChatPage() {
  const { hasFeature, loading: entitlementLoading, isAdmin } = useEntitlements();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [aiNotConfigured, setAiNotConfigured] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* --- Transport + useChat --- */
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ai/chat",
        body: { sessionId: activeSessionId },
        credentials: "include",
      }),
    [activeSessionId]
  );

  const { messages, sendMessage, status, setMessages, error } = useChat({
    transport,
    onFinish: () => {
      fetchSessions();
    },
    onError: (err) => {
      // Check for 503 AI not configured
      if (err && typeof err === "object" && "message" in err) {
        const msg = String((err as { message: string }).message);
        if (msg.includes("503") || msg.includes("ai_not_configured")) {
          setAiNotConfigured(true);
        }
      }
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  /* --- Auto-scroll on new messages --- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  /* --- Fetch sessions --- */
  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/sessions", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch {
      // silently fail
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  /* --- Session handlers --- */
  const handleNewSession = useCallback(() => {
    setActiveSessionId(null);
    setMessages([]);
    setAiNotConfigured(false);
  }, [setMessages]);

  const handleSelectSession = useCallback(
    async (sessionId: string) => {
      setActiveSessionId(sessionId);
      setAiNotConfigured(false);
      try {
        const res = await fetch(`/api/ai/sessions/${sessionId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.session?.messages) {
            const formatted = data.session.messages.map(
              (msg: { id: string; role: string; content: string }) => ({
                id: msg.id,
                role: msg.role.toLowerCase(),
                content: msg.content,
                parts: [{ type: "text" as const, text: msg.content }],
              })
            );
            setMessages(formatted);
          }
        }
      } catch {
        // silently fail
      }
    },
    [setMessages]
  );

  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      if (deleteConfirm !== sessionId) {
        setDeleteConfirm(sessionId);
        return;
      }
      setDeleteConfirm(null);
      try {
        await fetch(`/api/ai/sessions/${sessionId}`, {
          method: "DELETE",
          credentials: "include",
        });
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (activeSessionId === sessionId) {
          setActiveSessionId(null);
          setMessages([]);
        }
      } catch {
        // silently fail
      }
    },
    [deleteConfirm, activeSessionId, setMessages]
  );

  /* --- Send message --- */
  const handleSend = useCallback(
    (text: string) => {
      setAiNotConfigured(false);
      sendMessage({ text });
    },
    [sendMessage]
  );

  /* --- Tool action (sends as user message) --- */
  const handleToolAction = useCallback(
    (toolKey: string) => {
      const label = TOOL_LABELS[toolKey] || toolKey;
      handleSend(`Please use the ${label} tool.`);
    },
    [handleSend]
  );

  /* --- Loading state --- */
  if (entitlementLoading) {
    return (
      <div className="view">
        <div className="view-header">
          <h1 className="view-title">AI CHAT</h1>
        </div>
        <div className="brutalist-card" style={{ padding: "var(--space-2xl)", textAlign: "center" }}>
          Loading...
        </div>
      </div>
    );
  }

  /* --- Upgrade prompt --- */
  if (!hasFeature("ai_chat") && !isAdmin) {
    return (
      <div className="view">
        <div className="view-header">
          <h1 className="view-title">AI CHAT</h1>
        </div>
        <div className="brutalist-card" style={{ padding: "var(--space-2xl)", textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
          <div style={{ fontSize: "2rem", marginBottom: "var(--space-md)" }}>AI</div>
          <h2 style={{ fontFamily: "var(--font-heading)", margin: "0 0 var(--space-md) 0" }}>
            AI CHAT REQUIRES AN UPGRADE
          </h2>
          <p style={{ fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "var(--space-lg)" }}>
            AI-powered chat with tool actions is available on Pro and Team plans.
            Upgrade your subscription to access intelligent project assistance.
          </p>
          <a href="/api/billing/checkout" className="brutalist-btn brutalist-btn--primary" style={{ textDecoration: "none" }}>
            UPGRADE TO PRO
          </a>
        </div>
      </div>
    );
  }

  /* --- Main render --- */
  return (
    <div className="view">
      <div className="view-header">
        <h1 className="view-title">AI CHAT</h1>
        <span className="chat-status">{"\u25CF"} CONNECTED</span>
      </div>

      <div style={{ display: "flex", gap: "var(--space-md)", minHeight: 0, flex: 1 }}>
        {/* ---- SESSION LIST SIDEBAR ---- */}
        <div
          className="brutalist-card"
          style={{
            width: 260,
            minWidth: 220,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "var(--space-md)",
              borderBottom: "var(--border-thick)",
            }}
          >
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.9rem" }}>
              SESSIONS
            </span>
            <button className="brutalist-btn brutalist-btn--primary" onClick={handleNewSession} style={{ fontSize: "0.75rem", padding: "var(--space-xs) var(--space-sm)" }}>
              + NEW
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-sm)" }}>
            {sessionsLoading && (
              <div style={{ padding: "var(--space-md)", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--color-gray-mid)" }}>
                Loading...
              </div>
            )}
            {!sessionsLoading && sessions.length === 0 && (
              <div style={{ padding: "var(--space-md)", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--color-gray-mid)" }}>
                No conversations yet
              </div>
            )}
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                style={{
                  padding: "var(--space-sm) var(--space-md)",
                  marginBottom: "var(--space-xs)",
                  border: activeSessionId === session.id ? "var(--border-thick)" : "2px solid transparent",
                  background: activeSessionId === session.id ? "var(--color-info)" : "transparent",
                  cursor: "pointer",
                  position: "relative",
                  fontFamily: "var(--font-heading)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    paddingRight: 28,
                    color: activeSessionId === session.id ? "var(--color-surface)" : "var(--color-text)",
                  }}
                >
                  {session.title}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    fontFamily: "var(--font-mono)",
                    color: activeSessionId === session.id ? "var(--color-surface)" : "var(--color-gray-mid)",
                    marginTop: 2,
                  }}
                >
                  {session.messageCount} msg
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSession(session.id);
                  }}
                  style={{
                    position: "absolute",
                    top: "var(--space-sm)",
                    right: "var(--space-sm)",
                    padding: "2px 6px",
                    border: "var(--border-thin)",
                    background: deleteConfirm === session.id ? "var(--color-warning)" : "var(--color-surface)",
                    color: deleteConfirm === session.id ? "var(--color-surface)" : "var(--color-text)",
                    cursor: "pointer",
                    fontSize: "0.7rem",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                  }}
                >
                  {deleteConfirm === session.id ? "CONFIRM?" : "\u2715"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ---- MAIN CHAT AREA ---- */}
        <div className="chat-container" style={{ flex: 1 }}>
          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 && !aiNotConfigured && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                  gap: "var(--space-md)",
                  padding: "var(--space-2xl)",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    border: "var(--border-thicker)",
                    boxShadow: "var(--shadow-brutal)",
                    background: "var(--color-info)",
                    color: "var(--color-surface)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                  }}
                >
                  AI
                </div>
                <h3 style={{ fontFamily: "var(--font-heading)", margin: 0, fontSize: "1.1rem" }}>
                  START A NEW CONVERSATION
                </h3>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--color-gray-mid)", textAlign: "center", maxWidth: 400, lineHeight: 1.6 }}>
                  Ask me to add ideas, update your kanban board, generate project trees, or scaffold project structures.
                </p>
                <button className="brutalist-btn brutalist-btn--primary" onClick={handleNewSession}>
                  + NEW CHAT
                </button>
              </div>
            )}

            {aiNotConfigured && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                  gap: "var(--space-md)",
                  padding: "var(--space-2xl)",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    border: "var(--border-thicker)",
                    boxShadow: "var(--shadow-brutal)",
                    background: "var(--color-warning)",
                    color: "var(--color-surface)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                  }}
                >
                  !
                </div>
                <h3 style={{ fontFamily: "var(--font-heading)", margin: 0, fontSize: "1.1rem" }}>
                  AI IS NOT CONFIGURED
                </h3>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--color-gray-mid)", textAlign: "center", maxWidth: 440, lineHeight: 1.6 }}>
                  Set OPENAI_API_KEY in your environment variables to enable AI chat. The chat feature requires a valid OpenAI API key to function.
                </p>
              </div>
            )}

            {error && !aiNotConfigured && (
              <div
                style={{
                  padding: "var(--space-md)",
                  border: "var(--border-thick)",
                  background: "var(--color-warning)",
                  color: "var(--color-surface)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  margin: "var(--space-md)",
                }}
              >
                Error: {error.message || "Something went wrong"}
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-msg chat-msg--${message.role === "user" ? "user" : "ai"}`}
              >
                <div className="chat-avatar">
                  {message.role === "user" ? "U" : "AI"}
                </div>
                <div className="chat-bubble">
                  {message.parts.map((part, i) => {
                    if (part.type === "text") {
                      return (
                        <div key={i}>
                          {(part as { type: string; text: string }).text.split("\n").map((line: string, j: number) => (
                            <p key={j} style={{ margin: "0 0 4px 0" }}>{line || "\u00A0"}</p>
                          ))}
                        </div>
                      );
                    }
                    if (part.type.startsWith("tool-")) {
                      const toolPart = part as { type: string; toolCallId?: string; toolName?: string; state: string; input?: unknown; output?: unknown };
                      const toolLabel = TOOL_LABELS[toolPart.toolName || ""] || toolPart.toolName || toolPart.type;
                      const isComplete = toolPart.state === "result";
                      const isRunning = toolPart.state === "call";
                      return (
                        <div
                          key={i}
                          style={{
                            margin: "var(--space-sm) 0",
                            border: "var(--border-thin)",
                            padding: "var(--space-sm) var(--space-md)",
                            background: "var(--color-background)",
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.8rem",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                            <span style={{ fontWeight: 700 }}>
                              {isComplete ? "\u2713" : isRunning ? "\u2026" : "\u2022"}
                            </span>
                            <span style={{ fontWeight: 600 }}>{toolLabel}</span>
                            <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: isComplete ? "var(--color-success)" : "var(--color-warning)" }}>
                              {isComplete ? "COMPLETED" : isRunning ? "RUNNING..." : toolPart.state}
                            </span>
                          </div>
                          {toolPart.input != null && (
                            <details style={{ marginTop: "var(--space-xs)" }}>
                              <summary style={{ cursor: "pointer", fontSize: "0.75rem", color: "var(--color-gray-mid)" }}>Parameters</summary>
                              <pre style={{ margin: "4px 0 0 0", padding: "var(--space-sm)", background: "var(--color-surface)", border: "var(--border-thin)", fontSize: "0.7rem", overflow: "auto", maxHeight: 160, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                {JSON.stringify(toolPart.input, null, 2)}
                              </pre>
                            </details>
                          )}
                          {isComplete && toolPart.output != null && (
                            <details open style={{ marginTop: "var(--space-xs)", borderTop: "var(--border-thin)", paddingTop: "var(--space-xs)" }}>
                              <summary style={{ cursor: "pointer", fontSize: "0.75rem", color: "var(--color-gray-mid)" }}>Result</summary>
                              <pre style={{ margin: "4px 0 0 0", padding: "var(--space-sm)", background: "var(--color-surface)", border: "var(--border-thin)", fontSize: "0.7rem", overflow: "auto", maxHeight: 160, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                {typeof toolPart.output === "string" ? toolPart.output : JSON.stringify(toolPart.output, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chat-msg chat-msg--ai">
                <div className="chat-avatar">AI</div>
                <div className="chat-bubble">
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--color-gray-mid)" }}>
                    Thinking...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Tool action buttons */}
          <div
            style={{
              display: "flex",
              gap: "var(--space-sm)",
              padding: "var(--space-sm) var(--space-md)",
              borderTop: "var(--border-thin)",
              background: "var(--color-background)",
              flexWrap: "wrap",
            }}
          >
            {TOOL_ACTIONS.map((tool) => (
              <button
                key={tool.key}
                className="brutalist-btn"
                onClick={() => handleToolAction(tool.key)}
                disabled={isLoading || aiNotConfigured}
                style={{
                  fontSize: "0.7rem",
                  padding: "var(--space-xs) var(--space-sm)",
                  opacity: isLoading || aiNotConfigured ? 0.5 : 1,
                }}
              >
                {tool.icon} {tool.label}
              </button>
            ))}
          </div>

          {/* Input area */}
          <ChatInputArea
            onSend={handleSend}
            isLoading={isLoading}
            disabled={aiNotConfigured}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Chat Input Area (inline component)                                 */
/* ------------------------------------------------------------------ */

function ChatInputArea({
  onSend,
  isLoading,
  disabled,
}: {
  onSend: (text: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input-area">
      <textarea
        ref={textareaRef}
        className="chat-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? "AI CHAT NOT AVAILABLE..." : "TYPE YOUR MESSAGE..."}
        disabled={isLoading || disabled}
        rows={2}
        aria-label="Chat message input"
        style={{ opacity: disabled ? 0.5 : 1 }}
      />
      <button
        type="submit"
        className="brutalist-btn brutalist-btn--primary chat-send-btn"
        disabled={!value.trim() || isLoading || disabled}
        style={{ opacity: !value.trim() || isLoading || disabled ? 0.5 : 1 }}
      >
        {isLoading ? "..." : "SEND \u25B6"}
      </button>
    </form>
  );
}
