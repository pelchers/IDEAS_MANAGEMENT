"use client";

import { useEffect, useState } from "react";

interface Item { id: string; kind: string; title: string; subtitle: string | null; at: string }

const ICON: Record<string, string> = { audit: "◈", project: "▸", command: "⌘" };
const ACCENT: Record<string, string> = { audit: "#1283EB", project: "#2ECC71", command: "#9B59B6" };

function ago(iso: string): string {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ActivityPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activity").then((r) => r.json()).then((d) => { if (d.ok) setItems(d.items); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      <h1 className="nb-view-title mb-1">ACTIVITY</h1>
      <p className="text-[0.85rem] text-gray-mid mb-6">A unified timeline across your projects, actions, and runner commands.</p>

      {loading ? (
        <div className="flex flex-col gap-2">{[0, 1, 2, 3].map((i) => <div key={i} className="nb-card p-3" style={{ opacity: 0.4 }}><div style={{ height: 12, width: "50%", background: "#e5e0d8" }} /></div>)}</div>
      ) : items.length === 0 ? (
        <div className="nb-card p-8 text-center text-[0.85rem] text-gray-mid">No activity yet.</div>
      ) : (
        <div className="flex flex-col gap-2" data-testid="activity-feed">
          {items.map((it) => (
            <div key={it.id} className="nb-card p-3 flex items-center gap-3" data-testid="activity-item">
              <span style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #282828", color: "#fff", background: ACCENT[it.kind] ?? "#999", flexShrink: 0 }}>{ICON[it.kind] ?? "•"}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[0.85rem] truncate capitalize">{it.title}</div>
                {it.subtitle && <div className="font-mono text-[0.65rem] text-gray-mid truncate">{it.subtitle}</div>}
              </div>
              <span className="font-mono text-[0.65rem] text-gray-mid flex-shrink-0">{ago(it.at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
