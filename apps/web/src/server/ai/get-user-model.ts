import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { decrypt } from "./crypto";
import { prisma } from "@/server/db";
import type { LanguageModel } from "ai";

/**
 * Default models per provider (must support tool calling).
 */
const DEFAULT_MODELS: Record<string, string> = {
  groq: "llama-3.1-70b-versatile",
  openrouter: "anthropic/claude-sonnet-4",
  openai: "gpt-4o",
  anthropic: "claude-sonnet-4-20250514",
  google: "gemini-2.0-flash",
  ollama: "qwen3-coder:30b",
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
 * 1. User's configured BYOK provider key → appropriate SDK
 * 2. Groq built-in (server GROQ_API_KEY) → for subscribers
 * 3. Ollama local (if configured and running) → localhost:11434
 * 4. Server OPENAI_API_KEY env var → direct OpenAI (fallback)
 * 5. Auto-detect Ollama → last resort for local dev
 * 6. null → AI not available
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

  // ── BYOK providers (user has their own API key) ──
  if (user.aiApiKeyEncrypted && !["NONE", "OLLAMA_LOCAL", "GROQ_BUILTIN"].includes(user.aiProvider)) {
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

  // ── Groq built-in (server-side key, for subscribers/admins) ──
  if (user.aiProvider === "GROQ_BUILTIN" || user.aiProvider === "NONE") {
    if (process.env.GROQ_API_KEY) {
      const groq = createOpenAI({ baseURL: "https://api.groq.com/openai/v1", apiKey: process.env.GROQ_API_KEY });
      return { model: groq(modelId || DEFAULT_MODELS.groq), provider: "groq" };
    }
  }

  // ── Ollama local (no API key needed) ──
  if (user.aiProvider === "OLLAMA_LOCAL") {
    const running = await isOllamaRunning();
    if (running) {
      const ollamaOai = createOpenAI({ baseURL: "http://localhost:11434/v1", apiKey: "ollama" });
      return { model: ollamaOai(modelId || DEFAULT_MODELS.ollama), provider: "ollama" };
    }
  }

  // ── Fallback: server-side OpenAI key ──
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "sk-...") {
    const fallbackOa = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return { model: fallbackOa(modelId || "gpt-4o"), provider: "openai-fallback" };
  }

  // ── Last resort: auto-detect Ollama (local dev) ──
  const ollamaAvailable = await isOllamaRunning();
  if (ollamaAvailable) {
    const ollamaOai = createOpenAI({ baseURL: "http://localhost:11434/v1", apiKey: "ollama" });
    return { model: ollamaOai(modelId || DEFAULT_MODELS.ollama), provider: "ollama-auto" };
  }

  return null;
}
