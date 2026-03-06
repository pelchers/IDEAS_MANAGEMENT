"use client";

import { useState, useCallback, useMemo } from "react";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { useEntitlements } from "@/hooks/use-entitlements";
import { ChatMessageList } from "@/components/ai/chat-message-list";
import { ChatInput } from "@/components/ai/chat-input";
import { ProjectSelector } from "@/components/ai/project-selector";
import { SessionList } from "@/components/ai/session-list";
import { UpgradePrompt } from "@/components/ai/upgrade-prompt";

export default function AiChatPage() {
  const { hasFeature, loading: entitlementLoading, isAdmin } = useEntitlements();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ai/chat",
        body: {
          sessionId: activeSessionId,
          projectId,
        },
        credentials: "include",
      }),
    [activeSessionId, projectId]
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
    onFinish: () => {
      // Refresh session list after message exchange
      setRefreshTrigger((prev) => prev + 1);
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  const handleSend = useCallback(
    (text: string) => {
      sendMessage({ text });
    },
    [sendMessage]
  );

  const handleNewSession = useCallback(() => {
    setActiveSessionId(null);
    setMessages([]);
  }, [setMessages]);

  const handleSelectSession = useCallback(
    async (sessionId: string) => {
      setActiveSessionId(sessionId);
      // Load session messages
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
          if (data.session?.projectId) {
            setProjectId(data.session.projectId);
          }
        }
      } catch {
        // silently fail
      }
    },
    [setMessages]
  );

  // Show loading state
  if (entitlementLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Loading...</div>
      </div>
    );
  }

  // Show upgrade prompt for users without AI_CHAT entitlement
  if (!hasFeature("ai_chat") && !isAdmin) {
    return <UpgradePrompt />;
  }

  return (
    <div style={styles.page}>
      <SessionList
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        refreshTrigger={refreshTrigger}
      />
      <div style={styles.main}>
        <ProjectSelector projectId={projectId} onProjectChange={setProjectId} />
        <ChatMessageList messages={messages} isLoading={isLoading} />
        <ChatInput
          onSend={handleSend}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    height: "100vh",
    fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  loadingText: {
    fontSize: "14px",
    color: "#888",
  },
};
