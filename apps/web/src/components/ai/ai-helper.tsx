"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { usePathname, useParams } from "next/navigation";

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

interface QuickAction {
  label: string;
  prompt: string;
}

function getPageContext(pathname: string): { pageName: string; quickActions: QuickAction[] } {
  if (pathname.includes("/schema")) return {
    pageName: "Schema Planner",
    quickActions: [
      { label: "Suggest entities", prompt: "Based on this project, suggest database entities I should add to my schema." },
      { label: "Normalize schema", prompt: "Review my current schema and suggest normalization improvements." },
      { label: "Explain relations", prompt: "Explain the relationships between the entities in my schema." },
    ],
  };
  if (pathname.includes("/ideas")) return {
    pageName: "Ideas",
    quickActions: [
      { label: "Brainstorm ideas", prompt: "Help me brainstorm new ideas for this project." },
      { label: "Prioritize", prompt: "Help me prioritize my current ideas by impact and effort." },
      { label: "Expand idea", prompt: "Take my most recent idea and expand it with more detail and actionable steps." },
    ],
  };
  if (pathname.includes("/kanban")) return {
    pageName: "Kanban Board",
    quickActions: [
      { label: "Suggest tasks", prompt: "Suggest tasks I should add to my kanban board based on the project." },
      { label: "Categorize", prompt: "Help me categorize and organize my current kanban cards." },
      { label: "Summarize board", prompt: "Summarize the current state of my kanban board." },
    ],
  };
  if (pathname.includes("/whiteboard")) return {
    pageName: "Whiteboard",
    quickActions: [
      { label: "Suggest stickies", prompt: "Suggest sticky notes I should add to brainstorm this topic." },
      { label: "Organize layout", prompt: "Suggest how I should organize the items on my whiteboard." },
    ],
  };
  if (pathname.includes("/directory-tree")) return {
    pageName: "Directory Tree",
    quickActions: [
      { label: "Suggest structure", prompt: "Suggest a good directory structure for this type of project." },
      { label: "Explain conventions", prompt: "Explain the file naming and folder conventions in my project structure." },
    ],
  };
  if (pathname.includes("/dashboard")) return {
    pageName: "Dashboard",
    quickActions: [
      { label: "Summarize", prompt: "Summarize my project activity and suggest what I should work on next." },
      { label: "Next actions", prompt: "What should I focus on next based on my current project state?" },
    ],
  };
  return { pageName: "General", quickActions: [] };
}

export function AiHelper() {
  const pathname = usePathname();
  const params = useParams();
  const projectId = params.id ? String(params.id) : undefined;
  const { pageName, quickActions } = getPageContext(pathname);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = useCallback(async (text?: string) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isTyping) return;

    const userMessage: ChatMessage = { role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    if (!text) setInput("");
    setIsTyping(true);

    const apiMessages = [...messages, userMessage].map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text,
    }));

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, projectId, pageContext: pageName }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        if (res.status === 503) {
          setMessages((prev) => [...prev, { role: "ai", text: "AI not configured. Go to Settings to connect your OpenRouter account." }]);
          setIsTyping(false);
          return;
        }
        throw new Error(errData?.message || "Request failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let aiText = "";
      setMessages((prev) => [...prev, { role: "ai", text: "" }]);
      setIsTyping(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (line.startsWith("0:")) {
            try {
              const t = JSON.parse(line.slice(2));
              if (typeof t === "string") {
                aiText += t;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "ai", text: aiText };
                  return updated;
                });
              }
            } catch { /* skip */ }
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "ai", text: `Error: ${err instanceof Error ? err.message : "Unknown error"}` }]);
      setIsTyping(false);
    }
  }, [input, isTyping, messages, projectId, pageName]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // Don't show on the /ai page (it has its own chat)
  if (pathname === "/ai") return null;

  return (
    <>
      {/* Floating bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed", bottom: "24px", right: "24px", zIndex: 1500,
            width: "56px", height: "56px", backgroundColor: "#282828", color: "#2BBF5D",
            border: "3px solid #282828", boxShadow: "4px 4px 0px #282828",
            fontSize: "1.4rem", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", fontWeight: 700,
          }}
          title={`AI Helper — ${pageName}`}
        >
          AI
        </button>
      )}

      {/* Expanded panel */}
      {isOpen && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 1500,
          width: "380px", height: "520px", backgroundColor: "#FFFFFF",
          border: "4px solid #282828", boxShadow: "8px 8px 0px #282828",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "10px 16px", backgroundColor: "#282828", color: "#F8F3EC",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              AI HELPER — {pageName.toUpperCase()}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              style={{ backgroundColor: "transparent", border: "none", color: "#F8F3EC", fontSize: "1.2rem", cursor: "pointer", fontWeight: 700 }}
            >X</button>
          </div>

          {/* Quick actions */}
          {quickActions.length > 0 && messages.length === 0 && (
            <div style={{ padding: "8px 12px", borderBottom: "2px solid #28282820", display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {quickActions.map((qa) => (
                <button
                  key={qa.label}
                  onClick={() => sendMessage(qa.prompt)}
                  style={{
                    padding: "4px 10px", fontSize: "0.7rem", fontFamily: "'IBM Plex Mono', monospace",
                    border: "2px solid #282828", backgroundColor: "#F8F3EC", cursor: "pointer",
                    fontWeight: 600, textTransform: "uppercase",
                  }}
                >
                  {qa.label}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {messages.length === 0 && (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.8rem", color: "#999", textAlign: "center" }}>
                  Ask me anything about your {pageName.toLowerCase()}...
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%", padding: "8px 12px", fontSize: "0.8rem", lineHeight: 1.5,
                border: "2px solid #282828",
                backgroundColor: msg.role === "user" ? "#FF5E54" : "#FFFFFF",
                color: msg.role === "user" ? "#FFFFFF" : "#282828",
                fontFamily: "'IBM Plex Mono', monospace",
                wordBreak: "break-word",
              }}>
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: "flex-start", padding: "8px 12px", border: "2px solid #282828", fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.8rem", color: "#999" }}>
                TYPING...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "8px", borderTop: "2px solid #282828", display: "flex", gap: "6px", backgroundColor: "#F8F3EC" }}>
            <textarea
              style={{
                flex: 1, fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.8rem",
                border: "2px solid #282828", padding: "6px 10px", resize: "none",
                outline: "none", backgroundColor: "#FFFFFF", boxSizing: "border-box",
              }}
              placeholder="Ask AI..."
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              style={{
                padding: "6px 12px", backgroundColor: "#282828", color: "#FFFFFF",
                border: "2px solid #282828", fontWeight: 700, fontSize: "0.75rem",
                cursor: "pointer", alignSelf: "flex-end", textTransform: "uppercase",
              }}
            >
              SEND
            </button>
          </div>
        </div>
      )}
    </>
  );
}
