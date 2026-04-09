import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import type { Prisma } from "@/generated/prisma";
import { validateBody, isValidationError } from "@/server/api-validation";

const SaveChatSchema = z.object({
  sessionId: z.string().nullish(),
  userMessage: z.string().min(1, "userMessage required"),
  aiMessage: z.string().optional().default(""),
  toolCalls: z.array(z.object({
    name: z.string(),
    args: z.record(z.string(), z.unknown()),
    result: z.unknown(),
  })).optional(),
  provider: z.string().optional(),
});

/**
 * POST /api/ai/chat/save
 * Save client-side Ollama conversations to our database.
 * Called by the browser after each exchange with local Ollama.
 */
export async function POST(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  const parsed = await validateBody(req, SaveChatSchema);
  if (isValidationError(parsed)) return parsed;

  const { userMessage, aiMessage, toolCalls, provider } = parsed;
  let { sessionId } = parsed;

  try {
    // Create session if needed
    if (!sessionId) {
      const session = await prisma.aiChatSession.create({
        data: {
          userId: user.id,
          title: userMessage.slice(0, 60),
        },
      });
      sessionId = session.id;
    }

    // Save user message
    await prisma.aiChatMessage.create({
      data: {
        sessionId,
        role: "USER",
        content: userMessage,
      },
    });

    // Save tool call messages
    if (toolCalls && toolCalls.length > 0) {
      for (const tc of toolCalls) {
        await prisma.aiChatMessage.create({
          data: {
            sessionId,
            role: "TOOL",
            content: `Tool: ${tc.name}`,
            toolCalls: { toolName: tc.name, args: tc.args } as unknown as Prisma.InputJsonValue,
            toolResults: tc.result as unknown as Prisma.InputJsonValue,
          },
        });
      }
    }

    // Save AI response
    if (aiMessage) {
      await prisma.aiChatMessage.create({
        data: {
          sessionId,
          role: "ASSISTANT",
          content: aiMessage,
        },
      });
    }

    // Update session timestamp
    await prisma.aiChatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ ok: true, sessionId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
