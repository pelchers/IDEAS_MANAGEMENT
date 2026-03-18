"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

/* ══════════════════════════════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════════════════════════════ */

interface TreeNode {
  id: string;
  name: string;
  type: "folder" | "file";
  children?: TreeNode[];
}

interface DirectoryTreeData {
  tree: TreeNode[];
  fileContents: Record<string, string>;
  source?: { type: "manual" | "github" | "local"; githubRepo?: string; importedAt?: string };
}

type ModalMode = null | "import" | "export" | "addNode";
type ImportTab = "github" | "local" | "manual";

/* ══════════════════════════════════════════════════════════════════════
   Utilities
   ══════════════════════════════════════════════════════════════════════ */

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function ensureIds(nodes: TreeNode[]): TreeNode[] {
  return nodes.map((n) => ({
    ...n,
    id: n.id || uid(),
    children: n.children ? ensureIds(n.children) : undefined,
  }));
}

/* ── GitHub API ── */

interface GhTreeItem { path: string; type: string }

async function fetchGhTree(repo: string): Promise<GhTreeItem[]> {
  const res = await fetch(`https://api.github.com/repos/${repo}/git/trees/HEAD?recursive=1`);
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  return data.tree || [];
}

async function fetchGhFileContent(repo: string, path: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`);
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  if (data.encoding === "base64" && data.content) {
    return atob(data.content.replace(/\n/g, ""));
  }
  return data.content || "";
}

function ghTreeToNested(items: GhTreeItem[]): TreeNode[] {
  const root: TreeNode[] = [];
  const folderMap = new Map<string, TreeNode>();

  // Sort so folders come before files at same level
  const sorted = [...items].sort((a, b) => {
    if (a.type !== b.type) return a.type === "tree" ? -1 : 1;
    return a.path.localeCompare(b.path);
  });

  for (const item of sorted) {
    const parts = item.path.split("/");
    const name = parts[parts.length - 1];
    const isFolder = item.type === "tree";
    const node: TreeNode = { id: uid(), name, type: isFolder ? "folder" : "file", ...(isFolder ? { children: [] } : {}) };

    if (parts.length === 1) {
      root.push(node);
    } else {
      const parentPath = parts.slice(0, -1).join("/");
      const parent = folderMap.get(parentPath);
      if (parent && parent.children) {
        parent.children.push(node);
      }
    }

    if (isFolder) {
      folderMap.set(item.path, node);
    }
  }

  return root;
}

/* ── Parse pasted tree text ── */

function parseTreeText(text: string): TreeNode[] {
  const lines = text.split("\n").filter((l) => l.trim());
  const root: TreeNode[] = [];
  const stack: { node: TreeNode; depth: number }[] = [];

  for (const line of lines) {
    // Strip tree-drawing characters
    const cleaned = line.replace(/[│├└─┬┼┤┘┐┌┏┓┗┛┃┠┨┯┷╋║═╔╗╚╝╠╣╦╩]/g, "").replace(/\|/g, "");
    const stripped = cleaned.replace(/^\s+/, "");
    const indent = cleaned.length - stripped.length;
    const depth = Math.floor(indent / 2) || 0;
    const name = stripped.trim();
    if (!name) continue;

    const isFolder = name.endsWith("/") || (!name.includes(".") && !name.startsWith("."));
    const cleanName = name.replace(/\/$/, "");
    const node: TreeNode = { id: uid(), name: cleanName, type: isFolder ? "folder" : "file", ...(isFolder ? { children: [] } : {}) };

    // Pop stack to find parent
    while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(node);
    } else {
      const parent = stack[stack.length - 1].node;
      if (parent.children) parent.children.push(node);
    }

    if (isFolder) {
      stack.push({ node, depth });
    }
  }

  return root;
}

/* ── Export generators ── */

function exportTextTree(nodes: TreeNode[], prefix = ""): string {
  let result = "";
  nodes.forEach((node, i) => {
    const isLast = i === nodes.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const suffix = node.type === "folder" ? "/" : "";
    result += `${prefix}${connector}${node.name}${suffix}\n`;
    if (node.children && node.children.length > 0) {
      const childPrefix = prefix + (isLast ? "    " : "│   ");
      result += exportTextTree(node.children, childPrefix);
    }
  });
  return result;
}

function exportMarkdown(nodes: TreeNode[], depth = 0): string {
  let result = "";
  const indent = "  ".repeat(depth);
  for (const node of nodes) {
    if (node.type === "folder") {
      result += `${indent}- **${node.name}/**\n`;
      if (node.children) result += exportMarkdown(node.children, depth + 1);
    } else {
      result += `${indent}- ${node.name}\n`;
    }
  }
  return result;
}

function exportJson(data: DirectoryTreeData): string {
  return JSON.stringify(data, null, 2);
}

/* ── Tree manipulation helpers ── */

function addNodeToTree(nodes: TreeNode[], parentId: string | null, newNode: TreeNode): TreeNode[] {
  if (!parentId) return [...nodes, newNode];
  return nodes.map((n) => {
    if (n.id === parentId && n.type === "folder") {
      return { ...n, children: [...(n.children || []), newNode] };
    }
    if (n.children) {
      return { ...n, children: addNodeToTree(n.children, parentId, newNode) };
    }
    return n;
  });
}

function removeNodeFromTree(nodes: TreeNode[], nodeId: string): TreeNode[] {
  return nodes.filter((n) => n.id !== nodeId).map((n) => {
    if (n.children) return { ...n, children: removeNodeFromTree(n.children, nodeId) };
    return n;
  });
}

function renameNodeInTree(nodes: TreeNode[], nodeId: string, newName: string): TreeNode[] {
  return nodes.map((n) => {
    if (n.id === nodeId) return { ...n, name: newName };
    if (n.children) return { ...n, children: renameNodeInTree(n.children, nodeId, newName) };
    return n;
  });
}

function collectFolders(nodes: TreeNode[], path = ""): { id: string; path: string }[] {
  const result: { id: string; path: string }[] = [];
  for (const n of nodes) {
    if (n.type === "folder") {
      const p = path ? `${path}/${n.name}` : n.name;
      result.push({ id: n.id, path: p });
      if (n.children) result.push(...collectFolders(n.children, p));
    }
  }
  return result;
}

/* ══════════════════════════════════════════════════════════════════════
   TreeItem Component
   ══════════════════════════════════════════════════════════════════════ */

function TreeItem({
  node, depth, expanded, onToggle, onSelect, selectedFile, hoverNodeId, setHoverNodeId,
  onRename, onDelete, onAddChild,
}: {
  node: TreeNode; depth: number;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  onSelect: (name: string) => void;
  selectedFile: string | null;
  hoverNodeId: string | null;
  setHoverNodeId: (id: string | null) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
}) {
  const isFolder = node.type === "folder";
  const isExpanded = expanded[node.id] !== false;
  const isSelected = !isFolder && selectedFile === node.name;
  const isHover = hoverNodeId === node.id;
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);

  return (
    <li>
      <div
        onClick={() => { if (isFolder) onToggle(node.id); else onSelect(node.name); }}
        onMouseEnter={() => setHoverNodeId(node.id)}
        onMouseLeave={() => setHoverNodeId(null)}
        className={`flex items-center gap-2 py-1 px-2 cursor-pointer font-mono text-[0.85rem] transition-colors hover:bg-creamy-milk ${isSelected ? "bg-creamy-milk font-bold" : ""}`}
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        {isFolder ? (
          <span className="text-[0.65rem] w-4 text-center select-none">{isExpanded ? "\u25BC" : "\u25B6"}</span>
        ) : (
          <span className="w-4" />
        )}
        <span className="text-base">{isFolder ? (isExpanded ? "\uD83D\uDCC2" : "\uD83D\uDCC1") : "\uD83D\uDCC4"}</span>
        {editing ? (
          <input
            className="nb-input text-[0.85rem] py-0 px-1 flex-1"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { onRename(node.id, editName); setEditing(false); }
              if (e.key === "Escape") { setEditName(node.name); setEditing(false); }
            }}
            onBlur={() => { onRename(node.id, editName); setEditing(false); }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <span className={isFolder ? "font-medium" : "font-normal"}>{node.name}</span>
        )}
        {isHover && !editing && (
          <div className="flex gap-1 ml-auto" onClick={(e) => e.stopPropagation()}>
            {isFolder && (
              <button onClick={() => onAddChild(node.id)} className="text-[0.6rem] px-1 bg-malachite/20 border border-signal-black cursor-pointer font-bold" title="Add child">+</button>
            )}
            <button onClick={() => { setEditName(node.name); setEditing(true); }} className="text-[0.6rem] px-1 bg-creamy-milk border border-signal-black cursor-pointer font-bold" title="Rename">R</button>
            <button onClick={() => onDelete(node.id)} className="text-[0.6rem] px-1 bg-watermelon text-white border border-signal-black cursor-pointer font-bold" title="Delete">X</button>
          </div>
        )}
      </div>
      {isFolder && isExpanded && node.children && (
        <ul className="list-none">
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              selectedFile={selectedFile}
              hoverNodeId={hoverNodeId}
              setHoverNodeId={setHoverNodeId}
              onRename={onRename}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════════════════════════════ */

export default function DirectoryTreePage() {
  const params = useParams();
  const projectId = String(params.id);

  // ── State ──
  const [data, setData] = useState<DirectoryTreeData>({ tree: [], fileContents: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);

  // ── Modal state ──
  const [modal, setModal] = useState<ModalMode>(null);
  const [importTab, setImportTab] = useState<ImportTab>("github");
  const [ghRepoInput, setGhRepoInput] = useState("");
  const [ghLoading, setGhLoading] = useState(false);
  const [ghError, setGhError] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const [pastedTree, setPastedTree] = useState("");

  // ── Add node state ──
  const [addParentId, setAddParentId] = useState<string | null>(null);
  const [addNodeName, setAddNodeName] = useState("");
  const [addNodeType, setAddNodeType] = useState<"folder" | "file">("file");

  // ── Export state ──
  const [exportFormat, setExportFormat] = useState<"text" | "json" | "markdown">("text");
  const [exportContent, setExportContent] = useState("");

  // ── GitHub lazy-load tracking ──
  const [ghRepo, setGhRepo] = useState<string | null>(null);

  /* ── Load from artifact API ── */
  useEffect(() => {
    fetch(`/api/projects/${projectId}/artifacts/directory-tree/tree.plan.json`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.artifact?.content) {
          const c = d.artifact.content;
          setData({
            tree: ensureIds(c.tree || []),
            fileContents: c.fileContents || {},
            source: c.source,
          });
          if (c.source?.githubRepo) setGhRepo(c.source.githubRepo);
        }
        // Old shape fallback
        if (d.ok && d.content) {
          setData({
            tree: ensureIds(d.content.tree || []),
            fileContents: d.content.fileContents || {},
            source: d.content.source,
          });
          if (d.content.source?.githubRepo) setGhRepo(d.content.source.githubRepo);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  /* ── Auto-save ── */
  const saveData = useCallback((d: DirectoryTreeData) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch(`/api/projects/${projectId}/artifacts/directory-tree/tree.plan.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: d }),
        });
      } catch { /* silent */ }
      setSaving(false);
    }, 800);
  }, [projectId]);

  const updateData = useCallback((updater: (prev: DirectoryTreeData) => DirectoryTreeData) => {
    setData((prev) => {
      const next = updater(prev);
      saveData(next);
      return next;
    });
  }, [saveData]);

  /* ── Tree operations ── */
  const handleToggle = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: prev[id] === undefined ? false : !prev[id] }));
  }, []);

  const handleSelect = useCallback(async (name: string) => {
    setSelectedFile(name);
    // Lazy-load from GitHub if no local content
    if (!data.fileContents[name] && ghRepo) {
      try {
        // Find file path in tree
        const findPath = (nodes: TreeNode[], prefix: string): string | null => {
          for (const n of nodes) {
            const p = prefix ? `${prefix}/${n.name}` : n.name;
            if (n.type === "file" && n.name === name) return p;
            if (n.children) {
              const found = findPath(n.children, p);
              if (found) return found;
            }
          }
          return null;
        };
        const path = findPath(data.tree, "");
        if (path) {
          const content = await fetchGhFileContent(ghRepo, path);
          setData((prev) => ({ ...prev, fileContents: { ...prev.fileContents, [name]: content } }));
        }
      } catch { /* silent */ }
    }
  }, [data.fileContents, data.tree, ghRepo]);

  const handleRename = useCallback((id: string, newName: string) => {
    if (!newName.trim()) return;
    updateData((d) => ({ ...d, tree: renameNodeInTree(d.tree, id, newName.trim()) }));
  }, [updateData]);

  const handleDelete = useCallback((id: string) => {
    updateData((d) => ({ ...d, tree: removeNodeFromTree(d.tree, id) }));
  }, [updateData]);

  const handleAddNode = () => {
    if (!addNodeName.trim()) return;
    const newNode: TreeNode = { id: uid(), name: addNodeName.trim(), type: addNodeType, ...(addNodeType === "folder" ? { children: [] } : {}) };
    updateData((d) => ({ ...d, tree: addNodeToTree(d.tree, addParentId, newNode) }));
    setAddNodeName("");
    setModal(null);
  };

  const openAddChild = (parentId: string) => {
    setAddParentId(parentId);
    setAddNodeName("");
    setAddNodeType("file");
    setModal("addNode");
  };

  const openAddRoot = () => {
    setAddParentId(null);
    setAddNodeName("");
    setAddNodeType("folder");
    setModal("addNode");
  };

  /* ── GitHub import ── */
  const handleGhImport = async () => {
    const repo = ghRepoInput.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "").replace(/\.git$/, "");
    if (!repo || !repo.includes("/")) { setGhError("Enter owner/repo (e.g. facebook/react)"); return; }
    setGhLoading(true); setGhError(""); setImportMsg("");
    try {
      const rawTree = await fetchGhTree(repo);
      const nested = ghTreeToNested(rawTree);
      if (nested.length === 0) { setGhError("Repository tree is empty."); setGhLoading(false); return; }
      updateData(() => ({
        tree: ensureIds(nested),
        fileContents: {},
        source: { type: "github", githubRepo: repo, importedAt: new Date().toISOString() },
      }));
      setGhRepo(repo);
      setImportMsg(`Imported ${rawTree.length} items from ${repo}`);
    } catch (err) {
      setGhError(err instanceof Error ? err.message : "Import failed");
    }
    setGhLoading(false);
  };

  /* ── Local file import ── */
  const handleLocalFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setImportMsg("");
    const tree: TreeNode[] = [];
    const contents: Record<string, string> = {};
    const folderMap = new Map<string, TreeNode>();
    let processed = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = file.webkitRelativePath || file.name;
      const parts = path.split("/");

      // Build folder structure
      let currentList = tree;
      for (let j = 0; j < parts.length - 1; j++) {
        const folderPath = parts.slice(0, j + 1).join("/");
        let folder = folderMap.get(folderPath);
        if (!folder) {
          folder = { id: uid(), name: parts[j], type: "folder", children: [] };
          folderMap.set(folderPath, folder);
          currentList.push(folder);
        }
        currentList = folder.children!;
      }

      const fileName = parts[parts.length - 1];
      currentList.push({ id: uid(), name: fileName, type: "file" });

      // Read content
      const reader = new FileReader();
      reader.onload = () => {
        contents[fileName] = reader.result as string;
        processed++;
        if (processed === files.length) {
          updateData(() => ({
            tree: tree.length > 0 ? tree : ensureIds([{ id: uid(), name: "uploaded", type: "folder", children: tree }]),
            fileContents: contents,
            source: { type: "local", importedAt: new Date().toISOString() },
          }));
          setImportMsg(`Imported ${files.length} files.`);
        }
      };
      reader.readAsText(file);
    }
  };

  /* ── Pasted tree import ── */
  const handlePastedTreeImport = () => {
    if (!pastedTree.trim()) return;
    const parsed = parseTreeText(pastedTree);
    if (parsed.length === 0) { setGhError("Could not parse tree text."); return; }
    updateData(() => ({
      tree: parsed,
      fileContents: {},
      source: { type: "local", importedAt: new Date().toISOString() },
    }));
    setImportMsg(`Parsed ${parsed.length} root items from pasted text.`);
    setPastedTree("");
  };

  /* ── Export ── */
  const openExport = (fmt: "text" | "json" | "markdown") => {
    setExportFormat(fmt);
    if (fmt === "text") setExportContent(exportTextTree(data.tree));
    else if (fmt === "markdown") setExportContent(exportMarkdown(data.tree));
    else setExportContent(exportJson(data));
    setModal("export");
  };

  const copyExport = () => { navigator.clipboard.writeText(exportContent); };

  const downloadExport = () => {
    const ext = exportFormat === "text" ? "txt" : exportFormat === "markdown" ? "md" : "json";
    const blob = new Blob([exportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `directory-tree.${ext}`; a.click();
    URL.revokeObjectURL(url);
  };

  const fileContent = selectedFile ? data.fileContents[selectedFile] : null;
  const folders = collectFolders(data.tree);

  /* ── Render ── */
  if (loading) {
    return (
      <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
        <h1 className="nb-view-title">DIRECTORY TREE</h1>
        <div className="nb-card p-8 text-center font-mono text-[0.85rem] uppercase mt-6">Loading...</div>
      </div>
    );
  }

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      {/* View header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="nb-view-title">DIRECTORY TREE</h1>
          {saving && <span className="font-mono text-[0.7rem] text-[#999] uppercase">Saving...</span>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="nb-btn" onClick={() => { setImportTab("github"); setGhError(""); setImportMsg(""); setModal("import"); }}>IMPORT</button>
          <div className="flex gap-1">
            <button className="nb-btn" onClick={() => openExport("text")}>TXT</button>
            <button className="nb-btn" onClick={() => openExport("markdown")}>MD</button>
            <button className="nb-btn" onClick={() => openExport("json")}>JSON</button>
          </div>
          <button className="nb-btn nb-btn--primary" onClick={openAddRoot}>+ ADD</button>
        </div>
      </div>

      {/* Source badge */}
      {data.source && (
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 border-2 border-signal-black bg-white font-mono text-[0.7rem] uppercase">
          SOURCE: {data.source.type === "github" ? `GITHUB (${data.source.githubRepo})` : data.source.type.toUpperCase()}
          {data.source.importedAt && <span className="text-[#999]">@ {new Date(data.source.importedAt).toLocaleDateString()}</span>}
        </div>
      )}

      {/* Empty state */}
      {data.tree.length === 0 && (
        <div className="nb-card p-12 text-center">
          <div className="font-mono text-[2rem] mb-4">[ ]</div>
          <div className="font-mono text-[0.9rem] uppercase text-[#999] mb-6">No directory tree yet. Create one or import from GitHub / local files.</div>
          <div className="flex gap-3 justify-center flex-wrap">
            <button className="nb-btn nb-btn--primary" onClick={openAddRoot}>+ ADD ROOT FOLDER</button>
            <button className="nb-btn" onClick={() => { setImportTab("github"); setModal("import"); }}>IMPORT</button>
          </div>
        </div>
      )}

      {/* Directory container: tree + preview */}
      {data.tree.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
          {/* Tree panel */}
          <div className="nb-card max-h-[calc(100vh-260px)] overflow-y-auto">
            <h2 className="nb-card-title">FILE EXPLORER</h2>
            <ul className="list-none">
              {data.tree.map((node) => (
                <TreeItem
                  key={node.id}
                  node={node}
                  depth={0}
                  expanded={expanded}
                  onToggle={handleToggle}
                  onSelect={handleSelect}
                  selectedFile={selectedFile}
                  hoverNodeId={hoverNodeId}
                  setHoverNodeId={setHoverNodeId}
                  onRename={handleRename}
                  onDelete={handleDelete}
                  onAddChild={openAddChild}
                />
              ))}
            </ul>
          </div>

          {/* Preview panel */}
          <div className="nb-card lg:sticky lg:top-6">
            <h2 className="nb-card-title">{selectedFile || "FILE PREVIEW"}</h2>
            {fileContent ? (
              <pre className="bg-signal-black text-malachite font-mono text-[0.8rem] p-4 border-[3px] border-signal-black overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {fileContent}
              </pre>
            ) : selectedFile && ghRepo ? (
              <p className="font-mono text-gray-mid text-[0.85rem] uppercase">Loading content from GitHub...</p>
            ) : (
              <p className="font-mono text-gray-mid text-[0.85rem] uppercase">Select a file to preview its contents</p>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODALS
          ══════════════════════════════════════════════════ */}
      {modal && (
        <div
          onClick={() => setModal(null)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "#FFFFFF", border: "4px solid #282828", boxShadow: "8px 8px 0px #282828", padding: "24px", width: "90%", maxWidth: "600px", maxHeight: "85vh", overflow: "auto" }}
          >
            {/* ── Add Node ── */}
            {modal === "addNode" && (
              <>
                <h2 className="font-bold text-[1.1rem] uppercase tracking-wider mb-4">
                  {addParentId ? "ADD CHILD" : "ADD ROOT ITEM"}
                </h2>
                <form onSubmit={(e) => { e.preventDefault(); handleAddNode(); }} className="flex flex-col gap-4">
                  <div>
                    <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">NAME</label>
                    <input className="nb-input w-full" value={addNodeName} onChange={(e) => setAddNodeName(e.target.value)} placeholder="e.g. src or index.ts" autoFocus />
                  </div>
                  <div>
                    <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">TYPE</label>
                    <select className="nb-input w-full" value={addNodeType} onChange={(e) => setAddNodeType(e.target.value as "folder" | "file")}>
                      <option value="folder">FOLDER</option>
                      <option value="file">FILE</option>
                    </select>
                  </div>
                  {addParentId === null && folders.length > 0 && (
                    <div>
                      <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">PARENT (OPTIONAL)</label>
                      <select className="nb-input w-full" value={addParentId || ""} onChange={(e) => setAddParentId(e.target.value || null)}>
                        <option value="">ROOT LEVEL</option>
                        {folders.map((f) => <option key={f.id} value={f.id}>{f.path}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button type="submit" className="nb-btn nb-btn--primary">CREATE</button>
                    <button type="button" className="nb-btn" onClick={() => setModal(null)}>CANCEL</button>
                  </div>
                </form>
              </>
            )}

            {/* ── Import Modal ── */}
            {modal === "import" && (
              <>
                <h2 className="font-bold text-[1.1rem] uppercase tracking-wider mb-4">IMPORT DIRECTORY TREE</h2>

                {/* Tab bar */}
                <div className="flex gap-0 mb-4 border-b-4 border-signal-black">
                  {(["github", "local", "manual"] as ImportTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => { setImportTab(tab); setGhError(""); setImportMsg(""); }}
                      className={`px-4 py-2 font-bold text-[0.85rem] uppercase tracking-wider border-2 border-signal-black border-b-0 cursor-pointer transition-colors ${
                        importTab === tab ? "bg-signal-black text-creamy-milk" : "bg-white text-signal-black hover:bg-gray-100"
                      }`}
                    >
                      {tab === "github" ? "GITHUB REPO" : tab === "local" ? "LOCAL FILES" : "PASTE TREE"}
                    </button>
                  ))}
                </div>

                {importMsg && <div className="p-3 border-2 border-signal-black font-mono text-[0.85rem] bg-malachite/20 text-malachite mb-4">{importMsg}</div>}
                {ghError && <div className="p-3 border-2 border-signal-black font-mono text-[0.85rem] bg-watermelon/20 text-watermelon mb-4">{ghError}</div>}

                {/* GitHub tab */}
                {importTab === "github" && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">REPOSITORY (owner/repo)</label>
                      <div className="flex gap-2">
                        <input
                          className="nb-input flex-1"
                          value={ghRepoInput}
                          onChange={(e) => setGhRepoInput(e.target.value)}
                          placeholder="e.g. facebook/react or full GitHub URL"
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleGhImport(); } }}
                        />
                        <button className="nb-btn nb-btn--primary" onClick={handleGhImport} disabled={ghLoading}>
                          {ghLoading ? "..." : "IMPORT"}
                        </button>
                      </div>
                    </div>
                    <p className="font-mono text-[0.7rem] text-[#999]">Fetches full repository tree. File contents loaded on click. Public repos only.</p>
                  </div>
                )}

                {/* Local tab */}
                {importTab === "local" && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">UPLOAD FOLDER OR FILES</label>
                      <p className="font-mono text-[0.75rem] text-[#999] mb-2">Select a folder to import its structure and file contents.</p>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleLocalFiles(e.target.files)}
                        className="nb-input w-full cursor-pointer"
                        {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
                      />
                    </div>
                  </div>
                )}

                {/* Manual / Paste tab */}
                {importTab === "manual" && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">PASTE TREE TEXT</label>
                      <p className="font-mono text-[0.75rem] text-[#999] mb-2">Paste output from `tree` command or indented text. Folders end with / or have no extension.</p>
                      <textarea
                        className="nb-input nb-textarea w-full font-mono text-[0.8rem]"
                        rows={12}
                        value={pastedTree}
                        onChange={(e) => setPastedTree(e.target.value)}
                        placeholder={"src/\n  components/\n    Dashboard.tsx\n    Kanban.tsx\n  hooks/\n    useProjects.ts\npackage.json\nREADME.md"}
                      />
                    </div>
                    <button className="nb-btn nb-btn--primary self-start" onClick={handlePastedTreeImport} disabled={!pastedTree.trim()}>
                      PARSE & IMPORT
                    </button>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button className="nb-btn" onClick={() => setModal(null)}>CLOSE</button>
                </div>
              </>
            )}

            {/* ── Export Modal ── */}
            {modal === "export" && (
              <>
                <h2 className="font-bold text-[1.1rem] uppercase tracking-wider mb-4">
                  EXPORT — {exportFormat === "text" ? "TEXT TREE" : exportFormat === "markdown" ? "MARKDOWN" : "JSON"}
                </h2>
                <pre className="bg-[#1a1a1a] text-[#e8e0d5] p-4 border-2 border-signal-black font-mono text-[0.8rem] overflow-auto max-h-[400px] whitespace-pre-wrap">{exportContent}</pre>
                <div className="flex gap-3 mt-4">
                  <button className="nb-btn nb-btn--primary" onClick={copyExport}>COPY TO CLIPBOARD</button>
                  <button className="nb-btn" onClick={downloadExport}>DOWNLOAD .{exportFormat === "text" ? "txt" : exportFormat === "markdown" ? "md" : "json"}</button>
                  <button className="nb-btn" onClick={() => setModal(null)}>CLOSE</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
