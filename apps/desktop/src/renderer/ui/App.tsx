import React, { useMemo, useState } from "react";

type Node = {
  name: string;
  path: string;
  isDir: boolean;
  children?: Node[];
  expanded?: boolean;
  loading?: boolean;
};

async function loadChildren(path: string) {
  const entries = await window.ideaApi.listDirectory(path);
  return entries
    .filter((e) => e.name !== ".git")
    .sort((a, b) => Number(b.isDir) - Number(a.isDir) || a.name.localeCompare(b.name))
    .map((e) => ({ ...e }));
}

export function App() {
  const [projectRoot, setProjectRoot] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [status, setStatus] = useState<string>("Not signed in (Phase 1 shell)");

  const header = useMemo(() => {
    return projectRoot ? `Project: ${projectRoot}` : "No project selected";
  }, [projectRoot]);

  async function onSelectProjectRoot() {
    const dir = await window.ideaApi.selectDirectory();
    if (!dir) return;

    setProjectRoot(dir);
    setStatus("Local project root selected");

    const top = await loadChildren(dir);
    setNodes(top);

    // Stub sync op write to prove plumbing.
    await window.ideaApi.appendSyncOp(dir, {
      type: "select_project_root",
      projectRoot: dir
    });
  }

  async function toggleNode(n: Node, idxPath: number[]) {
    if (!n.isDir) return;

    // Update by path for stable state.
    const clone = structuredClone(nodes) as Node[];

    let cur: any = { children: clone };
    for (const i of idxPath) {
      cur = cur.children[i];
    }

    cur.expanded = !cur.expanded;
    if (cur.expanded && !cur.children) {
      cur.loading = true;
      setNodes(clone);
      const kids = await loadChildren(cur.path);
      cur.children = kids;
      cur.loading = false;
    }

    setNodes(clone);
  }

  function renderTree(list: Node[], prefix: number[] = []) {
    return (
      <ul className="tree">
        {list.map((n, i) => {
          const idxPath = [...prefix, i];
          return (
            <li key={n.path}>
              <button
                className={n.isDir ? "node dir" : "node file"}
                onClick={() => toggleNode(n, idxPath)}
                disabled={!n.isDir}
                title={n.path}
              >
                {n.isDir ? (n.expanded ? "▾" : "▸") : "·"} {n.name}
              </button>
              {n.loading ? <div className="loading">Loading...</div> : null}
              {n.expanded && n.children ? renderTree(n.children, idxPath) : null}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="layout">
      <header className="topbar">
        <div className="title">Idea Management Desktop</div>
        <div className="meta">{status}</div>
      </header>

      <div className="content">
        <aside className="sidebar">
          <div className="section">
            <div className="sectionTitle">Auth Shell</div>
            <div className="muted">Phase 2 will implement real auth.</div>
          </div>

          <div className="section">
            <div className="sectionTitle">Project Root</div>
            <button className="primary" onClick={onSelectProjectRoot}>
              Select Project Folder
            </button>
            <div className="muted">{header}</div>
          </div>
        </aside>

        <main className="main">
          <div className="panelTitle">Filesystem Tree (Phase 1 spine)</div>
          {projectRoot ? renderTree(nodes) : <div className="muted">Select a folder to view its structure.</div>}
        </main>
      </div>
    </div>
  );
}
