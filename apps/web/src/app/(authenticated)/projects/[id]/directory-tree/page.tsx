"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";

/* ── Types ── */
interface TreeNode {
  name: string;
  type: "folder" | "file";
  children?: TreeNode[];
}

/* ── Mock file tree (from pass-1) ── */
const FILE_TREE: TreeNode[] = [
  {
    name: "idea-management",
    type: "folder",
    children: [
      {
        name: "src",
        type: "folder",
        children: [
          {
            name: "components",
            type: "folder",
            children: [
              { name: "Dashboard.tsx", type: "file" },
              { name: "Kanban.tsx", type: "file" },
              { name: "Whiteboard.tsx", type: "file" },
              { name: "IdeaCapture.tsx", type: "file" },
              { name: "SchemaPlanner.tsx", type: "file" },
              { name: "Settings.tsx", type: "file" },
            ],
          },
          {
            name: "hooks",
            type: "folder",
            children: [
              { name: "useProjects.ts", type: "file" },
              { name: "useKanban.ts", type: "file" },
              { name: "useWhiteboard.ts", type: "file" },
            ],
          },
          {
            name: "utils",
            type: "folder",
            children: [
              { name: "helpers.ts", type: "file" },
              { name: "constants.ts", type: "file" },
            ],
          },
        ],
      },
      {
        name: "convex",
        type: "folder",
        children: [
          { name: "schema.ts", type: "file" },
          { name: "projects.ts", type: "file" },
          { name: "ideas.ts", type: "file" },
          { name: "auth.ts", type: "file" },
        ],
      },
      { name: "package.json", type: "file" },
      { name: "tsconfig.json", type: "file" },
      { name: "README.md", type: "file" },
    ],
  },
];

/* ── Mock file contents (from pass-1 app.js) ── */
const FILE_CONTENTS: Record<string, string> = {
  "Dashboard.tsx": `import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function Dashboard() {
  const projects = useQuery(api.projects.list);
  const stats = useQuery(api.stats.overview);

  return (
    <div className="dashboard-grid">
      <StatsRow data={stats} />
      <ActivityChart data={stats?.weekly} />
      <RecentActivity items={stats?.activity} />
    </div>
  );
}`,
  "Kanban.tsx": `import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function Kanban({ projectId }) {
  const moveCard = useMutation(api.kanban.moveCard);

  const handleDrop = async (cardId, column) => {
    await moveCard({ cardId, column });
  };

  return <KanbanBoard onDrop={handleDrop} />;
}`,
  "Whiteboard.tsx": `import { useRef, useEffect } from "react";

export function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    // Initialize drawing context
  }, []);

  return <canvas ref={canvasRef} />;
}`,
  "useProjects.ts": `import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function useProjects() {
  const projects = useQuery(api.projects.list);
  return { projects, loading: !projects };
}`,
  "useKanban.ts": `import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function useKanban(projectId: string) {
  const columns = useQuery(api.kanban.columns, { projectId });
  const moveCard = useMutation(api.kanban.moveCard);
  return { columns, moveCard };
}`,
  "schema.ts": `import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    status: v.string(),
    ownerId: v.string(),
  }),
  ideas: defineTable({
    title: v.string(),
    body: v.string(),
    projectId: v.id("projects"),
  }),
});`,
  "projects.ts": `import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("projects").collect();
  },
});`,
  "package.json": `{
  "name": "idea-management",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}`,
};

/* ── TreeItem component ── */
function TreeItem({
  node,
  depth,
  expanded,
  onToggle,
  onSelect,
  selectedFile,
}: {
  node: TreeNode;
  depth: number;
  expanded: Record<string, boolean>;
  onToggle: (path: string) => void;
  onSelect: (name: string) => void;
  selectedFile: string | null;
}) {
  const path = node.name;
  const isFolder = node.type === "folder";
  const isExpanded = expanded[path] !== false; // default expanded
  const isSelected = !isFolder && selectedFile === node.name;

  return (
    <li>
      <div
        onClick={() => {
          if (isFolder) {
            onToggle(path);
          } else {
            onSelect(node.name);
          }
        }}
        className={`flex items-center gap-2 py-1 px-2 cursor-pointer font-mono text-[0.85rem] transition-colors hover:bg-creamy-milk ${
          isSelected ? "bg-creamy-milk font-bold" : ""
        }`}
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        {/* Toggle arrow for folders */}
        {isFolder ? (
          <span className="text-[0.65rem] w-4 text-center select-none">
            {isExpanded ? "\u25BC" : "\u25B6"}
          </span>
        ) : (
          <span className="w-4" />
        )}

        {/* Icon */}
        <span className="text-base">
          {isFolder ? (isExpanded ? "\uD83D\uDCC2" : "\uD83D\uDCC1") : "\uD83D\uDCC4"}
        </span>

        {/* Name */}
        <span className={isFolder ? "font-medium" : "font-normal"}>
          {node.name}
        </span>
      </div>

      {/* Children */}
      {isFolder && isExpanded && node.children && (
        <ul className="list-none">
          {node.children.map((child) => (
            <TreeItem
              key={child.name}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              selectedFile={selectedFile}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/* ── Component ── */
export default function DirectoryTreePage() {
  const params = useParams();
  const projectId = String(params.id);
  const [tree, setTree] = useState<TreeNode[]>(FILE_TREE);
  const [fileContents, setFileContents] = useState<Record<string, string>>(FILE_CONTENTS);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(
    "Dashboard.tsx"
  );

  // Load directory tree from artifact API
  useEffect(() => {
    if (projectId.startsWith("mock-")) return;
    fetch(`/api/projects/${projectId}/artifacts/directory-tree/tree.plan.json`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.content) {
          if (Array.isArray(data.content.tree) && data.content.tree.length > 0) {
            setTree(data.content.tree);
          }
          if (data.content.fileContents && typeof data.content.fileContents === "object") {
            setFileContents((prev) => ({ ...prev, ...data.content.fileContents }));
          }
        }
      })
      .catch(() => {});
  }, [projectId]);

  const handleToggle = useCallback((path: string) => {
    setExpanded((prev) => ({
      ...prev,
      [path]: prev[path] === undefined ? false : !prev[path],
    }));
  }, []);

  const handleSelect = useCallback((name: string) => {
    setSelectedFile(name);
  }, []);

  const fileContent = selectedFile ? fileContents[selectedFile] : null;

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      {/* View header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="nb-view-title">DIRECTORY TREE</h1>
      </div>

      {/* Directory container: tree + preview */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
        {/* Tree panel */}
        <div className="nb-card max-h-[calc(100vh-260px)] overflow-y-auto">
          <h2 className="nb-card-title">FILE EXPLORER</h2>
          <ul className="list-none">
            {tree.map((node) => (
              <TreeItem
                key={node.name}
                node={node}
                depth={0}
                expanded={expanded}
                onToggle={handleToggle}
                onSelect={handleSelect}
                selectedFile={selectedFile}
              />
            ))}
          </ul>
        </div>

        {/* Preview panel */}
        <div className="nb-card lg:sticky lg:top-6">
          <h2 className="nb-card-title">
            {selectedFile ? selectedFile : "FILE PREVIEW"}
          </h2>
          {fileContent ? (
            <pre className="bg-signal-black text-malachite font-mono text-[0.8rem] p-4 border-[3px] border-signal-black overflow-x-auto leading-relaxed whitespace-pre-wrap">
              {fileContent}
            </pre>
          ) : (
            <p className="font-mono text-gray-mid text-[0.85rem] uppercase">
              Select a file to preview its contents
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
