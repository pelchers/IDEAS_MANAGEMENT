"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";

/* ── Types ── */
interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
}

interface ChatMessage {
  role: "user" | "ai" | "tool";
  text: string;
  toolCalls?: ToolCall[];
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ── Check AI config on mount ── */
  useEffect(() => {
    fetch("/api/ai/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.provider === "OLLAMA_LOCAL") setAiStatus("local");
        else if (data.provider !== "NONE") setAiStatus("connected");
        else {
          // Auto-detect Ollama
          fetch("http://localhost:11434/api/tags", { signal: AbortSignal.timeout(2000) })
            .then((r) => { if (r.ok) setAiStatus("local"); else setAiStatus("not_configured"); })
            .catch(() => setAiStatus("not_configured"));
        }
      })
      .catch(() => setAiStatus("not_configured"));
  }, []);

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
      case "/clear": setMessages([]); break;
      case "/rename": if (sessionId && parts[1]) renameSession(sessionId, parts.slice(1).join(" ")); break;
      case "/export": exportSession(); setMessages((prev) => [...prev, { role: "ai", text: "Session exported as markdown." }]); break;
      case "/help":
        setMessages((prev) => [...prev, { role: "ai", text: "**Available commands:**\n- `/new` — Start new session\n- `/clear` — Clear messages\n- `/rename <title>` — Rename session\n- `/export` — Download as markdown\n- `/help` — Show this help" }]);
        break;
      default: setMessages((prev) => [...prev, { role: "ai", text: `Unknown command: ${command}. Type /help for available commands.` }]);
    }
  }, [newChat, sessionId, renameSession, exportSession]);

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

    const apiMessages = [...messages, userMessage]
      .filter((m) => m.role !== "tool")
      .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, sessionId }),
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
        if (res.status === 403) {
          setMessages((prev) => [...prev, { role: "ai", text: "Built-in AI requires a subscription. You can:\n1. Subscribe to a Pro or Team plan for built-in AI access\n2. Add your own API key (OpenAI, Anthropic, Google) in Settings — no subscription needed\n3. If you're an admin, enable AI access in Settings > AI Configuration" }]);
          setIsTyping(false);
          return;
        }
        const errMsg = errorData?.message || errorData?.error || `Server error (${res.status})`;
        throw new Error(errMsg);
      }

      // Stream the response — parse text + tool calls
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let aiText = "";
      const pendingToolCalls: ToolCall[] = [];

      setMessages((prev) => [...prev, { role: "ai", text: "" }]);
      setIsTyping(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          const trimmed = line.trim();

          // Vercel AI SDK v6 SSE format: "data: {...}"
          if (trimmed.startsWith("data: ")) {
            try {
              const evt = JSON.parse(trimmed.slice(6));
              // Text delta
              if (evt.type === "text-delta" && typeof evt.delta === "string") {
                aiText += evt.delta;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "ai", text: aiText, toolCalls: pendingToolCalls.length > 0 ? [...pendingToolCalls] : undefined };
                  return updated;
                });
              }
              // Tool call start (tool-call or tool-input-start)
              if ((evt.type === "tool-call" || evt.type === "tool-input-start") && evt.toolName) {
                pendingToolCalls.push({ name: evt.toolName, args: {} });
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "ai", text: aiText, toolCalls: [...pendingToolCalls] };
                  return updated;
                });
              }
              // Tool input available (full args)
              if (evt.type === "tool-input-available" && pendingToolCalls.length > 0) {
                const lastTc = pendingToolCalls[pendingToolCalls.length - 1];
                lastTc.args = evt.input || {};
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "ai", text: aiText, toolCalls: [...pendingToolCalls] };
                  return updated;
                });
              }
              // Tool result (tool-result or tool-output-available)
              if ((evt.type === "tool-result" || evt.type === "tool-output-available") && pendingToolCalls.length > 0) {
                const lastTc = pendingToolCalls[pendingToolCalls.length - 1];
                lastTc.result = evt.output || evt.result || evt;
                // If tool succeeded but AI didn't generate text, show tool summary as text
                if (!aiText) {
                  const resultMsg = typeof lastTc.result === "object" && lastTc.result !== null && "message" in (lastTc.result as Record<string,unknown>)
                    ? String((lastTc.result as Record<string,unknown>).message)
                    : `Tool ${lastTc.name} executed successfully.`;
                  aiText = resultMsg;
                }
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "ai", text: aiText, toolCalls: [...pendingToolCalls] };
                  return updated;
                });
              }
              // Error
              if (evt.type === "error") {
                aiText = aiText || `Error: ${evt.errorText || "Unknown error"}`;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "ai", text: aiText };
                  return updated;
                });
              }
            } catch { /* skip unparseable */ }
          }

          // Legacy format fallback (0:, 9:, a: prefixes)
          if (trimmed.startsWith("0:")) {
            try {
              const text = JSON.parse(trimmed.slice(2));
              if (typeof text === "string") {
                aiText += text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "ai", text: aiText, toolCalls: pendingToolCalls.length > 0 ? [...pendingToolCalls] : undefined };
                  return updated;
                });
              }
            } catch { /* skip */ }
          }
        }
      }

      // If tools were called but AI didn't generate text, make a follow-up call
      // to get a natural language confirmation
      if (pendingToolCalls.length > 0 && !aiText.includes("Error")) {
        try {
          const toolSummary = pendingToolCalls.map((tc) => {
            const resultMsg = tc.result && typeof tc.result === "object" && "message" in (tc.result as Record<string,unknown>)
              ? String((tc.result as Record<string,unknown>).message) : "completed";
            return `Tool ${tc.name}: ${resultMsg}`;
          }).join(". ");

          const followUp = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [
                ...apiMessages,
                { role: "assistant", content: `I used tools to help you. Results: ${toolSummary}` },
                { role: "user", content: "Please confirm what you just did in a brief, friendly message." },
              ],
              sessionId: newSessionId || sessionId,
            }),
          });
          if (followUp.ok) {
            const reader2 = followUp.body?.getReader();
            if (reader2) {
              const decoder2 = new TextDecoder();
              let confirmText = "";
              while (true) {
                const { done, value } = await reader2.read();
                if (done) break;
                const chunk = decoder2.decode(value, { stream: true });
                for (const line of chunk.split("\n")) {
                  const t = line.trim();
                  if (t.startsWith("data: ")) {
                    try {
                      const evt = JSON.parse(t.slice(6));
                      if (evt.type === "text-delta" && typeof evt.delta === "string") confirmText += evt.delta;
                    } catch { /* skip */ }
                  }
                }
              }
              if (confirmText) {
                aiText = confirmText;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "ai", text: confirmText, toolCalls: [...pendingToolCalls] };
                  return updated;
                });
              }
            }
          }
        } catch { /* follow-up failed, tool result message already shown */ }

        // Dispatch artifact-updated event for live reactivity
        pendingToolCalls.forEach((tc) => {
          window.dispatchEvent(new CustomEvent("artifact-updated", { detail: { tool: tc.name, result: tc.result } }));
        });
      }

      if (!aiText && pendingToolCalls.length === 0) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "ai", text: "I received your message but couldn't generate a response. Please try again." };
          return updated;
        });
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong";
      setMessages((prev) => [...prev, { role: "ai", text: `Error: ${errMsg}` }]);
      setIsTyping(false);
    }
  }, [input, isTyping, messages, sessionId, handleSlashCommand, loadSessions]);

  /* ── Keyboard ── */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    // Show slash menu
    setShowSlashMenu(input.startsWith("/") && !input.includes(" "));
  };

  const filteredSessions = searchQuery
    ? sessions.filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : sessions;

  const statusLabel = aiStatus === "connected" ? "CONNECTED" : aiStatus === "local" ? "LOCAL AI" : aiStatus === "not_configured" ? "NOT CONFIGURED" : "CHECKING...";
  const statusColor = aiStatus === "connected" ? "text-malachite border-malachite" : aiStatus === "local" ? "text-cornflower border-cornflower" : aiStatus === "not_configured" ? "text-watermelon border-watermelon" : "text-gray-mid border-gray-mid";

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      {/* View header */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <h1 className="nb-view-title">AI CHAT</h1>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button onClick={exportSession} className="nb-btn nb-btn--small font-mono text-[0.7rem]">EXPORT</button>
          )}
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
            <button onClick={newChat} className="text-[0.65rem] px-2 py-0.5 bg-malachite text-white border border-malachite font-bold cursor-pointer hover:opacity-80">+ NEW</button>
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
                {/* Regular message */}
                {msg.role !== "tool" && (
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "self-end flex-row-reverse" : "self-start"}`}>
                    <div className={`w-9 h-9 min-w-[36px] border-2 border-signal-black flex items-center justify-center font-mono font-semibold text-[0.8rem] ${msg.role === "user" ? "bg-watermelon text-white" : "bg-signal-black text-malachite"}`}>
                      {msg.role === "user" ? "U" : "AI"}
                    </div>
                    <div className={`border-3 border-signal-black p-4 text-[0.9rem] leading-relaxed ${msg.role === "user" ? "bg-watermelon text-white shadow-nb" : "bg-white shadow-nb"}`}>
                      <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>

                      {/* Tool call cards */}
                      {msg.toolCalls && msg.toolCalls.length > 0 && (
                        <div className="mt-3 flex flex-col gap-2">
                          {msg.toolCalls.map((tc, j) => (
                            <details key={j} className="border-2 border-signal-black bg-creamy-milk">
                              <summary className="px-3 py-1.5 cursor-pointer font-mono text-[0.75rem] uppercase font-bold flex items-center gap-2">
                                <span className={`w-2 h-2 ${tc.result ? "bg-malachite" : "bg-lemon"}`} />
                                {tc.name.replace(/_/g, " ")}
                              </summary>
                              <div className="px-3 py-2 border-t border-signal-black/20 font-mono text-[0.7rem]">
                                <div className="mb-1"><strong>Args:</strong> {JSON.stringify(tc.args, null, 1)}</div>
                                {tc.result != null && <div><strong>Result:</strong> {String(typeof tc.result === "object" ? JSON.stringify(tc.result) : tc.result)}</div>}
                              </div>
                            </details>
                          ))}
                        </div>
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
