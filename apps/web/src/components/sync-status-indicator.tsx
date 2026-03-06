"use client";

import React from "react";

export type SyncState = "synced" | "syncing" | "conflict" | "offline";

interface SyncStatusIndicatorProps {
  state: SyncState;
  lastSyncTime?: string | null;
}

const STATE_CONFIG: Record<
  SyncState,
  { color: string; bgColor: string; label: string }
> = {
  synced: { color: "#1e8e3e", bgColor: "#e6f4ea", label: "Synced" },
  syncing: { color: "#f9ab00", bgColor: "#fef7e0", label: "Syncing..." },
  conflict: { color: "#d93025", bgColor: "#fce8e6", label: "Conflict" },
  offline: { color: "#80868b", bgColor: "#f1f3f4", label: "Offline" },
};

export function SyncStatusIndicator({
  state,
  lastSyncTime,
}: SyncStatusIndicatorProps) {
  const config = STATE_CONFIG[state];

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "12px",
        backgroundColor: config.bgColor,
        fontSize: "12px",
        fontWeight: 500,
        color: config.color,
      }}
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: config.color,
          display: "inline-block",
          animation: state === "syncing" ? "pulse 1.5s infinite" : undefined,
        }}
      />
      <span>{config.label}</span>
      {lastSyncTime && state === "synced" && (
        <span style={{ color: "#999", fontSize: "11px" }}>
          {formatTime(lastSyncTime)}
        </span>
      )}
    </div>
  );
}
