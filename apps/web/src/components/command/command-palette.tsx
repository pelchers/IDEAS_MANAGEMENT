"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type Command,
  type CommandContext,
  getRegisteredCommands,
  subscribeCommands,
  OPEN_EVENT,
} from "./command-registry";

interface ProjectLite {
  id: string;
  name: string;
}

/** Subsequence fuzzy scorer: matched query chars in order, with streak + word-start bonuses. */
function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (!q) return 1;
  let qi = 0;
  let score = 0;
  let streak = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      qi++;
      streak++;
      score += streak;
      if (ti === 0 || t[ti - 1] === " " || t[ti - 1] === "/") score += 3;
    } else {
      streak = 0;
    }
  }
  return qi === q.length ? score : -1;
}

function scoreCommand(cmd: Command, query: string): number {
  if (!query) return 1;
  return Math.max(
    fuzzyScore(query, cmd.title),
    fuzzyScore(query, cmd.subtitle ?? "") - 1,
    fuzzyScore(query, cmd.keywords ?? "") - 1,
    fuzzyScore(query, cmd.group) - 2
  );
}

const NAV: Array<Omit<Command, "perform"> & { href: string }> = [
  { id: "nav.dashboard", title: "Dashboard", group: "Navigation", icon: "◧", href: "/dashboard", keywords: "home overview stats" },
  { id: "nav.today", title: "Today / My Work", group: "Navigation", icon: "◔", href: "/today", keywords: "tasks due focus agenda" },
  { id: "nav.projects", title: "Projects", group: "Navigation", icon: "▦", href: "/projects", keywords: "workspaces" },
  { id: "nav.ai", title: "AI Chat", group: "Navigation", icon: "✦", href: "/ai", keywords: "assistant chat" },
  { id: "nav.explore", title: "Explore", group: "Navigation", icon: "◎", href: "/explore", keywords: "discover public" },
  { id: "nav.friends", title: "Friends", group: "Navigation", icon: "◑", href: "/friends", keywords: "social people" },
  { id: "nav.groups", title: "Groups", group: "Navigation", icon: "◍", href: "/groups", keywords: "teams" },
  { id: "nav.settings", title: "Settings", group: "Navigation", icon: "⚙", href: "/settings", keywords: "preferences integrations account" },
  { id: "nav.profile", title: "Profile", group: "Navigation", icon: "◕", href: "/profile", keywords: "account me" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [loadedProjects, setLoadedProjects] = useState(false);
  const [registryVersion, setRegistryVersion] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const openPalette = useCallback((initial?: string) => {
    setQuery(initial ?? "");
    setActive(0);
    setOpen(true);
  }, []);

  // Re-read registry when providers change.
  useEffect(() => subscribeCommands(() => setRegistryVersion((v) => v + 1)), []);

  // Global open shortcut (Cmd/Ctrl+K) + custom open event.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    function onOpenEvent(e: Event) {
      const detail = (e as CustomEvent).detail as { initialQuery?: string } | undefined;
      openPalette(detail?.initialQuery);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpenEvent);
    };
  }, [openPalette]);

  // Lazy-load the user's projects the first time the palette opens.
  useEffect(() => {
    if (!open || loadedProjects) return;
    setLoadedProjects(true);
    fetch("/api/projects")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.ok && Array.isArray(d.projects)) {
          setProjects(d.projects.map((p: ProjectLite) => ({ id: p.id, name: p.name })));
        }
      })
      .catch(() => {});
  }, [open, loadedProjects]);

  // Focus the input when opened.
  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  const ctx: CommandContext = useMemo(() => ({ router, close }), [router, close]);

  const commands = useMemo(() => {
    void registryVersion; // re-compute when registry changes
    const navCmds: Command[] = NAV.map((n) => ({
      id: n.id,
      title: n.title,
      group: n.group,
      icon: n.icon,
      keywords: n.keywords,
      perform: ({ router: r, close: c }) => {
        c();
        r.push(n.href);
      },
    }));

    const actionCmds: Command[] = [
      {
        id: "action.new-project",
        title: "New project",
        group: "Actions",
        icon: "+",
        keywords: "create add project",
        perform: ({ router: r, close: c }) => {
          c();
          r.push("/projects?new=1");
        },
      },
      {
        id: "action.capture",
        title: "Quick capture task",
        group: "Actions",
        icon: "✎",
        keywords: "new task todo capture inbox",
        perform: ({ router: r, close: c }) => {
          c();
          r.push("/today?capture=1");
        },
      },
      {
        id: "action.signout",
        title: "Sign out",
        group: "Actions",
        icon: "⎋",
        keywords: "logout leave exit",
        perform: async ({ close: c }) => {
          c();
          try {
            await fetch("/api/auth/signout", { method: "POST" });
          } catch {
            /* ignore */
          }
          try {
            localStorage.removeItem("im_selected_project");
          } catch {
            /* ignore */
          }
          window.location.href = "/signin";
        },
      },
    ];

    const projectCmds: Command[] = projects.map((p) => ({
      id: `project.${p.id}`,
      title: p.name,
      subtitle: "Open workspace",
      group: "Projects",
      icon: "▸",
      keywords: "project open workspace",
      perform: ({ router: r, close: c }) => {
        c();
        r.push(`/projects/${p.id}`);
      },
    }));

    return [...navCmds, ...actionCmds, ...projectCmds, ...getRegisteredCommands()];
  }, [projects, registryVersion]);

  const results = useMemo(() => {
    const scored = commands
      .map((c) => ({ c, s: scoreCommand(c, query.trim()) }))
      .filter((x) => x.s >= 0);
    if (query.trim()) scored.sort((a, b) => b.s - a.s);
    return scored.map((x) => x.c);
  }, [commands, query]);

  // Keep active index in range as results change.
  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, results.length - 1)));
  }, [results.length]);

  const grouped = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, Command[]>();
    for (const c of results) {
      if (!map.has(c.group)) {
        map.set(c.group, []);
        order.push(c.group);
      }
      map.get(c.group)!.push(c);
    }
    // Flat index across groups for keyboard nav.
    const flat: Command[] = order.flatMap((g) => map.get(g)!);
    return { order, map, flat };
  }, [results]);

  const runAt = useCallback(
    (index: number) => {
      const cmd = grouped.flat[index];
      if (cmd) void cmd.perform(ctx);
    },
    [grouped.flat, ctx]
  );

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, grouped.flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runAt(active);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  // Scroll active item into view.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-cmd-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  if (!open) return null;

  let flatIndex = -1;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onMouseDown={close}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(40,40,40,0.45)",
        zIndex: 3000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "min(640px, 92vw)",
          maxHeight: "70vh",
          backgroundColor: "#FFFFFF",
          border: "4px solid #282828",
          boxShadow: "8px 8px 0px #282828",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 18px", borderBottom: "3px solid #282828" }}>
          <span aria-hidden style={{ fontSize: "1.1rem", color: "#FF5E54" }}>⌘</span>
          <input
            ref={inputRef}
            data-testid="command-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Type a command or search…"
            aria-label="Command palette search"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "1rem",
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              color: "#282828",
              backgroundColor: "transparent",
            }}
          />
          <kbd style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.65rem", color: "#666", border: "2px solid #ccc", padding: "1px 5px" }}>ESC</kbd>
        </div>

        <div ref={listRef} style={{ overflowY: "auto", padding: "6px 0" }}>
          {grouped.flat.length === 0 && (
            <div style={{ padding: "24px 18px", textAlign: "center", color: "#666", fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.85rem" }}>
              No matching commands
            </div>
          )}
          {grouped.order.map((group) => (
            <div key={group}>
              <div style={{ padding: "8px 18px 4px", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999", fontFamily: "'IBM Plex Mono', monospace" }}>
                {group}
              </div>
              {grouped.map.get(group)!.map((cmd) => {
                flatIndex++;
                const idx = flatIndex;
                const isActive = idx === active;
                return (
                  <button
                    key={cmd.id}
                    data-cmd-index={idx}
                    data-testid={`command-item-${cmd.id}`}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => runAt(idx)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 18px",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      backgroundColor: isActive ? "#282828" : "transparent",
                      color: isActive ? "#FFFFFF" : "#282828",
                    }}
                  >
                    <span aria-hidden style={{ width: "20px", textAlign: "center", color: isActive ? "#FF5E54" : "#999", fontSize: "0.95rem" }}>
                      {cmd.icon ?? "›"}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 600, fontSize: "0.92rem", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {cmd.title}
                      </span>
                      {cmd.subtitle && (
                        <span style={{ fontSize: "0.72rem", color: isActive ? "#ccc" : "#888", fontFamily: "'IBM Plex Mono', monospace" }}>
                          {cmd.subtitle}
                        </span>
                      )}
                    </span>
                    {isActive && (
                      <kbd style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.6rem", color: "#FF5E54", border: "1px solid #555", padding: "1px 5px" }}>↵</kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
