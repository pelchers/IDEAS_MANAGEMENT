"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

interface UserInfo {
  email: string;
  role: string;
}

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", num: "01" },
  { href: "/projects", label: "Projects", num: "02" },
  { href: "/ai", label: "AI Chat", num: "03" },
  { href: "/settings", label: "Settings", num: "04" },
];

function getInitials(email: string): string {
  const name = email.split("@")[0];
  if (!name) return "??";
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getBreadcrumb(pathname: string): string {
  if (pathname.startsWith("/dashboard")) return "DASHBOARD";
  if (pathname.startsWith("/ai")) return "AI CHAT";
  if (pathname.startsWith("/settings")) return "SETTINGS";
  if (pathname.startsWith("/projects/")) {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length >= 3) {
      // /projects/[id]/kanban etc.
      return `PROJECT / ${segments[2].toUpperCase().replace("-", " ")}`;
    }
    return "PROJECT";
  }
  if (pathname.startsWith("/projects")) return "PROJECTS";
  return pathname.slice(1).toUpperCase() || "HOME";
}

function isActiveLink(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/projects") return pathname.startsWith("/projects");
  return pathname.startsWith(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Fetch current user
  useEffect(() => {
    let cancelled = false;
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.ok && data.user) {
            setUser({ email: data.user.email, role: data.user.role });
          }
        }
      } catch {
        // Silently fail - user info is non-critical
      }
    }
    fetchUser();
    return () => { cancelled = true; };
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Close drawer on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && drawerOpen) {
        setDrawerOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleSignout = useCallback(async () => {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
    } catch {
      // Sign out even if request fails
    }
    router.push("/signin");
  }, [router]);

  const breadcrumb = getBreadcrumb(pathname);

  return (
    <div className="app-container">
      {/* Hamburger button */}
      <button
        className={`hamburger-btn${drawerOpen ? " open" : ""}`}
        onClick={toggleDrawer}
        aria-label={drawerOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={drawerOpen}
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>

      {/* Overlay */}
      <div
        className={`nav-overlay${drawerOpen ? " visible" : ""}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Navigation Drawer */}
      <nav
        className={`nav-drawer${drawerOpen ? " open" : ""}`}
        aria-label="Main navigation"
      >
        <div className="nav-drawer-header">
          <div className="nav-logo">
            <span className="nav-logo-icon">&#9670;</span>
            <span className="nav-logo-text">
              IDEA<br />MGMT
            </span>
          </div>
          <button
            className="nav-close-btn"
            onClick={closeDrawer}
            aria-label="Close navigation"
          >
            &#10005;
          </button>
        </div>

        <ul className="nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`nav-link${isActiveLink(pathname, link.href) ? " active" : ""}`}
              >
                <span className="nav-link-num">{link.num}</span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-drawer-footer">
          <div className="nav-user">
            <div className="nav-user-avatar">
              {user ? getInitials(user.email) : "??"}
            </div>
            <div className="nav-user-info">
              <span className="nav-user-name">
                {user?.email?.split("@")[0] || "User"}
              </span>
              <span className="nav-user-role">
                {user?.role || "Member"}
              </span>
            </div>
          </div>
          <button
            className="brutalist-btn brutalist-btn--small nav-signout-btn"
            onClick={handleSignout}
            style={{ marginTop: "var(--space-md)", width: "100%" }}
          >
            SIGN OUT
          </button>
        </div>
      </nav>

      {/* Main area */}
      <div className="main-content">
        {/* Top bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <span className="top-bar-crumb">{breadcrumb}</span>
          </div>
          <div className="top-bar-right">
            <div className="top-bar-search">
              <input
                type="text"
                placeholder="SEARCH..."
                className="search-input"
                aria-label="Search"
              />
            </div>
            <button className="top-bar-notif" aria-label="Notifications">
              <span className="notif-dot" />
              &#9872;
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="page-content page-enter">
          {children}
        </div>
      </div>
    </div>
  );
}
