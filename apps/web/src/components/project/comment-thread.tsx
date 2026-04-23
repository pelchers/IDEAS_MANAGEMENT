"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  mentions: string[];
  createdAt: string;
  user: { id: string; displayName: string | null; avatarUrl: string | null };
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

/** Render content with @mentions as links */
function renderContent(content: string): React.ReactNode {
  // Pattern: @[displayName](userId)
  const parts = content.split(/(@\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const match = part.match(/@\[([^\]]+)\]\(([^)]+)\)/);
    if (match) {
      return (
        <Link key={i} href={`/users/${match[2]}`} className="text-watermelon font-bold hover:underline">
          @{match[1]}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function CommentThread({
  projectId,
  targetType,
  targetId,
}: {
  projectId: string;
  targetType: string;
  targetId: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/comments?targetType=${targetType}&targetId=${targetId}`);
      const data = await res.json();
      if (data.ok) setComments(data.comments || []);
    } catch { /* ignore */ }
  }, [projectId, targetType, targetId]);

  useEffect(() => {
    if (open) fetchComments();
  }, [open, fetchComments]);

  const addComment = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, content: newComment.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setComments((prev) => [...prev, data.comment]);
        setNewComment("");
      }
    } catch { /* ignore */ }
    setSending(false);
  };

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="font-mono text-[0.65rem] uppercase text-[#999] hover:text-signal-black flex items-center gap-1"
      >
        {comments.length > 0 ? `${comments.length} comment${comments.length !== 1 ? "s" : ""}` : "Add comment"}
        <span style={{ fontSize: "0.5rem" }}>{open ? "\u25B2" : "\u25BC"}</span>
      </button>

      {open && (
        <div className="mt-2 border-l-2 border-signal-black/20 pl-3">
          {comments.map((c) => (
            <div key={c.id} className="mb-2">
              <div className="flex items-center gap-2">
                <div style={{ width: "18px", height: "18px", backgroundColor: "#FF5E54", color: "#FFF", border: "1px solid #282828", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.4rem", overflow: "hidden", flexShrink: 0 }}>
                  {c.user.avatarUrl
                    ? <img src={c.user.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : (c.user.displayName || "?")[0].toUpperCase()}
                </div>
                <span className="font-bold text-[0.7rem] uppercase">{c.user.displayName || "User"}</span>
                <span className="font-mono text-[0.55rem] text-[#999]">{timeAgo(c.createdAt)}</span>
              </div>
              <div className="font-mono text-[0.75rem] mt-0.5 ml-[26px]">{renderContent(c.content)}</div>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              className="nb-input flex-1 text-[0.75rem] py-1"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addComment(); }}
            />
            <button className="nb-btn nb-btn--small text-[0.65rem]" onClick={addComment} disabled={sending}>
              {sending ? "..." : "SEND"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
