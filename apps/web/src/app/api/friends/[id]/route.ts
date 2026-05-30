import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { validateBody, isValidationError } from "@/server/api-validation";
import { createNotification } from "@/server/notifications/service";

const PatchSchema = z.object({
  action: z.enum(["accept", "decline"]),
});

type RouteParams = { params: Promise<{ id: string }> };

/**
 * PUT /api/friends/[id]
 * Accept or decline a pending friend request. Only the addressee may act.
 */
export async function PUT(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id } = await params;

  const parsed = await validateBody(req, PatchSchema);
  if (isValidationError(parsed)) return parsed;

  const friendship = await prisma.friendship.findUnique({ where: { id } });
  if (!friendship) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  if (friendship.addresseeId !== user.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  if (friendship.status !== "PENDING") {
    return NextResponse.json({ ok: false, error: "not_pending" }, { status: 409 });
  }

  const newStatus = parsed.action === "accept" ? "ACCEPTED" : "DECLINED";
  const updated = await prisma.friendship.update({
    where: { id },
    data: { status: newStatus },
  });

  if (parsed.action === "accept") {
    await createNotification({
      userId: friendship.requesterId,
      type: "friend.accepted",
      title: `${user.displayName || user.email} accepted your friend request`,
      sourceType: "User",
      sourceId: user.id,
      linkPath: `/users/${user.id}`,
    });
  }

  return NextResponse.json({ ok: true, friendship: { id: updated.id, status: updated.status } });
}

/**
 * DELETE /api/friends/[id]
 * Remove a friendship (unfriend) or cancel a request. Either party may act.
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id } = await params;

  const friendship = await prisma.friendship.findUnique({ where: { id } });
  if (!friendship) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  if (friendship.requesterId !== user.id && friendship.addresseeId !== user.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  // Don't allow deleting a block via this route — use the block endpoint
  if (friendship.status === "BLOCKED") {
    return NextResponse.json({ ok: false, error: "use_block_endpoint" }, { status: 400 });
  }

  await prisma.friendship.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
