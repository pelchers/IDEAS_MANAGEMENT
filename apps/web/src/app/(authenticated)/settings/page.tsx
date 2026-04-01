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

/* ── Billing state ── */
interface BillingState {
  plan: "FREE" | "PRO" | "TEAM";
  features: string[];
  loading: boolean;
  billingConfigured: boolean;
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

const DEFAULT_INTEGRATIONS: Integration[] = [
  { name: "GITHUB", icon: "\uD83D\uDC19", connected: false },
  { name: "SLACK", icon: "\uD83D\uDCAC", connected: false },
  { name: "STRIPE", icon: "\uD83D\uDCB3", connected: false },
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
  const [integrations, setIntegrations] = useState<Integration[]>(DEFAULT_INTEGRATIONS);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAiEntitlement, setHasAiEntitlement] = useState(false);
  const [aiMessage, setAiMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Billing state
  const [billing, setBilling] = useState<BillingState>({
    plan: "FREE",
    features: [],
    loading: true,
    billingConfigured: true, // assume configured until proven otherwise
  });
  const [billingMessage, setBillingMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [billingRedirecting, setBillingRedirecting] = useState<string | null>(null);

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
    if (searchParams.get("billing_success") === "true") {
      setBillingMessage({ type: "success", text: "Subscription activated! Your plan may take a moment to update." });
      // Re-fetch entitlements to reflect new plan
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.ok && data.entitlements) {
            setBilling({
              plan: data.entitlements.plan || "FREE",
              features: data.entitlements.features || [],
              loading: false,
              billingConfigured: true,
            });
          }
        })
        .catch(() => {});
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

  // Billing handlers
  const handleCheckout = async (plan: "PRO" | "TEAM") => {
    setBillingRedirecting(plan);
    setBillingMessage(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          successUrl: window.location.href.split("?")[0] + "?billing_success=true",
          cancelUrl: window.location.href.split("?")[0],
        }),
      });
      const data = await res.json();
      if (data.ok && data.url) {
        window.location.href = data.url;
        return; // redirecting, keep spinner
      }
      if (data.error === "billing_not_configured") {
        setBilling((prev) => ({ ...prev, billingConfigured: false }));
        setBillingMessage({ type: "error", text: "Billing is not configured. Stripe keys are missing." });
      } else {
        setBillingMessage({ type: "error", text: data.message || "Failed to start checkout." });
      }
    } catch {
      setBillingMessage({ type: "error", text: "Network error. Please try again." });
    }
    setBillingRedirecting(null);
  };

  const handleManageSubscription = async () => {
    setBillingRedirecting("MANAGE");
    setBillingMessage(null);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnUrl: window.location.href.split("?")[0],
        }),
      });
      const data = await res.json();
      if (data.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.error === "billing_not_configured") {
        setBilling((prev) => ({ ...prev, billingConfigured: false }));
        setBillingMessage({ type: "error", text: "Billing is not configured. Stripe keys are missing." });
      } else if (data.error === "no_subscription") {
        setBillingMessage({ type: "error", text: "No active subscription found." });
      } else {
        setBillingMessage({ type: "error", text: data.message || "Failed to open billing portal." });
      }
    } catch {
      setBillingMessage({ type: "error", text: "Network error. Please try again." });
    }
    setBillingRedirecting(null);
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
          if (data.user.role === "ADMIN") setIsAdmin(true);
          if (data.entitlements?.features?.includes("ai_chat")) setHasAiEntitlement(true);
          // Populate billing state from entitlements
          if (data.entitlements) {
            setBilling({
              plan: data.entitlements.plan || "FREE",
              features: data.entitlements.features || [],
              loading: false,
              billingConfigured: true,
            });
          } else {
            setBilling((prev) => ({ ...prev, loading: false }));
          }
          if (data.user.preferences && typeof data.user.preferences === "object") {
            const prefs = data.user.preferences as Record<string, unknown>;
            setPreferences((prev) => ({ ...prev, ...prefs }));
            // Load integration status
            if (prefs.integrations && typeof prefs.integrations === "object") {
              const intPrefs = prefs.integrations as Record<string, boolean>;
              setIntegrations((prev) => prev.map((i) => ({ ...i, connected: !!intPrefs[i.name.toLowerCase()] })));
            }
          }
        } else {
          setBilling((prev) => ({ ...prev, loading: false }));
        }
      })
      .catch(() => {
        setBilling((prev) => ({ ...prev, loading: false }));
      });
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
            {integrations.map((integration) => (
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
                  onClick={async () => {
                    const name = integration.name.toLowerCase();
                    const newConnected = !integration.connected;
                    if (name === "github" && !integration.connected) {
                      // For GitHub, prompt for personal access token
                      const token = prompt("Enter your GitHub Personal Access Token (PAT):");
                      if (!token) return;
                    }
                    if (name === "slack" && !integration.connected) {
                      const webhook = prompt("Enter your Slack webhook URL:");
                      if (!webhook) return;
                    }
                    if (name === "stripe" && !integration.connected) {
                      // Stripe connect via billing portal
                      try {
                        const res = await fetch("/api/billing/portal", { method: "POST" });
                        const data = await res.json();
                        if (data.url) { window.open(data.url, "_blank"); }
                      } catch { /* silent */ }
                    }
                    // Update local state
                    setIntegrations((prev) => prev.map((i) => i.name === integration.name ? { ...i, connected: newConnected } : i));
                    // Persist to preferences
                    const intState: Record<string, boolean> = {};
                    integrations.forEach((i) => { intState[i.name.toLowerCase()] = i.name === integration.name ? newConnected : i.connected; });
                    fetch("/api/auth/me", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ preferences: { ...preferences, integrations: intState } }),
                    }).catch(() => {});
                  }}
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
                      : aiConfig.provider === "OPENROUTER_BYOK"
                      ? "OPENROUTER (API KEY)"
                      : aiConfig.provider === "OPENAI_BYOK"
                      ? "OPENAI (API KEY)"
                      : aiConfig.provider === "ANTHROPIC_BYOK"
                      ? "ANTHROPIC / CLAUDE (API KEY)"
                      : aiConfig.provider === "GOOGLE_BYOK"
                      ? "GOOGLE / GEMINI (API KEY)"
                      : aiConfig.provider === "OLLAMA_LOCAL"
                      ? "OLLAMA (LOCAL)"
                      : aiConfig.provider === "GROQ_BUILTIN"
                      ? "GROQ (BUILT-IN)"
                      : aiConfig.provider}
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

              {/* Admin: AI access status */}
              {isAdmin && (
                <div className="mb-6 p-3 border-2 border-malachite bg-malachite/10 font-mono text-[0.8rem] text-malachite">
                  ● AI access active (admin). You have full access to built-in AI and all providers.
                </div>
              )}

              {/* Use Built-In AI (Ollama) */}
              <div className="mb-6 p-4 border-2 border-dashed border-malachite">
                <h3 className="font-bold text-[0.85rem] uppercase tracking-wider mb-2 text-malachite">
                  BUILT-IN AI (NO API KEY NEEDED)
                </h3>
                <p className="font-mono text-[0.75rem] text-gray-mid mb-3 leading-relaxed">
                  Use a local AI model via Ollama. Free, private, runs on your machine.
                  Requires <a href="https://ollama.com" target="_blank" rel="noopener" className="underline font-bold">Ollama</a> installed with a model like <code className="bg-creamy-milk px-1">ministral:3b</code>.
                </p>
                <div className="flex gap-2">
                  <button
                    className="nb-btn nb-btn--primary"
                    onClick={async () => {
                      setAiSaving(true); setAiMessage(null);
                      try {
                        // Check if Ollama is running
                        const check = await fetch("http://localhost:11434/api/tags").catch(() => null);
                        if (!check?.ok) {
                          setAiMessage({ type: "error", text: "Ollama not detected on localhost:11434. Install Ollama and run: ollama pull ministral:3b" });
                          setAiSaving(false); return;
                        }
                        const res = await fetch("/api/ai/config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "connect_ollama" }) });
                        const data = await res.json();
                        if (data.ok) { setAiMessage({ type: "success", text: "Connected to local Ollama!" }); fetchAiConfig(); }
                        else { setAiMessage({ type: "error", text: "Failed to connect." }); }
                      } catch { setAiMessage({ type: "error", text: "Network error." }); }
                      setAiSaving(false);
                    }}
                    disabled={aiConfig.provider !== "NONE" || aiSaving}
                  >
                    CONNECT OLLAMA
                  </button>
                </div>
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
                  Paste an API key from any supported provider. Key prefix auto-detects the provider.
                </p>
                <div className="font-mono text-[0.65rem] text-gray-mid mb-3 leading-relaxed flex flex-col gap-1">
                  <span><strong>OpenRouter:</strong> sk-or-v1-... (openrouter.ai/keys — 200+ models)</span>
                  <span><strong>OpenAI:</strong> sk-... (platform.openai.com — GPT-4o, o1)</span>
                  <span><strong>Anthropic:</strong> sk-ant-... (console.anthropic.com — Claude)</span>
                  <span><strong>Google:</strong> AIza... (aistudio.google.com — Gemini)</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    className="nb-input flex-1"
                    placeholder="sk-or-..., sk-..., sk-ant-..., or AIza..."
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

        {/* ── Billing Card ── */}
        <div className="nb-card p-8 col-span-full">
          <h2 className="nb-card-title">BILLING &amp; SUBSCRIPTION</h2>

          {billingMessage && (
            <div
              className={`p-3 mb-4 border-2 border-signal-black font-mono text-[0.85rem] ${
                billingMessage.type === "success"
                  ? "bg-malachite/20 text-malachite"
                  : "bg-watermelon/20 text-watermelon"
              }`}
            >
              {billingMessage.text}
            </div>
          )}

          {billing.loading ? (
            <p className="font-mono text-[0.85rem] text-gray-mid">Loading billing information...</p>
          ) : !billing.billingConfigured ? (
            <div className="p-4 border-2 border-dashed border-signal-black">
              <div className="flex items-center gap-3">
                <div className="text-[1.5rem]">⚙️</div>
                <div>
                  <div className="font-bold text-[0.9rem] uppercase">BILLING NOT CONFIGURED</div>
                  <div className="font-mono text-[0.75rem] text-gray-mid leading-relaxed mt-1">
                    Stripe is not set up for this instance. Contact the administrator to enable billing.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Current plan badge */}
              <div className="flex items-center gap-3 mb-6 p-4 border-2 border-dashed border-signal-black">
                <div className="text-[1.5rem]">
                  {billing.plan === "FREE" ? "📦" : billing.plan === "PRO" ? "⚡" : "👥"}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[0.9rem] uppercase">
                    CURRENT PLAN: <span className={billing.plan !== "FREE" ? "text-malachite" : ""}>{billing.plan}</span>
                  </div>
                  <div className="font-mono text-[0.75rem] text-gray-mid">
                    {billing.plan === "FREE"
                      ? "Basic features included. Upgrade to unlock more."
                      : billing.plan === "PRO"
                      ? "Pro features active: AI Chat, Whiteboard, Schema Planner"
                      : "Team features active: Everything in Pro + Collaboration"}
                  </div>
                </div>
                {billing.plan !== "FREE" && (
                  <button
                    className="nb-btn nb-btn--small"
                    onClick={handleManageSubscription}
                    disabled={billingRedirecting !== null}
                  >
                    {billingRedirecting === "MANAGE" ? "REDIRECTING..." : "MANAGE SUBSCRIPTION"}
                  </button>
                )}
              </div>

              {/* Plan comparison cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* FREE plan */}
                <div className={`p-5 border-2 ${billing.plan === "FREE" ? "border-signal-black bg-creamy-milk" : "border-dashed border-signal-black"}`}>
                  <div className="font-bold text-[1rem] uppercase tracking-wider mb-1">FREE</div>
                  <div className="font-mono text-[0.75rem] text-gray-mid mb-4">$0 / month</div>
                  <ul className="flex flex-col gap-2 font-mono text-[0.8rem]">
                    <li>✓ Dashboard</li>
                    <li>✓ Projects (limited)</li>
                    <li>✓ Kanban boards</li>
                    <li>✓ Ideas capture</li>
                    <li className="text-gray-mid line-through">✗ AI Chat</li>
                    <li className="text-gray-mid line-through">✗ Whiteboard</li>
                    <li className="text-gray-mid line-through">✗ Schema Planner</li>
                    <li className="text-gray-mid line-through">✗ Team collaboration</li>
                  </ul>
                  {billing.plan === "FREE" && (
                    <div className="mt-4 p-2 border-2 border-signal-black text-center font-bold text-[0.8rem] uppercase">
                      CURRENT PLAN
                    </div>
                  )}
                </div>

                {/* PRO plan */}
                <div className={`p-5 border-2 ${billing.plan === "PRO" ? "border-malachite bg-malachite/5" : "border-dashed border-signal-black"}`}>
                  <div className="font-bold text-[1rem] uppercase tracking-wider mb-1">PRO</div>
                  <div className="font-mono text-[0.75rem] text-gray-mid mb-4">Pricing on checkout</div>
                  <ul className="flex flex-col gap-2 font-mono text-[0.8rem]">
                    <li>✓ Everything in Free</li>
                    <li className="font-bold">✓ AI Chat</li>
                    <li className="font-bold">✓ Whiteboard</li>
                    <li className="font-bold">✓ Schema Planner</li>
                    <li>✓ Unlimited projects</li>
                    <li className="text-gray-mid line-through">✗ Team collaboration</li>
                  </ul>
                  {billing.plan === "PRO" ? (
                    <div className="mt-4 p-2 border-2 border-malachite text-center font-bold text-[0.8rem] uppercase text-malachite">
                      CURRENT PLAN
                    </div>
                  ) : billing.plan === "FREE" ? (
                    <button
                      className="nb-btn nb-btn--primary w-full mt-4"
                      onClick={() => handleCheckout("PRO")}
                      disabled={billingRedirecting !== null}
                    >
                      {billingRedirecting === "PRO" ? "REDIRECTING..." : "UPGRADE TO PRO"}
                    </button>
                  ) : null}
                </div>

                {/* TEAM plan */}
                <div className={`p-5 border-2 ${billing.plan === "TEAM" ? "border-malachite bg-malachite/5" : "border-dashed border-signal-black"}`}>
                  <div className="font-bold text-[1rem] uppercase tracking-wider mb-1">TEAM</div>
                  <div className="font-mono text-[0.75rem] text-gray-mid mb-4">Pricing on checkout</div>
                  <ul className="flex flex-col gap-2 font-mono text-[0.8rem]">
                    <li>✓ Everything in Pro</li>
                    <li className="font-bold">✓ Team collaboration</li>
                    <li className="font-bold">✓ Shared workspaces</li>
                    <li>✓ Priority support</li>
                  </ul>
                  {billing.plan === "TEAM" ? (
                    <div className="mt-4 p-2 border-2 border-malachite text-center font-bold text-[0.8rem] uppercase text-malachite">
                      CURRENT PLAN
                    </div>
                  ) : (
                    <button
                      className="nb-btn nb-btn--primary w-full mt-4"
                      onClick={() => handleCheckout("TEAM")}
                      disabled={billingRedirecting !== null}
                    >
                      {billingRedirecting === "TEAM" ? "REDIRECTING..." : "UPGRADE TO TEAM"}
                    </button>
                  )}
                </div>
              </div>

              {/* Active features list */}
              {billing.features.length > 0 && (
                <div className="p-4 border-2 border-dashed border-malachite">
                  <h3 className="font-bold text-[0.85rem] uppercase tracking-wider mb-2 text-malachite">
                    ACTIVE FEATURES
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {billing.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-3 py-1 border-2 border-signal-black font-mono text-[0.75rem] uppercase bg-creamy-milk"
                      >
                        {feature.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
