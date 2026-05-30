import { prisma } from "@/server/db";

/**
 * In-memory pub/sub bus for live notification delivery via SSE.
 * Each connected client registers a listener keyed by userId. In a
 * multi-instance deployment this would be backed by Redis pub/sub.
 */
type Listener = (payload: unknown) => void;
const listeners = new Map<string, Set<Listener>>();

export function subscribe(userId: string, fn: Listener): () => void {
  let set = listeners.get(userId);
  if (!set) {
    set = new Set();
    listeners.set(userId, set);
  }
  set.add(fn);
  return () => {
    set!.delete(fn);
    if (set!.size === 0) listeners.delete(userId);
  };
}

function publish(userId: string, payload: unknown) {
  const set = listeners.get(userId);
  if (!set) return;
  for (const fn of set) {
    try {
      fn(payload);
    } catch {
      /* ignore individual listener errors */
    }
  }
}

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  body?: string;
  sourceType?: string;
  sourceId?: string;
  linkPath?: string;
}

/**
 * Create a notification, persist it, and push it to any live SSE listeners.
 * Never notifies a user about their own action when actorId === userId.
 */
export async function createNotification(input: CreateNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? "",
      sourceType: input.sourceType ?? null,
      sourceId: input.sourceId ?? null,
      linkPath: input.linkPath ?? null,
    },
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
  });

  publish(input.userId, { kind: "notification", notification });
  return notification;
}

/**
 * Push an updated unread count to a user's live listeners (after read/dismiss).
 */
export async function publishUnreadCount(userId: string) {
  const count = await prisma.notification.count({ where: { userId, read: false } });
  publish(userId, { kind: "unread_count", count });
  return count;
}
