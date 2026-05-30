import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { publishUnreadCount } from "@/server/notifications/service";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * PUT /api/notifications/[id]/read
 * Mark a single notification as read. Owner only.
 */
export async function PUT(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id } = await params;

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== user.id) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (!notification.read) {
    await prisma.notification.update({ where: { id }, data: { read: true } });
  }

  const unreadCount = await publishUnreadCount(user.id);
  return NextResponse.json({ ok: true, unreadCount });
}
