"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  labels: string[];
  projectId: string | null;
  projectName: string | null;
  createdAt: string;
}

const PRIORITY_COLOR: Record<string, string> = {
  URGENT: "#FF5E54",
  HIGH: "#F5A623",
  MEDIUM: "#1283EB",
  LOW: "#999999",
};

function startOfLocalDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function atNoon(d: Date): string {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x.toISOString();
}
function fmtDue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const today = startOfLocalDay();
  const diff = Math.round((startOfLocalDay(d).getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  if (diff === 1) return "Tomorrow";
  if (diff < 0) return `${-diff}d overdue`;
  if (diff < 7) return d.toLocaleDateString(undefined, { weekday: "short" });
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type Bucket = "overdue" | "today" | "upcoming" | "someday";

function bucketOf(t: Task): Bucket {
  if (!t.dueDate) return "someday";
  const due = startOfLocalDay(new Date(t.dueDate));
  const today = startOfLocalDay();
  if (due.getTime() < today.getTime()) return "overdue";
  if (due.getTime() === today.getTime()) return "today";
  return "upcoming";
}

const BUCKET_META: Array<{ key: Bucket; label: string; accent: string }> = [
  { key: "overdue", label: "Overdue", accent: "#FF5E54" },
  { key: "today", label: "Today", accent: "#2ECC71" },
  { key: "upcoming", label: "Upcoming", accent: "#1283EB" },
  { key: "someday", label: "Someday", accent: "#999999" },
];

export default function TodayPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [captureTitle, setCaptureTitle] = useState("");
  const [captureDue, setCaptureDue] = useState<"none" | "today" | "tomorrow">("today");
  const [saving, setSaving] = useState(false);
  const captureRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    fetch("/api/tasks?includeDone=0")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.ok && Array.isArray(d.tasks)) setTasks(d.tasks);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Cmd-K "Quick capture" deep-links to /today?capture=1
  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("capture") === "1") {
      requestAnimationFrame(() => captureRef.current?.focus());
    }
  }, []);

  const buckets = useMemo(() => {
    const map: Record<Bucket, Task[]> = { overdue: [], today: [], upcoming: [], someday: [] };
    for (const t of tasks) map[bucketOf(t)].push(t);
    // upcoming sorted by due asc; others keep API order (due asc already)
    map.upcoming.sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
    return map;
  }, [tasks]);

  async function capture(e: React.FormEvent) {
    e.preventDefault();
    const title = captureTitle.trim();
    if (!title) return;
    setSaving(true);
    const dueDate =
      captureDue === "today" ? atNoon(new Date()) : captureDue === "tomorrow" ? atNoon(addDays(new Date(), 1)) : null;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, dueDate, priority: "MEDIUM" }),
      });
      const data = await res.json();
      if (data.ok && data.task) {
        setTasks((prev) => [data.task, ...prev]);
        setCaptureTitle("");
      }
    } catch {
      /* ignore */
    }
    setSaving(false);
  }

  // Optimistic mutations.
  const complete = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DONE" }),
    }).catch(() => {});
  }, []);

  const reschedule = useCallback((id: string, when: "today" | "tomorrow" | null) => {
    const dueDate = when === "today" ? atNoon(new Date()) : when === "tomorrow" ? atNoon(addDays(new Date(), 1)) : null;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, dueDate } : t)));
    fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dueDate }),
    }).catch(() => {});
  }, []);

  const remove = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    fetch(`/api/tasks/${id}`, { method: "DELETE" }).catch(() => {});
  }, []);

  const total = tasks.length;

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="nb-view-title">TODAY / MY WORK</h1>
          <p className="text-[0.85rem] text-gray-mid mt-1">
            {total === 0 ? "Nothing on your plate" : `${total} open ${total === 1 ? "task" : "tasks"} across all projects`}
          </p>
        </div>
      </div>

      {/* Quick capture */}
      <form onSubmit={capture} className="nb-card p-4 mb-6 flex flex-wrap gap-3 items-center">
        <input
          ref={captureRef}
          data-testid="capture-input"
          value={captureTitle}
          onChange={(e) => setCaptureTitle(e.target.value)}
          placeholder="Capture a task and press Enter…"
          className="nb-input flex-1 min-w-[240px]"
          aria-label="Quick capture task"
        />
        <select
          value={captureDue}
          onChange={(e) => setCaptureDue(e.target.value as typeof captureDue)}
          className="nb-input text-[0.8rem] py-2"
          aria-label="Due date"
        >
          <option value="today">Due today</option>
          <option value="tomorrow">Due tomorrow</option>
          <option value="none">No date</option>
        </select>
        <button type="submit" data-testid="capture-submit" className="nb-btn nb-btn--primary" disabled={saving || !captureTitle.trim()}>
          {saving ? "ADDING…" : "ADD"}
        </button>
      </form>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="nb-card p-4" style={{ opacity: 0.4 }}>
              <div style={{ height: 14, width: "40%", background: "#e5e0d8" }} />
            </div>
          ))}
        </div>
      ) : total === 0 ? (
        <div className="nb-card p-12 text-center">
          <div className="text-[2rem] mb-3">✓</div>
          <div className="font-bold uppercase tracking-wider mb-1">Inbox zero</div>
          <div className="text-[0.85rem] text-gray-mid">Capture a task above, or create one from any project.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {BUCKET_META.map(({ key, label, accent }) => {
            const items = buckets[key];
            if (items.length === 0) return null;
            return (
              <section key={key} data-testid={`bucket-${key}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ width: 10, height: 10, background: accent, display: "inline-block", border: "2px solid #282828" }} />
                  <h2 className="font-bold text-[0.9rem] uppercase tracking-wider">{label}</h2>
                  <span className="font-mono text-[0.7rem] text-gray-mid">{items.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {items.map((t) => (
                    <TaskRow key={t.id} task={t} onComplete={complete} onReschedule={reschedule} onRemove={remove} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TaskRow({
  task,
  onComplete,
  onReschedule,
  onRemove,
}: {
  task: Task;
  onComplete: (id: string) => void;
  onReschedule: (id: string, when: "today" | "tomorrow" | null) => void;
  onRemove: (id: string) => void;
}) {
  const remove = onRemove;
  const overdue = bucketOf(task) === "overdue";
  return (
    <div data-testid="task-row" className="nb-card flex items-center gap-3 p-3">
      <button
        aria-label="Complete task"
        data-testid="task-complete"
        onClick={() => onComplete(task.id)}
        title="Mark done"
        style={{
          width: 22,
          height: 22,
          border: "3px solid #282828",
          background: "#FFFFFF",
          cursor: "pointer",
          flexShrink: 0,
          borderRadius: 2,
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[0.92rem] truncate">{task.title}</div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span
            className="font-mono text-[0.62rem] uppercase px-1"
            style={{ color: "#fff", background: PRIORITY_COLOR[task.priority] ?? "#999" }}
          >
            {task.priority}
          </span>
          {task.projectName && (
            <span className="font-mono text-[0.65rem] text-gray-mid truncate" style={{ maxWidth: 160 }}>
              ▸ {task.projectName}
            </span>
          )}
          {task.dueDate && (
            <span className="font-mono text-[0.65rem]" style={{ color: overdue ? "#FF5E54" : "#666" }}>
              {fmtDue(task.dueDate)}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button className="nb-btn" style={btnMini} onClick={() => onReschedule(task.id, "today")} title="Due today">
          T
        </button>
        <button className="nb-btn" style={btnMini} onClick={() => onReschedule(task.id, "tomorrow")} title="Due tomorrow">
          +1
        </button>
        <button className="nb-btn" style={btnMini} onClick={() => remove(task.id)} title="Delete" data-testid="task-delete">
          ✕
        </button>
      </div>
    </div>
  );
}

const btnMini: React.CSSProperties = {
  padding: "3px 8px",
  fontSize: "0.7rem",
  minWidth: 0,
};
