"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

type ProjectStatus = "active" | "review" | "planning" | "paused";
type SortOption = "newest" | "oldest" | "name-az" | "name-za" | "status";

const STATUS_CLASSES: Record<ProjectStatus, string> = {
  active: "bg-malachite",
  review: "bg-cornflower text-white",
  planning: "bg-lemon",
  paused: "bg-gray-mid text-white",
};

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "ALL", value: "ALL" },
  { label: "PLANNING", value: "PLANNING" },
  { label: "ACTIVE", value: "ACTIVE" },
  { label: "PAUSED", value: "PAUSED" },
  { label: "ARCHIVED", value: "ARCHIVED" },
];

interface ProjectData {
  id: string;
  title: string;
  name: string;
  desc: string;
  status: ProjectStatus;
  rawStatus: string;
  progress: number;
  tasks: number;
  tags: string[];
  dueDate: string;
  createdAt: string;
}

function mapApiProject(p: { id: string; name: string; description: string; status: string; tags?: string[]; createdAt: string }): ProjectData {
  const statusMap: Record<string, ProjectStatus> = { ACTIVE: "active", PLANNING: "planning", PAUSED: "paused", ARCHIVED: "paused" };
  return {
    id: p.id,
    title: p.name.toUpperCase(),
    name: p.name,
    desc: p.description || "No description",
    status: statusMap[p.status] || "planning",
    rawStatus: p.status,
    progress: 0,
    tasks: 0,
    tags: p.tags || [],
    dueDate: new Date(p.createdAt).toISOString().split("T")[0],
    createdAt: p.createdAt,
  };
}

function selectProject(id: string, name: string) {
  localStorage.setItem("im_selected_project", JSON.stringify({ id, name }));
  const fn = (window as unknown as Record<string, unknown>).__imSelectProject;
  if (typeof fn === "function") (fn as (id: string, name: string) => void)(id, name);
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

  // Search, sort, filter
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Settings modal
  const [editProject, setEditProject] = useState<ProjectData | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState("PLANNING");
  const [editTags, setEditTags] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("im_selected_project");
    if (saved) { try { const p = JSON.parse(saved); if (p.id) setSelectedId(p.id); } catch { /* ignore */ } }
  }, []);

  const fetchProjects = () => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => { if (data.ok && data.projects) setProjects(data.projects.map(mapApiProject)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setCreating(true); setCreateError(null);
    try {
      const res = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newProjectName.trim(), description: newProjectDesc.trim() }) });
      const data = await res.json();
      if (data.ok) { setNewProjectName(""); setNewProjectDesc(""); setShowCreateForm(false); fetchProjects(); }
      else setCreateError(data.error || "Failed to create project");
    } catch { setCreateError("Network error"); }
    setCreating(false);
  };

  const handleSelect = (project: ProjectData) => { setSelectedId(project.id); selectProject(project.id, project.title); };

  // Settings modal handlers
  const openSettings = (p: ProjectData) => {
    setEditProject(p); setEditName(p.name); setEditDesc(p.desc === "No description" ? "" : p.desc);
    setEditStatus(p.rawStatus); setEditTags(p.tags.join(", "));
  };

  const saveSettings = async () => {
    if (!editProject || !editName.trim()) return;
    setEditSaving(true);
    try {
      await fetch(`/api/projects/${editProject.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(), description: editDesc.trim(), status: editStatus,
          tags: editTags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      setEditProject(null); fetchProjects();
    } catch { /* silent */ }
    setEditSaving(false);
  };

  const deleteProject = async () => {
    if (!editProject) return;
    if (!window.confirm(`Delete "${editProject.name}"? This will permanently delete the project and all its data.`)) return;
    try {
      await fetch(`/api/projects/${editProject.id}`, { method: "DELETE" });
      if (selectedId === editProject.id) { setSelectedId(null); localStorage.removeItem("im_selected_project"); }
      setEditProject(null); fetchProjects();
    } catch { /* silent */ }
  };

  // Filtered + sorted projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter((p) => p.rawStatus === statusFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sortBy) {
      case "name-az": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-za": result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "newest": result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case "oldest": result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
      case "status": result.sort((a, b) => a.rawStatus.localeCompare(b.rawStatus)); break;
    }

    return result;
  }, [projects, searchQuery, sortBy, statusFilter]);

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      {/* View header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="nb-view-title">PROJECTS</h1>
        <button className="nb-btn nb-btn--primary" onClick={() => setShowCreateForm(!showCreateForm)}>+ NEW PROJECT</button>
      </div>

      {/* Create project form */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="nb-card p-6 mb-6 flex flex-col gap-4">
          {createError && <div className="p-3 border-2 border-signal-black bg-watermelon/20 text-watermelon font-mono text-[0.85rem]">{createError}</div>}
          <div>
            <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">PROJECT NAME</label>
            <input type="text" className="nb-input w-full" placeholder="My New Project" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} required />
          </div>
          <div>
            <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">DESCRIPTION</label>
            <textarea className="nb-input nb-textarea w-full" placeholder="What is this project about?" value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="nb-btn nb-btn--primary" disabled={creating || !newProjectName.trim()}>{creating ? "CREATING..." : "CREATE PROJECT"}</button>
            <button type="button" className="nb-btn" onClick={() => setShowCreateForm(false)}>CANCEL</button>
          </div>
        </form>
      )}

      {/* Search, sort, filter bar */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        {/* Search */}
        <input
          type="text"
          className="nb-input flex-1 min-w-[200px]"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Sort */}
        <select className="nb-input text-[0.8rem] py-2" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
          <option value="newest">NEWEST</option>
          <option value="oldest">OLDEST</option>
          <option value="name-az">NAME A-Z</option>
          <option value="name-za">NAME Z-A</option>
          <option value="status">STATUS</option>
        </select>

        {/* Status filter chips */}
        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 font-bold text-[0.75rem] uppercase border-2 border-signal-black cursor-pointer transition-colors ${
                statusFilter === f.value ? "bg-signal-black text-malachite" : "bg-white text-signal-black hover:bg-creamy-milk"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty states */}
      {!loading && projects.length === 0 && (
        <div className="text-center py-20 font-mono text-[#999] border-4 border-signal-black bg-white shadow-nb">
          <div className="text-[2.5rem] mb-4">[ ]</div>
          <div className="text-[0.9rem] uppercase mb-2">No projects yet</div>
          <div className="text-[0.8rem]">Click &quot;+ NEW PROJECT&quot; above to get started.</div>
        </div>
      )}

      {!loading && projects.length > 0 && filteredProjects.length === 0 && (
        <div className="text-center py-12 font-mono text-[#999] border-3 border-dashed border-signal-black/30 bg-white">
          <div className="text-[0.9rem] uppercase">No projects match your search</div>
        </div>
      )}

      {/* Projects grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 ${loading ? "animate-pulse" : ""}`}>
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className={`bg-white border-4 border-signal-black shadow-nb p-6 transition-[transform,box-shadow] duration-150 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-nb-xl relative ${
              selectedId === project.id ? "ring-4 ring-watermelon ring-offset-2" : ""
            }`}
          >
            {/* Settings gear */}
            <button
              onClick={(e) => { e.preventDefault(); openSettings(project); }}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center border-2 border-signal-black bg-white hover:bg-creamy-milk cursor-pointer text-[1rem] transition-colors"
              title="Project settings"
            >
              &#9881;
            </button>

            {/* Status badge */}
            <div className="mb-3 flex items-center justify-between pr-10">
              <span className={`font-mono text-[0.7rem] uppercase font-semibold px-3 py-1 border-2 border-signal-black ${STATUS_CLASSES[project.status]}`}>
                {project.status}
              </span>
              {selectedId === project.id && (
                <span className="font-mono text-[0.65rem] uppercase text-watermelon font-bold">SELECTED</span>
              )}
            </div>

            {/* Title */}
            <Link href={`/projects/${project.id}`}>
              <h3 className="text-[1.2rem] font-bold uppercase mb-2 hover:text-watermelon transition-colors cursor-pointer pr-8">
                {project.title}
              </h3>
            </Link>

            {/* Description */}
            <p className="text-[0.9rem] text-gray-mid mb-3 leading-relaxed line-clamp-2">{project.desc}</p>

            {/* Tags */}
            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {project.tags.map((tag) => (
                  <span key={tag} className="font-mono text-[0.65rem] uppercase px-2 py-0.5 border border-signal-black bg-creamy-milk">{tag}</span>
                ))}
              </div>
            )}

            {/* Meta row */}
            <div className="flex justify-between font-mono text-[0.75rem] uppercase pt-3 border-t-2 border-dashed border-signal-black">
              <span>{project.tasks} TASKS</span>
              <span>{project.dueDate}</span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-4">
              <button
                className={`nb-btn nb-btn--small flex-1 ${selectedId === project.id ? "" : "nb-btn--primary"}`}
                onClick={() => handleSelect(project)}
              >
                {selectedId === project.id ? "SELECTED" : "SELECT"}
              </button>
              <Link href={`/projects/${project.id}`} className="nb-btn nb-btn--small text-center">OPEN</Link>
            </div>
          </div>
        ))}
      </div>

      {/* ── Settings Modal ── */}
      {editProject && (
        <div onClick={() => setEditProject(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "#FFFFFF", border: "4px solid #282828", boxShadow: "8px 8px 0px #282828", padding: "24px", width: "90%", maxWidth: "520px", maxHeight: "85vh", overflow: "auto" }}>
            <h2 className="font-bold text-[1.1rem] uppercase tracking-wider mb-4">PROJECT SETTINGS</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">NAME</label>
                <input className="nb-input w-full" value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div>
                <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">DESCRIPTION</label>
                <textarea className="nb-input nb-textarea w-full" rows={3} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">STATUS</label>
                  <select className="nb-input w-full" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                    <option value="PLANNING">PLANNING</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PAUSED">PAUSED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">TAGS (comma-sep)</label>
                  <input className="nb-input w-full" value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="web, mobile, ai" />
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <button className="nb-btn nb-btn--primary" onClick={saveSettings} disabled={editSaving}>{editSaving ? "SAVING..." : "SAVE"}</button>
                <button className="nb-btn" onClick={() => setEditProject(null)}>CANCEL</button>
                <button className="nb-btn nb-btn--danger ml-auto" onClick={deleteProject}>DELETE PROJECT</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
