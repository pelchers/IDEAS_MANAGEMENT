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

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<PublicUser | null>(null);
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        const data = await res.json();
        if (data.ok) {
          setUser(data.user);
          setProjects(data.projects || []);
        } else {
          setError(data.error === "user_not_found" ? "User not found." : "Failed to load profile.");
        }
      } catch {
        setError("Network error.");
      }
      setLoading(false);
    })();
  }, [userId]);

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
