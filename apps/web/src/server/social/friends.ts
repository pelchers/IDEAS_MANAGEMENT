import { prisma } from "@/server/db";

/**
 * Return the set of accepted-friend user IDs for a given user.
 */
export async function getFriendIds(userId: string): Promise<string[]> {
  const rows = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    select: { requesterId: true, addresseeId: true },
  });
  return rows.map((r) => (r.requesterId === userId ? r.addresseeId : r.requesterId));
}

/**
 * Return the friendship status between the viewer and a target user, from the
 * viewer's perspective: "none" | "friends" | "incoming" | "outgoing" | "blocked".
 */
export async function getFriendshipState(
  viewerId: string,
  targetId: string
): Promise<{ state: "none" | "friends" | "incoming" | "outgoing" | "blocked"; friendshipId: string | null }> {
  if (viewerId === targetId) return { state: "none", friendshipId: null };

  const f = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: viewerId, addresseeId: targetId },
        { requesterId: targetId, addresseeId: viewerId },
      ],
    },
  });

  if (!f) return { state: "none", friendshipId: null };
  if (f.status === "ACCEPTED") return { state: "friends", friendshipId: f.id };
  if (f.status === "BLOCKED") return { state: "blocked", friendshipId: f.id };
  if (f.status === "PENDING") {
    return { state: f.addresseeId === viewerId ? "incoming" : "outgoing", friendshipId: f.id };
  }
  return { state: "none", friendshipId: f.id };
}

/**
 * Return mutual friends between two users (intersection of friend ID sets),
 * resolved to lightweight user objects.
 */
export async function getMutualFriends(viewerId: string, targetId: string) {
  if (viewerId === targetId) return [];
  const [a, b] = await Promise.all([getFriendIds(viewerId), getFriendIds(targetId)]);
  const setB = new Set(b);
  const mutualIds = a.filter((id) => setB.has(id));
  if (mutualIds.length === 0) return [];

  return prisma.user.findMany({
    where: { id: { in: mutualIds } },
    select: { id: true, displayName: true, avatarUrl: true },
  });
}
