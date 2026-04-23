/**
 * In-memory presence tracker for project users.
 * Tracks which users are active in which project with heartbeat expiry.
 */

interface PresenceEntry {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  lastSeen: number;
}

// projectId -> Map<userId, PresenceEntry>
const presenceMap = new Map<string, Map<string, PresenceEntry>>();

const HEARTBEAT_TIMEOUT = 5 * 60 * 1000; // 5 minutes

/**
 * Register or refresh a user's presence in a project.
 */
export function setPresence(
  projectId: string,
  userId: string,
  displayName: string | null,
  avatarUrl: string | null
) {
  let projectPresence = presenceMap.get(projectId);
  if (!projectPresence) {
    projectPresence = new Map();
    presenceMap.set(projectId, projectPresence);
  }
  projectPresence.set(userId, { userId, displayName, avatarUrl, lastSeen: Date.now() });
}

/**
 * Remove a user's presence from a project.
 */
export function removePresence(projectId: string, userId: string) {
  const projectPresence = presenceMap.get(projectId);
  if (projectPresence) {
    projectPresence.delete(userId);
    if (projectPresence.size === 0) presenceMap.delete(projectId);
  }
}

/**
 * Get all active users in a project (filtered by heartbeat timeout).
 */
export function getPresence(projectId: string): PresenceEntry[] {
  const projectPresence = presenceMap.get(projectId);
  if (!projectPresence) return [];

  const now = Date.now();
  const active: PresenceEntry[] = [];

  for (const [userId, entry] of projectPresence.entries()) {
    if (now - entry.lastSeen > HEARTBEAT_TIMEOUT) {
      projectPresence.delete(userId);
    } else {
      active.push(entry);
    }
  }

  if (projectPresence.size === 0) presenceMap.delete(projectId);
  return active;
}
