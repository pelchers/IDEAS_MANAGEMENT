"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
    progress: 0,
    tasks: 0,
    dueDate: new Date(p.createdAt).toISOString().split("T")[0],
  };
}

function selectProject(id: string, name: string) {
  localStorage.setItem("im_selected_project", JSON.stringify({ id, name }));
  // Notify app shell
  const fn = (window as unknown as Record<string, unknown>).__imSelectProject;
  if (typeof fn === "function") {
    (fn as (id: string, name: string) => void)(id, name);
  }
  // Trigger storage event for TopBar
  window.dispatchEvent(new Event("storage"));
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Load selected project from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("im_selected_project");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id) setSelectedId(parsed.id);
      } catch { /* ignore */ }
    }
  }, []);

  const fetchProjects = () => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.projects) {
          setProjects(data.projects.map(mapApiProject));
        }
      })
      .catch(() => {})
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

  const handleSelect = (project: ProjectData) => {
    setSelectedId(project.id);
    selectProject(project.id, project.title);
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
      {!loading && projects.length === 0 && (
        <div style={{
          textAlign: "center", padding: "80px 20px",
          fontFamily: "monospace", color: "#999",
          border: "4px solid #1a1a1a", background: "#fff",
          boxShadow: "4px 4px 0 #1a1a1a",
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>[ ]</div>
          <div style={{ fontSize: "0.9rem", textTransform: "uppercase", marginBottom: "8px" }}>
            No projects yet
          </div>
          <div style={{ fontSize: "0.8rem" }}>
            Click &quot;+ NEW PROJECT&quot; above to get started.
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 ${loading ? "animate-pulse" : ""}`}>
        {projects.map((project) => (
          <div
            key={project.id}
            className={`bg-white border-4 border-signal-black shadow-nb p-6 transition-[transform,box-shadow] duration-150 ${
              selectedId === project.id ? "ring-4 ring-watermelon ring-offset-2" : ""
            }`}
          >
            {/* Status badge */}
            <div className="mb-3 flex items-center justify-between">
              <span
                className={`font-mono text-[0.7rem] uppercase font-semibold px-3 py-1 border-2 border-signal-black ${STATUS_CLASSES[project.status]}`}
              >
                {project.status}
              </span>
              {selectedId === project.id && (
                <span className="font-mono text-[0.65rem] uppercase text-watermelon font-bold">
                  SELECTED
                </span>
              )}
            </div>

            {/* Title */}
            <Link href={`/projects/${project.id}`}>
              <h3 className="text-[1.2rem] font-bold uppercase mb-2 hover:text-watermelon transition-colors cursor-pointer">
                {project.title}
              </h3>
            </Link>

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

            {/* Action buttons */}
            <div className="flex gap-2 mt-4">
              <button
                className={`nb-btn nb-btn--small flex-1 ${
                  selectedId === project.id ? "" : "nb-btn--primary"
                }`}
                onClick={() => handleSelect(project)}
              >
                {selectedId === project.id ? "SELECTED" : "SELECT PROJECT"}
              </button>
              <Link
                href={`/projects/${project.id}`}
                className="nb-btn nb-btn--small text-center"
              >
                OPEN
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
