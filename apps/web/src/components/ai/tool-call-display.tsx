"use client";

interface ToolCallDisplayProps {
  toolName: string;
  args: Record<string, unknown>;
  state: string;
  result?: unknown;
}

const TOOL_LABELS: Record<string, string> = {
  add_idea: "Add Idea",
  update_kanban: "Update Kanban",
  generate_tree: "Generate Tree",
  create_project_structure: "Create Project Structure",
};

export function ToolCallDisplay({ toolName, args, state, result }: ToolCallDisplayProps) {
  const label = TOOL_LABELS[toolName] || toolName;
  const isComplete = state === "result";
  const isRunning = state === "call";

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.icon}>{isComplete ? "\u2713" : isRunning ? "\u2026" : "\u2022"}</span>
        <span style={styles.label}>{label}</span>
        <span style={{
          ...styles.status,
          color: isComplete ? "#16a34a" : "#d97706",
        }}>
          {isComplete ? "Completed" : isRunning ? "Running..." : state}
        </span>
      </div>

      <div style={styles.args}>
        <details>
          <summary style={styles.detailsSummary}>Parameters</summary>
          <pre style={styles.pre}>{JSON.stringify(args, null, 2)}</pre>
        </details>
      </div>

      {isComplete && result != null && (
        <div style={styles.result}>
          <details open>
            <summary style={styles.detailsSummary}>Result</summary>
            <pre style={styles.pre}>
              {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    margin: "8px 0",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    padding: "10px 12px",
    backgroundColor: "#fafafa",
    fontSize: "13px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
  },
  icon: {
    fontSize: "14px",
    fontWeight: "bold",
  },
  label: {
    fontWeight: "600",
    color: "#333",
  },
  status: {
    marginLeft: "auto",
    fontSize: "12px",
    fontWeight: "500",
  },
  args: {
    marginTop: "4px",
  },
  result: {
    marginTop: "6px",
    borderTop: "1px solid #e8e8e8",
    paddingTop: "6px",
  },
  detailsSummary: {
    cursor: "pointer",
    fontSize: "12px",
    color: "#666",
    fontWeight: "500",
    outline: "none",
  },
  pre: {
    margin: "4px 0 0 0",
    padding: "8px",
    backgroundColor: "#fff",
    border: "1px solid #eee",
    borderRadius: "4px",
    fontSize: "12px",
    overflow: "auto",
    maxHeight: "200px",
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
  },
};
