"use client";

import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import { ToolCallDisplay } from "./tool-call-display";

interface ChatMessageListProps {
  messages: UIMessage[];
  isLoading: boolean;
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>AI</div>
        <h3 style={styles.emptyTitle}>Start a conversation</h3>
        <p style={styles.emptyText}>
          Ask me to add ideas, update your kanban board, generate project trees, or scaffold project structures.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {messages.map((message) => (
        <div
          key={message.id}
          style={{
            ...styles.message,
            ...(message.role === "user" ? styles.userMessage : styles.assistantMessage),
          }}
        >
          <div style={styles.roleLabel}>
            {message.role === "user" ? "You" : "AI Assistant"}
          </div>
          <div style={styles.content}>
            {message.parts.map((part, i) => {
              if (part.type === "text") {
                return (
                  <div key={i} style={styles.textContent}>
                    {part.text.split("\n").map((line, j) => (
                      <p key={j} style={styles.paragraph}>{line || "\u00A0"}</p>
                    ))}
                  </div>
                );
              }
              // Tool invocation parts in AI SDK v6 have type matching "tool-*"
              if (part.type.startsWith("tool-")) {
                const toolPart = part as { type: string; toolCallId: string; toolName?: string; state: string; input?: unknown; output?: unknown };
                return (
                  <ToolCallDisplay
                    key={i}
                    toolName={(toolPart.toolName || toolPart.type) as string}
                    args={(toolPart.input ?? {}) as Record<string, unknown>}
                    state={toolPart.state}
                    result={toolPart.output}
                  />
                );
              }
              return null;
            })}
          </div>
        </div>
      ))}
      {isLoading && (
        <div style={{ ...styles.message, ...styles.assistantMessage }}>
          <div style={styles.roleLabel}>AI Assistant</div>
          <div style={styles.thinking}>Thinking...</div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "16px",
    overflowY: "auto",
    flex: 1,
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: "12px",
    color: "#666",
    padding: "40px",
  },
  emptyIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "#e8e4ff",
    color: "#5b4dc7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "bold",
  },
  emptyTitle: {
    margin: 0,
    fontSize: "18px",
    color: "#333",
  },
  emptyText: {
    margin: 0,
    fontSize: "14px",
    textAlign: "center" as const,
    maxWidth: "400px",
    lineHeight: "1.5",
  },
  message: {
    padding: "12px 16px",
    borderRadius: "8px",
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#e8e4ff",
    color: "#1a1a2e",
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f5f5f5",
    color: "#1a1a2e",
  },
  roleLabel: {
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    color: "#888",
    marginBottom: "4px",
  },
  content: {
    fontSize: "14px",
    lineHeight: "1.6",
  },
  textContent: {},
  paragraph: {
    margin: "0 0 4px 0",
  },
  thinking: {
    fontSize: "14px",
    color: "#888",
    fontStyle: "italic",
  },
};
