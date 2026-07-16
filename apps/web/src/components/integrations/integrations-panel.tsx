"use client";

import { useCallback, useEffect, useState } from "react";

interface IntegrationStatus {
  id: string;
  label: string;
  description: string;
  kind: "oauth" | "apiKey" | "local";
  capabilities: string[];
  setupHint?: string;
  configured: boolean;
  connected: boolean;
  status: string;
  accountLabel: string | null;
}

const ICONS: Record<string, string> = {
  EMAIL: "✉",
  GMAIL: "✦",
  GOOGLE_CALENDAR: "◔",
  VSCODE: "▤",
};

export function IntegrationsPanel() {
  const [items, setItems] = useState<IntegrationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(() => {
    fetch("/api/integrations")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.ok && Array.isArray(d.integrations)) setItems(d.integrations);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Surface OAuth callback results (?integration_connected / ?integration_error).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("integration_connected");
    const error = params.get("integration_error");
    if (connected) setBanner({ kind: "ok", text: `Connected ${connected.replace(/_/g, " ").toLowerCase()}.` });
    else if (error) setBanner({ kind: "err", text: `Connection failed: ${error.replace(/_/g, " ")}.` });
    if (connected || error) window.history.replaceState({}, "", window.location.pathname);
  }, []);

  const connect = useCallback(
    async (item: IntegrationStatus) => {
      setBusy(item.id);
      try {
        const res = await fetch(`/api/integrations/${item.id}/connect`, { method: "POST" });
        const data = await res.json();
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl; // OAuth consent
          return;
        }
        if (data.ok) load();
        else setBanner({ kind: "err", text: data.message ?? "Could not connect." });
      } catch {
        setBanner({ kind: "err", text: "Network error." });
      }
      setBusy(null);
    },
    [load]
  );

  const disconnect = useCallback(
    async (item: IntegrationStatus) => {
      setBusy(item.id);
      try {
        await fetch(`/api/integrations/${item.id}/disconnect`, { method: "POST" });
        load();
      } catch {
        /* ignore */
      }
      setBusy(null);
    },
    [load]
  );

  const sendDigest = useCallback(async () => {
    setBusy("EMAIL");
    try {
      const res = await fetch(`/api/integrations/EMAIL/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "digest" }),
      });
      const data = await res.json();
      setBanner(
        data.ok
          ? { kind: "ok", text: "Digest sent to your inbox." }
          : { kind: "err", text: data.error === "not_configured" ? "Server email isn't configured yet." : "Could not send digest." }
      );
    } catch {
      setBanner({ kind: "err", text: "Network error." });
    }
    setBusy(null);
  }, []);

  return (
    <div className="nb-card p-8" data-testid="integrations-panel">
      <h2 className="nb-card-title">INTEGRATIONS</h2>
      <p className="text-[0.8rem] text-gray-mid mb-4">
        Connect external services. Everything is wired — providers without server credentials show a setup hint.
      </p>

      {banner && (
        <div
          className="mb-4 p-3 border-2 font-mono text-[0.8rem]"
          style={{
            borderColor: banner.kind === "ok" ? "#2ECC71" : "#FF5E54",
            background: banner.kind === "ok" ? "rgba(46,204,113,0.1)" : "rgba(255,94,84,0.1)",
          }}
        >
          {banner.text}
        </div>
      )}

      {loading ? (
        <div className="text-[0.85rem] text-gray-mid font-mono">Loading…</div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              data-testid={`integration-${item.id}`}
              className="flex items-start gap-4 p-4 border-2 border-signal-black"
            >
              <div className="text-[1.4rem] w-11 h-11 flex items-center justify-center bg-creamy-milk border-2 border-signal-black shrink-0">
                {ICONS[item.id] ?? "◇"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[0.9rem] uppercase">{item.label}</div>
                <div className="text-[0.78rem] text-gray-mid">{item.description}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.capabilities.map((c) => (
                    <span key={c} className="font-mono text-[0.6rem] uppercase px-1 border border-gray-mid text-gray-mid">
                      {c}
                    </span>
                  ))}
                </div>
                <div
                  className="font-mono text-[0.72rem] uppercase mt-2"
                  data-testid={`integration-status-${item.id}`}
                  style={{ color: item.connected ? "#2ECC71" : !item.configured ? "#F5A623" : "#999" }}
                >
                  {item.connected
                    ? `Connected${item.accountLabel ? ` — ${item.accountLabel}` : ""}`
                    : !item.configured
                      ? "Not configured"
                      : "Not connected"}
                </div>
                {!item.configured && item.setupHint && (
                  <div className="text-[0.7rem] text-gray-mid mt-1">{item.setupHint}</div>
                )}
              </div>
              <div className="flex flex-col gap-2 items-end shrink-0">
                {item.connected ? (
                  <button
                    className="nb-btn nb-btn--small"
                    data-testid={`integration-disconnect-${item.id}`}
                    disabled={busy === item.id}
                    onClick={() => disconnect(item)}
                  >
                    DISCONNECT
                  </button>
                ) : (
                  <button
                    className="nb-btn nb-btn--small nb-btn--primary"
                    data-testid={`integration-connect-${item.id}`}
                    disabled={busy === item.id || !item.configured}
                    title={!item.configured ? item.setupHint : undefined}
                    onClick={() => connect(item)}
                  >
                    {busy === item.id ? "…" : "CONNECT"}
                  </button>
                )}
                {item.id === "EMAIL" && item.configured && (
                  <button className="nb-btn nb-btn--small" disabled={busy === "EMAIL"} onClick={sendDigest}>
                    SEND DIGEST
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
