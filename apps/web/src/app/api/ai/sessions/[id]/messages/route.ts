import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";

/**
 * DELETE /api/ai/sessions/[id]/messages
 * Clear all messages in a session but keep the session itself.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id } = await params;

  const session = await prisma.aiChatSession.findFirst({ where: { id, userId: user.id } });
  if (!session) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  await prisma.aiChatMessage.deleteMany({ where: { sessionId: id } });

  return NextResponse.json({ ok: true });
}
