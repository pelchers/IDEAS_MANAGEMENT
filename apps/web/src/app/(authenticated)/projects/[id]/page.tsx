"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

/* ── Constants ── */
const TABS = ["EDITOR", "PREVIEW", "NOTES"] as const;
type Tab = (typeof TABS)[number];

interface Note {
  id: string;
  text: string;
  createdAt: string;
  modifiedAt: string;
}

interface WorkspaceData {
  editorContent: string;
  notes: Note[];
}

interface ProjectDetail {
  name: string;
  description: string;
  status: string;
}

function selectProject(id: string, name: string) {
  localStorage.setItem("im_selected_project", JSON.stringify({ id, name }));
  const fn = (window as unknown as Record<string, unknown>).__imSelectProject;
  if (typeof fn === "function") {
    (fn as (id: string, name: string) => void)(id, name);
  }
  window.dispatchEvent(new Event("storage"));
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ProjectWorkspacePage() {
  const params = useParams();
  const projectId = String(params.id);
  const [activeTab, setActiveTab] = useState<Tab>("EDITOR");
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isSelected, setIsSelected] = useState(false);

  /* ── Workspace state ── */
  const [editorContent, setEditorContent] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Note editing state ── */
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteText, setNoteText] = useState("");
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [hoverNote, setHoverNote] = useState<string | null>(null);

  /* ── Load project ── */
  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.project) setProject(data.project);
      })
      .catch(() => {});
  }, [projectId]);

  useEffect(() => {
    const saved = localStorage.getItem("im_selected_project");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setIsSelected(parsed.id === projectId);
      } catch {}
    }
  }, [projectId]);

  useEffect(() => {
    if (project) {
      selectProject(projectId, project.name.toUpperCase());
      setIsSelected(true);
    }
  }, [project, projectId]);

  const handleSelectProject = () => {
    const name = project?.name?.toUpperCase() || `PROJECT ${projectId}`;
    selectProject(projectId, name);
    setIsSelected(true);
  };

  /* ── Load workspace data ── */
  useEffect(() => {
    fetch(`/api/projects/${projectId}/artifacts/workspace/workspace.json`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.artifact?.content) {
          const ws = data.artifact.content as WorkspaceData;
          setEditorContent(ws.editorContent || "");
          setNotes(ws.notes || []);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [projectId]);

  /* ── Save workspace data (debounced) ── */
  const saveWorkspace = useCallback(
    (content: string, notesList: Note[]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setSaving(true);
      saveTimer.current = setTimeout(() => {
        const payload: WorkspaceData = {
          editorContent: content,
          notes: notesList,
        };
        fetch(`/api/projects/${projectId}/artifacts/workspace/workspace.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: payload }),
        })
          .then(() => setSaving(false))
          .catch(() => setSaving(false));
      }, 800);
    },
    [projectId]
  );

  const updateEditor = (val: string) => {
    setEditorContent(val);
    saveWorkspace(val, notes);
  };

  const updateNotes = (updated: Note[]) => {
    setNotes(updated);
    saveWorkspace(editorContent, updated);
  };

  /* ── Note CRUD ── */
  const addNote = () => {
    if (!newNoteText.trim()) return;
    const now = new Date().toISOString();
    const note: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: newNoteText.trim(),
      createdAt: now,
      modifiedAt: now,
    };
    const updated = [note, ...notes];
    updateNotes(updated);
    setNewNoteText("");
    setShowAddNote(false);
  };

  const saveEditNote = () => {
    if (!editingNote || !noteText.trim()) return;
    const updated = notes.map((n) =>
      n.id === editingNote.id
        ? { ...n, text: noteText.trim(), modifiedAt: new Date().toISOString() }
        : n
    );
    updateNotes(updated);
    setEditingNote(null);
    setNoteText("");
  };

  const deleteNote = (id: string) => {
    updateNotes(notes.filter((n) => n.id !== id));
  };

  /* ── Render simple markdown for preview ── */
  const renderPreview = (text: string) => {
    if (!text.trim()) return "Nothing to preview yet. Write something in the editor tab.";
    return text;
  };

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      {/* View header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="nb-view-title">
          {project ? project.name.toUpperCase() : "WORKSPACE"}
        </h1>
        <div className="flex items-center gap-4 flex-wrap">
          <button
            className={`nb-btn nb-btn--small ${isSelected ? "" : "nb-btn--primary"}`}
            onClick={handleSelectProject}
          >
            {isSelected ? "SELECTED" : "SELECT PROJECT"}
          </button>
          <div className="flex gap-2">
            <Link href={`/projects/${projectId}/kanban`} className="nb-btn nb-btn--small">KANBAN</Link>
            <Link href={`/projects/${projectId}/whiteboard`} className="nb-btn nb-btn--small">WHITEBOARD</Link>
            <Link href={`/projects/${projectId}/schema`} className="nb-btn nb-btn--small">SCHEMA</Link>
            <Link href={`/projects/${projectId}/ideas`} className="nb-btn nb-btn--small">IDEAS</Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="font-mono text-xs uppercase text-gray-mid">
              {project ? project.status : `PROJECT #${projectId}`}
            </span>
            {saving && (
              <span style={{
                fontFamily: "monospace", fontSize: "0.7rem", color: "#999",
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                saving...
              </span>
            )}
          </div>
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
        {!loaded ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            minHeight: "400px", fontFamily: "monospace", fontSize: "0.9rem",
            textTransform: "uppercase", color: "#999",
          }}>
            Loading workspace...
          </div>
        ) : (
          <>
            {/* EDITOR panel */}
            {activeTab === "EDITOR" && (
              <div>
                <textarea
                  value={editorContent}
                  onChange={(e) => updateEditor(e.target.value)}
                  placeholder="Start writing... Your content is auto-saved."
                  style={{
                    width: "100%",
                    minHeight: "500px",
                    padding: "24px",
                    border: "none",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "'Space Mono', 'Courier New', monospace",
                    fontSize: "0.95rem",
                    lineHeight: "1.8",
                    background: "transparent",
                    color: "#1a1a1a",
                  }}
                />
              </div>
            )}

            {/* PREVIEW panel */}
            {activeTab === "PREVIEW" && (
              <div style={{ padding: "24px" }}>
                <div style={{
                  border: "4px solid #1a1a1a",
                  padding: "32px",
                  background: "#faf9f6",
                }}>
                  <h2 style={{
                    fontSize: "1.1rem", fontWeight: 800, textTransform: "uppercase",
                    marginBottom: "16px", paddingBottom: "8px",
                    borderBottom: "2px solid #1a1a1a",
                  }}>
                    RENDERED PREVIEW
                  </h2>
                  <div style={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "'Space Mono', 'Courier New', monospace",
                    fontSize: "0.9rem",
                    lineHeight: "1.8",
                    color: editorContent.trim() ? "#1a1a1a" : "#999",
                  }}>
                    {renderPreview(editorContent)}
                  </div>
                </div>
              </div>
            )}

            {/* NOTES panel */}
            {activeTab === "NOTES" && (
              <div style={{ padding: "24px" }}>
                {/* Add note button / form */}
                {!showAddNote ? (
                  <button
                    onClick={() => setShowAddNote(true)}
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      padding: "10px 20px",
                      border: "3px solid #1a1a1a",
                      background: "#1a1a1a",
                      color: "#faf9f6",
                      cursor: "pointer",
                      marginBottom: "20px",
                      display: "block",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translate(-2px, -2px)";
                      e.currentTarget.style.boxShadow = "4px 4px 0 #1a1a1a";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    + ADD NOTE
                  </button>
                ) : (
                  <div style={{
                    border: "3px solid #1a1a1a",
                    padding: "16px",
                    marginBottom: "20px",
                    background: "#faf9f6",
                  }}>
                    <textarea
                      autoFocus
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Write your note..."
                      style={{
                        width: "100%",
                        minHeight: "100px",
                        padding: "12px",
                        border: "2px solid #1a1a1a",
                        fontFamily: "'Space Mono', 'Courier New', monospace",
                        fontSize: "0.9rem",
                        lineHeight: "1.6",
                        resize: "vertical",
                        outline: "none",
                        marginBottom: "12px",
                      }}
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={addNote}
                        style={{
                          fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 700,
                          textTransform: "uppercase", padding: "8px 16px",
                          border: "2px solid #1a1a1a", background: "#1a1a1a",
                          color: "#faf9f6", cursor: "pointer",
                        }}
                      >
                        SAVE NOTE
                      </button>
                      <button
                        onClick={() => { setShowAddNote(false); setNewNoteText(""); }}
                        style={{
                          fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 700,
                          textTransform: "uppercase", padding: "8px 16px",
                          border: "2px solid #1a1a1a", background: "transparent",
                          color: "#1a1a1a", cursor: "pointer",
                        }}
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                )}

                {/* Notes list */}
                {notes.length === 0 && (
                  <div style={{
                    textAlign: "center", padding: "60px 20px",
                    fontFamily: "monospace", color: "#999",
                  }}>
                    <div style={{ fontSize: "2rem", marginBottom: "12px" }}>[ ]</div>
                    <div style={{ fontSize: "0.85rem", textTransform: "uppercase" }}>
                      No notes yet. Add one above.
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      onMouseEnter={() => setHoverNote(note.id)}
                      onMouseLeave={() => setHoverNote(null)}
                      style={{
                        border: "3px solid #1a1a1a",
                        padding: "20px",
                        background: "#fff",
                        boxShadow: hoverNote === note.id ? "4px 4px 0 #1a1a1a" : "2px 2px 0 #1a1a1a",
                        transform: hoverNote === note.id ? "translate(-2px, -2px)" : "none",
                        transition: "all 0.15s ease",
                        position: "relative",
                      }}
                    >
                      {/* Edit / Delete buttons on hover */}
                      {hoverNote === note.id && (
                        <div style={{
                          position: "absolute", top: "8px", right: "8px",
                          display: "flex", gap: "4px",
                        }}>
                          <button
                            onClick={() => { setEditingNote(note); setNoteText(note.text); }}
                            title="Edit"
                            style={{
                              width: "28px", height: "28px", border: "2px solid #1a1a1a",
                              background: "#fff", cursor: "pointer", display: "flex",
                              alignItems: "center", justifyContent: "center",
                              fontWeight: 700, fontSize: "0.75rem",
                            }}
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => deleteNote(note.id)}
                            title="Delete"
                            style={{
                              width: "28px", height: "28px", border: "2px solid #1a1a1a",
                              background: "#fff", cursor: "pointer", display: "flex",
                              alignItems: "center", justifyContent: "center",
                              fontWeight: 700, fontSize: "0.75rem", color: "#e74c3c",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* Note content */}
                      {editingNote?.id === note.id ? (
                        <div>
                          <textarea
                            autoFocus
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            style={{
                              width: "100%", minHeight: "80px", padding: "10px",
                              border: "2px solid #1a1a1a", fontFamily: "'Space Mono', monospace",
                              fontSize: "0.9rem", lineHeight: "1.6", resize: "vertical",
                              outline: "none", marginBottom: "10px",
                            }}
                          />
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={saveEditNote}
                              style={{
                                fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 700,
                                textTransform: "uppercase", padding: "6px 12px",
                                border: "2px solid #1a1a1a", background: "#1a1a1a",
                                color: "#faf9f6", cursor: "pointer",
                              }}
                            >
                              SAVE
                            </button>
                            <button
                              onClick={() => { setEditingNote(null); setNoteText(""); }}
                              style={{
                                fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 700,
                                textTransform: "uppercase", padding: "6px 12px",
                                border: "2px solid #1a1a1a", background: "transparent",
                                cursor: "pointer",
                              }}
                            >
                              CANCEL
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p style={{
                            fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "12px",
                            paddingRight: hoverNote === note.id ? "70px" : "0",
                          }}>
                            {note.text}
                          </p>
                          <div style={{
                            display: "flex", justifyContent: "space-between",
                            fontFamily: "monospace", fontSize: "0.7rem",
                            textTransform: "uppercase", color: "#999",
                            paddingTop: "10px", borderTop: "2px dashed #1a1a1a",
                          }}>
                            <span>Created {timeAgo(note.createdAt)}</span>
                            {note.modifiedAt !== note.createdAt && (
                              <span>Edited {timeAgo(note.modifiedAt)}</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
