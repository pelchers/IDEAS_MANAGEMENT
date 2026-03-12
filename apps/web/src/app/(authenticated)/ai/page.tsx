"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";

/* ── Types ── */
interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

/* ── Mock fallback responses (used when AI is not configured) ── */
const AI_CANNED_RESPONSES = [
  "That's a great question! Let me think about that for a moment. Based on current best practices, I'd suggest starting with user research to validate assumptions before committing to a specific implementation path.",
  "Interesting approach! Here are a few considerations: scalability of the solution, maintainability of the codebase, and the learning curve for new team members. Would you like me to dive deeper into any of these?",
  "I'd recommend breaking this down into smaller, testable hypotheses. Start with the core user flow, measure engagement, then iterate. This aligns well with lean methodology principles.",
  "Good thinking! From a technical perspective, you might want to consider using a modular architecture here. It would allow the team to work on features independently while maintaining consistency across the platform.",
];

export default function AiPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<"checking" | "connected" | "not_configured">("checking");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ── Check AI configuration on mount ── */
  useEffect(() => {
    fetch("/api/ai/config")
      .then((res) => res.json())
      .then((data) => {
        setAiStatus(data.provider !== "NONE" ? "connected" : "not_configured");
      })
      .catch(() => setAiStatus("not_configured"));
  }, []);

  /* ── Auto-scroll to bottom ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* ── Send message handler ── */
  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMessage: ChatMessage = { role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Build messages array for API
    const apiMessages = [...messages, userMessage].map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text,
    }));

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          sessionId,
        }),
      });

      // Capture session ID from response header
      const newSessionId = res.headers.get("X-Session-Id");
      if (newSessionId) setSessionId(newSessionId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);

        // AI not configured — fall back to mock responses
        if (res.status === 503 && errorData?.error === "ai_not_configured") {
          setTimeout(() => {
            const response = AI_CANNED_RESPONSES[Math.floor(Math.random() * AI_CANNED_RESPONSES.length)];
            setMessages((prev) => [...prev, { role: "ai", text: response }]);
            setIsTyping(false);
          }, 800);
          return;
        }

        throw new Error(errorData?.message || "AI request failed");
      }

      // Stream the response
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let aiText = "";

      // Add empty AI message that we'll update as chunks arrive
      setMessages((prev) => [...prev, { role: "ai", text: "" }]);
      setIsTyping(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Parse SSE data lines for text content
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("0:")) {
            // Vercel AI SDK text stream format: 0:"text content"
            try {
              const text = JSON.parse(line.slice(2));
              if (typeof text === "string") {
                aiText += text;
                // Update the last message in place
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "ai", text: aiText };
                  return updated;
                });
              }
            } catch {
              // Skip unparseable chunks
            }
          }
        }
      }

      // If no text was streamed, show a fallback
      if (!aiText) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "ai", text: "I received your message but couldn't generate a response. Please try again." };
          return updated;
        });
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong";
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: `Error: ${errMsg}` },
      ]);
      setIsTyping(false);
    }
  }, [input, isTyping, messages, sessionId]);

  /* ── Enter to send, Shift+Enter for newline ── */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      {/* View header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="nb-view-title">AI CHAT</h1>
        <span
          className={`font-mono text-[0.8rem] px-3 py-1 border-2 ${
            aiStatus === "connected"
              ? "text-malachite border-malachite"
              : aiStatus === "not_configured"
              ? "text-lemon border-lemon"
              : "text-gray-mid border-gray-mid"
          }`}
        >
          {aiStatus === "connected"
            ? "● CONNECTED"
            : aiStatus === "not_configured"
            ? "● MOCK MODE"
            : "● CHECKING..."}
        </span>
      </div>

      {/* Not configured banner */}
      {aiStatus === "not_configured" && (
        <div className="mb-4 p-3 border-2 border-lemon bg-lemon/10 font-mono text-[0.8rem]">
          AI not configured — using mock responses. Go to{" "}
          <a href="/settings" className="underline font-bold">Settings</a>{" "}
          to connect your OpenRouter account or add an API key.
        </div>
      )}

      {/* Chat container */}
      <div className="border-4 border-signal-black shadow-nb bg-white flex flex-col min-h-[400px] max-h-[calc(100vh-220px)]">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <p className="font-mono text-gray-mid text-[0.9rem]">
                Start a conversation...
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 max-w-[80%] ${
                msg.role === "user"
                  ? "self-end flex-row-reverse"
                  : "self-start"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 min-w-[36px] border-2 border-signal-black flex items-center justify-center font-mono font-semibold text-[0.8rem] ${
                  msg.role === "user"
                    ? "bg-watermelon text-white"
                    : "bg-signal-black text-malachite"
                }`}
              >
                {msg.role === "user" ? "JD" : "AI"}
              </div>

              {/* Bubble */}
              <div
                className={`border-3 border-signal-black p-4 text-[0.9rem] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-watermelon text-white shadow-nb"
                    : "bg-white shadow-nb"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-[80%] self-start">
              <div className="w-9 h-9 min-w-[36px] border-2 border-signal-black flex items-center justify-center font-mono font-semibold text-[0.8rem] bg-signal-black text-malachite">
                AI
              </div>
              <div className="border-3 border-signal-black p-4 text-[0.9rem] leading-relaxed bg-white shadow-nb">
                <span className="font-mono text-gray-mid animate-pulse">
                  TYPING...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex gap-2 p-4 border-t-4 border-signal-black bg-creamy-milk">
          <textarea
            ref={textareaRef}
            className="flex-1 font-mono text-[0.9rem] border-3 border-signal-black py-2 px-4 resize-none outline-none focus:shadow-nb bg-white"
            placeholder="TYPE YOUR MESSAGE..."
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
  );
}
