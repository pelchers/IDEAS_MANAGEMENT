"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Runner { id: string; name: string; status: string; workingDir: string | null; online: boolean }
interface Command { id: string; runnerId: string; runnerName?: string; command: string; status: string; exitCode: number | null; output: string; createdAt: string }
interface Snippet { id: string; name: string; command: string }

export default function OrchestratorPage() {
  const [runners, setRunners] = useState<Runner[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [commands, setCommands] = useState<Command[]>([]);
  const [loading, setLoading] = useState(true);

  // Create runner
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDir, setNewDir] = useState("");
  const [created, setCreated] = useState<{ id: string; token: string } | null>(null);

  // Console
  const [activeRunner, setActiveRunner] = useState<string>("");
  const [cmdText, setCmdText] = useState("");
  const [liveOutput, setLiveOutput] = useState("");
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  const loadRunners = useCallback(() => {
    fetch("/api/runners").then((r) => r.json()).then((d) => { if (d.ok) setRunners(d.runners); }).catch(() => {});
  }, []);
  const loadCommands = useCallback(() => {
    fetch("/api/runners/commands").then((r) => r.json()).then((d) => { if (d.ok) setCommands(d.commands); }).catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/runners").then((r) => r.json()),
      fetch("/api/snippets").then((r) => r.json()),
      fetch("/api/runners/commands").then((r) => r.json()),
    ]).then(([r, s, c]) => {
      if (r.ok) { setRunners(r.runners); if (r.runners[0]) setActiveRunner(r.runners[0].id); }
      if (s.ok) setSnippets(s.snippets);
      if (c.ok) setCommands(c.commands);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Poll runner status every 10s (online/offline).
  useEffect(() => {
    const t = setInterval(loadRunners, 10_000);
    return () => clearInterval(t);
  }, [loadRunners]);

  useEffect(() => () => { esRef.current?.close(); }, []);

  async function createRunner(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const res = await fetch("/api/runners", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), workingDir: newDir.trim() || undefined }),
    });
    const d = await res.json();
    if (d.ok) { setCreated({ id: d.runner.id, token: d.token }); setNewName(""); setNewDir(""); setShowCreate(false); loadRunners(); }
  }

  async function deleteRunner(id: string) {
    await fetch(`/api/runners/${id}`, { method: "DELETE" }).catch(() => {});
    loadRunners();
    if (activeRunner === id) setActiveRunner("");
  }

  async function dispatch() {
    if (!activeRunner || !cmdText.trim()) return;
    const res = await fetch(`/api/runners/${activeRunner}/dispatch`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: cmdText.trim() }),
    });
    const d = await res.json();
    if (!d.ok) return;
    setCmdText("");
    setLiveOutput("");
    setLiveStatus("QUEUED");
    loadCommands();
    streamCommand(d.command.id);
  }

  function streamCommand(id: string) {
    esRef.current?.close();
    const es = new EventSource(`/api/runners/commands/${id}/stream`);
    esRef.current = es;
    es.addEventListener("output", (e) => setLiveOutput((prev) => prev + JSON.parse((e as MessageEvent).data).chunk));
    es.addEventListener("done", (e) => {
      const d = JSON.parse((e as MessageEvent).data);
      setLiveStatus(d.status);
      es.close();
      loadCommands();
    });
    es.onerror = () => { es.close(); };
  }

  const bridgeCmd = created
    ? `node runner-agent.mjs --url ${typeof window !== "undefined" ? window.location.origin : ""} --token ${created.token}`
    : "";

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="nb-view-title">ORCHESTRATOR</h1>
          <p className="text-[0.85rem] text-gray-mid mt-1">Dispatch terminal commands to your runners and watch output live.</p>
        </div>
        <button className="nb-btn nb-btn--primary" onClick={() => { setShowCreate(!showCreate); setCreated(null); }}>+ NEW RUNNER</button>
      </div>

      {showCreate && (
        <form onSubmit={createRunner} className="nb-card p-4 mb-6 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="font-bold text-[0.75rem] uppercase tracking-wider mb-1 block">Runner name</label>
            <input className="nb-input w-full" data-testid="runner-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="my-laptop" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="font-bold text-[0.75rem] uppercase tracking-wider mb-1 block">Working dir (optional)</label>
            <input className="nb-input w-full" value={newDir} onChange={(e) => setNewDir(e.target.value)} placeholder="C:\dev\project" />
          </div>
          <button type="submit" data-testid="runner-create" className="nb-btn nb-btn--primary">CREATE</button>
        </form>
      )}

      {created && (
        <div className="nb-card p-4 mb-6 border-malachite" data-testid="runner-token-panel">
          <div className="font-bold text-[0.85rem] uppercase mb-2">Runner created — copy this token now (shown once)</div>
          <div className="font-mono text-[0.75rem] bg-creamy-milk border-2 border-signal-black p-2 break-all mb-2">{created.token}</div>
          <div className="text-[0.8rem] text-gray-mid mb-1">Start the bridge (from <code>apps/web/scripts/</code>):</div>
          <div className="font-mono text-[0.72rem] bg-signal-black text-creamy-milk p-2 break-all">{bridgeCmd}</div>
          <div className="text-[0.7rem] text-gray-mid mt-2">Or use the VS Code extension in <code>packages/vscode-runner</code>.</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Runners list */}
        <div>
          <h2 className="font-bold text-[0.9rem] uppercase tracking-wider mb-2">Runners</h2>
          {loading ? <div className="text-gray-mid font-mono text-[0.8rem]">Loading…</div> : runners.length === 0 ? (
            <div className="nb-card p-4 text-[0.8rem] text-gray-mid">No runners yet. Create one to get started.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {runners.map((r) => (
                <button
                  key={r.id}
                  data-testid={`runner-${r.id}`}
                  onClick={() => setActiveRunner(r.id)}
                  className={`nb-card p-3 flex items-center gap-2 text-left ${activeRunner === r.id ? "ring-4 ring-watermelon" : ""}`}
                >
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: r.online ? "#2ECC71" : "#999", border: "2px solid #282828", flexShrink: 0 }} />
                  <span className="flex-1 min-w-0">
                    <span className="font-bold text-[0.85rem] block truncate">{r.name}</span>
                    <span className="font-mono text-[0.65rem] text-gray-mid">{r.online ? "online" : "offline"}{r.workingDir ? ` · ${r.workingDir}` : ""}</span>
                  </span>
                  <span onClick={(e) => { e.stopPropagation(); deleteRunner(r.id); }} className="nb-btn nb-btn--small" title="Delete">✕</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Console + history */}
        <div className="min-w-0">
          <h2 className="font-bold text-[0.9rem] uppercase tracking-wider mb-2">Console</h2>
          <div className="nb-card p-4 mb-4">
            <div className="flex gap-2 mb-2 flex-wrap">
              <select className="nb-input text-[0.8rem] py-2" value={activeRunner} onChange={(e) => setActiveRunner(e.target.value)} aria-label="Runner">
                <option value="">Select runner…</option>
                {runners.map((r) => <option key={r.id} value={r.id}>{r.name}{r.online ? "" : " (offline)"}</option>)}
              </select>
              {snippets.length > 0 && (
                <select className="nb-input text-[0.8rem] py-2" value="" onChange={(e) => { const s = snippets.find((x) => x.id === e.target.value); if (s) setCmdText(s.command); }} aria-label="Insert snippet">
                  <option value="">Insert snippet…</option>
                  {snippets.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}
            </div>
            <textarea
              data-testid="command-textarea"
              className="nb-input w-full font-mono text-[0.85rem]"
              rows={2}
              value={cmdText}
              onChange={(e) => setCmdText(e.target.value)}
              placeholder="pnpm test    (dispatched immediately — auto-run)"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="font-mono text-[0.7rem] text-gray-mid">{liveStatus ? `Last: ${liveStatus}` : ""}</span>
              <button data-testid="dispatch-btn" className="nb-btn nb-btn--primary" disabled={!activeRunner || !cmdText.trim()} onClick={dispatch}>DISPATCH ▶</button>
            </div>
            {(liveOutput || liveStatus) && (
              <pre data-testid="live-output" className="mt-3 bg-signal-black text-creamy-milk font-mono text-[0.72rem] p-3 overflow-x-auto whitespace-pre-wrap" style={{ maxHeight: 240, overflowY: "auto" }}>{liveOutput || "(waiting for output…)"}</pre>
            )}
          </div>

          <h2 className="font-bold text-[0.9rem] uppercase tracking-wider mb-2">History</h2>
          <div className="flex flex-col gap-2">
            {commands.length === 0 && <div className="text-gray-mid font-mono text-[0.8rem]">No commands yet.</div>}
            {commands.slice(0, 20).map((c) => (
              <div key={c.id} className="nb-card p-3" data-testid="command-history-item">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[0.8rem] truncate">{c.command}</span>
                  <span className="font-mono text-[0.65rem] px-2 py-0.5 border-2 border-signal-black" style={{ color: "#fff", background: c.status === "DONE" ? "#2ECC71" : c.status === "FAILED" ? "#FF5E54" : c.status === "RUNNING" ? "#1283EB" : "#999" }}>{c.status}</span>
                </div>
                <div className="font-mono text-[0.62rem] text-gray-mid mt-0.5">{c.runnerName}{c.exitCode !== null ? ` · exit ${c.exitCode}` : ""}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
