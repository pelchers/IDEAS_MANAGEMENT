"use client";

import { useState, useEffect, useCallback } from "react";

interface Session {
  id: string;
  title: string;
  projectId: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SessionListProps {
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  refreshTrigger?: number;
}

export function SessionList({ activeSessionId, onSelectSession, onNewSession, refreshTrigger }: SessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/sessions", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions, refreshTrigger]);

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/ai/sessions/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch {
      // silently fail
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Chats</h3>
        <button onClick={onNewSession} style={styles.newButton}>
          + New
        </button>
      </div>

      <div style={styles.list}>
        {loading && <div style={styles.loadingText}>Loading...</div>}
        {!loading && sessions.length === 0 && (
          <div style={styles.emptyText}>No conversations yet</div>
        )}
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            style={{
              ...styles.sessionItem,
              ...(activeSessionId === session.id ? styles.activeItem : {}),
            }}
          >
            <div style={styles.sessionTitle}>{session.title}</div>
            <div style={styles.sessionMeta}>
              {session.messageCount} messages
              {session.projectId && ` | ${session.projectId}`}
            </div>
            <button
              onClick={(e) => handleDelete(e, session.id)}
              style={styles.deleteButton}
              title="Delete session"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    borderRight: "1px solid #e0e0e0",
    backgroundColor: "#f8f8f8",
    width: "260px",
    minWidth: "260px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    borderBottom: "1px solid #e0e0e0",
  },
  title: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
  },
  newButton: {
    padding: "6px 12px",
    backgroundColor: "#5b4dc7",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: "8px",
  },
  loadingText: {
    padding: "16px",
    textAlign: "center" as const,
    color: "#888",
    fontSize: "13px",
  },
  emptyText: {
    padding: "16px",
    textAlign: "center" as const,
    color: "#888",
    fontSize: "13px",
  },
  sessionItem: {
    padding: "10px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "4px",
    position: "relative" as const,
    transition: "background-color 0.15s",
  },
  activeItem: {
    backgroundColor: "#e8e4ff",
  },
  sessionTitle: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#333",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
    paddingRight: "24px",
  },
  sessionMeta: {
    fontSize: "11px",
    color: "#888",
    marginTop: "2px",
  },
  deleteButton: {
    position: "absolute" as const,
    top: "10px",
    right: "8px",
    padding: "2px 6px",
    border: "none",
    backgroundColor: "transparent",
    color: "#999",
    cursor: "pointer",
    fontSize: "12px",
    borderRadius: "4px",
  },
};
