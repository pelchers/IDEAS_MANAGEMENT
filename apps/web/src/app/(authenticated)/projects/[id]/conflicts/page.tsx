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
      <div className="nb-loading" style={{ height: "100vh" }}>
        Loading conflicts...
      </div>
    );
  }

  return (
    <div className="nb-page" style={{ height: "100vh", overflow: "hidden" }}>
      <header className="nb-header" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "4px solid var(--nb-black)",
        flexShrink: 0,
        backgroundColor: "var(--nb-cream)",
      }}>
        <div>
          <a href={`/projects/${projectId}`} style={{
            fontSize: "13px",
            color: "var(--nb-black)",
            textDecoration: "none",
            display: "block",
            marginBottom: "4px",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            textTransform: "uppercase",
          }}>
            &larr; Back to Project
          </a>
          <h1 style={{
            fontSize: "20px",
            fontWeight: 900,
            margin: 0,
            fontFamily: "var(--font-heading)",
            textTransform: "uppercase",
          }}>
            Conflict Resolver
          </h1>
        </div>
        <span className="nb-badge nb-badge-watermelon" style={{ fontSize: "14px" }}>
          {conflicts.length} conflict{conflicts.length !== 1 ? "s" : ""}
        </span>
      </header>

      {conflicts.length === 0 ? (
        <div className="nb-empty" style={{ margin: "60px auto", maxWidth: "400px", textAlign: "center" }}>
          <div style={{
            fontSize: "48px",
            marginBottom: "16px",
            lineHeight: 1,
          }}>
            &#x2705;
          </div>
          <p style={{
            fontSize: "16px",
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase",
            fontWeight: 700,
            textAlign: "center",
            margin: "0 0 8px",
          }}>
            No Conflicts
          </p>
          <p style={{
            fontSize: "13px",
            fontFamily: "var(--font-mono)",
            color: "var(--nb-gray-mid)",
            textAlign: "center",
            margin: 0,
          }}>
            All artifacts are in sync. Nothing to resolve.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Conflict List */}
          <div style={{
            width: "300px",
            borderRight: "4px solid var(--nb-black)",
            overflow: "auto",
            flexShrink: 0,
            backgroundColor: "var(--nb-white)",
          }}>
            {conflicts.map((c) => (
              <div
                key={c.id}
                className="nb-card"
                style={{
                  padding: "12px 16px",
                  borderBottom: "4px solid var(--nb-black)",
                  cursor: "pointer",
                  backgroundColor: selectedConflict?.id === c.id ? "var(--nb-lemon)" : "var(--nb-white)",
                  borderLeft: "none",
                  borderRight: "none",
                  borderTop: "none",
                  boxShadow: "none",
                }}
                onClick={() => {
                  setSelectedConflict(c);
                  setEditContent(formatJson(c.payload));
                }}
              >
                <div style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "var(--nb-black)",
                  wordBreak: "break-all",
                  fontFamily: "var(--font-mono)",
                }}>
                  {c.artifactPath}
                </div>
                <div style={{
                  fontSize: "11px",
                  color: "var(--nb-gray-dark)",
                  marginTop: "4px",
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                }}>
                  Base revision: {c.baseRevision} | Created:{" "}
                  {new Date(c.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Diff / Resolution View */}
          {selectedConflict && (
            <div style={{ flex: 1, overflow: "auto", padding: "20px" }}>
              <h3 style={{
                fontSize: "16px",
                fontWeight: 900,
                margin: "0 0 12px",
                fontFamily: "var(--font-heading)",
                textTransform: "uppercase",
              }}>
                Conflict: {selectedConflict.artifactPath}
              </h3>

              <div className="nb-grid-2" style={{ gap: "12px", marginBottom: "16px" }}>
                <div className="nb-card" style={{ padding: 0, overflow: "hidden" }}>
                  <h4 style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    margin: 0,
                    padding: "8px 12px",
                    backgroundColor: "var(--nb-malachite)",
                    borderBottom: "4px solid var(--nb-black)",
                    fontFamily: "var(--font-mono)",
                    textTransform: "uppercase",
                    color: "var(--nb-white)",
                  }}>
                    Local (Your Changes)
                  </h4>
                  <pre style={{
                    margin: 0,
                    padding: "12px",
                    fontSize: "12px",
                    fontFamily: "var(--font-mono)",
                    overflow: "auto",
                    maxHeight: "300px",
                    whiteSpace: "pre-wrap",
                    backgroundColor: "var(--nb-cream)",
                  }}>
                    {formatJson(selectedConflict.payload)}
                  </pre>
                </div>
                <div className="nb-card" style={{ padding: 0, overflow: "hidden" }}>
                  <h4 style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    margin: 0,
                    padding: "8px 12px",
                    backgroundColor: "var(--nb-cornflower)",
                    borderBottom: "4px solid var(--nb-black)",
                    fontFamily: "var(--font-mono)",
                    textTransform: "uppercase",
                    color: "var(--nb-white)",
                  }}>
                    Remote (Server)
                  </h4>
                  <pre style={{
                    margin: 0,
                    padding: "12px",
                    fontSize: "12px",
                    fontFamily: "var(--font-mono)",
                    overflow: "auto",
                    maxHeight: "300px",
                    whiteSpace: "pre-wrap",
                    backgroundColor: "var(--nb-cream)",
                  }}>
                    {formatJson(
                      getRemoteContent(selectedConflict.artifactPath)
                    )}
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="nb-flex" style={{ gap: "8px", marginBottom: "16px" }}>
                <button
                  className="nb-btn nb-btn-success"
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
                  className="nb-btn nb-btn-primary"
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
                  className="nb-btn nb-btn-accent"
                  onClick={() => {
                    // Already showing edit view since editContent is set
                  }}
                  disabled={resolving}
                >
                  Manual Edit
                </button>
              </div>

              {/* Manual Edit */}
              <div className="nb-divider" style={{ paddingTop: "16px" }}>
                <h4 style={{
                  fontSize: "13px",
                  fontWeight: 800,
                  margin: "0 0 8px",
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                }}>
                  Edit Merged Content (JSON)
                </h4>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="nb-input"
                  style={{
                    width: "100%",
                    minHeight: "200px",
                    fontFamily: "var(--font-mono)",
                    marginBottom: "8px",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                  spellCheck={false}
                />
                <button
                  className="nb-btn nb-btn-primary"
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
