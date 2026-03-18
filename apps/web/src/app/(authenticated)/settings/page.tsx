"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

/* ── Toggle state for preferences ── */
interface Preferences {
  darkMode: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEffects: boolean;
}

/* ── AI Config state ── */
interface AiConfig {
  provider: "NONE" | "OPENROUTER_OAUTH" | "OPENROUTER_BYOK";
  maskedKey: string | null;
  loading: boolean;
}

/* ── Integration data ── */
interface Integration {
  name: string;
  icon: string;
  connected: boolean;
}

const INTEGRATIONS: Integration[] = [
  { name: "GITHUB", icon: "\uD83D\uDC19", connected: true },
  { name: "SLACK", icon: "\uD83D\uDCAC", connected: false },
  { name: "STRIPE", icon: "\uD83D\uDCB3", connected: true },
];

function SettingsContent() {
  const searchParams = useSearchParams();
  const [preferences, setPreferences] = useState<Preferences>({
    darkMode: false,
    emailNotifications: true,
    pushNotifications: true,
    soundEffects: false,
  });

  const [aiConfig, setAiConfig] = useState<AiConfig>({
    provider: "NONE",
    maskedKey: null,
    loading: true,
  });
  const [byokKey, setByokKey] = useState("");
  const [aiSaving, setAiSaving] = useState(false);
  const [aiMessage, setAiMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch AI config on mount
  const fetchAiConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/config");
      if (res.ok) {
        const data = await res.json();
        setAiConfig({
          provider: data.provider,
          maskedKey: data.maskedKey,
          loading: false,
        });
      } else {
        setAiConfig((prev) => ({ ...prev, loading: false }));
      }
    } catch {
      setAiConfig((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchAiConfig();
  }, [fetchAiConfig]);

  // Handle OAuth callback messages from URL params
  useEffect(() => {
    if (searchParams.get("ai_connected") === "true") {
      setAiMessage({ type: "success", text: "OpenRouter connected successfully!" });
      fetchAiConfig();
    }
    if (searchParams.get("ai_error")) {
      setAiMessage({ type: "error", text: `OpenRouter error: ${searchParams.get("ai_error")}` });
    }
  }, [searchParams, fetchAiConfig]);

  const handleByokSave = async () => {
    if (!byokKey.trim()) return;
    setAiSaving(true);
    setAiMessage(null);
    try {
      const res = await fetch("/api/ai/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: byokKey.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setAiMessage({ type: "success", text: "API key saved successfully!" });
        setByokKey("");
        fetchAiConfig();
      } else {
        setAiMessage({ type: "error", text: data.message || "Failed to save key." });
      }
    } catch {
      setAiMessage({ type: "error", text: "Network error." });
    }
    setAiSaving(false);
  };

  const handleDisconnect = async () => {
    setAiSaving(true);
    try {
      const res = await fetch("/api/ai/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect" }),
      });
      const data = await res.json();
      if (data.ok) {
        setAiMessage({ type: "success", text: "AI provider disconnected." });
        fetchAiConfig();
      }
    } catch {
      setAiMessage({ type: "error", text: "Failed to disconnect." });
    }
    setAiSaving(false);
  };

  const handleOpenRouterConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_OPENROUTER_CLIENT_ID;
    if (!clientId) {
      setAiMessage({ type: "error", text: "OpenRouter client ID not configured." });
      return;
    }
    const callbackUrl = `${window.location.origin}/api/ai/openrouter/callback`;
    const authUrl = `https://openrouter.ai/auth?callback_url=${encodeURIComponent(callbackUrl)}`;
    window.location.href = authUrl;
  };

  // Profile state
  const [profileEmail, setProfileEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load user profile on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.user) {
          setProfileEmail(data.user.email);
          if (data.user.preferences && typeof data.user.preferences === "object") {
            setPreferences((prev) => ({ ...prev, ...data.user.preferences }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileEmail.trim()) return;
    setProfileSaving(true);
    setProfileMessage(null);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profileEmail.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setProfileMessage({ type: "success", text: "Profile saved!" });
      } else {
        setProfileMessage({ type: "error", text: data.error === "email_in_use" ? "Email already in use." : "Failed to save." });
      }
    } catch {
      setProfileMessage({ type: "error", text: "Network error." });
    }
    setProfileSaving(false);
  };

  const togglePref = (key: keyof Preferences) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Persist to DB
      fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: next }),
      }).catch(() => {});
      return next;
    });
  };

  const prefItems: { key: keyof Preferences; label: string }[] = [
    { key: "darkMode", label: "DARK MODE" },
    { key: "emailNotifications", label: "EMAIL NOTIFICATIONS" },
    { key: "pushNotifications", label: "PUSH NOTIFICATIONS" },
    { key: "soundEffects", label: "SOUND EFFECTS" },
  ];

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      {/* View header */}
      <div className="mb-8">
        <h1 className="nb-view-title">SETTINGS</h1>
        <p className="nb-view-subtitle mt-1">Manage your account and preferences</p>
      </div>

      {/* Settings grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-6">
        {/* ── Profile Card ── */}
        <div className="nb-card p-8">
          <h2 className="nb-card-title">PROFILE</h2>
          <form className="flex flex-col gap-4" onSubmit={handleProfileSave}>
            {profileMessage && (
              <div className={`p-3 border-2 border-signal-black font-mono text-[0.85rem] ${
                profileMessage.type === "success" ? "bg-malachite/20 text-malachite" : "bg-watermelon/20 text-watermelon"
              }`}>
                {profileMessage.text}
              </div>
            )}
            <div>
              <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">
                EMAIL
              </label>
              <input
                type="email"
                className="nb-input w-full"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                placeholder="Your email"
              />
            </div>
            <div>
              <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">
                BIO
              </label>
              <textarea
                className="nb-input nb-textarea w-full"
                defaultValue="Product designer and idea enthusiast. Building the future of collaborative thinking."
                placeholder="Tell us about yourself"
              />
            </div>
            <button type="submit" className="nb-btn nb-btn--primary self-start mt-2" disabled={profileSaving}>
              {profileSaving ? "SAVING..." : "SAVE CHANGES"}
            </button>
          </form>
        </div>

        {/* ── Preferences Card ── */}
        <div className="nb-card p-8">
          <h2 className="nb-card-title">PREFERENCES</h2>
          <div className="flex flex-col">
            {prefItems.map((item, i) => (
              <div
                key={item.key}
                className={`flex items-center justify-between py-4 ${
                  i < prefItems.length - 1
                    ? "border-b-2 border-dashed border-signal-black"
                    : ""
                }`}
              >
                <span className="font-bold text-[0.85rem] uppercase tracking-wider">
                  {item.label}
                </span>
                <label className="nb-toggle">
                  <input
                    type="checkbox"
                    checked={preferences[item.key]}
                    onChange={() => togglePref(item.key)}
                  />
                  <span className="nb-toggle-track" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* ── Integrations Card ── */}
        <div className="nb-card p-8">
          <h2 className="nb-card-title">INTEGRATIONS</h2>
          <div className="flex flex-col gap-4">
            {INTEGRATIONS.map((integration) => (
              <div
                key={integration.name}
                className="flex items-center gap-4 p-4 border-2 border-dashed border-signal-black"
              >
                {/* Icon */}
                <div className="text-[1.5rem] w-11 h-11 flex items-center justify-center bg-creamy-milk border-2 border-signal-black shrink-0">
                  {integration.icon}
                </div>
                {/* Name + status */}
                <div className="flex-1">
                  <div className="font-bold text-[0.9rem] uppercase">
                    {integration.name}
                  </div>
                  <div
                    className={`font-mono text-[0.75rem] uppercase ${
                      integration.connected
                        ? "text-malachite"
                        : "text-gray-mid"
                    }`}
                  >
                    {integration.connected ? "Connected" : "Not connected"}
                  </div>
                </div>
                {/* Action button */}
                <button
                  className={`nb-btn nb-btn--small ${
                    integration.connected ? "" : "nb-btn--primary"
                  }`}
                >
                  {integration.connected ? "DISCONNECT" : "CONNECT"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── AI Configuration Card ── */}
        <div className="nb-card p-8">
          <h2 className="nb-card-title">AI CONFIGURATION</h2>

          {aiMessage && (
            <div
              className={`p-3 mb-4 border-2 border-signal-black font-mono text-[0.85rem] ${
                aiMessage.type === "success"
                  ? "bg-malachite/20 text-malachite"
                  : "bg-watermelon/20 text-watermelon"
              }`}
            >
              {aiMessage.text}
            </div>
          )}

          {aiConfig.loading ? (
            <p className="font-mono text-[0.85rem] text-gray-mid">Loading AI configuration...</p>
          ) : (
            <>
              {/* Current status */}
              <div className="flex items-center gap-3 mb-6 p-4 border-2 border-dashed border-signal-black">
                <div className="text-[1.5rem]">
                  {aiConfig.provider === "NONE" ? "⚡" : "✅"}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[0.9rem] uppercase">
                    {aiConfig.provider === "NONE"
                      ? "NO AI PROVIDER"
                      : aiConfig.provider === "OPENROUTER_OAUTH"
                      ? "OPENROUTER (OAUTH)"
                      : "OPENROUTER (API KEY)"}
                  </div>
                  <div
                    className={`font-mono text-[0.75rem] ${
                      aiConfig.provider !== "NONE" ? "text-malachite" : "text-gray-mid"
                    }`}
                  >
                    {aiConfig.provider !== "NONE" && aiConfig.maskedKey
                      ? `Key: ${aiConfig.maskedKey}`
                      : "Not connected — AI chat will use mock responses"}
                  </div>
                </div>
                {aiConfig.provider !== "NONE" && (
                  <button
                    className="nb-btn nb-btn--small"
                    onClick={handleDisconnect}
                    disabled={aiSaving}
                  >
                    DISCONNECT
                  </button>
                )}
              </div>

              {/* Connect via OpenRouter OAuth */}
              <div className="mb-6">
                <h3 className="font-bold text-[0.85rem] uppercase tracking-wider mb-2">
                  OPTION 1: CONNECT OPENROUTER ACCOUNT
                </h3>
                <p className="font-mono text-[0.75rem] text-gray-mid mb-3 leading-relaxed">
                  Connect your OpenRouter account for access to 200+ AI models.
                  AI usage is billed to your OpenRouter account.
                </p>
                <button
                  className="nb-btn nb-btn--primary"
                  onClick={handleOpenRouterConnect}
                  disabled={aiConfig.provider !== "NONE" || aiSaving}
                >
                  CONNECT OPENROUTER
                </button>
              </div>

              {/* BYOK: Paste API Key */}
              <div>
                <h3 className="font-bold text-[0.85rem] uppercase tracking-wider mb-2">
                  OPTION 2: PASTE API KEY
                </h3>
                <p className="font-mono text-[0.75rem] text-gray-mid mb-3 leading-relaxed">
                  Paste your OpenRouter API key directly. Get one at openrouter.ai/keys.
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    className="nb-input flex-1"
                    placeholder="sk-or-v1-..."
                    value={byokKey}
                    onChange={(e) => setByokKey(e.target.value)}
                    disabled={aiConfig.provider !== "NONE" || aiSaving}
                  />
                  <button
                    className="nb-btn nb-btn--primary"
                    onClick={handleByokSave}
                    disabled={!byokKey.trim() || aiConfig.provider !== "NONE" || aiSaving}
                  >
                    {aiSaving ? "SAVING..." : "SAVE KEY"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Danger Zone Card ── */}
        <div className="nb-card p-8 border-watermelon">
          <h2 className="nb-card-title text-watermelon border-b-watermelon">
            DANGER ZONE
          </h2>
          <p className="font-mono text-[0.85rem] text-watermelon mb-6 leading-relaxed">
            These actions are irreversible. Please proceed with caution.
          </p>
          <div className="flex gap-4 flex-wrap">
            <button className="nb-btn" onClick={async () => {
              try {
                const res = await fetch("/api/auth/me/export");
                const data = await res.json();
                if (data.ok) {
                  const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a"); a.href = url; a.download = "idea-management-export.json"; a.click();
                  URL.revokeObjectURL(url);
                }
              } catch { /* silent */ }
            }}>EXPORT ALL DATA</button>
            <button className="nb-btn nb-btn--danger" onClick={async () => {
              const email = prompt("Type your email to confirm account deletion:");
              if (!email || email.toLowerCase() !== profileEmail.toLowerCase()) { alert("Email does not match. Deletion cancelled."); return; }
              try {
                const res = await fetch("/api/auth/me", { method: "DELETE" });
                const data = await res.json();
                if (data.ok) { window.location.href = "/signin"; }
                else { alert("Failed to delete account."); }
              } catch { alert("Network error."); }
            }}>DELETE ACCOUNT</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="animate-pulse p-8 font-mono text-gray-mid">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
