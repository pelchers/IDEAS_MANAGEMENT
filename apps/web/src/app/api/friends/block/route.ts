import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { validateBody, isValidationError } from "@/server/api-validation";

const BlockSchema = z.object({
  targetUserId: z.string().min(1),
  action: z.enum(["block", "unblock"]),
});

/**
 * POST /api/friends/block
 * Block or unblock another user. A block collapses any existing friendship
 * into a single BLOCKED row owned by the blocker (requesterId = blocker).
 */
export async function POST(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  const parsed = await validateBody(req, BlockSchema);
  if (isValidationError(parsed)) return parsed;

  if (parsed.targetUserId === user.id) {
    return NextResponse.json({ ok: false, error: "cannot_block_self" }, { status: 400 });
  }

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: user.id, addresseeId: parsed.targetUserId },
        { requesterId: parsed.targetUserId, addresseeId: user.id },
      ],
    },
  });

  if (parsed.action === "block") {
    if (existing) {
      const updated = await prisma.friendship.update({
        where: { id: existing.id },
        // Blocker owns the row as requester
        data: { status: "BLOCKED", requesterId: user.id, addresseeId: parsed.targetUserId },
      });
      return NextResponse.json({ ok: true, friendship: { id: updated.id, status: updated.status } });
    }
    const created = await prisma.friendship.create({
      data: { requesterId: user.id, addresseeId: parsed.targetUserId, status: "BLOCKED" },
    });
    return NextResponse.json({ ok: true, friendship: { id: created.id, status: created.status } }, { status: 201 });
  }

  // unblock
  if (!existing || existing.status !== "BLOCKED") {
    return NextResponse.json({ ok: false, error: "not_blocked" }, { status: 404 });
  }
  if (existing.requesterId !== user.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  await prisma.friendship.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true });
}
