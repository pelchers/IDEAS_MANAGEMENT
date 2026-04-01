"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

/* ── Types ── */
interface ConflictOp {
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
  updatedAt: string;
}

type ResolveMode = "idle" | "merge";

/* ── Helpers ── */
function prettyJson(val: unknown): string {
  if (typeof val === "string") return val;
  try {
    return JSON.stringify(val, null, 2);
  } catch {
    return String(val);
  }
}

function timeSince(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/* ── Main Component ── */
export default function ConflictsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params.id;

  const [conflicts, setConflicts] = useState<ConflictOp[]>([]);
  const [artifacts, setArtifacts] = useState<ArtifactState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track which conflict is in "merge" mode
  const [mergeState, setMergeState] = useState<Record<string, ResolveMode>>({});
  const [mergeContent, setMergeContent] = useState<Record<string, string>>({});
  const [resolving, setResolving] = useState<Record<string, boolean>>({});

  /* ── Fetch conflicts ── */
  const fetchConflicts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sync/pull/${projectId}?since=0`);
      if (!res.ok) {
        setError(`Failed to fetch: ${res.status}`);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Unknown error");
        setLoading(false);
        return;
      }
      setConflicts(data.conflicts ?? []);
      setArtifacts(data.artifacts ?? []);
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchConflicts();
  }, [fetchConflicts]);

  /* ── Resolve a conflict ── */
  const resolve = useCallback(
    async (operationId: string, resolution: "keep-local" | "keep-remote" | "merged", merged?: string) => {
      setResolving((prev) => ({ ...prev, [operationId]: true }));
      try {
        const body: Record<string, unknown> = { resolution };
        if (resolution === "merged" && merged !== undefined) {
          // Try to parse as JSON; fall back to string
          try {
            body.mergedContent = JSON.parse(merged);
          } catch {
            body.mergedContent = merged;
          }
        }
        const res = await fetch(`/api/sync/resolve/${operationId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert(`Resolve failed: ${data.error || res.status}`);
          return;
        }
        // Remove from local list
        setConflicts((prev) => prev.filter((c) => c.operationId !== operationId));
        setMergeState((prev) => {
          const next = { ...prev };
          delete next[operationId];
          return next;
        });
      } finally {
        setResolving((prev) => ({ ...prev, [operationId]: false }));
      }
    },
    []
  );

  /* ── Lookup current artifact content ── */
  function getRemoteContent(artifactPath: string): string {
    const art = artifacts.find((a) => a.artifactPath === artifactPath);
    return art ? prettyJson(art.content) : "(no remote content)";
  }

  function getRemoteRevision(artifactPath: string): number {
    const art = artifacts.find((a) => a.artifactPath === artifactPath);
    return art?.revision ?? 0;
  }

  /* ── Render ── */
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <h1
          style={{
            fontWeight: 900,
            fontSize: "1.8rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            margin: 0,
          }}
        >
          Sync Conflicts
        </h1>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={fetchConflicts} disabled={loading} style={btnSecondary}>
            {loading ? "LOADING..." : "REFRESH"}
          </button>
          <Link href={`/projects/${projectId}`} style={{ textDecoration: "none" }}>
            <button style={btnSecondary}>BACK TO WORKSPACE</button>
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={errorBanner}>
          <span style={{ fontWeight: 700 }}>ERROR:</span> {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && conflicts.length === 0 && (
        <div
          style={{
            border: "4px solid #282828",
            boxShadow: "6px 6px 0px #282828",
            padding: "48px 32px",
            textAlign: "center",
            backgroundColor: "#D5F5E3",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>&#10003;</div>
          <h2 style={{ fontWeight: 800, fontSize: "1.3rem", textTransform: "uppercase", margin: "0 0 8px" }}>
            No Conflicts
          </h2>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.85rem", color: "#444", margin: 0 }}>
            All sync operations for this project are clean.
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && conflicts.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                border: "4px solid #282828",
                boxShadow: "6px 6px 0px #282828",
                padding: "24px",
                backgroundColor: "#F8F3EC",
                opacity: 0.5,
                height: "120px",
              }}
            />
          ))}
        </div>
      )}

      {/* Conflict cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {conflicts.map((conflict) => {
          const localContent = prettyJson(conflict.payload);
          const remoteContent = getRemoteContent(conflict.artifactPath);
          const remoteRev = getRemoteRevision(conflict.artifactPath);
          const isMerging = mergeState[conflict.operationId] === "merge";
          const isResolving = resolving[conflict.operationId];

          return (
            <div
              key={conflict.operationId}
              style={{
                border: "4px solid #282828",
                boxShadow: "6px 6px 0px #282828",
                backgroundColor: "#FFFFFF",
              }}
            >
              {/* Card header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderBottom: "4px solid #282828",
                  backgroundColor: "#FADBD8",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: "12px",
                      height: "12px",
                      backgroundColor: "#C0392B",
                      border: "2px solid #282828",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {conflict.artifactPath}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "0.7rem",
                    color: "#666",
                    flexShrink: 0,
                  }}
                >
                  <span>BASE REV: {conflict.baseRevision}</span>
                  <span>|</span>
                  <span>REMOTE REV: {remoteRev}</span>
                  <span>|</span>
                  <span>{timeSince(conflict.createdAt)}</span>
                </div>
              </div>

              {/* Diff view */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  borderBottom: "4px solid #282828",
                }}
              >
                {/* Local (your changes) */}
                <div style={{ borderRight: "2px solid #282828" }}>
                  <div style={diffHeader("#FFE459", "#282828")}>
                    LOCAL (YOUR CHANGES)
                  </div>
                  <pre style={diffPre}>{localContent}</pre>
                </div>

                {/* Remote (server) */}
                <div style={{ borderLeft: "2px solid #282828" }}>
                  <div style={diffHeader("#3498DB", "#FFFFFF")}>
                    REMOTE (SERVER)
                  </div>
                  <pre style={diffPre}>{remoteContent}</pre>
                </div>
              </div>

              {/* Manual merge area */}
              {isMerging && (
                <div style={{ borderBottom: "4px solid #282828", padding: "16px 20px", backgroundColor: "#F8F3EC" }}>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      marginBottom: "8px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Manual Merge — edit below then submit
                  </div>
                  <textarea
                    style={{
                      width: "100%",
                      minHeight: "200px",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "0.8rem",
                      padding: "12px",
                      border: "3px solid #282828",
                      boxShadow: "3px 3px 0px #282828",
                      backgroundColor: "#FFFFFF",
                      color: "#282828",
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                    value={mergeContent[conflict.operationId] ?? localContent}
                    onChange={(e) =>
                      setMergeContent((prev) => ({
                        ...prev,
                        [conflict.operationId]: e.target.value,
                      }))
                    }
                  />
                  <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                    <button
                      style={btnPrimary}
                      disabled={isResolving}
                      onClick={() =>
                        resolve(
                          conflict.operationId,
                          "merged",
                          mergeContent[conflict.operationId] ?? localContent
                        )
                      }
                    >
                      {isResolving ? "RESOLVING..." : "SUBMIT MERGE"}
                    </button>
                    <button
                      style={btnSecondary}
                      onClick={() =>
                        setMergeState((prev) => ({
                          ...prev,
                          [conflict.operationId]: "idle",
                        }))
                      }
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  padding: "16px 20px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  style={btnAcceptLocal}
                  disabled={isResolving}
                  onClick={() => resolve(conflict.operationId, "keep-local")}
                >
                  {isResolving ? "..." : "ACCEPT LOCAL"}
                </button>
                <button
                  style={btnAcceptRemote}
                  disabled={isResolving}
                  onClick={() => resolve(conflict.operationId, "keep-remote")}
                >
                  {isResolving ? "..." : "ACCEPT REMOTE"}
                </button>
                <button
                  style={btnMerge}
                  disabled={isResolving}
                  onClick={() =>
                    setMergeState((prev) => ({
                      ...prev,
                      [conflict.operationId]: isMerging ? "idle" : "merge",
                    }))
                  }
                >
                  {isMerging ? "HIDE MERGE" : "MANUAL MERGE"}
                </button>

                {/* Operation ID for reference */}
                <span
                  style={{
                    marginLeft: "auto",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "0.65rem",
                    color: "#999",
                    alignSelf: "center",
                  }}
                >
                  {conflict.operationId.slice(0, 12)}...
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Brutalist inline styles ── */

const btnBase: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontWeight: 700,
  fontSize: "0.8rem",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  padding: "10px 20px",
  border: "3px solid #282828",
  boxShadow: "4px 4px 0px #282828",
  cursor: "pointer",
  transition: "transform 80ms ease, box-shadow 80ms ease",
};

const btnPrimary: React.CSSProperties = {
  ...btnBase,
  backgroundColor: "#282828",
  color: "#FFFFFF",
};

const btnSecondary: React.CSSProperties = {
  ...btnBase,
  backgroundColor: "#FFFFFF",
  color: "#282828",
};

const btnAcceptLocal: React.CSSProperties = {
  ...btnBase,
  backgroundColor: "#FFE459",
  color: "#282828",
};

const btnAcceptRemote: React.CSSProperties = {
  ...btnBase,
  backgroundColor: "#3498DB",
  color: "#FFFFFF",
};

const btnMerge: React.CSSProperties = {
  ...btnBase,
  backgroundColor: "#9B59B6",
  color: "#FFFFFF",
};

const errorBanner: React.CSSProperties = {
  border: "4px solid #282828",
  boxShadow: "6px 6px 0px #282828",
  backgroundColor: "#FADBD8",
  padding: "16px 20px",
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: "0.85rem",
  marginBottom: "24px",
};

function diffHeader(bg: string, fg: string): React.CSSProperties {
  return {
    padding: "8px 16px",
    backgroundColor: bg,
    color: fg,
    fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 700,
    fontSize: "0.7rem",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    borderBottom: "2px solid #282828",
  };
}

const diffPre: React.CSSProperties = {
  padding: "12px 16px",
  margin: 0,
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: "0.75rem",
  lineHeight: 1.5,
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
  maxHeight: "300px",
  overflowY: "auto",
  backgroundColor: "#FAFAFA",
};
