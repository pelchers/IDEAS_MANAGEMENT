"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type SyncState = "synced" | "syncing" | "conflict" | "error" | "offline";

interface SyncStatusData {
  state: SyncState;
  conflictCount: number;
  projectId: string | null;
}

/**
 * Compact sync-status badge for the app shell top bar.
 * Polls GET /api/sync/pull/[projectId] every 30s and on mount.
 */
export function SyncStatusIndicator() {
  const [status, setStatus] = useState<SyncStatusData>({
    state: "synced",
    conflictCount: 0,
    projectId: null,
  });

  const fetchStatus = useCallback(async (pid: string) => {
    try {
      setStatus((prev) => ({ ...prev, state: "syncing", projectId: pid }));
      const res = await fetch(`/api/sync/pull/${pid}?since=0`);
      if (!res.ok) {
        setStatus((prev) => ({ ...prev, state: "error" }));
        return;
      }
      const data = await res.json();
      if (!data.ok) {
        setStatus((prev) => ({ ...prev, state: "error" }));
        return;
      }
      const conflicts: unknown[] = data.conflicts ?? [];
      setStatus({
        state: conflicts.length > 0 ? "conflict" : "synced",
        conflictCount: conflicts.length,
        projectId: pid,
      });
    } catch {
      setStatus((prev) => ({ ...prev, state: "error" }));
    }
  }, []);

  useEffect(() => {
    // Read selected project from localStorage
    let pid: string | null = null;
    try {
      const saved = localStorage.getItem("im_selected_project");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.id) pid = parsed.id;
      }
    } catch { /* ignore */ }

    if (!pid) {
      setStatus({ state: "offline", conflictCount: 0, projectId: null });
      return;
    }

    // Initial fetch
    fetchStatus(pid);

    // Poll every 30s
    const interval = setInterval(() => fetchStatus(pid!), 30_000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Also react to storage changes (project switch in another tab or component)
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "im_selected_project" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.id) fetchStatus(parsed.id);
        } catch { /* ignore */ }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [fetchStatus]);

  const { bg, fg, label, pulse } = styleForState(status.state, status.conflictCount);

  const badge = (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        border: "3px solid #282828",
        boxShadow: "2px 2px 0px #282828",
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "0.7rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        backgroundColor: bg,
        color: fg,
        cursor: status.state === "conflict" ? "pointer" : "default",
        animation: pulse ? "nb-pulse 1.5s ease-in-out infinite" : undefined,
        whiteSpace: "nowrap",
      }}
      title={
        status.state === "conflict"
          ? `${status.conflictCount} conflict(s) — click to resolve`
          : label
      }
    >
      <span style={{ width: "8px", height: "8px", backgroundColor: fg, display: "inline-block" }} />
      {label}
      {/* Inline keyframes for pulse animation */}
      {pulse && (
        <style>{`
          @keyframes nb-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.55; }
          }
        `}</style>
      )}
    </div>
  );

  // If there are conflicts and we have a project, link to conflicts page
  if (status.state === "conflict" && status.projectId) {
    return (
      <Link href={`/projects/${status.projectId}/conflicts`} style={{ textDecoration: "none" }}>
        {badge}
      </Link>
    );
  }

  return badge;
}

function styleForState(state: SyncState, conflictCount: number) {
  switch (state) {
    case "synced":
      return { bg: "#D5F5E3", fg: "#1E8449", label: "Synced", pulse: false };
    case "syncing":
      return { bg: "#FEF9E7", fg: "#B7950B", label: "Syncing...", pulse: true };
    case "conflict":
      return {
        bg: "#FADBD8",
        fg: "#C0392B",
        label: `${conflictCount} Conflict${conflictCount !== 1 ? "s" : ""}`,
        pulse: false,
      };
    case "error":
      return { bg: "#F8F3EC", fg: "#666666", label: "Sync err", pulse: false };
    case "offline":
    default:
      return { bg: "#F8F3EC", fg: "#999999", label: "Offline", pulse: false };
  }
}
