"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface FriendUser {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  email: string;
}
interface Entry {
  friendshipId: string;
  user: FriendUser;
  since: string;
}

function initials(u: FriendUser) {
  return (u.displayName || u.email).split(/[\s@]/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join("");
}

function Avatar({ u }: { u: FriendUser }) {
  return (
    <div style={{ width: "40px", height: "40px", backgroundColor: "#FF5E54", color: "#FFF", border: "2px solid #282828", boxShadow: "2px 2px 0 #282828", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", overflow: "hidden", flexShrink: 0 }}>
      {u.avatarUrl ? <img src={u.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials(u)}
    </div>
  );
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Entry[]>([]);
  const [incoming, setIncoming] = useState<Entry[]>([]);
  const [outgoing, setOutgoing] = useState<Entry[]>([]);
  const [blocked, setBlocked] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/friends");
      const data = await res.json();
      if (data.ok) {
        setFriends(data.friends);
        setIncoming(data.incoming);
        setOutgoing(data.outgoing);
        setBlocked(data.blocked);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const respond = async (friendshipId: string, action: "accept" | "decline") => {
    await fetch(`/api/friends/${friendshipId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    load();
  };
  const remove = async (friendshipId: string) => {
    await fetch(`/api/friends/${friendshipId}`, { method: "DELETE" });
    load();
  };
  const unblock = async (targetUserId: string) => {
    await fetch(`/api/friends/block`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetUserId, action: "unblock" }) });
    load();
  };
  const block = async (targetUserId: string) => {
    if (!confirm("Block this user?")) return;
    await fetch(`/api/friends/block`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetUserId, action: "block" }) });
    load();
  };

  if (loading) {
    return (
      <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
        <h1 className="nb-view-title mb-4">FRIENDS</h1>
        <div className="nb-card p-8 text-center font-mono text-[0.85rem] uppercase">Loading...</div>
      </div>
    );
  }

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      <div className="mb-6">
        <h1 className="nb-view-title">FRIENDS</h1>
        <p className="nb-view-subtitle mt-1">Your connections and requests</p>
      </div>

      {/* Incoming requests */}
      {incoming.length > 0 && (
        <div className="nb-card p-6 mb-6">
          <h2 className="nb-card-title mb-4">INCOMING REQUESTS ({incoming.length})</h2>
          <div className="flex flex-col gap-3">
            {incoming.map((e) => (
              <div key={e.friendshipId} className="flex items-center gap-3 p-3 border-2 border-signal-black">
                <Avatar u={e.user} />
                <Link href={`/users/${e.user.id}`} className="flex-1 min-w-0 hover:underline">
                  <div className="font-bold text-[0.85rem] uppercase truncate">{e.user.displayName || e.user.email}</div>
                  <div className="font-mono text-[0.65rem] text-[#999] truncate">{e.user.email}</div>
                </Link>
                <button className="nb-btn nb-btn--primary nb-btn--small" onClick={() => respond(e.friendshipId, "accept")}>ACCEPT</button>
                <button className="nb-btn nb-btn--small" onClick={() => respond(e.friendshipId, "decline")}>DECLINE</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outgoing requests */}
      {outgoing.length > 0 && (
        <div className="nb-card p-6 mb-6">
          <h2 className="nb-card-title mb-4">SENT REQUESTS ({outgoing.length})</h2>
          <div className="flex flex-col gap-3">
            {outgoing.map((e) => (
              <div key={e.friendshipId} className="flex items-center gap-3 p-3 border-2 border-dashed border-signal-black/40">
                <Avatar u={e.user} />
                <Link href={`/users/${e.user.id}`} className="flex-1 min-w-0 hover:underline">
                  <div className="font-bold text-[0.85rem] uppercase truncate">{e.user.displayName || e.user.email}</div>
                  <div className="font-mono text-[0.6rem] text-[#999] uppercase">Pending</div>
                </Link>
                <button className="nb-btn nb-btn--small" onClick={() => remove(e.friendshipId)}>CANCEL</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      <div className="nb-card p-6 mb-6">
        <h2 className="nb-card-title mb-4">FRIENDS ({friends.length})</h2>
        {friends.length === 0 ? (
          <p className="font-mono text-[0.8rem] text-[#999] uppercase">No friends yet. Find people on the <Link href="/explore" className="text-watermelon hover:underline">Explore</Link> page.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
            {friends.map((e) => (
              <div key={e.friendshipId} className="flex items-center gap-3 p-3 border-2 border-signal-black">
                <Avatar u={e.user} />
                <Link href={`/users/${e.user.id}`} className="flex-1 min-w-0 hover:underline">
                  <div className="font-bold text-[0.85rem] uppercase truncate">{e.user.displayName || e.user.email}</div>
                  <div className="font-mono text-[0.6rem] text-[#999] truncate">{e.user.email}</div>
                </Link>
                <button className="text-[#999] hover:text-watermelon font-bold text-[0.7rem]" title="Unfriend" onClick={() => remove(e.friendshipId)}>X</button>
                <button className="text-[#999] hover:text-signal-black font-bold text-[0.6rem]" title="Block" onClick={() => block(e.user.id)}>&#128683;</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Blocked */}
      {blocked.length > 0 && (
        <div className="nb-card p-6">
          <h2 className="nb-card-title mb-4">BLOCKED ({blocked.length})</h2>
          <div className="flex flex-col gap-2">
            {blocked.map((e) => (
              <div key={e.friendshipId} className="flex items-center gap-3 p-2 border border-signal-black/30 bg-creamy-milk">
                <Avatar u={e.user} />
                <span className="flex-1 font-bold text-[0.8rem] uppercase truncate">{e.user.displayName || e.user.email}</span>
                <button className="nb-btn nb-btn--small" onClick={() => unblock(e.user.id)}>UNBLOCK</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
