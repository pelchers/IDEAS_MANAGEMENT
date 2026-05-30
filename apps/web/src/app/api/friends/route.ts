import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";

/**
 * GET /api/friends
 * List the authenticated user's friendships, grouped into:
 *  - friends (ACCEPTED)
 *  - incoming (PENDING where I am the addressee)
 *  - outgoing (PENDING where I am the requester)
 *  - blocked (BLOCKED where I am the requester/blocker)
 */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  const rows = await prisma.friendship.findMany({
    where: {
      OR: [{ requesterId: user.id }, { addresseeId: user.id }],
    },
    select: {
      id: true,
      status: true,
      requesterId: true,
      addresseeId: true,
      createdAt: true,
      requester: { select: { id: true, displayName: true, avatarUrl: true, email: true } },
      addressee: { select: { id: true, displayName: true, avatarUrl: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const friends: unknown[] = [];
  const incoming: unknown[] = [];
  const outgoing: unknown[] = [];
  const blocked: unknown[] = [];

  for (const r of rows) {
    const other = r.requesterId === user.id ? r.addressee : r.requester;
    const entry = { friendshipId: r.id, user: other, since: r.createdAt };
    if (r.status === "ACCEPTED") {
      friends.push(entry);
    } else if (r.status === "PENDING") {
      if (r.addresseeId === user.id) incoming.push(entry);
      else outgoing.push(entry);
    } else if (r.status === "BLOCKED") {
      // Only the blocker sees the block in their list
      if (r.requesterId === user.id) blocked.push(entry);
    }
  }

  return NextResponse.json({ ok: true, friends, incoming, outgoing, blocked });
}
