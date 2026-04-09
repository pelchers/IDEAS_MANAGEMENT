import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { validateBody, isValidationError } from "@/server/api-validation";

const UpdateSessionSchema = z.object({
  title: z.string().max(200).optional(),
});

/**
 * GET /api/ai/sessions/[id]
 * Get a chat session with all its messages.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  const { id } = await params;

  const session = await prisma.aiChatSession.findFirst({
    where: { id, userId: user.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          content: true,
          toolCalls: true,
          toolResults: true,
          createdAt: true,
        },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    session: {
      id: session.id,
      title: session.title,
      projectId: session.projectId,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messages: session.messages,
    },
  });
}

/**
 * PUT /api/ai/sessions/[id]
 * Update session (rename, pin, archive).
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id } = await params;

  const session = await prisma.aiChatSession.findFirst({ where: { id, userId: user.id } });
  if (!session) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const parsed = await validateBody(req, UpdateSessionSchema);
  if (isValidationError(parsed)) return parsed;

  const data: Record<string, unknown> = {};
  if (parsed.title) data.title = parsed.title.trim().slice(0, 200);

  if (Object.keys(data).length === 0) return NextResponse.json({ ok: true, message: "no_changes" });

  await prisma.aiChatSession.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}

/**
 * DELETE /api/ai/sessions/[id]
 * Delete a chat session and all its messages.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  const { id } = await params;

  // Verify ownership before deleting
  const session = await prisma.aiChatSession.findFirst({
    where: { id, userId: user.id },
  });

  if (!session) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  await prisma.aiChatSession.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
