"use client";

interface UpgradePromptProps {
  feature?: string;
}

/**
 * Upgrade prompt shown when the user lacks the AI_CHAT entitlement.
 * Directs users to upgrade their plan.
 */
export function UpgradePrompt({ feature = "AI Chat" }: UpgradePromptProps) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>AI</div>
        <h2 style={styles.heading}>{feature} requires an upgrade</h2>
        <p style={styles.description}>
          AI-powered chat with tool actions is available on Pro and Team plans.
          Upgrade your subscription to access intelligent project assistance,
          idea management, kanban updates, and project scaffolding.
        </p>
        <div style={styles.features}>
          <div style={styles.featureItem}>Streaming AI conversations</div>
          <div style={styles.featureItem}>AI-driven idea creation</div>
          <div style={styles.featureItem}>Kanban board automation</div>
          <div style={styles.featureItem}>Project structure generation</div>
        </div>
        <a href="/api/billing/checkout" style={styles.upgradeButton}>
          Upgrade to Pro
        </a>
        <p style={styles.subtext}>
          Already have a subscription?{" "}
          <a href="/api/billing/portal" style={styles.link}>
            Manage billing
          </a>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "40px 20px",
    backgroundColor: "#fafafa",
  },
  card: {
    maxWidth: "480px",
    textAlign: "center" as const,
    padding: "40px 32px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  icon: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #e8e4ff, #c4b5fd)",
    color: "#5b4dc7",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "16px",
  },
  heading: {
    margin: "0 0 12px 0",
    fontSize: "22px",
    fontWeight: "700",
    color: "#1a1a2e",
  },
  description: {
    margin: "0 0 20px 0",
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#666",
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "24px",
  },
  featureItem: {
    padding: "8px 12px",
    backgroundColor: "#f5f3ff",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#5b4dc7",
  },
  upgradeButton: {
    display: "inline-block",
    padding: "12px 32px",
    backgroundColor: "#5b4dc7",
    color: "#fff",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    textDecoration: "none",
  },
  subtext: {
    marginTop: "16px",
    fontSize: "13px",
    color: "#888",
  },
  link: {
    color: "#5b4dc7",
    textDecoration: "underline",
  },
};
