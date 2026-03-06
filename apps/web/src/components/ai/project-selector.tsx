"use client";

interface ProjectSelectorProps {
  projectId: string | null;
  onProjectChange: (projectId: string | null) => void;
}

/**
 * Project context selector for AI chat.
 * In Phase 5+ this will fetch real projects from the API.
 * For now it provides a text input for project IDs.
 */
export function ProjectSelector({ projectId, onProjectChange }: ProjectSelectorProps) {
  return (
    <div style={styles.container}>
      <label style={styles.label}>Project Context</label>
      <div style={styles.inputRow}>
        <input
          type="text"
          value={projectId || ""}
          onChange={(e) => onProjectChange(e.target.value || null)}
          placeholder="Enter project ID (optional)"
          style={styles.input}
        />
        {projectId && (
          <button
            onClick={() => onProjectChange(null)}
            style={styles.clearButton}
            title="Clear project context"
          >
            x
          </button>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderBottom: "1px solid #e0e0e0",
    backgroundColor: "#fafafa",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#666",
    whiteSpace: "nowrap" as const,
  },
  inputRow: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    flex: 1,
  },
  input: {
    flex: 1,
    padding: "6px 10px",
    border: "1px solid #d0d0d0",
    borderRadius: "4px",
    fontSize: "13px",
    outline: "none",
    fontFamily: "inherit",
  },
  clearButton: {
    padding: "4px 8px",
    border: "1px solid #d0d0d0",
    borderRadius: "4px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "12px",
    color: "#666",
  },
};
