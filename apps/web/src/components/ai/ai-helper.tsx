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
  const [helperSessionId, setHelperSessionId] = useState<string | null>(null);
  const [showSessions, setShowSessions] = useState(false);
  const [recentSessions, setRecentSessions] = useState<{ id: string; title: string; messageCount: number }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persist/load helper session per page + load recent sessions
  const sessionKey = `ai_helper_session_${pathname}`;
  useEffect(() => {
    if (!isOpen) return;
    // Load saved session for this page
    const savedId = typeof window !== "undefined" ? localStorage.getItem(sessionKey) : null;
    if (savedId) {
      setHelperSessionId(savedId);
      fetch(`/api/ai/sessions/${savedId}`).then((r) => r.json()).then((d) => {
        if (d.ok && d.session?.messages) {
          setMessages(d.session.messages.filter((m: { role: string }) => m.role !== "TOOL").map((m: { role: string; content: string }) => ({
            role: m.role === "USER" ? "user" as const : "ai" as const,
            text: m.content,
          })));
        }
      }).catch(() => {});
    }
    // Load recent sessions
    fetch("/api/ai/sessions").then((r) => r.json()).then((d) => {
      if (d.ok && d.sessions) setRecentSessions(d.sessions.slice(0, 5));
    }).catch(() => {});
  }, [sessionKey, isOpen]);

  const switchHelperSession = useCallback(async (sid: string) => {
    setHelperSessionId(sid);
    if (typeof window !== "undefined") localStorage.setItem(sessionKey, sid);
    setShowSessions(false);
    try {
      const res = await fetch(`/api/ai/sessions/${sid}`);
      const d = await res.json();
      if (d.ok && d.session?.messages) {
        setMessages(d.session.messages.filter((m: { role: string }) => m.role !== "TOOL").map((m: { role: string; content: string }) => ({
          role: m.role === "USER" ? "user" as const : "ai" as const,
          text: m.content,
        })));
      }
    } catch { setMessages([]); }
  }, [sessionKey]);

  const deleteHelperSession = useCallback(async (sid: string) => {
    await fetch(`/api/ai/sessions/${sid}`, { method: "DELETE" }).catch(() => {});
    if (helperSessionId === sid) { setHelperSessionId(null); setMessages([]); if (typeof window !== "undefined") localStorage.removeItem(sessionKey); }
    setRecentSessions((prev) => prev.filter((s) => s.id !== sid));
  }, [helperSessionId, sessionKey]);

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
        body: JSON.stringify({ messages: apiMessages, projectId, pageContext: pageName, sessionId: helperSessionId }),
      });

      // Save session ID from response
      const newSessionId = res.headers.get("X-Session-Id");
      if (newSessionId) {
        setHelperSessionId(newSessionId);
        if (typeof window !== "undefined") localStorage.setItem(sessionKey, newSessionId);
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        if (res.status === 503) {
          setMessages((prev) => [...prev, { role: "ai", text: "AI not available. Install Ollama for free local AI, or add an API key in Settings." }]);
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
          const trimmed = line.trim();
          // Vercel AI SDK v6 SSE format
          if (trimmed.startsWith("data: ")) {
            try {
              const evt = JSON.parse(trimmed.slice(6));
              if (evt.type === "text-delta" && typeof evt.delta === "string") {
                aiText += evt.delta;
                setMessages((prev) => { const u = [...prev]; u[u.length - 1] = { role: "ai", text: aiText }; return u; });
              }
              // Tool output — dispatch for live reactivity
              if (evt.type === "tool-output-available") {
                const resultMsg = evt.output?.message || "Action completed.";
                if (!aiText) { aiText = String(resultMsg); setMessages((prev) => { const u = [...prev]; u[u.length - 1] = { role: "ai", text: aiText }; return u; }); }
                window.dispatchEvent(new CustomEvent("artifact-updated", { detail: { tool: evt.toolName || "unknown", result: evt.output } }));
              }
            } catch { /* skip */ }
          }
          // Legacy format fallback
          if (trimmed.startsWith("0:")) {
            try {
              const t = JSON.parse(trimmed.slice(2));
              if (typeof t === "string") {
                aiText += t;
                setMessages((prev) => { const u = [...prev]; u[u.length - 1] = { role: "ai", text: aiText }; return u; });
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
              AI — {pageName.toUpperCase()}
            </span>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                onClick={() => setShowSessions(!showSessions)}
                style={{ backgroundColor: showSessions ? "#F8F3EC" : "transparent", border: "1px solid #F8F3EC", color: showSessions ? "#282828" : "#F8F3EC", fontSize: "0.6rem", cursor: "pointer", fontWeight: 700, padding: "2px 6px", textTransform: "uppercase" }}
                title="View sessions"
              >{recentSessions.length > 0 ? `${recentSessions.length}` : "0"}</button>
              <button
                onClick={() => { window.location.href = helperSessionId ? `/ai?session=${helperSessionId}` : "/ai"; }}
                style={{ backgroundColor: "transparent", border: "1px solid #F8F3EC", color: "#F8F3EC", fontSize: "0.6rem", cursor: "pointer", fontWeight: 700, padding: "2px 6px", textTransform: "uppercase" }}
                title="Expand to full chat"
              >EXPAND</button>
              <button
                onClick={() => { setMessages([]); setHelperSessionId(null); if (typeof window !== "undefined") localStorage.removeItem(sessionKey); setShowSessions(false); }}
                style={{ backgroundColor: "transparent", border: "1px solid #F8F3EC", color: "#F8F3EC", fontSize: "0.6rem", cursor: "pointer", fontWeight: 700, padding: "2px 6px", textTransform: "uppercase" }}
                title="New conversation"
              >NEW</button>
              <button
                onClick={() => setIsOpen(false)}
                style={{ backgroundColor: "transparent", border: "none", color: "#F8F3EC", fontSize: "1.2rem", cursor: "pointer", fontWeight: 700 }}
              >X</button>
            </div>
          </div>

          {/* Session list (collapsible) */}
          {showSessions && recentSessions.length > 0 && (
            <div style={{ borderBottom: "2px solid #28282820", maxHeight: "150px", overflowY: "auto" }}>
              {recentSessions.map((s) => (
                <div
                  key={s.id}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 12px", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.7rem", borderBottom: "1px dashed #28282815" }}
                  onClick={() => switchHelperSession(s.id)}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, fontWeight: helperSessionId === s.id ? 700 : 400 }}>{s.title}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteHelperSession(s.id); }}
                    style={{ background: "none", border: "none", color: "#FF5E54", cursor: "pointer", fontWeight: 700, fontSize: "0.65rem", padding: "0 4px" }}
                  >X</button>
                </div>
              ))}
              <div
                style={{ padding: "4px 12px", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.65rem", color: "#999", textTransform: "uppercase", textAlign: "center" }}
                onClick={() => { window.location.href = "/ai"; }}
              >
                VIEW ALL →
              </div>
            </div>
          )}

          {/* Quick actions */}
          {quickActions.length > 0 && messages.length === 0 && !showSessions && (
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
