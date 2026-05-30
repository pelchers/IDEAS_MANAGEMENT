"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface PublicUser {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  email: string | null;
  tags: string[];
}

interface PublicProject {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  tags: string[];
  memberCount: number;
  role: string;
  createdAt: string;
}

interface MutualFriend {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<PublicUser | null>(null);
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friendState, setFriendState] = useState<string>("none");
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [mutualFriends, setMutualFriends] = useState<MutualFriend[]>([]);
  const [isSelf, setIsSelf] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      if (data.ok) {
        setUser(data.user);
        setProjects(data.projects || []);
        setFriendState(data.friendship?.state || "none");
        setFriendshipId(data.friendship?.friendshipId || null);
        setMutualFriends(data.mutualFriends || []);
        setIsSelf(!!data.isSelf);
      } else {
        setError(data.error === "user_not_found" ? "User not found." : "Failed to load profile.");
      }
    } catch {
      setError("Network error.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!userId) return;
    load();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendRequest = async () => {
    setBusy(true);
    await fetch("/api/friends/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ addresseeId: userId }) });
    await load();
    setBusy(false);
  };
  const respond = async (action: "accept" | "decline") => {
    if (!friendshipId) return;
    setBusy(true);
    await fetch(`/api/friends/${friendshipId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    await load();
    setBusy(false);
  };
  const unfriend = async () => {
    if (!friendshipId) return;
    setBusy(true);
    await fetch(`/api/friends/${friendshipId}`, { method: "DELETE" });
    await load();
    setBusy(false);
  };

  const initials = user
    ? (user.displayName || user.email || "?")
        .split(/[\s@]/)
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0].toUpperCase())
        .join("")
    : "?";

  if (loading) {
    return (
      <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
        <h1 className="nb-view-title mb-4">USER PROFILE</h1>
        <div className="nb-card p-8 text-center font-mono text-[0.85rem] uppercase">Loading...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
        <h1 className="nb-view-title mb-4">USER PROFILE</h1>
        <div className="nb-card p-8 text-center font-mono text-[0.85rem] uppercase text-watermelon">
          {error || "User not found."}
        </div>
        <Link href="/explore" className="nb-btn mt-4 inline-block">BACK TO EXPLORE</Link>
      </div>
    );
  }

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      <div className="mb-8">
        <h1 className="nb-view-title">USER PROFILE</h1>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-6">
        {/* ── Profile Card ── */}
        <div className="nb-card p-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <div
                className="flex-shrink-0"
                style={{
                  width: "72px",
                  height: "72px",
                  backgroundColor: "#FF5E54",
                  color: "#FFFFFF",
                  border: "3px solid #282828",
                  boxShadow: "4px 4px 0px #282828",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  overflow: "hidden",
                }}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-[1.1rem] uppercase tracking-wider truncate">
                  {user.displayName || "Anonymous"}
                </h2>
                {user.email && (
                  <p className="font-mono text-[0.75rem] text-[#666] uppercase truncate">{user.email}</p>
                )}
              </div>
            </div>

            {user.bio && (
              <div>
                <h3 className="font-bold text-[0.8rem] uppercase tracking-wider mb-1">BIO</h3>
                <p className="font-mono text-[0.85rem] leading-relaxed" style={{ wordBreak: "break-word" }}>
                  {user.bio}
                </p>
              </div>
            )}

            {user.tags.length > 0 && (
              <div>
                <h3 className="font-bold text-[0.8rem] uppercase tracking-wider mb-2">TAGS</h3>
                <div className="flex flex-wrap gap-2">
                  {user.tags.map((tag) => (
                    <span key={tag} className="font-mono text-[0.75rem] uppercase px-3 py-1 border-2 border-signal-black bg-white">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Friend actions */}
            {!isSelf && (
              <div className="flex gap-2 flex-wrap">
                {friendState === "none" && (
                  <button className="nb-btn nb-btn--primary nb-btn--small" onClick={sendRequest} disabled={busy}>+ ADD FRIEND</button>
                )}
                {friendState === "outgoing" && (
                  <button className="nb-btn nb-btn--small" onClick={unfriend} disabled={busy}>CANCEL REQUEST</button>
                )}
                {friendState === "incoming" && (
                  <>
                    <button className="nb-btn nb-btn--primary nb-btn--small" onClick={() => respond("accept")} disabled={busy}>ACCEPT</button>
                    <button className="nb-btn nb-btn--small" onClick={() => respond("decline")} disabled={busy}>DECLINE</button>
                  </>
                )}
                {friendState === "friends" && (
                  <>
                    <span className="font-mono text-[0.7rem] uppercase px-3 py-1.5 border-2 border-malachite text-malachite font-bold">&#10003; FRIENDS</span>
                    <button className="nb-btn nb-btn--small" onClick={unfriend} disabled={busy}>UNFRIEND</button>
                  </>
                )}
                {friendState === "blocked" && (
                  <span className="font-mono text-[0.7rem] uppercase px-3 py-1.5 border-2 border-signal-black text-[#999]">BLOCKED</span>
                )}
              </div>
            )}

            {/* Mutual friends */}
            {mutualFriends.length > 0 && (
              <div>
                <h3 className="font-bold text-[0.8rem] uppercase tracking-wider mb-2">MUTUAL FRIENDS ({mutualFriends.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {mutualFriends.map((m) => (
                    <Link key={m.id} href={`/users/${m.id}`} className="flex items-center gap-2 px-2 py-1 border border-signal-black/20 hover:bg-creamy-milk">
                      <div style={{ width: "22px", height: "22px", backgroundColor: "#FF5E54", color: "#FFF", border: "1px solid #282828", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.5rem", overflow: "hidden" }}>
                        {m.avatarUrl ? <img src={m.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (m.displayName || "?")[0].toUpperCase()}
                      </div>
                      <span className="font-mono text-[0.7rem] uppercase truncate max-w-[120px]">{m.displayName || "User"}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Public Projects ── */}
        <div className="nb-card p-8">
          <h2 className="nb-card-title mb-4">PUBLIC PROJECTS ({projects.length})</h2>
          {projects.length === 0 ? (
            <p className="font-mono text-[0.8rem] text-[#999] uppercase">No public projects.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="block border-2 border-signal-black p-4 hover:bg-creamy-milk transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[0.9rem] uppercase">{p.name}</span>
                    <span className="font-mono text-[0.65rem] uppercase px-2 py-0.5 border border-signal-black">{p.status}</span>
                  </div>
                  {p.description && (
                    <p className="font-mono text-[0.75rem] text-[#666] line-clamp-2">{p.description}</p>
                  )}
                  <div className="flex gap-3 mt-2 font-mono text-[0.65rem] text-[#999] uppercase">
                    <span>{p.memberCount} member{p.memberCount !== 1 ? "s" : ""}</span>
                    <span>{p.role}</span>
                    {p.tags.length > 0 && <span>{p.tags.slice(0, 3).join(", ")}</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Link href="/explore" className="nb-btn mt-6 inline-block">BACK TO EXPLORE</Link>
    </div>
  );
}
