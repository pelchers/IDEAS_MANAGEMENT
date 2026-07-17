"use client";

import { useCallback, useEffect, useState } from "react";

interface Snippet { id: string; name: string; command: string; description: string | null }
interface Runner { id: string; name: string; online: boolean }

export default function SnippetsPage() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [runners, setRunners] = useState<Runner[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [command, setCommand] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([
      fetch("/api/snippets").then((r) => r.json()),
      fetch("/api/runners").then((r) => r.json()),
    ]).then(([s, r]) => { if (s.ok) setSnippets(s.snippets); if (r.ok) setRunners(r.runners); }).catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !command.trim()) return;
    const res = await fetch("/api/snippets", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), command: command.trim(), description: description.trim() || undefined }),
    });
    if ((await res.json()).ok) { setName(""); setCommand(""); setDescription(""); load(); }
  }

  async function remove(id: string) {
    await fetch(`/api/snippets/${id}`, { method: "DELETE" }).catch(() => {});
    load();
  }

  async function runOn(snippet: Snippet, runnerId: string) {
    if (!runnerId) return;
    const res = await fetch(`/api/runners/${runnerId}/dispatch`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: snippet.command, source: "snippet" }),
    });
    setMsg((await res.json()).ok ? `Dispatched "${snippet.name}".` : "Dispatch failed.");
    setTimeout(() => setMsg(null), 3000);
  }

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      <h1 className="nb-view-title mb-1">COMMAND SNIPPETS</h1>
      <p className="text-[0.85rem] text-gray-mid mb-6">Saved commands you can dispatch to any runner in one click.</p>

      {msg && <div className="nb-card p-3 mb-4 font-mono text-[0.8rem] border-malachite">{msg}</div>}

      <form onSubmit={create} className="nb-card p-4 mb-6 flex flex-col gap-3">
        <div className="flex gap-3 flex-wrap">
          <input className="nb-input flex-1 min-w-[160px]" data-testid="snippet-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (e.g. Run tests)" />
          <input className="nb-input flex-[2] min-w-[220px] font-mono" data-testid="snippet-command" value={command} onChange={(e) => setCommand(e.target.value)} placeholder="pnpm test" />
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <input className="nb-input flex-1 min-w-[220px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" />
          <button type="submit" data-testid="snippet-create" className="nb-btn nb-btn--primary" disabled={!name.trim() || !command.trim()}>SAVE SNIPPET</button>
        </div>
      </form>

      {loading ? <div className="text-gray-mid font-mono text-[0.8rem]">Loading…</div> : snippets.length === 0 ? (
        <div className="nb-card p-8 text-center text-[0.85rem] text-gray-mid">No snippets yet.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {snippets.map((s) => (
            <div key={s.id} className="nb-card p-4" data-testid="snippet-item">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-[0.9rem]">{s.name}</div>
                  <div className="font-mono text-[0.8rem] text-gray-mid break-all">{s.command}</div>
                  {s.description && <div className="text-[0.75rem] text-gray-mid mt-1">{s.description}</div>}
                </div>
                <div className="flex gap-2 items-center flex-shrink-0">
                  {runners.length > 0 && (
                    <select className="nb-input text-[0.75rem] py-1" defaultValue="" onChange={(e) => { runOn(s, e.target.value); e.target.value = ""; }} aria-label="Run on runner">
                      <option value="">Run on…</option>
                      {runners.map((r) => <option key={r.id} value={r.id}>{r.name}{r.online ? "" : " (offline)"}</option>)}
                    </select>
                  )}
                  <button className="nb-btn nb-btn--small" data-testid="snippet-delete" onClick={() => remove(s.id)}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
