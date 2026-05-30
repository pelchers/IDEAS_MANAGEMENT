import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";

/**
 * GET /api/notifications?limit=...&unreadOnly=1
 * List the authenticated user's notifications + unread count.
 */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  const url = new URL(req.url);
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));
  const unreadOnly = url.searchParams.get("unreadOnly") === "1";

  const where: Record<string, unknown> = { userId: user.id };
  if (unreadOnly) where.read = false;

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        sourceType: true,
        sourceId: true,
        linkPath: true,
        read: true,
        createdAt: true,
      },
    }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
  ]);

  return NextResponse.json({ ok: true, notifications, unreadCount });
}

/**
 * DELETE /api/notifications
 * Dismiss (delete) all the authenticated user's notifications.
 */
export async function DELETE(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  await prisma.notification.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
}
