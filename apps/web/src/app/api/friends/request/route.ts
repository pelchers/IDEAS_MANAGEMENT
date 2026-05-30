import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { validateBody, isValidationError } from "@/server/api-validation";
import { createNotification } from "@/server/notifications/service";

const RequestSchema = z.object({
  addresseeId: z.string().min(1),
});

/**
 * POST /api/friends/request
 * Send a friend request to another user.
 */
export async function POST(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  const parsed = await validateBody(req, RequestSchema);
  if (isValidationError(parsed)) return parsed;

  if (parsed.addresseeId === user.id) {
    return NextResponse.json({ ok: false, error: "cannot_friend_self" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: parsed.addresseeId } });
  if (!target) {
    return NextResponse.json({ ok: false, error: "user_not_found" }, { status: 404 });
  }

  // Look for any existing friendship in either direction
  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: user.id, addresseeId: parsed.addresseeId },
        { requesterId: parsed.addresseeId, addresseeId: user.id },
      ],
    },
  });

  if (existing) {
    if (existing.status === "BLOCKED") {
      return NextResponse.json({ ok: false, error: "blocked" }, { status: 403 });
    }
    if (existing.status === "ACCEPTED") {
      return NextResponse.json({ ok: false, error: "already_friends" }, { status: 409 });
    }
    if (existing.status === "PENDING") {
      // If the other party already requested me, accept it instead of duplicating
      if (existing.addresseeId === user.id) {
        const updated = await prisma.friendship.update({
          where: { id: existing.id },
          data: { status: "ACCEPTED" },
        });
        // Notify the original requester that we accepted
        await createNotification({
          userId: existing.requesterId,
          type: "friend.accepted",
          title: `${user.displayName || user.email} accepted your friend request`,
          sourceType: "User",
          sourceId: user.id,
          linkPath: `/users/${user.id}`,
        });
        return NextResponse.json({ ok: true, friendship: { id: updated.id, status: updated.status }, autoAccepted: true });
      }
      return NextResponse.json({ ok: false, error: "request_already_sent" }, { status: 409 });
    }
    // DECLINED — allow re-request by resetting to PENDING
    const reopened = await prisma.friendship.update({
      where: { id: existing.id },
      data: { status: "PENDING", requesterId: user.id, addresseeId: parsed.addresseeId },
    });
    await createNotification({
      userId: parsed.addresseeId,
      type: "friend.request",
      title: `${user.displayName || user.email} sent you a friend request`,
      sourceType: "User",
      sourceId: user.id,
      linkPath: `/friends`,
    });
    return NextResponse.json({ ok: true, friendship: { id: reopened.id, status: reopened.status } }, { status: 201 });
  }

  const friendship = await prisma.friendship.create({
    data: { requesterId: user.id, addresseeId: parsed.addresseeId, status: "PENDING" },
  });

  await createNotification({
    userId: parsed.addresseeId,
    type: "friend.request",
    title: `${user.displayName || user.email} sent you a friend request`,
    sourceType: "User",
    sourceId: user.id,
    linkPath: `/friends`,
  });

  return NextResponse.json({ ok: true, friendship: { id: friendship.id, status: friendship.status } }, { status: 201 });
}
