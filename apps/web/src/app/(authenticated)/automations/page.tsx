"use client";

import { useCallback, useEffect, useState } from "react";

interface Rule { id: string; name: string; trigger: string; conditionJson: { status?: string; projectId?: string }; runnerId: string | null; command: string; enabled: boolean }
interface Runner { id: string; name: string }

const STATUSES = ["BACKLOG", "TODO", "IN_PROGRESS", "DONE"];

export default function AutomationsPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [runners, setRunners] = useState<Runner[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("TASK_STATUS_CHANGED");
  const [status, setStatus] = useState("IN_PROGRESS");
  const [runnerId, setRunnerId] = useState("");
  const [command, setCommand] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([
      fetch("/api/automations").then((r) => r.json()),
      fetch("/api/runners").then((r) => r.json()),
    ]).then(([a, r]) => {
      if (a.ok) setRules(a.rules);
      if (r.ok) { setRunners(r.runners); if (r.runners[0] && !runnerId) setRunnerId(r.runners[0].id); }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [runnerId]);
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!name.trim() || !command.trim() || !runnerId) { setErr("Name, runner, and command are required."); return; }
    const res = await fetch("/api/automations", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(), trigger, runnerId, command: command.trim(),
        condition: trigger === "TASK_STATUS_CHANGED" ? { status } : {},
      }),
    });
    const d = await res.json();
    if (d.ok) { setName(""); setCommand(""); load(); }
    else setErr(d.error === "runner_not_found" ? "That runner no longer exists." : "Could not create rule.");
  }

  async function toggle(rule: Rule) {
    await fetch(`/api/automations/${rule.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: !rule.enabled }) });
    load();
  }
  async function remove(id: string) {
    await fetch(`/api/automations/${id}`, { method: "DELETE" }).catch(() => {});
    load();
  }

  const runnerName = (id: string | null) => runners.find((r) => r.id === id)?.name ?? "(deleted runner)";

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      <h1 className="nb-view-title mb-1">AUTOMATIONS</h1>
      <p className="text-[0.85rem] text-gray-mid mb-6">When a task event fires and the condition matches, dispatch a command to a runner.</p>

      <form onSubmit={create} className="nb-card p-4 mb-6 flex flex-col gap-3">
        <div className="flex gap-3 flex-wrap">
          <input className="nb-input flex-1 min-w-[160px]" data-testid="rule-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rule name (e.g. Test on In Progress)" />
          <select className="nb-input py-2 text-[0.8rem]" value={trigger} onChange={(e) => setTrigger(e.target.value)} aria-label="Trigger">
            <option value="TASK_STATUS_CHANGED">When task status changes to…</option>
            <option value="TASK_CREATED">When a task is created</option>
          </select>
          {trigger === "TASK_STATUS_CHANGED" && (
            <select className="nb-input py-2 text-[0.8rem]" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <select className="nb-input py-2 text-[0.8rem]" value={runnerId} onChange={(e) => setRunnerId(e.target.value)} aria-label="Runner" data-testid="rule-runner">
            <option value="">Runner…</option>
            {runners.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <input className="nb-input flex-1 min-w-[200px] font-mono" data-testid="rule-command" value={command} onChange={(e) => setCommand(e.target.value)} placeholder="pnpm test" />
          <button type="submit" data-testid="rule-create" className="nb-btn nb-btn--primary">ADD RULE</button>
        </div>
        {err && <div className="font-mono text-[0.78rem] text-watermelon">{err}</div>}
      </form>

      {loading ? <div className="text-gray-mid font-mono text-[0.8rem]">Loading…</div> : rules.length === 0 ? (
        <div className="nb-card p-8 text-center text-[0.85rem] text-gray-mid">No automation rules yet.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {rules.map((rule) => (
            <div key={rule.id} className="nb-card p-4 flex items-center gap-3" data-testid="rule-item">
              <button onClick={() => toggle(rule)} title="Toggle" data-testid="rule-toggle" style={{ width: 40, height: 22, borderRadius: 999, border: "2px solid #282828", background: rule.enabled ? "#2ECC71" : "#ccc", position: "relative", flexShrink: 0, cursor: "pointer" }}>
                <span style={{ position: "absolute", top: 1, left: rule.enabled ? 20 : 2, width: 16, height: 16, borderRadius: 999, background: "#fff", border: "1px solid #282828", transition: "left 120ms" }} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[0.88rem]">{rule.name}</div>
                <div className="font-mono text-[0.68rem] text-gray-mid">
                  {rule.trigger === "TASK_STATUS_CHANGED" ? `status → ${rule.conditionJson?.status ?? "any"}` : "task created"} → <span className="text-signal-black">{rule.command}</span> on {runnerName(rule.runnerId)}
                </div>
              </div>
              <button className="nb-btn nb-btn--small" data-testid="rule-delete" onClick={() => remove(rule.id)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
