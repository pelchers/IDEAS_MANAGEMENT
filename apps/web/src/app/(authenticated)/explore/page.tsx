"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface ExploreProject {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  tags: string[];
  memberCount: number;
  owner: { id: string; displayName: string | null; avatarUrl: string | null } | null;
  createdAt: string;
}

interface ExploreUser {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  tags: string[];
  projectCount: number;
}

type Tab = "projects" | "users";

export default function ExplorePage() {
  const [tab, setTab] = useState<Tab>("projects");
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<ExploreProject[]>([]);
  const [users, setUsers] = useState<ExploreUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("recent");

  const searchProjects = useCallback(async (q: string, s: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      params.set("sort", s);
      params.set("limit", "30");
      const res = await fetch(`/api/projects/explore?${params}`);
      const data = await res.json();
      if (data.ok) setProjects(data.projects);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const searchUsers = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      params.set("limit", "30");
      const res = await fetch(`/api/users?${params}`);
      const data = await res.json();
      if (data.ok) setUsers(data.users);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  // Initial load
  useEffect(() => {
    searchProjects("", sort);
    searchUsers("");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    if (tab === "projects") searchProjects(query, sort);
    else searchUsers(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const ownerInitials = (owner: ExploreProject["owner"]) => {
    if (!owner) return "?";
    return (owner.displayName || "?").split(/\s/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join("");
  };

  const userInitials = (u: ExploreUser) => {
    return (u.displayName || "?").split(/\s/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join("") || "?";
  };

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      <div className="mb-6">
        <h1 className="nb-view-title">EXPLORE</h1>
        <p className="nb-view-subtitle mt-1">Discover public projects and users</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-6">
        {(["projects", "users"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); if (t === "projects") searchProjects(query, sort); else searchUsers(query); }}
            className="font-mono font-bold text-[0.85rem] uppercase px-6 py-3 border-2 border-signal-black cursor-pointer transition-colors"
            style={{
              backgroundColor: tab === t ? "#282828" : "#FFF",
              color: tab === t ? "#FFF" : "#282828",
              marginRight: "-2px",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          className="nb-input flex-1"
          placeholder={tab === "projects" ? "Search projects by name..." : "Search users by name or tag..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {tab === "projects" && (
          <select
            className="nb-input"
            value={sort}
            onChange={(e) => { setSort(e.target.value); searchProjects(query, e.target.value); }}
            style={{ width: "140px" }}
          >
            <option value="recent">RECENT</option>
            <option value="name">NAME</option>
            <option value="members">POPULAR</option>
          </select>
        )}
        <button className="nb-btn nb-btn--primary" onClick={handleSearch}>SEARCH</button>
      </div>

      {loading && (
        <div className="nb-card p-6 text-center font-mono text-[0.85rem] uppercase mb-6">Loading...</div>
      )}

      {/* ── Projects Tab ── */}
      {tab === "projects" && !loading && (
        <>
          {projects.length === 0 ? (
            <div className="nb-card p-8 text-center">
              <p className="font-mono text-[0.85rem] text-[#999] uppercase">
                No public projects found. Projects must be set to PUBLIC visibility to appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="nb-card p-5 hover:shadow-[6px_6px_0_#282828] transition-shadow block"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-[0.95rem] uppercase tracking-wide truncate flex-1">{p.name}</h3>
                    <span className="font-mono text-[0.6rem] uppercase px-2 py-0.5 border border-signal-black ml-2 flex-shrink-0">
                      {p.status}
                    </span>
                  </div>
                  {p.description && (
                    <p className="font-mono text-[0.75rem] text-[#666] mb-3 line-clamp-2">{p.description}</p>
                  )}
                  {p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {p.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="font-mono text-[0.6rem] uppercase px-2 py-0.5 bg-creamy-milk border border-signal-black/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between font-mono text-[0.65rem] text-[#999] uppercase">
                    <div className="flex items-center gap-2">
                      {p.owner && (
                        <>
                          <div
                            style={{
                              width: "20px", height: "20px", backgroundColor: "#FF5E54", color: "#FFF",
                              border: "1px solid #282828", display: "flex", alignItems: "center", justifyContent: "center",
                              fontWeight: 700, fontSize: "0.5rem", overflow: "hidden",
                            }}
                          >
                            {p.owner.avatarUrl ? (
                              <img src={p.owner.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : ownerInitials(p.owner)}
                          </div>
                          <span>{p.owner.displayName || "Unknown"}</span>
                        </>
                      )}
                    </div>
                    <span>{p.memberCount} member{p.memberCount !== 1 ? "s" : ""}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Users Tab ── */}
      {tab === "users" && !loading && (
        <>
          {users.length === 0 ? (
            <div className="nb-card p-8 text-center">
              <p className="font-mono text-[0.85rem] text-[#999] uppercase">No users found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
              {users.map((u) => (
                <Link
                  key={u.id}
                  href={`/users/${u.id}`}
                  className="nb-card p-5 hover:shadow-[6px_6px_0_#282828] transition-shadow block"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div
                      style={{
                        width: "48px", height: "48px", backgroundColor: "#FF5E54", color: "#FFF",
                        border: "2px solid #282828", boxShadow: "3px 3px 0 #282828",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: "1rem", overflow: "hidden", flexShrink: 0,
                      }}
                    >
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : userInitials(u)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-[0.9rem] uppercase tracking-wide truncate">
                        {u.displayName || "Anonymous"}
                      </h3>
                      <span className="font-mono text-[0.65rem] text-[#999] uppercase">
                        {u.projectCount} project{u.projectCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  {u.bio && (
                    <p className="font-mono text-[0.75rem] text-[#666] mb-2 line-clamp-2">{u.bio}</p>
                  )}
                  {u.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {u.tags.slice(0, 5).map((tag) => (
                        <span key={tag} className="font-mono text-[0.6rem] uppercase px-2 py-0.5 bg-creamy-milk border border-signal-black/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
