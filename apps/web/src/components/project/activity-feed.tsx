"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Activity {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: { id: string; displayName: string | null; avatarUrl: string | null; email: string };
}

function formatAction(action: string): string {
  const map: Record<string, string> = {
    "invite.sent": "sent an invite",
    "member.joined": "joined the project",
    "member.added": "added a member",
    "member.removed": "removed a member",
    "member.role_changed": "changed a member's role",
    "comment.added": "commented",
    "artifact.created": "created an artifact",
    "artifact.updated": "updated an artifact",
    "artifact.deleted": "deleted an artifact",
    "settings.updated": "updated settings",
  };
  return map[action] || action.replace(/\./g, " ");
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function ActivityFeed({ projectId }: { projectId: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/activity?limit=20`);
      const data = await res.json();
      if (data.ok) setActivities(data.activities || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const actorInitials = (actor: Activity["actor"]) =>
    (actor.displayName || actor.email).split(/[\s@]/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join("");

  return (
    <div className="nb-card p-6">
      <h3 className="nb-card-title mb-4">ACTIVITY</h3>

      {loading ? (
        <p className="font-mono text-[0.8rem] text-[#999] uppercase">Loading...</p>
      ) : activities.length === 0 ? (
        <p className="font-mono text-[0.8rem] text-[#999] uppercase">No activity yet.</p>
      ) : (
        <div className="flex flex-col">
          {activities.map((a, i) => (
            <div key={a.id} className="flex gap-3 pb-3 mb-3" style={{ borderBottom: i < activities.length - 1 ? "1px solid #28282815" : "none" }}>
              {/* Avatar */}
              <div style={{ width: "24px", height: "24px", backgroundColor: "#FF5E54", color: "#FFF", border: "1px solid #282828", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.45rem", overflow: "hidden", flexShrink: 0, marginTop: "2px" }}>
                {a.actor.avatarUrl
                  ? <img src={a.actor.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : actorInitials(a.actor)}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[0.75rem]">
                  <Link href={`/users/${a.actor.id}`} className="font-bold uppercase hover:underline">
                    {a.actor.displayName || a.actor.email}
                  </Link>
                  {" "}
                  <span className="text-[#666]">{formatAction(a.action)}</span>
                </div>
                <div className="font-mono text-[0.6rem] text-[#999] mt-0.5">{timeAgo(a.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
