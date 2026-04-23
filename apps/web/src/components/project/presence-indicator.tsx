"use client";

import { useState, useEffect, useRef } from "react";

interface PresenceUser {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export function PresenceIndicator({ projectId }: { projectId: string }) {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(`/api/projects/${projectId}/presence`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as PresenceUser[];
        setUsers(data);
      } catch { /* ignore parse errors */ }
    };

    es.onerror = () => {
      // Will auto-reconnect
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [projectId]);

  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5" title={`${users.length} online: ${users.map((u) => u.displayName || "User").join(", ")}`}>
      {users.slice(0, 4).map((u) => (
        <div
          key={u.userId}
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            backgroundColor: "#FF5E54",
            color: "#FFF",
            border: "2px solid #2ECC71",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "0.4rem",
            overflow: "hidden",
            flexShrink: 0,
            position: "relative",
          }}
          title={u.displayName || "User"}
        >
          {u.avatarUrl ? (
            <img src={u.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            (u.displayName || "?")[0].toUpperCase()
          )}
          {/* Green dot */}
          <div style={{
            position: "absolute",
            bottom: "-1px",
            right: "-1px",
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            backgroundColor: "#2ECC71",
            border: "1px solid #FFF",
          }} />
        </div>
      ))}
      {users.length > 4 && (
        <span className="font-mono text-[0.6rem] text-malachite font-bold">+{users.length - 4}</span>
      )}
      <span className="font-mono text-[0.55rem] text-malachite uppercase ml-1">online</span>
    </div>
  );
}
