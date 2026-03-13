"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ── Fallback mock data (shown when no real projects exist) ── */
const MOCK_PROJECTS = [
  { id: "mock-1", title: "MOBILE APP REDESIGN", desc: "Complete overhaul of the mobile experience with new navigation patterns and gesture controls.", status: "active" as const, progress: 72, tasks: 24, dueDate: "2026-04-15" },
  { id: "mock-2", title: "API V3 MIGRATION", desc: "Migrate all endpoints to v3 with improved rate limiting and authentication flow.", status: "active" as const, progress: 45, tasks: 18, dueDate: "2026-05-01" },
  { id: "mock-3", title: "DESIGN SYSTEM 2.0", desc: "New component library with brutalist design tokens and accessibility-first approach.", status: "review" as const, progress: 88, tasks: 32, dueDate: "2026-03-20" },
  { id: "mock-4", title: "AI INTEGRATION", desc: "Natural language processing pipeline for idea categorization and smart suggestions.", status: "planning" as const, progress: 15, tasks: 12, dueDate: "2026-06-01" },
  { id: "mock-5", title: "PERFORMANCE AUDIT", desc: "Core Web Vitals optimization, bundle splitting, and lazy loading implementation.", status: "active" as const, progress: 60, tasks: 8, dueDate: "2026-03-30" },
  { id: "mock-6", title: "ONBOARDING FLOW", desc: "Interactive tutorial system for new users with progressive disclosure of features.", status: "paused" as const, progress: 30, tasks: 14, dueDate: "2026-07-01" },
];

type ProjectStatus = "active" | "review" | "planning" | "paused";

const STATUS_CLASSES: Record<ProjectStatus, string> = {
  active: "bg-malachite",
  review: "bg-cornflower text-white",
  planning: "bg-lemon",
  paused: "bg-gray-mid text-white",
};

interface ProjectData {
  id: string;
  title: string;
  desc: string;
  status: ProjectStatus;
  progress: number;
  tasks: number;
  dueDate: string;
}

function mapApiProject(p: {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}): ProjectData {
  const statusMap: Record<string, ProjectStatus> = {
    ACTIVE: "active",
    PLANNING: "planning",
    PAUSED: "paused",
    ARCHIVED: "paused",
  };
  return {
    id: p.id,
    title: p.name.toUpperCase(),
    desc: p.description || "No description",
    status: statusMap[p.status] || "planning",
    progress: 0, // Will be populated from kanban artifact
    tasks: 0,
    dueDate: new Date(p.createdAt).toISOString().split("T")[0],
  };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>(MOCK_PROJECTS);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchProjects = () => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.projects && data.projects.length > 0) {
          setProjects(data.projects.map(mapApiProject));
        }
        // If no real projects, keep mock data
      })
      .catch(() => {
        // Keep mock data on error
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName.trim(),
          description: newProjectDesc.trim(),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setNewProjectName("");
        setNewProjectDesc("");
        setShowCreateForm(false);
        fetchProjects();
      } else {
        setCreateError(data.error || "Failed to create project");
      }
    } catch {
      setCreateError("Network error — could not create project");
    }
    setCreating(false);
  };

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      {/* View header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="nb-view-title">PROJECTS</h1>
        <button
          className="nb-btn nb-btn--primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          + NEW PROJECT
        </button>
      </div>

      {/* Create project form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="nb-card p-6 mb-6 flex flex-col gap-4"
        >
          {createError && (
            <div className="p-3 border-2 border-signal-black bg-watermelon/20 text-watermelon font-mono text-[0.85rem]">
              {createError}
            </div>
          )}
          <div>
            <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">
              PROJECT NAME
            </label>
            <input
              type="text"
              className="nb-input w-full"
              placeholder="My New Project"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">
              DESCRIPTION
            </label>
            <textarea
              className="nb-input nb-textarea w-full"
              placeholder="What is this project about?"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="nb-btn nb-btn--primary"
              disabled={creating || !newProjectName.trim()}
            >
              {creating ? "CREATING..." : "CREATE PROJECT"}
            </button>
            <button
              type="button"
              className="nb-btn"
              onClick={() => setShowCreateForm(false)}
            >
              CANCEL
            </button>
          </div>
        </form>
      )}

      {/* Projects grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 ${loading ? "animate-pulse" : ""}`}>
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="block bg-white border-4 border-signal-black shadow-nb p-6 transition-[transform,box-shadow] duration-150 cursor-pointer hover:-translate-x-[3px] hover:-translate-y-[3px] hover:rotate-[0.5deg] hover:shadow-nb-xl"
          >
            {/* Status badge */}
            <div className="mb-3">
              <span
                className={`font-mono text-[0.7rem] uppercase font-semibold px-3 py-1 border-2 border-signal-black ${STATUS_CLASSES[project.status]}`}
              >
                {project.status}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-[1.2rem] font-bold uppercase mb-2">
              {project.title}
            </h3>

            {/* Description */}
            <p className="text-[0.9rem] text-gray-mid mb-4 leading-relaxed">
              {project.desc}
            </p>

            {/* Meta row */}
            <div className="flex justify-between font-mono text-[0.75rem] uppercase pt-4 border-t-2 border-dashed border-signal-black">
              <span>{project.tasks} TASKS</span>
              <span>DUE {project.dueDate}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-creamy-milk border-2 border-signal-black mt-2">
              <div
                className="h-full bg-watermelon"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
