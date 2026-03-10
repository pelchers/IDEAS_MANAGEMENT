"use client";

import { usePathname } from "next/navigation";

/**
 * Map pathname segments to display titles (all uppercase, matching pass-1).
 */
function getTitleFromPathname(pathname: string): string {
  // Check specific routes first
  if (pathname === "/dashboard") return "DASHBOARD";
  if (pathname === "/projects") return "PROJECTS";
  if (pathname === "/ai") return "AI CHAT";
  if (pathname === "/settings") return "SETTINGS";

  // Project-specific routes
  if (pathname.includes("/kanban")) return "KANBAN";
  if (pathname.includes("/whiteboard")) return "WHITEBOARD";
  if (pathname.includes("/schema")) return "SCHEMA PLANNER";
  if (pathname.includes("/directory-tree")) return "DIRECTORY TREE";
  if (pathname.includes("/ideas")) return "IDEAS";

  // /projects/[id] — workspace view
  const projectDetailPattern = /^\/projects\/[^/]+$/;
  if (projectDetailPattern.test(pathname)) return "WORKSPACE";

  return "DASHBOARD";
}

export function TopBar() {
  const pathname = usePathname();
  const title = getTitleFromPathname(pathname);

  return (
    <header
      className="
        fixed top-0 left-0 right-0
        h-[60px]
        bg-surface
        border-b-[4px] border-signal-black
        flex items-center justify-between
        pr-6
        z-[900]
      "
      style={{ paddingLeft: "76px" }}
    >
      {/* Left — view title */}
      <div className="flex items-center">
        <span className="font-sans font-bold text-[1.1rem] tracking-[0.05em] uppercase">
          {title}
        </span>
      </div>

      {/* Right — search + notification */}
      <div className="flex items-center gap-4">
        {/* Search input */}
        <input
          type="text"
          placeholder="SEARCH..."
          aria-label="Search"
          className="
            font-mono text-[0.85rem]
            py-2 px-4
            border-[3px] border-signal-black
            bg-creamy-milk text-signal-black
            w-[200px]
            transition-[box-shadow,width] duration-150 ease-linear
            focus:outline-none focus:shadow-nb focus:w-[260px]
            placeholder:text-gray-mid placeholder:uppercase placeholder:tracking-[0.1em]
          "
        />

        {/* Notification bell */}
        <button
          className="
            w-11 h-11
            bg-surface
            border-[3px] border-signal-black
            shadow-nb
            cursor-pointer
            text-[1.2rem]
            flex items-center justify-center
            relative
            transition-[transform,box-shadow] duration-150 ease-linear
            hover:-translate-x-px hover:-translate-y-px hover:shadow-nb-lg
            active:translate-x-0.5 active:translate-y-0.5 active:shadow-nb-sm
            focus-visible:outline-3 focus-visible:outline-watermelon focus-visible:outline-offset-2
          "
          aria-label="Notifications"
        >
          <span
            className="
              absolute top-[6px] right-[6px]
              w-[10px] h-[10px]
              bg-watermelon
              border-2 border-surface
            "
          />
          &#9872;
        </button>
      </div>
    </header>
  );
}
