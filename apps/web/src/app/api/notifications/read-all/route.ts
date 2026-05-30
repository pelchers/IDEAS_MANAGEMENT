import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { publishUnreadCount } from "@/server/notifications/service";

/**
 * POST /api/notifications/read-all
 * Mark all of the authenticated user's notifications as read.
 */
export async function POST(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });

  const unreadCount = await publishUnreadCount(user.id);
  return NextResponse.json({ ok: true, unreadCount });
}
