import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";

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

  let body: { title?: string; projectId?: string } = {};
  try {
    body = await req.json();
  } catch {
    // Empty body is fine — defaults will be used
  }

  const session = await prisma.aiChatSession.create({
    data: {
      userId: user.id,
      title: body.title || "New Chat",
      projectId: body.projectId ?? null,
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
