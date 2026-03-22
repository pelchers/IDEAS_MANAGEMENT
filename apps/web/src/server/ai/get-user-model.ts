import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
// Ollama via OpenAI-compatible API (better SDK compatibility than native provider)
import { decrypt } from "./crypto";
import { prisma } from "@/server/db";
import type { LanguageModel } from "ai";

/**
 * Default models per provider (must support tool calling).
 */
const DEFAULT_MODELS: Record<string, string> = {
  openrouter: "anthropic/claude-sonnet-4",
  openai: "gpt-4o",
  anthropic: "claude-sonnet-4-20250514",
  google: "gemini-2.0-flash",
  ollama: "qwen2.5:3b",
};

/**
 * Check if Ollama is running on localhost.
 */
async function isOllamaRunning(): Promise<boolean> {
  try {
    const res = await fetch("http://localhost:11434/api/tags", { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Resolve the AI model for a given user.
 *
 * Priority:
 * 1. User's configured provider key → appropriate SDK
 * 2. Ollama local (if configured and running) → localhost:11434
 * 3. Server OPENAI_API_KEY env var → direct OpenAI (fallback)
 * 4. null → AI not available
 *
 * Tool calling support:
 * - OpenAI (GPT-4o, GPT-4-turbo): full tool support
 * - Anthropic (Claude 3+): full tool support
 * - Google (Gemini 1.5+, 2.0): full tool support
 * - OpenRouter: depends on underlying model (Claude, GPT-4o, Gemini all work)
 * - Ollama (Ministral 3B, Qwen3-4B): full tool support via llama.cpp
 */
export async function getUserModel(
  userId: string,
  modelId?: string
): Promise<{ model: LanguageModel; provider: string } | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      aiProvider: true,
      aiApiKeyEncrypted: true,
    },
  });

  if (!user) return null;

  // Cloud providers (require API key)
  if (user.aiProvider !== "NONE" && user.aiProvider !== "OLLAMA_LOCAL" && user.aiApiKeyEncrypted) {
    const apiKey = decrypt(user.aiApiKeyEncrypted);

    switch (user.aiProvider) {
      case "OPENROUTER_OAUTH":
      case "OPENROUTER_BYOK": {
        const openrouter = createOpenRouter({ apiKey });
        return { model: openrouter(modelId || DEFAULT_MODELS.openrouter), provider: "openrouter" };
      }
      case "OPENAI_BYOK": {
        const oa = createOpenAI({ apiKey });
        return { model: oa(modelId || DEFAULT_MODELS.openai), provider: "openai" };
      }
      case "ANTHROPIC_BYOK": {
        const ant = createAnthropic({ apiKey });
        return { model: ant(modelId || DEFAULT_MODELS.anthropic), provider: "anthropic" };
      }
      case "GOOGLE_BYOK": {
        const goog = createGoogleGenerativeAI({ apiKey });
        return { model: goog(modelId || DEFAULT_MODELS.google), provider: "google" };
      }
    }
  }

  // Ollama local (no API key needed) — use OpenAI-compatible endpoint
  if (user.aiProvider === "OLLAMA_LOCAL") {
    const running = await isOllamaRunning();
    if (running) {
      const ollamaOai = createOpenAI({ baseURL: "http://localhost:11434/v1", apiKey: "ollama" });
      return { model: ollamaOai(modelId || DEFAULT_MODELS.ollama), provider: "ollama" };
    }
  }

  // Fallback: server-side OpenAI key
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "sk-...") {
    const fallbackOa = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return {
      model: fallbackOa(modelId || "gpt-4o"),
      provider: "openai-fallback",
    };
  }

  // Last resort: try Ollama even if not explicitly configured
  const ollamaAvailable = await isOllamaRunning();
  if (ollamaAvailable) {
    const ollamaOai = createOpenAI({ baseURL: "http://localhost:11434/v1", apiKey: "ollama" });
    return { model: ollamaOai(modelId || DEFAULT_MODELS.ollama), provider: "ollama-auto" };
  }

  return null;
}
