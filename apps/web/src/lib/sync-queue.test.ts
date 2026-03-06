import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SyncQueue } from "./sync-queue";

// Mock global fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("SyncQueue", () => {
  let queue: SyncQueue;

  beforeEach(() => {
    queue = new SyncQueue();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("enqueue", () => {
    it("adds operations to the queue", () => {
      const op = {
        operationId: "op-1",
        projectId: "proj-1",
        artifactPath: "ideas/ideas.json",
        baseRevision: 1,
        payload: { ideas: [] },
        timestamp: new Date().toISOString(),
      };

      queue.enqueue(op);
      expect(queue.getStatus().queueLength).toBe(1);
    });
  });

  describe("getStatus", () => {
    it("returns correct status for empty queue", () => {
      const status = queue.getStatus();
      expect(status.queueLength).toBe(0);
      expect(status.lastSyncTime).toBeNull();
      expect(status.pendingConflicts).toBe(0);
      expect(status.isSyncing).toBe(false);
    });
  });

  describe("flush", () => {
    it("returns empty result for empty queue", async () => {
      const result = await queue.flush();
      expect(result.applied).toEqual([]);
      expect(result.conflicts).toEqual([]);
      expect(result.errors).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("pushes operations to server and removes applied ones", async () => {
      const op = {
        operationId: "op-1",
        projectId: "proj-1",
        artifactPath: "ideas/ideas.json",
        baseRevision: 1,
        payload: { ideas: [] },
        timestamp: new Date().toISOString(),
      };

      queue.enqueue(op);

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          applied: ["op-1"],
          conflicts: [],
          errors: [],
        }),
      });

      const result = await queue.flush();
      expect(result.applied).toEqual(["op-1"]);
      expect(queue.getStatus().queueLength).toBe(0);
      expect(queue.getStatus().lastSyncTime).not.toBeNull();
    });

    it("keeps conflicting operations in queue", async () => {
      const op = {
        operationId: "op-1",
        projectId: "proj-1",
        artifactPath: "kanban/board.json",
        baseRevision: 1,
        payload: { columns: [] },
        timestamp: new Date().toISOString(),
      };

      queue.enqueue(op);

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          applied: [],
          conflicts: [
            {
              operationId: "op-1",
              currentRevision: 3,
              artifactContent: { columns: [{ id: "other" }] },
            },
          ],
          errors: [],
        }),
      });

      const result = await queue.flush();
      expect(result.conflicts).toHaveLength(1);
      expect(queue.getStatus().pendingConflicts).toBe(1);
      // Operation stays in queue since not applied
      expect(queue.getStatus().queueLength).toBe(1);
    });

    it("throws on HTTP error", async () => {
      queue.enqueue({
        operationId: "op-1",
        projectId: "proj-1",
        artifactPath: "test.json",
        baseRevision: 0,
        payload: {},
        timestamp: new Date().toISOString(),
      });

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(queue.flush()).rejects.toThrow("Sync push failed: 500");
    });
  });

  describe("pull", () => {
    it("fetches remote changes", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          operations: [
            {
              operationId: "op-remote-1",
              artifactPath: "ideas/ideas.json",
              baseRevision: 0,
              payload: { ideas: [{ id: "1" }] },
              userId: "user-2",
              createdAt: "2026-01-01T00:00:00Z",
            },
          ],
          artifacts: [
            {
              artifactPath: "ideas/ideas.json",
              content: { ideas: [{ id: "1" }] },
              revision: 1,
              updatedAt: "2026-01-01T00:00:00Z",
            },
          ],
          conflicts: [],
        }),
      });

      const result = await queue.pull("proj-1", 0);
      expect(result.operations).toHaveLength(1);
      expect(result.artifacts).toHaveLength(1);
      expect(result.conflicts).toHaveLength(0);
      expect(queue.getStatus().lastSyncTime).not.toBeNull();
    });

    it("throws on HTTP error", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 401 });
      await expect(queue.pull("proj-1")).rejects.toThrow("Sync pull failed: 401");
    });
  });

  describe("clearConflicts", () => {
    it("clears conflict list", async () => {
      queue.enqueue({
        operationId: "op-1",
        projectId: "proj-1",
        artifactPath: "test.json",
        baseRevision: 0,
        payload: {},
        timestamp: new Date().toISOString(),
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          applied: [],
          conflicts: [{ operationId: "op-1", currentRevision: 1, artifactContent: {} }],
          errors: [],
        }),
      });

      await queue.flush();
      expect(queue.getStatus().pendingConflicts).toBe(1);

      queue.clearConflicts();
      expect(queue.getStatus().pendingConflicts).toBe(0);
    });
  });
});
