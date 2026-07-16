"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  sourceType: string | null;
  sourceId: string | null;
  linkPath: string | null;
  read: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=20");
      const data = await res.json();
      if (data.ok) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  // Initial fetch + SSE subscription
  useEffect(() => {
    load();
    const es = new EventSource("/api/notifications/stream");
    esRef.current = es;
    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.kind === "unread_count") {
          setUnreadCount(payload.count);
        } else if (payload.kind === "notification") {
          setNotifications((prev) => [payload.notification, ...prev].slice(0, 20));
          setUnreadCount((c) => c + 1);
        }
      } catch { /* ignore */ }
    };
    es.onerror = () => { /* auto-reconnect */ };
    return () => { es.close(); esRef.current = null; };
  }, [load]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const lastLoadRef = useRef(0);
  const toggle = () => {
    const next = !open;
    setOpen(next);
    // The SSE stream keeps the list live; only re-fetch on open if it's stale
    // (>20s) rather than hitting the API every time the panel is opened.
    if (next && Date.now() - lastLoadRef.current > 20_000) {
      lastLoadRef.current = Date.now();
      load();
    }
  };

  const handleClick = async (n: Notification) => {
    if (!n.read) {
      await fetch(`/api/notifications/${n.id}/read`, { method: "PUT" });
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    if (n.linkPath) router.push(n.linkPath);
  };

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifications((prev) => prev.map((x) => ({ ...x, read: true })));
    setUnreadCount(0);
  };

  const dismissAll = async () => {
    await fetch("/api/notifications", { method: "DELETE" });
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div style={{ position: "relative", flexShrink: 0 }} ref={panelRef}>
      <button
        aria-label="Notifications"
        onClick={toggle}
        style={{
          width: "44px", height: "44px", backgroundColor: "#FFFFFF",
          border: "3px solid #282828", boxShadow: "4px 4px 0px #282828",
          cursor: "pointer", fontSize: "1.2rem", display: "flex",
          alignItems: "center", justifyContent: "center",
          position: "relative", flexShrink: 0,
        }}
      >
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute", top: "-8px", right: "-8px", minWidth: "20px", height: "20px",
              padding: "0 4px", backgroundColor: "#FF5E54", color: "#FFF",
              border: "2px solid #282828", borderRadius: "10px",
              fontSize: "0.65rem", fontWeight: 700, fontFamily: "monospace",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            data-testid="notification-badge"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        &#9872;
      </button>

      {open && (
        <div
          style={{
            position: "absolute", top: "54px", right: 0, width: "360px", maxHeight: "70vh",
            backgroundColor: "#FFFFFF", border: "3px solid #282828", boxShadow: "6px 6px 0 #282828",
            zIndex: 200, display: "flex", flexDirection: "column", overflow: "hidden",
          }}
          data-testid="notification-panel"
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "2px solid #282828" }}>
            <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase" }}>Notifications</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={markAllRead} style={{ fontFamily: "monospace", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", border: "2px solid #282828", background: "#FFF", padding: "3px 6px", cursor: "pointer" }}>Read all</button>
              <button onClick={dismissAll} style={{ fontFamily: "monospace", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", border: "2px solid #282828", background: "#FFF", padding: "3px 6px", cursor: "pointer" }}>Clear</button>
            </div>
          </div>

          <div style={{ overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: "24px", textAlign: "center", fontFamily: "monospace", fontSize: "0.75rem", color: "#999", textTransform: "uppercase" }}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", fontFamily: "monospace", fontSize: "0.75rem", color: "#999", textTransform: "uppercase" }} data-testid="notification-empty">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "12px 16px", borderBottom: "1px solid #28282815",
                    backgroundColor: n.read ? "#FFF" : "#FFF4E6", cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    {!n.read && <span style={{ width: "8px", height: "8px", backgroundColor: "#FF5E54", borderRadius: "50%", marginTop: "5px", flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 700, lineHeight: 1.3 }}>{n.title}</div>
                      {n.body && <div style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#666", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.body}</div>}
                      <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: "#999", marginTop: "3px" }}>{timeAgo(n.createdAt)}</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
