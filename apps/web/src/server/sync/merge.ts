/**
 * Auto-merge logic for append-only artifacts.
 * Some artifact types (ideas lists, chat logs) can be safely merged
 * by unioning their arrays.
 */

/** Artifact paths that support append-only auto-merge. */
const APPEND_ONLY_PATHS = [
  "ideas/ideas.json",
  "ai/chats/default.ndjson",
];

/**
 * Check if an artifact path supports auto-merge.
 */
export function canAutoMerge(artifactPath: string): boolean {
  return APPEND_ONLY_PATHS.some(
    (p) => artifactPath === p || artifactPath.startsWith("ai/chats/")
  );
}

/**
 * Auto-merge for append-only content.
 * Performs a union-append: items in local that are not in remote are appended to remote.
 * Identifies items by `id` field if present, otherwise by deep equality.
 *
 * @param local  - The client's version of the content
 * @param remote - The server's current version of the content
 * @returns The merged content
 */
export function autoMergeAppendOnly(
  local: unknown,
  remote: unknown
): unknown {
  // Handle ideas/ideas.json format: { ideas: [...] }
  if (isIdeasFormat(local) && isIdeasFormat(remote)) {
    const localIdeas = (local as { ideas: unknown[] }).ideas;
    const remoteIdeas = (remote as { ideas: unknown[] }).ideas;
    const merged = mergeArrays(localIdeas, remoteIdeas);
    return { ...(remote as Record<string, unknown>), ideas: merged };
  }

  // Handle chat messages format: { messages: [...] }
  if (isMessagesFormat(local) && isMessagesFormat(remote)) {
    const localMessages = (local as { messages: unknown[] }).messages;
    const remoteMessages = (remote as { messages: unknown[] }).messages;
    const merged = mergeArrays(localMessages, remoteMessages);
    return { ...(remote as Record<string, unknown>), messages: merged };
  }

  // If both are arrays directly, merge them
  if (Array.isArray(local) && Array.isArray(remote)) {
    return mergeArrays(local, remote);
  }

  // Fallback: use remote (server wins)
  return remote;
}

function isIdeasFormat(obj: unknown): boolean {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "ideas" in obj &&
    Array.isArray((obj as Record<string, unknown>).ideas)
  );
}

function isMessagesFormat(obj: unknown): boolean {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "messages" in obj &&
    Array.isArray((obj as Record<string, unknown>).messages)
  );
}

/**
 * Merge two arrays by union. Uses `id` field for dedup if items have one,
 * otherwise uses JSON stringification.
 */
function mergeArrays(local: unknown[], remote: unknown[]): unknown[] {
  const result = [...remote];
  const existingIds = new Set<string>();
  const existingHashes = new Set<string>();

  for (const item of remote) {
    if (typeof item === "object" && item !== null && "id" in item) {
      existingIds.add(String((item as { id: unknown }).id));
    } else {
      existingHashes.add(JSON.stringify(item));
    }
  }

  for (const item of local) {
    if (typeof item === "object" && item !== null && "id" in item) {
      const id = String((item as { id: unknown }).id);
      if (!existingIds.has(id)) {
        result.push(item);
        existingIds.add(id);
      }
    } else {
      const hash = JSON.stringify(item);
      if (!existingHashes.has(hash)) {
        result.push(item);
        existingHashes.add(hash);
      }
    }
  }

  return result;
}
