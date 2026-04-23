"use client";

import { useState, useEffect, useCallback } from "react";

interface Member {
  id: string;
  userId: string;
  role: string;
  user: { id: string; displayName: string | null; email: string; avatarUrl: string | null };
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
}

export function MemberPanel({ projectId, isOwner }: { projectId: string; isOwner: boolean }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("EDITOR");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();
      if (data.ok && data.project?.members) {
        setMembers(data.project.members);
      }
    } catch { /* ignore */ }
  }, [projectId]);

  const fetchInvites = useCallback(async () => {
    if (!isOwner) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/invite`);
      const data = await res.json();
      if (data.ok) setInvites(data.invites || []);
    } catch { /* ignore */ }
  }, [projectId, isOwner]);

  useEffect(() => {
    fetchMembers();
    fetchInvites();
  }, [fetchMembers, fetchInvites]);

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;
    setSending(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage({ type: "ok", text: `Invite sent to ${inviteEmail}` });
        setInviteEmail("");
        fetchInvites();
      } else {
        setMessage({ type: "err", text: data.error === "already_member" ? "Already a member" : data.error === "invite_already_sent" ? "Invite already pending" : data.error || "Failed" });
      }
    } catch {
      setMessage({ type: "err", text: "Network error" });
    }
    setSending(false);
  };

  const changeRole = async (memberId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.ok) fetchMembers();
      else setMessage({ type: "err", text: data.error || "Failed" });
    } catch { /* ignore */ }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm("Remove this member?")) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/members/${memberId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) fetchMembers();
      else setMessage({ type: "err", text: data.error || "Failed" });
    } catch { /* ignore */ }
  };

  const initials = (m: Member) =>
    (m.user.displayName || m.user.email).split(/[\s@]/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join("");

  return (
    <div className="nb-card p-6">
      <h3 className="nb-card-title mb-4">MEMBERS ({members.length})</h3>

      {message && (
        <div className={`mb-3 p-2 border-2 border-signal-black font-mono text-[0.75rem] ${message.type === "ok" ? "bg-malachite/20 text-malachite" : "bg-watermelon/20 text-watermelon"}`}>
          {message.text}
        </div>
      )}

      {/* Member list */}
      <div className="flex flex-col gap-2 mb-4">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3 p-2 border border-signal-black/20">
            <div style={{ width: "28px", height: "28px", backgroundColor: "#FF5E54", color: "#FFF", border: "1px solid #282828", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.55rem", overflow: "hidden", flexShrink: 0 }}>
              {m.user.avatarUrl ? <img src={m.user.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials(m)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[0.8rem] uppercase truncate">{m.user.displayName || m.user.email}</div>
              <div className="font-mono text-[0.6rem] text-[#999]">{m.user.email}</div>
            </div>
            {isOwner ? (
              <select
                className="nb-input text-[0.7rem] py-1 px-2"
                value={m.role}
                onChange={(e) => changeRole(m.id, e.target.value)}
                style={{ width: "90px" }}
              >
                <option value="OWNER">OWNER</option>
                <option value="EDITOR">EDITOR</option>
                <option value="VIEWER">VIEWER</option>
              </select>
            ) : (
              <span className="font-mono text-[0.65rem] uppercase px-2 py-0.5 border border-signal-black">{m.role}</span>
            )}
            {isOwner && m.role !== "OWNER" && (
              <button onClick={() => removeMember(m.id)} className="text-watermelon font-bold text-[0.7rem] hover:opacity-70" title="Remove">X</button>
            )}
          </div>
        ))}
      </div>

      {/* Pending invites */}
      {isOwner && invites.length > 0 && (
        <div className="mb-4">
          <h4 className="font-bold text-[0.75rem] uppercase mb-2">PENDING INVITES</h4>
          {invites.map((inv) => (
            <div key={inv.id} className="flex items-center gap-2 p-2 border border-dashed border-signal-black/30 mb-1 font-mono text-[0.7rem]">
              <span className="flex-1 truncate">{inv.email}</span>
              <span className="uppercase text-[0.6rem]">{inv.role}</span>
            </div>
          ))}
        </div>
      )}

      {/* Invite form */}
      {isOwner && (
        <div className="flex gap-2">
          <input
            type="email"
            className="nb-input flex-1 text-[0.8rem]"
            placeholder="Invite by email..."
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendInvite(); }}
          />
          <select className="nb-input text-[0.7rem]" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} style={{ width: "90px" }}>
            <option value="EDITOR">EDITOR</option>
            <option value="VIEWER">VIEWER</option>
          </select>
          <button className="nb-btn nb-btn--primary nb-btn--small" onClick={sendInvite} disabled={sending}>
            {sending ? "..." : "INVITE"}
          </button>
        </div>
      )}
    </div>
  );
}

/** Compact avatar row for workspace header */
export function MemberAvatarRow({ projectId }: { projectId: string }) {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.project?.members) setMembers(data.project.members);
      })
      .catch(() => {});
  }, [projectId]);

  if (members.length === 0) return null;

  return (
    <div className="flex items-center gap-1" title={members.map((m) => m.user.displayName || m.user.email).join(", ")}>
      {members.slice(0, 5).map((m) => (
        <div
          key={m.id}
          style={{ width: "24px", height: "24px", backgroundColor: "#FF5E54", color: "#FFF", border: "1px solid #282828", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.45rem", overflow: "hidden", marginLeft: members.indexOf(m) > 0 ? "-6px" : 0 }}
          title={m.user.displayName || m.user.email}
        >
          {m.user.avatarUrl
            ? <img src={m.user.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : (m.user.displayName || m.user.email).split(/[\s@]/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join("")}
        </div>
      ))}
      {members.length > 5 && (
        <span className="font-mono text-[0.6rem] text-[#999] ml-1">+{members.length - 5}</span>
      )}
    </div>
  );
}
