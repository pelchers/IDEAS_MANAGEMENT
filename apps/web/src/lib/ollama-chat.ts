/**
 * Client-side Ollama chat orchestration.
 * Browser talks directly to user's local Ollama for inference.
 * Tool calls are sent to our server for DB execution.
 */

import { OLLAMA_BASE, getOllamaModelName } from "./ollama-client";

export interface OllamaChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: OllamaToolCall[];
  tool_call_id?: string;
}

export interface OllamaToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface OllamaToolDef {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

interface StreamCallbacks {
  onToken: (token: string) => void;
  onReasoning?: (text: string) => void;
  onToolCall: (name: string, args: Record<string, unknown>) => void;
  onToolResult: (name: string, result: unknown) => void;
  onComplete: () => void;
  onError: (error: string) => void;
}

/**
 * Stream a chat completion from local Ollama.
 * Uses OpenAI-compatible /v1/chat/completions endpoint.
 * Returns the full response text and any tool calls.
 */
export async function streamOllamaChat(
  messages: OllamaChatMessage[],
  tools: OllamaToolDef[],
  hasCustomModel: boolean,
  callbacks: StreamCallbacks,
  maxSteps = 3,
): Promise<{ text: string; toolCalls: Array<{ name: string; args: Record<string, unknown>; result: unknown }> }> {
  const modelName = getOllamaModelName(hasCustomModel);
  let fullText = "";
  const allToolCalls: Array<{ name: string; args: Record<string, unknown>; result: unknown }> = [];
  let currentMessages = [...messages];

  for (let step = 0; step < maxSteps; step++) {
    const response = await fetch(`${OLLAMA_BASE}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        messages: currentMessages,
        tools: tools.length > 0 ? tools : undefined,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      callbacks.onError(`Ollama error: ${response.status} ${response.statusText}`);
      break;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let stepText = "";
    let stepToolCalls: OllamaToolCall[] = [];
    let reasoningText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        const payload = trimmed.slice(6);
        if (payload === "[DONE]") continue;

        try {
          const data = JSON.parse(payload);
          const choice = data.choices?.[0];
          if (!choice) continue;

          const delta = choice.delta;
          if (!delta) continue;

          // Text content
          if (delta.content) {
            stepText += delta.content;
            fullText += delta.content;
            callbacks.onToken(delta.content);
          }

          // Reasoning (qwen3 thinking field)
          if (delta.reasoning_content || delta.reasoning) {
            const r = delta.reasoning_content || delta.reasoning;
            reasoningText += r;
            callbacks.onReasoning?.(r);
          }

          // Tool calls
          if (delta.tool_calls) {
            for (const tc of delta.tool_calls) {
              if (tc.index !== undefined) {
                // Streaming tool call — accumulate
                while (stepToolCalls.length <= tc.index) {
                  stepToolCalls.push({ id: "", type: "function", function: { name: "", arguments: "" } });
                }
                const existing = stepToolCalls[tc.index];
                if (tc.id) existing.id = tc.id;
                if (tc.function?.name) existing.function.name += tc.function.name;
                if (tc.function?.arguments) existing.function.arguments += tc.function.arguments;
              }
            }
          }
        } catch { /* skip malformed SSE */ }
      }
    }

    // If no tool calls, we're done
    if (stepToolCalls.length === 0 || stepToolCalls.every((tc) => !tc.function.name)) {
      break;
    }

    // Execute tool calls via our server
    for (const tc of stepToolCalls) {
      if (!tc.function.name) continue;

      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(tc.function.arguments || "{}");
      } catch { /* empty args */ }

      callbacks.onToolCall(tc.function.name, args);

      try {
        const toolRes = await fetch("/api/ai/tools", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolName: tc.function.name, args }),
        });
        const toolData = await toolRes.json();

        const result = toolData.ok ? toolData.result : { error: toolData.error };
        allToolCalls.push({ name: tc.function.name, args, result });
        callbacks.onToolResult(tc.function.name, result);

        // Dispatch artifact-updated event for live reactivity
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("artifact-updated", {
            detail: { tool: tc.function.name, result },
          }));
        }

        // Add assistant message with tool calls + tool result to conversation
        currentMessages.push({
          role: "assistant",
          content: stepText || "",
          tool_calls: [tc],
        });
        currentMessages.push({
          role: "tool",
          content: JSON.stringify(result),
          tool_call_id: tc.id || `call_${Date.now()}`,
        });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Tool execution failed";
        callbacks.onError(errMsg);
        allToolCalls.push({ name: tc.function.name, args, result: { error: errMsg } });
      }
    }
  }

  callbacks.onComplete();
  return { text: fullText, toolCalls: allToolCalls };
}
