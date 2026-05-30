"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Member {
  id: string;
  role: string;
  status: string;
  user: { id: string; displayName: string | null; avatarUrl: string | null; email: string };
}
interface GroupProject {
  id: string;
  name: string;
  status: string;
  visibility: string;
  memberCount: number;
}
interface GroupDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  avatarUrl: string | null;
  members: Member[];
  pendingMembers: Member[];
  projects: GroupProject[];
  myRole: string | null;
  myStatus: string | null;
}

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.id as string;
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      const data = await res.json();
      if (data.ok) setGroup(data.group);
      else setError(data.error === "not_found" ? "Group not found." : "Failed to load group.");
    } catch {
      setError("Network error.");
    }
    setLoading(false);
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  const isAdmin = group?.myRole === "OWNER" || group?.myRole === "ADMIN";

  const join = async () => {
    setBusy(true);
    await fetch(`/api/groups/${groupId}/members`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "join" }) });
    await load();
    setBusy(false);
  };
  const invite = async () => {
    if (!inviteEmail.trim()) return;
    setBusy(true);
    await fetch(`/api/groups/${groupId}/members`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "invite", email: inviteEmail.trim() }) });
    setInviteEmail("");
    await load();
    setBusy(false);
  };
  const approve = async (memberId: string) => {
    await fetch(`/api/groups/${groupId}/members/${memberId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "approve" }) });
    load();
  };
  const changeRole = async (memberId: string, role: string) => {
    await fetch(`/api/groups/${groupId}/members/${memberId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "set_role", role }) });
    load();
  };
  const removeMember = async (memberId: string) => {
    if (!confirm("Remove this member?")) return;
    await fetch(`/api/groups/${groupId}/members/${memberId}`, { method: "DELETE" });
    load();
  };

  if (loading) {
    return (
      <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
        <h1 className="nb-view-title mb-4">GROUP</h1>
        <div className="nb-card p-8 text-center font-mono text-[0.85rem] uppercase">Loading...</div>
      </div>
    );
  }
  if (error || !group) {
    return (
      <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
        <h1 className="nb-view-title mb-4">GROUP</h1>
        <div className="nb-card p-8 text-center font-mono text-[0.85rem] uppercase text-watermelon">{error || "Group not found."}</div>
        <Link href="/groups" className="nb-btn mt-4 inline-block">BACK TO GROUPS</Link>
      </div>
    );
  }

  const groupInitials = group.name.split(/\s/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join("");
  const mInitials = (m: Member) => (m.user.displayName || m.user.email).split(/[\s@]/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join("");

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div style={{ width: "64px", height: "64px", backgroundColor: "#282828", color: "#FFF", border: "3px solid #282828", boxShadow: "4px 4px 0 #FF5E54", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.3rem", overflow: "hidden", flexShrink: 0 }}>
          {group.avatarUrl ? <img src={group.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : groupInitials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="nb-view-title">{group.name}</h1>
          {group.description && <p className="nb-view-subtitle mt-1">{group.description}</p>}
        </div>
        {!group.myStatus && (
          <button className="nb-btn nb-btn--primary" onClick={join} disabled={busy}>REQUEST TO JOIN</button>
        )}
        {group.myStatus === "pending" && (
          <span className="font-mono text-[0.7rem] uppercase px-3 py-1.5 border-2 border-watermelon text-watermelon font-bold">JOIN PENDING</span>
        )}
        {group.myRole && (
          <span className="font-mono text-[0.7rem] uppercase px-3 py-1.5 border-2 border-malachite text-malachite font-bold">{group.myRole}</span>
        )}
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-6">
        {/* Members */}
        <div className="nb-card p-6">
          <h2 className="nb-card-title mb-4">MEMBERS ({group.members.length})</h2>
          <div className="flex flex-col gap-2 mb-4">
            {group.members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-2 border border-signal-black/20">
                <div style={{ width: "28px", height: "28px", backgroundColor: "#FF5E54", color: "#FFF", border: "1px solid #282828", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.55rem", overflow: "hidden", flexShrink: 0 }}>
                  {m.user.avatarUrl ? <img src={m.user.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : mInitials(m)}
                </div>
                <Link href={`/users/${m.user.id}`} className="flex-1 min-w-0 hover:underline">
                  <div className="font-bold text-[0.8rem] uppercase truncate">{m.user.displayName || m.user.email}</div>
                </Link>
                {isAdmin && m.role !== "OWNER" ? (
                  <select className="nb-input text-[0.65rem] py-1 px-1.5" value={m.role} onChange={(e) => changeRole(m.id, e.target.value)} style={{ width: "85px" }}>
                    {group.myRole === "OWNER" && <option value="OWNER">OWNER</option>}
                    <option value="ADMIN">ADMIN</option>
                    <option value="MEMBER">MEMBER</option>
                  </select>
                ) : (
                  <span className="font-mono text-[0.6rem] uppercase px-2 py-0.5 border border-signal-black">{m.role}</span>
                )}
                {isAdmin && m.role !== "OWNER" && (
                  <button className="text-watermelon font-bold text-[0.7rem] hover:opacity-70" title="Remove" onClick={() => removeMember(m.id)}>X</button>
                )}
              </div>
            ))}
          </div>

          {/* Pending join requests */}
          {isAdmin && group.pendingMembers.length > 0 && (
            <div className="mb-4">
              <h3 className="font-bold text-[0.75rem] uppercase mb-2">JOIN REQUESTS ({group.pendingMembers.length})</h3>
              {group.pendingMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-2 p-2 border border-dashed border-signal-black/40 mb-1">
                  <span className="flex-1 font-mono text-[0.7rem] truncate">{m.user.displayName || m.user.email}</span>
                  <button className="nb-btn nb-btn--primary nb-btn--small text-[0.6rem]" onClick={() => approve(m.id)}>APPROVE</button>
                  <button className="text-watermelon font-bold text-[0.7rem]" onClick={() => removeMember(m.id)}>X</button>
                </div>
              ))}
            </div>
          )}

          {/* Invite form */}
          {isAdmin && (
            <div className="flex gap-2">
              <input className="nb-input flex-1 text-[0.8rem]" type="email" placeholder="Invite by email..." value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") invite(); }} />
              <button className="nb-btn nb-btn--primary nb-btn--small" onClick={invite} disabled={busy}>INVITE</button>
            </div>
          )}
        </div>

        {/* Shared projects */}
        <div className="nb-card p-6">
          <h2 className="nb-card-title mb-4">SHARED PROJECTS ({group.projects.length})</h2>
          {group.projects.length === 0 ? (
            <p className="font-mono text-[0.8rem] text-[#999] uppercase">No projects linked to this group.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {group.projects.map((p) => (
                <Link key={p.id} href={`/projects/${p.id}`} className="block border-2 border-signal-black p-4 hover:bg-creamy-milk transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[0.9rem] uppercase">{p.name}</span>
                    <span className="font-mono text-[0.6rem] uppercase px-2 py-0.5 border border-signal-black">{p.status}</span>
                  </div>
                  <div className="font-mono text-[0.65rem] text-[#999] uppercase">{p.memberCount} member{p.memberCount !== 1 ? "s" : ""} · {p.visibility}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Link href="/groups" className="nb-btn mt-6 inline-block">BACK TO GROUPS</Link>
    </div>
  );
}
