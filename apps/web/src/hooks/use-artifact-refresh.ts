"use client";

import { useEffect } from "react";

/**
 * Hook that listens for `artifact-updated` custom events and calls
 * the provided callback when the specified tool name matches.
 *
 * Usage:
 *   useArtifactRefresh("update_ideas_artifact", loadIdeas);
 *   useArtifactRefresh("update_kanban_artifact", loadBoard);
 */
export function useArtifactRefresh(toolName: string, onRefresh: () => void) {
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.tool === toolName) {
        // Small delay to let the DB write complete
        setTimeout(onRefresh, 500);
      }
    };
    window.addEventListener("artifact-updated", handler);
    return () => window.removeEventListener("artifact-updated", handler);
  }, [toolName, onRefresh]);
}

/**
 * Listen for ANY artifact update (useful for dashboard/summary pages).
 */
export function useAnyArtifactRefresh(onRefresh: () => void) {
  useEffect(() => {
    const handler = () => setTimeout(onRefresh, 500);
    window.addEventListener("artifact-updated", handler);
    return () => window.removeEventListener("artifact-updated", handler);
  }, [onRefresh]);
}
