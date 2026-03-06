"use client";

import { useState, useEffect, useCallback, use } from "react";

interface ConflictItem {
  id: string;
  operationId: string;
  artifactPath: string;
  baseRevision: number;
  payload: unknown;
  createdAt: string;
}

interface ArtifactState {
  artifactPath: string;
  content: unknown;
  revision: number;
}

export default function ConflictResolverPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [artifacts, setArtifacts] = useState<ArtifactState[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConflict, setSelectedConflict] = useState<ConflictItem | null>(
    null
  );
  const [editContent, setEditContent] = useState("");
  const [resolving, setResolving] = useState(false);

  const fetchConflicts = useCallback(async () => {
    try {
      const res = await fetch(`/api/sync/pull/${projectId}?since=0`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setConflicts(data.conflicts ?? []);
        setArtifacts(data.artifacts ?? []);
      }
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchConflicts();
  }, [fetchConflicts]);

  const getRemoteContent = (artifactPath: string): unknown => {
    const a = artifacts.find((x) => x.artifactPath === artifactPath);
    return a?.content ?? {};
  };

  const handleResolve = async (
    operationId: string,
    resolution: "keep-local" | "keep-remote" | "merged",
    mergedContent?: unknown
  ) => {
    setResolving(true);
    try {
      const body: Record<string, unknown> = { resolution };
      if (resolution === "merged" && mergedContent !== undefined) {
        body.mergedContent = mergedContent;
      }

      const res = await fetch(`/api/sync/resolve/${operationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSelectedConflict(null);
        setEditContent("");
        fetchConflicts();
      }
    } catch {
      // error
    } finally {
      setResolving(false);
    }
  };

  const handleManualMerge = () => {
    if (!selectedConflict) return;
    try {
      const parsed = JSON.parse(editContent);
      handleResolve(selectedConflict.operationId, "merged", parsed);
    } catch {
      alert("Invalid JSON. Please fix the content before saving.");
    }
  };

  const formatJson = (obj: unknown): string => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Loading conflicts...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <a href={`/projects/${projectId}`} style={styles.backLink}>
            &larr; Back to Project
          </a>
          <h1 style={styles.title}>Conflict Resolver</h1>
        </div>
        <span style={styles.conflictCount}>
          {conflicts.length} conflict{conflicts.length !== 1 ? "s" : ""}
        </span>
      </header>

      {conflicts.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>
            No conflicts found. All artifacts are in sync.
          </p>
        </div>
      ) : (
        <div style={styles.content}>
          {/* Conflict List */}
          <div style={styles.conflictList}>
            {conflicts.map((c) => (
              <div
                key={c.id}
                style={{
                  ...styles.conflictItem,
                  ...(selectedConflict?.id === c.id
                    ? styles.conflictItemActive
                    : {}),
                }}
                onClick={() => {
                  setSelectedConflict(c);
                  setEditContent(formatJson(c.payload));
                }}
              >
                <div style={styles.conflictPath}>{c.artifactPath}</div>
                <div style={styles.conflictMeta}>
                  Base revision: {c.baseRevision} | Created:{" "}
                  {new Date(c.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Diff / Resolution View */}
          {selectedConflict && (
            <div style={styles.diffView}>
              <h3 style={styles.diffTitle}>
                Conflict: {selectedConflict.artifactPath}
              </h3>

              <div style={styles.diffPanes}>
                <div style={styles.diffPane}>
                  <h4 style={styles.paneTitle}>Local (Your Changes)</h4>
                  <pre style={styles.codeBlock}>
                    {formatJson(selectedConflict.payload)}
                  </pre>
                </div>
                <div style={styles.diffPane}>
                  <h4 style={styles.paneTitle}>Remote (Server)</h4>
                  <pre style={styles.codeBlock}>
                    {formatJson(
                      getRemoteContent(selectedConflict.artifactPath)
                    )}
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={styles.actions}>
                <button
                  style={styles.actionBtn}
                  onClick={() =>
                    handleResolve(
                      selectedConflict.operationId,
                      "keep-local"
                    )
                  }
                  disabled={resolving}
                >
                  Keep Local
                </button>
                <button
                  style={styles.actionBtn}
                  onClick={() =>
                    handleResolve(
                      selectedConflict.operationId,
                      "keep-remote"
                    )
                  }
                  disabled={resolving}
                >
                  Keep Remote
                </button>
                <button
                  style={{ ...styles.actionBtn, ...styles.mergeBtn }}
                  onClick={() => {
                    // Already showing edit view since editContent is set
                  }}
                  disabled={resolving}
                >
                  Manual Edit
                </button>
              </div>

              {/* Manual Edit */}
              <div style={styles.editSection}>
                <h4 style={styles.paneTitle}>
                  Edit Merged Content (JSON)
                </h4>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  style={styles.editArea}
                  spellCheck={false}
                />
                <button
                  style={{ ...styles.actionBtn, ...styles.saveBtn }}
                  onClick={handleManualMerge}
                  disabled={resolving}
                >
                  {resolving ? "Resolving..." : "Save Merged Version"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid #e0e0e0",
    flexShrink: 0,
  },
  backLink: {
    fontSize: "13px",
    color: "#1a73e8",
    textDecoration: "none",
    display: "block",
    marginBottom: "4px",
  },
  title: {
    fontSize: "20px",
    fontWeight: 600,
    margin: 0,
  },
  conflictCount: {
    fontSize: "14px",
    color: "#d93025",
    fontWeight: 500,
  },
  content: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  conflictList: {
    width: "300px",
    borderRight: "1px solid #e0e0e0",
    overflow: "auto",
    flexShrink: 0,
  },
  conflictItem: {
    padding: "12px 16px",
    borderBottom: "1px solid #f1f3f4",
    cursor: "pointer",
    transition: "background-color 0.1s",
  },
  conflictItemActive: {
    backgroundColor: "#e8f4fd",
  },
  conflictPath: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#333",
    wordBreak: "break-all" as const,
  },
  conflictMeta: {
    fontSize: "11px",
    color: "#999",
    marginTop: "4px",
  },
  diffView: {
    flex: 1,
    overflow: "auto",
    padding: "20px",
  },
  diffTitle: {
    fontSize: "16px",
    fontWeight: 600,
    margin: "0 0 12px",
  },
  diffPanes: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "16px",
  },
  diffPane: {
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    overflow: "hidden",
  },
  paneTitle: {
    fontSize: "13px",
    fontWeight: 600,
    margin: 0,
    padding: "8px 12px",
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #e0e0e0",
  },
  codeBlock: {
    margin: 0,
    padding: "12px",
    fontSize: "12px",
    fontFamily: "var(--font-geist-mono), monospace",
    overflow: "auto",
    maxHeight: "300px",
    whiteSpace: "pre-wrap" as const,
    backgroundColor: "#fafafa",
  },
  actions: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
  },
  actionBtn: {
    padding: "8px 16px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
  },
  mergeBtn: {
    borderColor: "#1a73e8",
    color: "#1a73e8",
  },
  editSection: {
    borderTop: "1px solid #e0e0e0",
    paddingTop: "16px",
  },
  editArea: {
    width: "100%",
    minHeight: "200px",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "12px",
    fontFamily: "var(--font-geist-mono), monospace",
    marginBottom: "8px",
    resize: "vertical" as const,
    boxSizing: "border-box" as const,
  },
  saveBtn: {
    backgroundColor: "#1a73e8",
    color: "#fff",
    border: "none",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "60px 20px",
  },
  emptyText: {
    fontSize: "16px",
    color: "#888",
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  loadingText: {
    fontSize: "14px",
    color: "#888",
  },
};
