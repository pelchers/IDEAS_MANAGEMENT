import { describe, it, expect } from "vitest";
import { canAutoMerge, autoMergeAppendOnly } from "./merge";

describe("canAutoMerge", () => {
  it("returns true for ideas/ideas.json", () => {
    expect(canAutoMerge("ideas/ideas.json")).toBe(true);
  });

  it("returns true for ai/chats/default.ndjson", () => {
    expect(canAutoMerge("ai/chats/default.ndjson")).toBe(true);
  });

  it("returns true for any ai/chats path", () => {
    expect(canAutoMerge("ai/chats/custom.ndjson")).toBe(true);
  });

  it("returns false for kanban/board.json", () => {
    expect(canAutoMerge("kanban/board.json")).toBe(false);
  });

  it("returns false for project.json", () => {
    expect(canAutoMerge("project.json")).toBe(false);
  });

  it("returns false for whiteboard/board.json", () => {
    expect(canAutoMerge("whiteboard/board.json")).toBe(false);
  });
});

describe("autoMergeAppendOnly", () => {
  describe("ideas format", () => {
    it("merges ideas with unique ids", () => {
      const local = {
        ideas: [
          { id: "1", title: "Idea A" },
          { id: "3", title: "Idea C (new)" },
        ],
      };
      const remote = {
        ideas: [
          { id: "1", title: "Idea A" },
          { id: "2", title: "Idea B" },
        ],
      };

      const result = autoMergeAppendOnly(local, remote) as {
        ideas: Array<{ id: string; title: string }>;
      };
      expect(result.ideas).toHaveLength(3);
      expect(result.ideas.map((i) => i.id)).toEqual(["1", "2", "3"]);
    });

    it("deduplicates by id", () => {
      const local = {
        ideas: [
          { id: "1", title: "Idea A updated" },
        ],
      };
      const remote = {
        ideas: [
          { id: "1", title: "Idea A original" },
        ],
      };

      const result = autoMergeAppendOnly(local, remote) as {
        ideas: Array<{ id: string; title: string }>;
      };
      // Remote wins for existing items
      expect(result.ideas).toHaveLength(1);
      expect(result.ideas[0].title).toBe("Idea A original");
    });

    it("handles empty local", () => {
      const local = { ideas: [] };
      const remote = { ideas: [{ id: "1", title: "Existing" }] };
      const result = autoMergeAppendOnly(local, remote) as {
        ideas: Array<{ id: string }>;
      };
      expect(result.ideas).toHaveLength(1);
    });

    it("handles empty remote", () => {
      const local = { ideas: [{ id: "1", title: "New" }] };
      const remote = { ideas: [] };
      const result = autoMergeAppendOnly(local, remote) as {
        ideas: Array<{ id: string }>;
      };
      expect(result.ideas).toHaveLength(1);
    });
  });

  describe("messages format", () => {
    it("merges messages with unique ids", () => {
      const local = {
        messages: [
          { id: "m1", text: "Hello" },
          { id: "m3", text: "New msg" },
        ],
      };
      const remote = {
        messages: [
          { id: "m1", text: "Hello" },
          { id: "m2", text: "World" },
        ],
      };

      const result = autoMergeAppendOnly(local, remote) as {
        messages: Array<{ id: string }>;
      };
      expect(result.messages).toHaveLength(3);
    });
  });

  describe("array format", () => {
    it("merges plain arrays by value equality", () => {
      const local = ["a", "b", "c"];
      const remote = ["a", "d"];
      const result = autoMergeAppendOnly(local, remote) as string[];
      expect(result).toHaveLength(4);
      expect(result).toEqual(["a", "d", "b", "c"]);
    });
  });

  describe("fallback", () => {
    it("returns remote for unrecognized formats", () => {
      const local = { type: "unknown", data: 42 };
      const remote = { type: "unknown", data: 99 };
      const result = autoMergeAppendOnly(local, remote);
      expect(result).toEqual(remote);
    });
  });
});
