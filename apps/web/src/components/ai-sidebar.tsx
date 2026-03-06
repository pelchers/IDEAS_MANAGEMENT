"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { useEntitlements } from "@/hooks/use-entitlements";

interface AiSidebarProps {
  /** Current project ID for context injection */
  projectId?: string | null;
  /** Current route/page name for context */
  currentRoute?: string;
}

/**
 * AI Sidebar component -- collapsible panel on the right side.
 * Provides a compact chat interface with quick action buttons.
 * Auto-injects current project context and route.
 */
export function AiSidebar({ projectId, currentRoute }: AiSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { hasFeature, isAdmin } = useEntitlements();

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ai/chat",
        body: {
          projectId: projectId ?? undefined,
        },
        credentials: "include",
      }),
    [projectId]
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    id: "ai-sidebar",
    transport,
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Keyboard shortcut: Ctrl/Cmd + Shift + A to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "A") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;
    sendMessage({ text: trimmed });
    setInputValue("");
  };

  const handleQuickAction = useCallback((action: string) => {
    const actions: Record<string, string> = {
      add_idea: `Add a new idea to project ${projectId || "(please specify project ID)"}`,
      update_board: `Show me the kanban board for project ${projectId || "(please specify project ID)"} and help me update it`,
      generate_tree: `Generate a directory tree structure for project ${projectId || "(please specify project ID)"}`,
    };
    const message = actions[action] || action;
    sendMessage({ text: message });
  }, [projectId, sendMessage]);

  const canUseAi = hasFeature("ai_chat") || isAdmin;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={styles.toggleButton}
        title="Toggle AI Sidebar (Ctrl+Shift+A)"
      >
        AI
      </button>

      {/* Sidebar panel */}
      {isOpen && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <h3 style={styles.headerTitle}>AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} style={styles.closeButton}>
              x
            </button>
          </div>

          {currentRoute && (
            <div style={styles.contextBar}>
              <span style={styles.contextLabel}>Context:</span>
              <span style={styles.contextValue}>
                {currentRoute}
                {projectId ? ` | ${projectId}` : ""}
              </span>
            </div>
          )}

          {!canUseAi ? (
            <div style={styles.upgradeContainer}>
              <p style={styles.upgradeText}>
                AI Chat requires a Pro or Team subscription.
              </p>
              <a href="/api/billing/checkout" style={styles.upgradeLink}>
                Upgrade now
              </a>
            </div>
          ) : (
            <>
              {/* Quick actions */}
              <div style={styles.quickActions}>
                <button
                  onClick={() => handleQuickAction("add_idea")}
                  style={styles.quickButton}
                  disabled={isLoading}
                >
                  Add Idea
                </button>
                <button
                  onClick={() => handleQuickAction("update_board")}
                  style={styles.quickButton}
                  disabled={isLoading}
                >
                  Update Board
                </button>
                <button
                  onClick={() => handleQuickAction("generate_tree")}
                  style={styles.quickButton}
                  disabled={isLoading}
                >
                  Generate Tree
                </button>
              </div>

              {/* Messages */}
              <div style={styles.messages}>
                {messages.length === 0 && (
                  <div style={styles.emptyText}>
                    Use quick actions or type a message below.
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      ...styles.message,
                      ...(msg.role === "user" ? styles.userMsg : styles.assistantMsg),
                    }}
                  >
                    <div style={styles.msgRole}>
                      {msg.role === "user" ? "You" : "AI"}
                    </div>
                    <div style={styles.msgContent}>
                      {msg.parts.map((part, i) => {
                        if (part.type === "text") {
                          return <span key={i}>{part.text}</span>;
                        }
                        if (part.type.startsWith("tool-")) {
                          const toolPart = part as unknown as { type: string; toolName?: string; state: string };
                          return (
                            <div key={i} style={styles.toolTag}>
                              Tool: {toolPart.toolName || toolPart.type}
                              {toolPart.state === "result" ? " (done)" : " (running...)"}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div style={{ ...styles.message, ...styles.assistantMsg }}>
                    <div style={styles.msgContent}>Thinking...</div>
                  </div>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSend} style={styles.inputForm}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask AI..."
                  disabled={isLoading}
                  style={styles.input}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  style={styles.sendButton}
                >
                  Go
                </button>
              </form>

              {/* Clear chat */}
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  style={styles.clearButton}
                >
                  Clear chat
                </button>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  toggleButton: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "#5b4dc7",
    color: "#fff",
    border: "none",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(91,77,199,0.4)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  panel: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "360px",
    height: "100vh",
    backgroundColor: "#fff",
    borderLeft: "1px solid #e0e0e0",
    boxShadow: "-4px 0 12px rgba(0,0,0,0.08)",
    zIndex: 999,
    display: "flex",
    flexDirection: "column",
    fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid #e0e0e0",
  },
  headerTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: "4px 8px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "16px",
    color: "#888",
  },
  contextBar: {
    padding: "6px 16px",
    backgroundColor: "#f8f8f8",
    borderBottom: "1px solid #eee",
    fontSize: "11px",
    display: "flex",
    gap: "4px",
  },
  contextLabel: {
    fontWeight: "600",
    color: "#888",
  },
  contextValue: {
    color: "#555",
  },
  upgradeContainer: {
    padding: "32px 16px",
    textAlign: "center" as const,
  },
  upgradeText: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "12px",
  },
  upgradeLink: {
    color: "#5b4dc7",
    fontWeight: "600",
    textDecoration: "underline",
  },
  quickActions: {
    display: "flex",
    gap: "6px",
    padding: "10px 16px",
    borderBottom: "1px solid #eee",
    flexWrap: "wrap" as const,
  },
  quickButton: {
    padding: "5px 10px",
    fontSize: "12px",
    fontWeight: "500",
    border: "1px solid #d0d0d0",
    borderRadius: "14px",
    backgroundColor: "#fff",
    cursor: "pointer",
    color: "#5b4dc7",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  emptyText: {
    textAlign: "center" as const,
    color: "#aaa",
    fontSize: "13px",
    padding: "20px",
  },
  message: {
    padding: "8px 10px",
    borderRadius: "6px",
    fontSize: "13px",
    lineHeight: "1.5",
    maxWidth: "90%",
  },
  userMsg: {
    alignSelf: "flex-end",
    backgroundColor: "#e8e4ff",
  },
  assistantMsg: {
    alignSelf: "flex-start",
    backgroundColor: "#f5f5f5",
  },
  msgRole: {
    fontSize: "10px",
    fontWeight: "600",
    textTransform: "uppercase" as const,
    color: "#999",
    marginBottom: "2px",
  },
  msgContent: {
    wordBreak: "break-word" as const,
  },
  toolTag: {
    display: "inline-block",
    padding: "2px 8px",
    backgroundColor: "#e8e4ff",
    borderRadius: "4px",
    fontSize: "11px",
    marginTop: "4px",
    color: "#5b4dc7",
  },
  inputForm: {
    display: "flex",
    gap: "6px",
    padding: "10px 12px",
    borderTop: "1px solid #e0e0e0",
  },
  input: {
    flex: 1,
    padding: "8px 10px",
    border: "1px solid #d0d0d0",
    borderRadius: "6px",
    fontSize: "13px",
    outline: "none",
    fontFamily: "inherit",
  },
  sendButton: {
    padding: "8px 14px",
    backgroundColor: "#5b4dc7",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  clearButton: {
    padding: "6px",
    border: "none",
    backgroundColor: "transparent",
    color: "#aaa",
    cursor: "pointer",
    fontSize: "11px",
    textAlign: "center" as const,
    borderTop: "1px solid #eee",
  },
};
