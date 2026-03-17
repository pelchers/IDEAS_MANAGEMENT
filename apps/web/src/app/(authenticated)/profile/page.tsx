"use client";

import { useState, useEffect, useCallback } from "react";

interface UserProfile {
  email: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  tags: string[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    email: "",
    displayName: "",
    bio: "",
    avatarUrl: "",
    tags: [],
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UserProfile>(profile);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [tagInput, setTagInput] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.ok && data.user) {
        const p: UserProfile = {
          email: data.user.email ?? "",
          displayName: data.user.displayName ?? "",
          bio: data.user.bio ?? "",
          avatarUrl: data.user.avatarUrl ?? "",
          tags: data.user.tags ?? [],
        };
        setProfile(p);
        setDraft(p);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load profile." });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: draft.displayName,
          bio: draft.bio,
          avatarUrl: draft.avatarUrl || null,
          tags: draft.tags,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setProfile(draft);
        setEditing(false);
        setMessage({ type: "success", text: "Profile updated!" });
      } else {
        setMessage({ type: "error", text: data.error ?? "Failed to save." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error." });
    }
    setSaving(false);
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && draft.tags.length < 10 && !draft.tags.includes(tag)) {
      setDraft((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setDraft((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const initials = (profile.displayName || profile.email || "?")
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("");

  if (loading) {
    return (
      <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
        <div className="mb-8">
          <h1 className="nb-view-title">PROFILE</h1>
        </div>
        <div className="nb-card p-8 text-center font-mono text-[0.85rem] uppercase">Loading...</div>
      </div>
    );
  }

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      {/* View header */}
      <div className="mb-8">
        <h1 className="nb-view-title">PROFILE</h1>
        <p className="nb-view-subtitle mt-1">Your public-facing profile information</p>
      </div>

      {message && (
        <div className={`mb-6 p-3 border-2 border-signal-black font-mono text-[0.85rem] ${
          message.type === "success" ? "bg-malachite/20 text-malachite" : "bg-watermelon/20 text-watermelon"
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-6">
        {/* ── Profile Card ── */}
        <div className="nb-card p-8">
          {!editing ? (
            /* ── View Mode ── */
            <div className="flex flex-col gap-6">
              {/* Avatar + name */}
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
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-[1.1rem] uppercase tracking-wider truncate">
                    {profile.displayName || profile.email}
                  </h2>
                  <p className="font-mono text-[0.75rem] text-[#666] uppercase truncate">{profile.email}</p>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div>
                  <h3 className="font-bold text-[0.8rem] uppercase tracking-wider mb-1">BIO</h3>
                  <p className="font-mono text-[0.85rem] leading-relaxed" style={{ wordBreak: "break-word" }}>
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Tags */}
              {profile.tags.length > 0 && (
                <div>
                  <h3 className="font-bold text-[0.8rem] uppercase tracking-wider mb-2">TAGS</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[0.75rem] uppercase px-3 py-1 border-2 border-signal-black bg-white"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="nb-btn nb-btn--primary self-start mt-2"
                onClick={() => { setDraft(profile); setEditing(true); setMessage(null); }}
              >
                EDIT PROFILE
              </button>
            </div>
          ) : (
            /* ── Edit Mode ── */
            <form className="flex flex-col gap-4" onSubmit={handleSave}>
              <h2 className="nb-card-title">EDIT PROFILE</h2>

              <div>
                <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">
                  DISPLAY NAME
                </label>
                <input
                  type="text"
                  className="nb-input w-full"
                  value={draft.displayName}
                  onChange={(e) => setDraft((p) => ({ ...p, displayName: e.target.value }))}
                  placeholder="Your display name"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">
                  BIO
                </label>
                <textarea
                  className="nb-input nb-textarea w-full"
                  value={draft.bio}
                  onChange={(e) => setDraft((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell us about yourself"
                  maxLength={500}
                  rows={4}
                />
                <span className="font-mono text-[0.7rem] text-[#999]">{draft.bio.length}/500</span>
              </div>

              <div>
                <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">
                  AVATAR URL
                </label>
                <input
                  type="url"
                  className="nb-input w-full"
                  value={draft.avatarUrl}
                  onChange={(e) => setDraft((p) => ({ ...p, avatarUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">
                  TAGS ({draft.tags.length}/10)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="nb-input flex-1"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="Add a tag"
                    maxLength={50}
                  />
                  <button type="button" className="nb-btn" onClick={addTag} disabled={draft.tags.length >= 10}>
                    ADD
                  </button>
                </div>
                {draft.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {draft.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[0.75rem] uppercase px-3 py-1 border-2 border-signal-black bg-white inline-flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-watermelon font-bold hover:opacity-70"
                          style={{ lineHeight: 1 }}
                        >
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-2">
                <button type="submit" className="nb-btn nb-btn--primary" disabled={saving}>
                  {saving ? "SAVING..." : "SAVE CHANGES"}
                </button>
                <button
                  type="button"
                  className="nb-btn"
                  onClick={() => { setEditing(false); setMessage(null); }}
                  disabled={saving}
                >
                  CANCEL
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Account Info Card ── */}
        <div className="nb-card p-8">
          <h2 className="nb-card-title">ACCOUNT</h2>
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-[0.8rem] uppercase tracking-wider mb-1">EMAIL</h3>
              <p className="font-mono text-[0.85rem]">{profile.email}</p>
            </div>
            <p className="font-mono text-[0.75rem] text-[#999] uppercase">
              Email changes can be made in Settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
