import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { validateBody, isValidationError } from "@/server/api-validation";

const CreateSessionSchema = z.object({
  title: z.string().optional(),
  projectId: z.string().optional(),
});

/**
 * GET /api/ai/sessions
 * List the authenticated user's chat sessions.
 */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  const sessions = await prisma.aiChatSession.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      projectId: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json({
    ok: true,
    sessions: sessions.map((s) => ({
      id: s.id,
      title: s.title,
      projectId: s.projectId,
      messageCount: s._count.messages,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    })),
  });
}

/**
 * POST /api/ai/sessions
 * Create a new chat session.
 */
export async function POST(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  const parsed = await validateBody(req, CreateSessionSchema);
  if (isValidationError(parsed)) return parsed;

  const session = await prisma.aiChatSession.create({
    data: {
      userId: user.id,
      title: parsed.title || "New Chat",
      projectId: parsed.projectId ?? null,
    },
  });

  return NextResponse.json({
    ok: true,
    session: {
      id: session.id,
      title: session.title,
      projectId: session.projectId,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    },
  }, { status: 201 });
}

/**
 * DELETE /api/ai/sessions
 * Delete ALL chat sessions for the authenticated user.
 */
export async function DELETE(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  await prisma.aiChatSession.deleteMany({ where: { userId: user.id } });

  return NextResponse.json({ ok: true });
}
