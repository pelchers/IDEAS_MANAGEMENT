import type { SyncOp } from "@idea-management/schemas";

interface SyncConflict {
  operationId: string;
  currentRevision: number;
  artifactContent: unknown;
}

interface SyncStatus {
  queueLength: number;
  lastSyncTime: string | null;
  pendingConflicts: number;
  isSyncing: boolean;
}

interface FlushResult {
  applied: string[];
  conflicts: SyncConflict[];
  errors: Array<{ index: number; error: string }>;
}

interface PullResult {
  operations: Array<{
    operationId: string;
    artifactPath: string;
    baseRevision: number;
    payload: unknown;
    userId: string;
    createdAt: string;
  }>;
  artifacts: Array<{
    artifactPath: string;
    content: unknown;
    revision: number;
    updatedAt: string;
  }>;
  conflicts: Array<{
    id: string;
    operationId: string;
    artifactPath: string;
    baseRevision: number;
    payload: unknown;
    createdAt: string;
  }>;
}

/**
 * Client-side sync queue for managing offline mutations
 * and syncing with the server.
 */
export class SyncQueue {
  private queue: SyncOp[] = [];
  private conflicts: SyncConflict[] = [];
  private lastSyncTime: string | null = null;
  private isSyncing = false;

  /**
   * Add an operation to the local queue.
   */
  enqueue(operation: SyncOp): void {
    this.queue.push(operation);
  }

  /**
   * Push all queued operations to the server.
   * Returns the result with applied operations and any conflicts.
   */
  async flush(): Promise<FlushResult> {
    if (this.queue.length === 0) {
      return { applied: [], conflicts: [], errors: [] };
    }

    this.isSyncing = true;
    try {
      const res = await fetch("/api/sync/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ operations: this.queue }),
      });

      if (!res.ok) {
        throw new Error(`Sync push failed: ${res.status}`);
      }

      const data = await res.json();

      // Remove applied operations from queue
      const appliedSet = new Set(data.applied as string[]);
      this.queue = this.queue.filter(
        (op) => !appliedSet.has(op.operationId)
      );

      // Track conflicts
      if (data.conflicts) {
        this.conflicts.push(...data.conflicts);
      }

      this.lastSyncTime = new Date().toISOString();

      return {
        applied: data.applied ?? [],
        conflicts: data.conflicts ?? [],
        errors: data.errors ?? [],
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Pull remote changes for a project since the last known revision.
   */
  async pull(projectId: string, lastRevision: number = 0): Promise<PullResult> {
    this.isSyncing = true;
    try {
      const res = await fetch(
        `/api/sync/pull/${projectId}?since=${lastRevision}`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error(`Sync pull failed: ${res.status}`);
      }

      const data = await res.json();
      this.lastSyncTime = new Date().toISOString();

      return {
        operations: data.operations ?? [],
        artifacts: data.artifacts ?? [],
        conflicts: data.conflicts ?? [],
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Get the current status of the sync queue.
   */
  getStatus(): SyncStatus {
    return {
      queueLength: this.queue.length,
      lastSyncTime: this.lastSyncTime,
      pendingConflicts: this.conflicts.length,
      isSyncing: this.isSyncing,
    };
  }

  /**
   * Get queued operations (for inspection/debugging).
   */
  getQueue(): readonly SyncOp[] {
    return this.queue;
  }

  /**
   * Clear resolved conflicts.
   */
  clearConflicts(): void {
    this.conflicts = [];
  }
}

/**
 * Singleton sync queue instance for the application.
 */
let _instance: SyncQueue | null = null;

export function getSyncQueue(): SyncQueue {
  if (!_instance) {
    _instance = new SyncQueue();
  }
  return _instance;
}
