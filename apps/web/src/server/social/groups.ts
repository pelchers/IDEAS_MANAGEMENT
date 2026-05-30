import { prisma } from "@/server/db";
import type { GroupRole } from "@/generated/prisma";

const ROLE_RANK: Record<GroupRole, number> = { MEMBER: 1, ADMIN: 2, OWNER: 3 };

/**
 * Return the authenticated user's active membership in a group, or null.
 */
export async function getGroupMembership(groupId: string, userId: string) {
  return prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { id: true, role: true, status: true },
  });
}

/**
 * Check whether a user has at least the given role in a group (active members only).
 */
export async function hasGroupRole(groupId: string, userId: string, minRole: GroupRole): Promise<boolean> {
  const m = await getGroupMembership(groupId, userId);
  if (!m || m.status !== "active") return false;
  return ROLE_RANK[m.role] >= ROLE_RANK[minRole];
}
