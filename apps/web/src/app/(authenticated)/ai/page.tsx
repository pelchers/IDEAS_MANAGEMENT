"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";

/* ── Types ── */
interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

/* ── Mock Data (from pass-1) ── */
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: "user",
    text: "Can you help me brainstorm features for the mobile app redesign?",
  },
  {
    role: "ai",
    text: "Of course! Here are some directions to consider: gesture-based navigation, offline mode with smart sync, customizable dashboard widgets, and a quick-capture floating button for ideas on the go.",
  },
  {
    role: "user",
    text: "I like the gesture navigation idea. What patterns work best for productivity apps?",
  },
  {
    role: "ai",
    text: "For productivity apps, swipe-to-action on list items (archive, delete, flag) works great. Also consider pinch-to-zoom on kanban boards, pull-to-refresh, and a bottom sheet for quick actions. Keep gesture discoverability in mind — subtle hints on first use help.",
  },
  {
    role: "user",
    text: "What about accessibility with gesture controls?",
  },
  {
    role: "ai",
    text: "Critical point! Always provide button alternatives for every gesture. Use haptic feedback for confirmation, support VoiceOver/TalkBack for all interactive elements, and ensure tap targets are at least 44px. Consider adding a gesture guide in settings that users can reference anytime.",
  },
];

const AI_CANNED_RESPONSES = [
  "That's a great question! Let me think about that for a moment. Based on current best practices, I'd suggest starting with user research to validate assumptions before committing to a specific implementation path.",
  "Interesting approach! Here are a few considerations: scalability of the solution, maintainability of the codebase, and the learning curve for new team members. Would you like me to dive deeper into any of these?",
  "I'd recommend breaking this down into smaller, testable hypotheses. Start with the core user flow, measure engagement, then iterate. This aligns well with lean methodology principles.",
  "Good thinking! From a technical perspective, you might want to consider using a modular architecture here. It would allow the team to work on features independently while maintaining consistency across the platform.",
];

export default function AiPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ── Auto-scroll to bottom ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* ── Send message handler ── */
  const sendMessage = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response after 800ms (pass-1 behavior)
    setTimeout(() => {
      const response =
        AI_CANNED_RESPONSES[
          Math.floor(Math.random() * AI_CANNED_RESPONSES.length)
        ];
      setMessages((prev) => [...prev, { role: "ai", text: response }]);
      setIsTyping(false);
    }, 800);
  }, [input]);

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
        <span className="font-mono text-[0.8rem] text-malachite px-3 py-1 border-2 border-malachite">
          ● CONNECTED
        </span>
      </div>

      {/* Chat container */}
      <div className="border-4 border-signal-black shadow-nb bg-white flex flex-col min-h-[400px] max-h-[calc(100vh-220px)]">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
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
