"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface GroupCard {
  id: string;
  name: string;
  slug: string;
  description: string;
  avatarUrl: string | null;
  memberCount: number;
  projectCount: number;
  myRole: string | null;
  myStatus: string | null;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async (q: string, t: "all" | "mine") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (t === "mine") params.set("mine", "1");
      const res = await fetch(`/api/groups?${params}`);
      const data = await res.json();
      if (data.ok) setGroups(data.groups);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load("", "all"); }, [load]);

  const createGroup = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setShowCreate(false);
        setNewName("");
        setNewDesc("");
        load(query, tab);
      }
    } catch { /* ignore */ }
    setCreating(false);
  };

  const groupInitials = (g: GroupCard) => g.name.split(/\s/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join("");

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="nb-view-title">GROUPS</h1>
          <p className="nb-view-subtitle mt-1">Collaborate in shared workspaces</p>
        </div>
        <button className="nb-btn nb-btn--primary" onClick={() => setShowCreate(!showCreate)}>+ CREATE GROUP</button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="nb-card p-6 mb-6">
          <h2 className="nb-card-title mb-4">CREATE GROUP</h2>
          <div className="flex flex-col gap-3">
            <input className="nb-input" placeholder="Group name" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={120} />
            <textarea className="nb-input nb-textarea" placeholder="Description (optional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} maxLength={2000} rows={3} />
            <div className="flex gap-2">
              <button className="nb-btn nb-btn--primary" onClick={createGroup} disabled={creating}>{creating ? "CREATING..." : "CREATE"}</button>
              <button className="nb-btn" onClick={() => setShowCreate(false)}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs + search */}
      <div className="flex gap-0 mb-4">
        {(["all", "mine"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); load(query, t); }}
            className="font-mono font-bold text-[0.8rem] uppercase px-5 py-2.5 border-2 border-signal-black cursor-pointer"
            style={{ backgroundColor: tab === t ? "#282828" : "#FFF", color: tab === t ? "#FFF" : "#282828", marginRight: "-2px" }}
          >
            {t === "all" ? "All Groups" : "My Groups"}
          </button>
        ))}
      </div>
      <div className="flex gap-3 mb-6">
        <input className="nb-input flex-1" placeholder="Search groups..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") load(query, tab); }} />
        <button className="nb-btn nb-btn--primary" onClick={() => load(query, tab)}>SEARCH</button>
      </div>

      {loading ? (
        <div className="nb-card p-6 text-center font-mono text-[0.85rem] uppercase">Loading...</div>
      ) : groups.length === 0 ? (
        <div className="nb-card p-8 text-center">
          <p className="font-mono text-[0.85rem] text-[#999] uppercase">
            {tab === "mine" ? "You're not in any groups yet." : "No groups found."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {groups.map((g) => (
            <Link key={g.id} href={`/groups/${g.id}`} className="nb-card p-5 hover:shadow-[6px_6px_0_#282828] transition-shadow block">
              <div className="flex items-center gap-3 mb-3">
                <div style={{ width: "44px", height: "44px", backgroundColor: "#282828", color: "#FFF", border: "2px solid #282828", boxShadow: "3px 3px 0 #FF5E54", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.9rem", overflow: "hidden", flexShrink: 0 }}>
                  {g.avatarUrl ? <img src={g.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : groupInitials(g)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-[0.95rem] uppercase tracking-wide truncate">{g.name}</h3>
                  {g.myRole && <span className="font-mono text-[0.6rem] uppercase text-malachite font-bold">{g.myRole}</span>}
                  {g.myStatus === "pending" && <span className="font-mono text-[0.6rem] uppercase text-watermelon font-bold">PENDING</span>}
                </div>
              </div>
              {g.description && <p className="font-mono text-[0.75rem] text-[#666] mb-3 line-clamp-2">{g.description}</p>}
              <div className="flex gap-3 font-mono text-[0.65rem] text-[#999] uppercase">
                <span>{g.memberCount} member{g.memberCount !== 1 ? "s" : ""}</span>
                <span>{g.projectCount} project{g.projectCount !== 1 ? "s" : ""}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
