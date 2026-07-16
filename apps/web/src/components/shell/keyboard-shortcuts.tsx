"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { openCommandPalette } from "@/components/command/command-registry";

/** `g`-prefixed navigation targets. */
const GO: Record<string, string> = {
  d: "/dashboard",
  t: "/today",
  p: "/projects",
  a: "/ai",
  e: "/explore",
  f: "/friends",
  r: "/groups",
  s: "/settings",
};

const HELP: Array<{ keys: string; label: string }> = [
  { keys: "⌘K  /  Ctrl K", label: "Command palette" },
  { keys: "/", label: "Search (command palette)" },
  { keys: "c", label: "Quick-capture a task" },
  { keys: "g then d", label: "Go to Dashboard" },
  { keys: "g then t", label: "Go to Today" },
  { keys: "g then p", label: "Go to Projects" },
  { keys: "g then a", label: "Go to AI Chat" },
  { keys: "g then e", label: "Go to Explore" },
  { keys: "g then f", label: "Go to Friends" },
  { keys: "g then r", label: "Go to Groups" },
  { keys: "g then s", label: "Go to Settings" },
  { keys: "?", label: "Show this help" },
];

function isTypingTarget(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null;
  if (!node) return false;
  const tag = node.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || node.isContentEditable;
}

export function KeyboardShortcuts() {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);
  const gPending = useRef<number | null>(null);

  const clearG = useCallback(() => {
    if (gPending.current) {
      window.clearTimeout(gPending.current);
      gPending.current = null;
    }
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      // `g` prefix is pending → resolve a navigation.
      if (gPending.current) {
        const dest = GO[e.key.toLowerCase()];
        clearG();
        if (dest) {
          e.preventDefault();
          router.push(dest);
        }
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        setHelpOpen((o) => !o);
      } else if (e.key === "Escape") {
        setHelpOpen(false);
      } else if (e.key === "/") {
        e.preventDefault();
        openCommandPalette();
      } else if (e.key.toLowerCase() === "c") {
        e.preventDefault();
        router.push("/today?capture=1");
      } else if (e.key.toLowerCase() === "g") {
        e.preventDefault();
        gPending.current = window.setTimeout(clearG, 1500);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearG();
    };
  }, [router, clearG]);

  if (!helpOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Keyboard shortcuts"
      onMouseDown={() => setHelpOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(40,40,40,0.45)",
        zIndex: 3200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "min(460px, 94vw)",
          backgroundColor: "#FFFFFF",
          border: "4px solid #282828",
          boxShadow: "8px 8px 0px #282828",
          padding: "24px",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontWeight: 800, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setHelpOpen(false)}
            aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {HELP.map((h) => (
            <div key={h.keys} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px dashed #ddd" }}>
              <span style={{ fontSize: "0.85rem" }}>{h.label}</span>
              <kbd style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", border: "2px solid #282828", padding: "2px 7px", backgroundColor: "#F8F3EC" }}>
                {h.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
