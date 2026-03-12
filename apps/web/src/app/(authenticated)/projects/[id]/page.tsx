"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

/* ── Constants ── */
const TABS = ["EDITOR", "PREVIEW", "NOTES"] as const;
type Tab = (typeof TABS)[number];

const TOOLBAR_BUTTONS = ["B", "I", "U", "H1", "H2", "≡", "🔗"];

const MOCK_EDITOR_CONTENT = `This is a workspace document for the project. The editor supports rich text formatting with bold, italic, and underline styles.

Key decisions made so far:
• Navigation patterns will use a tab-based approach
• Gesture controls mapped to swipe left/right for section switching
• Color palette follows the brutalist design system tokens

Next steps include finalizing the component library integration and scheduling the design review with the team.`;

const MOCK_NOTES = [
  { id: 1, text: "Reviewed initial wireframes with the team. Agreed on tab-based navigation pattern.", author: "Jane Doe", time: "2026-03-08 14:22" },
  { id: 2, text: "API endpoints for v3 migration are now documented. Need to update rate limiting config.", author: "Alex Kim", time: "2026-03-07 09:15" },
  { id: 3, text: "Design tokens exported from Figma. Ready for component library integration.", author: "Sam Rivera", time: "2026-03-06 16:40" },
  { id: 4, text: "Performance benchmarks collected. Bundle size reduced by 18% after tree-shaking.", author: "Chris Miller", time: "2026-03-05 11:30" },
];

interface ProjectDetail {
  name: string;
  description: string;
  status: string;
}

export default function ProjectWorkspacePage() {
  const params = useParams();
  const projectId = String(params.id);
  const [activeTab, setActiveTab] = useState<Tab>("EDITOR");
  const [project, setProject] = useState<ProjectDetail | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.project) {
          setProject(data.project);
        }
      })
      .catch(() => { /* keep defaults */ });
  }, [projectId]);

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      {/* View header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="nb-view-title">
          {project ? project.name.toUpperCase() : "WORKSPACE"}
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Link href={`/projects/${projectId}/kanban`} className="nb-btn nb-btn--small">KANBAN</Link>
            <Link href={`/projects/${projectId}/whiteboard`} className="nb-btn nb-btn--small">WHITEBOARD</Link>
            <Link href={`/projects/${projectId}/schema`} className="nb-btn nb-btn--small">SCHEMA</Link>
            <Link href={`/projects/${projectId}/ideas`} className="nb-btn nb-btn--small">IDEAS</Link>
          </div>
          <span className="font-mono text-xs uppercase text-gray-mid">
            {project ? project.status : `PROJECT #${projectId}`}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-0">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`font-mono text-[0.8rem] uppercase px-6 py-2 border-[3px] border-signal-black font-semibold cursor-pointer transition-[background,color] duration-150 ${
              activeTab === tab
                ? "bg-signal-black text-creamy-milk"
                : "bg-transparent text-signal-black hover:bg-creamy-milk"
            }`}
            style={{ marginRight: "-3px" }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Panel container */}
      <div className="border-4 border-signal-black bg-white shadow-nb">
        {/* EDITOR panel */}
        {activeTab === "EDITOR" && (
          <div>
            {/* Toolbar */}
            <div className="flex gap-1 p-3 border-b-[3px] border-signal-black bg-creamy-milk">
              {TOOLBAR_BUTTONS.map((btn, i) => (
                <button
                  key={i}
                  className="w-9 h-9 border-2 border-signal-black bg-white font-bold text-sm cursor-pointer flex items-center justify-center hover:bg-signal-black hover:text-creamy-milk transition-[background,color] duration-150"
                >
                  {btn}
                </button>
              ))}
            </div>

            {/* Editor area */}
            <div className="min-h-[400px] p-6 leading-[1.8] border-[3px] border-signal-black m-0 whitespace-pre-wrap">
              {MOCK_EDITOR_CONTENT}
            </div>
          </div>
        )}

        {/* PREVIEW panel */}
        {activeTab === "PREVIEW" && (
          <div className="p-6">
            <div className="border-4 border-signal-black p-8 bg-creamy-milk">
              <h2 className="text-xl font-bold uppercase mb-4 pb-2 border-b-2 border-signal-black">
                RENDERED PREVIEW
              </h2>
              <p className="text-gray-mid mb-6 leading-relaxed">
                This panel displays the rendered output of the workspace
                document. Visual elements, diagrams, and formatted content
                appear here as a live preview.
              </p>
              {/* Placeholder for Rough.js SVG — will be added in whiteboard session */}
              <div className="w-full h-48 border-[3px] border-dashed border-signal-black flex items-center justify-center bg-white">
                <span className="font-mono text-sm uppercase text-gray-mid tracking-wider">
                  [ DIAGRAM PLACEHOLDER ]
                </span>
              </div>
            </div>
          </div>
        )}

        {/* NOTES panel */}
        {activeTab === "NOTES" && (
          <div className="p-6">
            <div className="space-y-4">
              {MOCK_NOTES.map((note) => (
                <div
                  key={note.id}
                  className="border-[3px] border-signal-black p-5 bg-white shadow-nb-sm hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-nb transition-all duration-150"
                >
                  <p className="text-[0.95rem] leading-relaxed mb-3">
                    {note.text}
                  </p>
                  <div className="flex justify-between font-mono text-[0.75rem] uppercase text-gray-mid pt-3 border-t-2 border-dashed border-signal-black">
                    <span>{note.author}</span>
                    <span>{note.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
