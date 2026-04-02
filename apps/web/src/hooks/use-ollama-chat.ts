"use client";

import { useState, useCallback, useRef } from "react";
import { streamOllamaChat, type OllamaChatMessage, type OllamaToolDef } from "@/lib/ollama-chat";
import type { OllamaStatus } from "@/lib/ollama-client";

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
  provider?: string;
}

interface UseOllamaChatOptions {
  ollamaStatus: OllamaStatus;
  systemPrompt: string;
  tools: OllamaToolDef[];
  sessionId: string | null;
  onSessionCreated?: (id: string) => void;
}

/**
 * React hook for client-side Ollama chat.
 * Streams from the user's local Ollama, sends tool calls to our server.
 * Saves messages to our DB for persistence.
 */
export function useOllamaChat({
  ollamaStatus,
  systemPrompt,
  tools,
  sessionId,
  onSessionCreated,
}: UseOllamaChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: "user", text, provider: "local" };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Build Ollama message history
    const ollamaMessages: OllamaChatMessage[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history
    for (const m of [...messages, userMsg]) {
      if (m.role === "user") {
        ollamaMessages.push({ role: "user", content: m.text });
      } else if (m.role === "ai") {
        ollamaMessages.push({ role: "assistant", content: m.text });
      }
    }

    // Add streaming AI message placeholder
    setMessages((prev) => [...prev, { role: "ai", text: "", isStreaming: true, provider: "local" }]);

    let aiText = "";
    let aiReasoning = "";
    const pendingToolCalls: ToolCall[] = [];

    const updateAiMsg = () => {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "ai",
          text: aiText,
          reasoning: aiReasoning || undefined,
          toolCalls: pendingToolCalls.length > 0 ? [...pendingToolCalls] : undefined,
          isStreaming: true,
          provider: "local",
        };
        return updated;
      });
    };

    try {
      const result = await streamOllamaChat(
        ollamaMessages,
        tools,
        ollamaStatus.hasCustomModel,
        {
          onToken: (token) => {
            aiText += token;
            updateAiMsg();
          },
          onReasoning: (r) => {
            aiReasoning += r;
            updateAiMsg();
          },
          onToolCall: (name, args) => {
            pendingToolCalls.push({ name, args });
            aiReasoning += `\n▶ Calling: ${name.replace(/_/g, " ")}...`;
            updateAiMsg();
          },
          onToolResult: (name, res) => {
            const tc = pendingToolCalls.find((t) => t.name === name && !t.result);
            if (tc) tc.result = res;
            const resultMsg = typeof res === "object" && res !== null && "message" in (res as Record<string, unknown>)
              ? String((res as Record<string, unknown>).message) : "completed";
            aiReasoning += `\n✅ ${resultMsg}`;
            if (!aiText) aiText = resultMsg;
            updateAiMsg();
          },
          onComplete: () => {
            // Mark streaming done
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { ...updated[updated.length - 1], isStreaming: false };
              return updated;
            });
            setIsTyping(false);
          },
          onError: (err) => {
            aiReasoning += `\n❌ Error: ${err}`;
            if (!aiText) aiText = `Error: ${err}`;
            updateAiMsg();
          },
        },
      );

      // Save conversation to our DB
      await saveToServer(sessionId, text, result.text, result.toolCalls, onSessionCreated);

    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Connection to local Ollama failed";
      setMessages((prev) => [...prev.slice(0, -1), { role: "ai", text: `Error: ${errMsg}`, provider: "local" }]);
      setIsTyping(false);
    }
  }, [isTyping, messages, systemPrompt, tools, ollamaStatus, sessionId, onSessionCreated]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const setExternalMessages = useCallback((msgs: ChatMessage[]) => {
    setMessages(msgs);
  }, []);

  return { messages, isTyping, sendMessage, clearMessages, setMessages: setExternalMessages };
}

/**
 * Save the client-side conversation to our server DB.
 */
async function saveToServer(
  sessionId: string | null,
  userText: string,
  aiText: string,
  toolCalls: Array<{ name: string; args: Record<string, unknown>; result: unknown }>,
  onSessionCreated?: (id: string) => void,
) {
  try {
    const res = await fetch("/api/ai/chat/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        userMessage: userText,
        aiMessage: aiText,
        toolCalls,
        provider: "ollama-local",
      }),
    });
    const data = await res.json();
    if (data.ok && data.sessionId && !sessionId) {
      onSessionCreated?.(data.sessionId);
    }
  } catch { /* non-critical — chat still works locally even if save fails */ }
}
