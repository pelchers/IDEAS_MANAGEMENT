import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import type { Prisma } from "@prisma/client";

/**
 * POST /api/ai/chat/save
 * Save client-side Ollama conversations to our database.
 * Called by the browser after each exchange with local Ollama.
 */
export async function POST(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  let body: {
    sessionId?: string | null;
    userMessage: string;
    aiMessage: string;
    toolCalls?: Array<{ name: string; args: Record<string, unknown>; result: unknown }>;
    provider?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const { userMessage, aiMessage, toolCalls, provider } = body;
  let { sessionId } = body;

  if (!userMessage) {
    return NextResponse.json({ ok: false, error: "userMessage required" }, { status: 400 });
  }

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
