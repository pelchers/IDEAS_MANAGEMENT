"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Navigation links matching pass-1 numbered nav (01-10).
 * Project-specific routes (03-08) use a placeholder project ID.
 */
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

/**
 * Extract the current project ID from a pathname like /projects/abc123 or /projects/abc123/kanban.
 */
function extractProjectId(pathname: string): string | null {
  const match = pathname.match(/^\/projects\/([^/]+)/);
  return match ? match[1] : null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);

  // Resolve the current project ID so project-scoped links (03-08) navigate correctly
  const currentProjectId = extractProjectId(pathname);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        closeDrawer();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeDrawer]);

  /**
   * Resolve the href for a nav link.
   * Project-scoped links (03-08) use the current project ID if available.
   */
  function resolveHref(link: NavLink): string {
    if (link.projectRoute && currentProjectId) {
      return `/projects/${currentProjectId}${link.suffix || ""}`;
    }
    if (link.projectRoute) {
      // No project selected — go to projects list
      return "/projects";
    }
    return link.href;
  }

  // Determine if a nav link is active based on current pathname
  function isActive(link: NavLink): boolean {
    if (link.num === "02") {
      return pathname === "/projects";
    }
    if (link.projectRoute) {
      if (link.suffix) {
        return pathname.includes(link.suffix);
      }
      const projectDetailPattern = /^\/projects\/[^/]+$/;
      return projectDetailPattern.test(pathname);
    }
    return pathname.startsWith(link.href);
  }

  return (
    <>
      {/* ============================================ */}
      {/* HAMBURGER BUTTON (always visible)            */}
      {/* ============================================ */}
      {/* Hamburger — hidden when drawer is open (drawer has its own close button) */}
      {!isOpen && (
        <button
          className="
            fixed top-[10px] left-[12px] z-[1100]
            w-12 h-12
            bg-surface
            border-[4px] border-signal-black
            shadow-nb
            cursor-pointer
            flex flex-col items-center justify-center
            gap-[5px] p-[10px]
            transition-[box-shadow,transform] duration-150 ease-linear
            hover:shadow-nb-lg hover:-translate-x-px hover:-translate-y-px
            active:shadow-nb-sm active:translate-x-0.5 active:translate-y-0.5
            focus-visible:outline-3 focus-visible:outline-watermelon focus-visible:outline-offset-2
          "
          onClick={openDrawer}
          aria-label="Open navigation menu"
          aria-expanded={false}
        >
          <span className="block w-6 h-[3px] bg-signal-black" />
          <span className="block w-6 h-[3px] bg-signal-black" />
          <span className="block w-6 h-[3px] bg-signal-black" />
        </button>
      )}

      {/* ============================================ */}
      {/* NAVIGATION DRAWER                            */}
      {/* ============================================ */}
      <nav
        className={`
          fixed top-0 left-0
          w-[280px] h-screen
          bg-surface
          border-r-[4px] border-signal-black
          z-[1050]
          flex flex-col
          overflow-y-auto
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)" }}
        aria-label="Main navigation"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between p-6 border-b-[4px] border-signal-black min-h-[80px]">
          <div className="flex items-center gap-2">
            <span className="text-[2rem] text-watermelon">&#9670;</span>
            <span className="font-sans font-bold text-[1.1rem] leading-[1.1] tracking-[0.05em]">
              IDEA<br />MGMT
            </span>
          </div>
          <button
            className="
              w-10 h-10
              bg-watermelon text-surface
              border-[3px] border-signal-black
              shadow-nb
              cursor-pointer
              text-[1.2rem] font-bold
              flex items-center justify-center
              transition-[box-shadow,transform] duration-150 ease-linear
              hover:-translate-x-px hover:-translate-y-px hover:shadow-nb-lg
              active:translate-x-0.5 active:translate-y-0.5 active:shadow-nb-sm
              focus-visible:outline-3 focus-visible:outline-watermelon focus-visible:outline-offset-2
            "
            onClick={closeDrawer}
            aria-label="Close navigation"
          >
            &#10005;
          </button>
        </div>

        {/* Nav links */}
        <ul className="list-none flex-1 py-2">
          {NAV_LINKS.map((link) => {
            const active = isActive(link);
            const needsProject = link.projectRoute && !currentProjectId;
            const href = resolveHref(link);

            return (
              <li key={link.num}>
                <Link
                  href={href}
                  onClick={closeDrawer}
                  className={`
                    flex items-center gap-4
                    px-6 py-4
                    font-sans font-bold text-base
                    uppercase tracking-[0.03em]
                    border-b-2 border-transparent
                    transition-[background,transform,border-color] duration-150 ease-linear
                    relative
                    hover:bg-creamy-milk hover:translate-x-1
                    focus-visible:outline-3 focus-visible:outline-watermelon focus-visible:outline-offset-[-3px]
                    ${active ? "bg-signal-black text-malachite hover:bg-gray-dark" : ""}
                    ${needsProject ? "opacity-40 pointer-events-none" : ""}
                  `}
                  aria-disabled={needsProject}
                  tabIndex={needsProject ? -1 : undefined}
                >
                  <span
                    className={`
                      font-mono text-xs min-w-[24px]
                      ${active ? "text-watermelon" : "text-gray-mid"}
                    `}
                  >
                    {link.num}
                  </span>
                  {link.label}
                  {needsProject && (
                    <span className="font-mono text-[0.6rem] text-gray-mid ml-auto">
                      select project
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Drawer footer — user profile */}
        <div className="p-6 border-t-[4px] border-signal-black">
          <div className="flex items-center gap-4">
            <div
              className="
                w-11 h-11
                bg-watermelon text-surface
                border-[3px] border-signal-black
                shadow-nb
                flex items-center justify-center
                font-sans font-bold text-base
              "
            >
              JD
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[0.9rem]">Jane Doe</span>
              <span className="font-mono text-xs text-gray-mid uppercase">
                Admin
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* ============================================ */}
      {/* OVERLAY (behind drawer)                      */}
      {/* ============================================ */}
      <div
        className={`
          fixed inset-0
          bg-black/50
          z-[1000]
          transition-opacity duration-250 ease-linear
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={closeDrawer}
      />

      {/* ============================================ */}
      {/* MAIN CONTENT                                 */}
      {/* ============================================ */}
      <main
        className="mt-[60px] min-h-[calc(100vh-60px)] w-full"
        style={{ padding: "clamp(16px, 2.5vw, 48px)" }}
      >
        {children}
      </main>
    </>
  );
}
