import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { openai } from "@ai-sdk/openai";
import { decrypt } from "./crypto";
import { prisma } from "@/server/db";
import type { LanguageModel } from "ai";

/**
 * Resolve the AI model for a given user.
 *
 * Priority:
 * 1. User's OpenRouter key (OAuth or BYOK) → OpenRouter provider
 * 2. Server OPENAI_API_KEY env var → direct OpenAI (fallback)
 * 3. null → AI not available
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

  // Try user's OpenRouter key first
  if (
    (user.aiProvider === "OPENROUTER_OAUTH" || user.aiProvider === "OPENROUTER_BYOK") &&
    user.aiApiKeyEncrypted
  ) {
    const apiKey = decrypt(user.aiApiKeyEncrypted);
    const openrouter = createOpenRouter({ apiKey });
    return {
      model: openrouter(modelId || "anthropic/claude-sonnet-4"),
      provider: "openrouter",
    };
  }

  // Fallback: server-side OpenAI key
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "sk-...") {
    return {
      model: openai(modelId || "gpt-4o"),
      provider: "openai-fallback",
    };
  }

  return null;
}
