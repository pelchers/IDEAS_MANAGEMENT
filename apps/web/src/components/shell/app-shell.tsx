"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AiHelper } from "@/components/ai/ai-helper";

/* ── Title from pathname ── */
function getTitleFromPathname(pathname: string): string {
  if (pathname === "/dashboard") return "DASHBOARD";
  if (pathname === "/projects") return "PROJECTS";
  if (pathname === "/ai") return "AI CHAT";
  if (pathname === "/profile") return "PROFILE";
  if (pathname === "/settings") return "SETTINGS";
  if (pathname.includes("/kanban")) return "KANBAN";
  if (pathname.includes("/whiteboard")) return "WHITEBOARD";
  if (pathname.includes("/schema")) return "SCHEMA PLANNER";
  if (pathname.includes("/directory-tree")) return "DIRECTORY TREE";
  if (pathname.includes("/ideas")) return "IDEAS";
  if (/^\/projects\/[^/]+$/.test(pathname)) return "WORKSPACE";
  return "DASHBOARD";
}

/* ── Nav links ── */
interface NavLink {
  num: string;
  label: string;
  href: string;
  projectRoute?: boolean;
  suffix?: string;
}

const NAV_LINKS: NavLink[] = [
  { num: "01", label: "Dashboard", href: "/dashboard" },
  { num: "02", label: "Projects", href: "/projects" },
  { num: "03", label: "Workspace", href: "/projects", projectRoute: true },
  { num: "04", label: "Kanban", href: "/projects", projectRoute: true, suffix: "/kanban" },
  { num: "05", label: "Whiteboard", href: "/projects", projectRoute: true, suffix: "/whiteboard" },
  { num: "06", label: "Schema", href: "/projects", projectRoute: true, suffix: "/schema" },
  { num: "07", label: "Directory", href: "/projects", projectRoute: true, suffix: "/directory-tree" },
  { num: "08", label: "Ideas", href: "/projects", projectRoute: true, suffix: "/ideas" },
  { num: "09", label: "AI Chat", href: "/ai" },
  { num: "10", label: "Settings", href: "/settings" },
];

function extractProjectId(pathname: string): string | null {
  const match = pathname.match(/^\/projects\/([^/]+)/);
  return match ? match[1] : null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectName, setSelectedProjectName] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ email: string; role: string; displayName?: string } | null>(null);
  const pathname = usePathname();
  const title = getTitleFromPathname(pathname);

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);

  // Auto-detect project from URL
  useEffect(() => {
    const urlProjectId = extractProjectId(pathname);
    if (urlProjectId && urlProjectId !== selectedProjectId) {
      setSelectedProjectId(urlProjectId);
      fetch(`/api/projects/${urlProjectId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.ok && data.project) {
            setSelectedProjectName(data.project.name);
          }
        })
        .catch(() => {});
    }
  }, [pathname, selectedProjectId]);

  // Load selected project from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("im_selected_project");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id) {
          setSelectedProjectId(parsed.id);
          setSelectedProjectName(parsed.name || null);
        }
      } catch { /* ignore */ }
    }
  }, []);

  // Persist selected project
  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem("im_selected_project", JSON.stringify({
        id: selectedProjectId,
        name: selectedProjectName,
      }));
    }
  }, [selectedProjectId, selectedProjectName]);

  // Fetch user info — redirect to signin if session expired
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.status === 401) {
          window.location.href = "/signin";
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.ok && data.user) {
          setUserInfo({ email: data.user.email, role: data.user.role, displayName: data.user.displayName ?? undefined });
        } else if (data && !data.ok) {
          window.location.href = "/signin";
        }
      })
      .catch(() => {
        window.location.href = "/signin";
      });
  }, []);

  const activeProjectId = extractProjectId(pathname) || selectedProjectId;

  function resolveHref(link: NavLink): string {
    if (link.projectRoute && activeProjectId) {
      return `/projects/${activeProjectId}${link.suffix || ""}`;
    }
    if (link.projectRoute) return "/projects";
    return link.href;
  }

  function isActive(link: NavLink): boolean {
    if (link.num === "02") return pathname === "/projects";
    if (link.projectRoute) {
      if (link.suffix) return pathname.includes(link.suffix);
      return /^\/projects\/[^/]+$/.test(pathname);
    }
    return pathname.startsWith(link.href);
  }

  const userInitials = userInfo
    ? (userInfo.displayName || userInfo.email).split(/[\s@]/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join("")
    : "??";
  const userDisplayName = userInfo?.displayName || userInfo?.email || "Loading...";
  const userRole = userInfo?.role || "...";

  // Expose selectProject for child pages
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__imSelectProject = (id: string, name: string) => {
      setSelectedProjectId(id);
      setSelectedProjectName(name);
    };
    return () => {
      delete (window as unknown as Record<string, unknown>).__imSelectProject;
    };
  }, []);

  const drawerWidth = 280;

  return (
    <>
      {/* ============================================ */}
      {/* TOP BAR — shifts with sidebar                */}
      {/* ============================================ */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: isOpen ? `${drawerWidth}px` : "0px",
          right: 0,
          height: "60px",
          backgroundColor: "#FFFFFF",
          borderBottom: "4px solid #282828",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: isOpen ? "24px" : "76px",
          paddingRight: "24px",
          zIndex: 900,
          transition: "left 300ms cubic-bezier(0.2, 0, 0, 1), padding-left 300ms cubic-bezier(0.2, 0, 0, 1)",
          boxSizing: "border-box",
        }}
      >
        {/* Left — hamburger (when closed) + title + project */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
          {!isOpen && (
            <button
              onClick={openDrawer}
              aria-label="Open navigation menu"
              style={{
                width: "44px",
                height: "44px",
                backgroundColor: "#FFFFFF",
                border: "3px solid #282828",
                boxShadow: "3px 3px 0px #282828",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                padding: "8px",
                flexShrink: 0,
              }}
            >
              <span style={{ display: "block", width: "20px", height: "3px", backgroundColor: "#282828" }} />
              <span style={{ display: "block", width: "20px", height: "3px", backgroundColor: "#282828" }} />
              <span style={{ display: "block", width: "20px", height: "3px", backgroundColor: "#282828" }} />
            </button>
          )}
          <span style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "0.05em", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const }}>
            {title}
          </span>
          {selectedProjectName && (
            <>
              <span style={{ color: "#666666" }}>/</span>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "0.8rem",
                textTransform: "uppercase" as const,
                color: "#FF5E54",
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap" as const,
                maxWidth: "200px",
              }}>
                {selectedProjectName}
              </span>
            </>
          )}
        </div>

        {/* Right — search + notification */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
          <input
            type="text"
            placeholder="SEARCH..."
            aria-label="Search"
            className="nb-input--mono"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.85rem",
              padding: "8px 16px",
              border: "3px solid #282828",
              backgroundColor: "#F8F3EC",
              color: "#282828",
              width: "200px",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
          <button
            aria-label="Notifications"
            style={{
              width: "44px",
              height: "44px",
              backgroundColor: "#FFFFFF",
              border: "3px solid #282828",
              boxShadow: "4px 4px 0px #282828",
              cursor: "pointer",
              fontSize: "1.2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative" as const,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                width: "10px",
                height: "10px",
                backgroundColor: "#FF5E54",
                border: "2px solid #FFFFFF",
              }}
            />
            &#9872;
          </button>
        </div>
      </header>

      {/* ============================================ */}
      {/* NAVIGATION DRAWER                            */}
      {/* ============================================ */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: `${drawerWidth}px`,
          height: "100vh",
          backgroundColor: "#FFFFFF",
          borderRight: "4px solid #282828",
          zIndex: 1050,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 300ms cubic-bezier(0.2, 0, 0, 1)",
        }}
        aria-label="Main navigation"
      >
        {/* Drawer header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px", borderBottom: "4px solid #282828", minHeight: "80px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "2rem", color: "#FF5E54" }}>&#9670;</span>
            <span style={{ fontWeight: 700, fontSize: "1.1rem", lineHeight: 1.1, letterSpacing: "0.05em" }}>
              IDEA<br />MGMT
            </span>
          </div>
          <button
            onClick={closeDrawer}
            aria-label="Close navigation"
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#FF5E54",
              color: "#FFFFFF",
              border: "3px solid #282828",
              boxShadow: "4px 4px 0px #282828",
              cursor: "pointer",
              fontSize: "1.2rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            &#10005;
          </button>
        </div>

        {/* Selected project indicator */}
        {selectedProjectName && (
          <div style={{ padding: "12px 24px", borderBottom: "2px dashed #282828", backgroundColor: "rgba(255,228,89,0.3)" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.65rem", textTransform: "uppercase" as const, color: "#666666" }}>Selected Project</div>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase" as const, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{selectedProjectName}</div>
          </div>
        )}

        {/* Nav links */}
        <ul style={{ listStyle: "none", flex: 1, padding: "8px 0", margin: 0 }}>
          {NAV_LINKS.map((link) => {
            const active = isActive(link);
            const needsProject = link.projectRoute && !activeProjectId;
            const href = resolveHref(link);

            return (
              <li key={link.num}>
                <Link
                  href={href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "16px 24px",
                    fontWeight: 700,
                    fontSize: "1rem",
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.03em",
                    textDecoration: "none",
                    backgroundColor: active ? "#282828" : "transparent",
                    color: active ? "#FFFFFF" : "#282828",
                    opacity: needsProject ? 0.4 : 1,
                    pointerEvents: needsProject ? "none" : "auto",
                    transition: "background 150ms ease",
                  }}
                  aria-disabled={needsProject}
                  tabIndex={needsProject ? -1 : undefined}
                >
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "0.75rem",
                      minWidth: "24px",
                      color: active ? "#FF5E54" : "#666666",
                    }}
                  >
                    {link.num}
                  </span>
                  {link.label}
                  {needsProject && (
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.6rem", color: "#666666", marginLeft: "auto" }}>
                      select project
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Drawer footer — user profile (clickable) */}
        <Link
          href="/profile"
          style={{ display: "block", padding: "24px", borderTop: "4px solid #282828", cursor: "pointer", textDecoration: "none", color: "inherit", transition: "background-color 150ms" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(40,40,40,0.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                backgroundColor: "#FF5E54",
                color: "#FFFFFF",
                border: "3px solid #282828",
                boxShadow: "4px 4px 0px #282828",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "1rem",
                flexShrink: 0,
              }}
            >
              {userInitials}
            </div>
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{userDisplayName}</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.75rem", color: "#666666", textTransform: "uppercase" as const }}>
                {userRole}
              </span>
            </div>
          </div>
        </Link>
      </nav>

      {/* ============================================ */}
      {/* MAIN CONTENT — shrinks when drawer open      */}
      {/* ============================================ */}
      <main
        style={{
          marginTop: "60px",
          marginLeft: isOpen ? `${drawerWidth}px` : "0px",
          width: isOpen ? `calc(100% - ${drawerWidth}px)` : "100%",
          minHeight: "calc(100vh - 60px)",
          padding: "clamp(16px, 2.5vw, 48px)",
          transition: "margin-left 300ms cubic-bezier(0.2, 0, 0, 1), width 300ms cubic-bezier(0.2, 0, 0, 1)",
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        {children}
      </main>

      {/* Floating AI Helper — available on all pages */}
      <AiHelper />
    </>
  );
}
