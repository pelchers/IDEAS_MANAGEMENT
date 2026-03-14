"use client";

import { useState, useEffect } from "react";

/* ── Types ── */
interface DashboardStats {
  totalIdeas: number;
  activeProjects: number;
  totalProjects: number;
  tasksInProgress: number;
  completionRate: number;
}

interface ActivityItem {
  text: string;
  time: string;
  type: string;
}

const ACTIVITY_ICONS: Record<string, string> = {
  "project.created": "+",
  "project.updated": "~",
  "project.archived": "x",
  "auth.signin": ">",
  "auth.signup": "*",
  "ai.openrouter_connected": "#",
};

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function formatAction(action: string, actorEmail: string, metadata: unknown): string {
  const name = actorEmail.split("@")[0];
  const meta = metadata as Record<string, string> | null;
  switch (action) {
    case "project.created":
      return `${name} created project "${meta?.name || "Untitled"}"`;
    case "project.updated":
      return `${name} updated project "${meta?.name || "Untitled"}"`;
    case "project.archived":
      return `${name} archived a project`;
    case "auth.signin":
      return `${name} signed in`;
    case "auth.signup":
      return `${name} created an account`;
    default:
      return `${name} performed ${action.replace(/\./g, " ")}`;
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setStats(data.stats);
          if (data.activity && data.activity.length > 0) {
            setActivities(
              data.activity.map((a: { action: string; createdAt: string; actorEmail: string; metadata: unknown }) => ({
                text: formatAction(a.action, a.actorEmail, a.metadata),
                time: formatRelativeTime(a.createdAt),
                type: a.action,
              }))
            );
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const displayStats = stats || { totalIdeas: 0, activeProjects: 0, totalProjects: 0, tasksInProgress: 0, completionRate: 0 };

  const STATS_CARDS = [
    { number: String(displayStats.totalIdeas), label: "TOTAL IDEAS", variant: "watermelon" },
    { number: String(displayStats.activeProjects), label: "ACTIVE PROJECTS", variant: "malachite" },
    { number: String(displayStats.tasksInProgress), label: "TASKS IN PROGRESS", variant: "amethyst" },
    { number: `${displayStats.completionRate}%`, label: "COMPLETION RATE", variant: "cornflower" },
  ];

  const variantColors: Record<string, string> = {
    watermelon: "#FF5E54",
    malachite: "#2BBF5D",
    amethyst: "#9B59B6",
    cornflower: "#6495ED",
  };

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      {/* View header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 className="nb-view-title">DASHBOARD</h1>
        <p style={{
          fontFamily: "monospace", fontSize: "0.8rem", textTransform: "uppercase",
          color: "#999", marginTop: "4px",
        }}>
          System overview and recent activity
        </p>
      </div>

      {/* Stats row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "24px",
        marginBottom: "32px",
      }}>
        {STATS_CARDS.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "#fff",
              border: "4px solid #1a1a1a",
              borderLeft: `8px solid ${variantColors[stat.variant]}`,
              boxShadow: "4px 4px 0 #1a1a1a",
              padding: "24px",
              transition: "all 0.15s ease",
              cursor: "default",
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translate(-2px, -2px) rotate(-1deg)";
              e.currentTarget.style.boxShadow = "6px 6px 0 #1a1a1a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "4px 4px 0 #1a1a1a";
            }}
          >
            <div style={{
              fontWeight: 800, fontSize: "2rem", fontFamily: "monospace",
            }}>
              {stat.number}
            </div>
            <div style={{
              fontFamily: "monospace", fontSize: "0.7rem", textTransform: "uppercase",
              letterSpacing: "0.05em", color: "#999", marginTop: "4px",
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard grid: summary + activity */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr",
        gap: "24px",
      }}>
        {/* Summary card */}
        <div style={{
          border: "4px solid #1a1a1a",
          background: "#fff",
          boxShadow: "4px 4px 0 #1a1a1a",
          padding: "24px",
        }}>
          <h2 style={{
            fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em",
            fontSize: "1.1rem", marginBottom: "16px", paddingBottom: "8px",
            borderBottom: "2px solid #1a1a1a",
          }}>
            PROJECT SUMMARY
          </h2>

          {loading ? (
            <div style={{
              textAlign: "center", padding: "40px", fontFamily: "monospace",
              color: "#999", textTransform: "uppercase", fontSize: "0.85rem",
            }}>
              Loading...
            </div>
          ) : displayStats.totalProjects === 0 ? (
            <div style={{
              textAlign: "center", padding: "60px 20px",
              fontFamily: "monospace", color: "#999",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>[ ]</div>
              <div style={{ fontSize: "0.85rem", textTransform: "uppercase" }}>
                No projects yet. Create one to get started.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Bar-style breakdown */}
              <div>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 700,
                  textTransform: "uppercase", marginBottom: "8px",
                }}>
                  <span>Projects</span>
                  <span>{displayStats.totalProjects} total / {displayStats.activeProjects} active</span>
                </div>
                <div style={{
                  height: "24px", border: "3px solid #1a1a1a", background: "#f5f5f5",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    width: displayStats.totalProjects > 0
                      ? `${(displayStats.activeProjects / displayStats.totalProjects) * 100}%`
                      : "0%",
                    background: "#2BBF5D",
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>

              <div>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 700,
                  textTransform: "uppercase", marginBottom: "8px",
                }}>
                  <span>Task Completion</span>
                  <span>{displayStats.completionRate}%</span>
                </div>
                <div style={{
                  height: "24px", border: "3px solid #1a1a1a", background: "#f5f5f5",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    width: `${displayStats.completionRate}%`,
                    background: "#6495ED",
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>

              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px",
                marginTop: "8px",
              }}>
                <div style={{
                  border: "3px solid #1a1a1a", padding: "16px", background: "#faf9f6",
                  textAlign: "center",
                }}>
                  <div style={{ fontWeight: 800, fontSize: "1.5rem", fontFamily: "monospace" }}>
                    {displayStats.totalIdeas}
                  </div>
                  <div style={{
                    fontFamily: "monospace", fontSize: "0.65rem", textTransform: "uppercase",
                    color: "#999", marginTop: "2px",
                  }}>
                    Ideas Captured
                  </div>
                </div>
                <div style={{
                  border: "3px solid #1a1a1a", padding: "16px", background: "#faf9f6",
                  textAlign: "center",
                }}>
                  <div style={{ fontWeight: 800, fontSize: "1.5rem", fontFamily: "monospace" }}>
                    {displayStats.tasksInProgress}
                  </div>
                  <div style={{
                    fontFamily: "monospace", fontSize: "0.65rem", textTransform: "uppercase",
                    color: "#999", marginTop: "2px",
                  }}>
                    Tasks Active
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Activity card */}
        <div style={{
          border: "4px solid #1a1a1a",
          background: "#fff",
          boxShadow: "4px 4px 0 #1a1a1a",
          padding: "24px",
        }}>
          <h2 style={{
            fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em",
            fontSize: "1.1rem", marginBottom: "16px", paddingBottom: "8px",
            borderBottom: "2px solid #1a1a1a",
          }}>
            RECENT ACTIVITY
          </h2>

          {loading ? (
            <div style={{
              textAlign: "center", padding: "40px", fontFamily: "monospace",
              color: "#999", textTransform: "uppercase", fontSize: "0.85rem",
            }}>
              Loading...
            </div>
          ) : activities.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "60px 20px",
              fontFamily: "monospace", color: "#999",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>[ ]</div>
              <div style={{ fontSize: "0.85rem", textTransform: "uppercase" }}>
                No activity yet
              </div>
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {activities.map((activity, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: "12px",
                    padding: "12px 0",
                    borderBottom: i < activities.length - 1 ? "2px dashed #1a1a1a" : "none",
                  }}
                >
                  <span style={{
                    fontFamily: "monospace", fontWeight: 800, fontSize: "1rem",
                    marginTop: "2px", width: "20px", textAlign: "center",
                    flexShrink: 0,
                  }}>
                    {ACTIVITY_ICONS[activity.type] || ">"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.9rem", fontWeight: 500, lineHeight: 1.4 }}>
                      {activity.text}
                    </p>
                    <p style={{
                      fontFamily: "monospace", fontSize: "0.7rem", color: "#999",
                      marginTop: "4px", textTransform: "uppercase",
                    }}>
                      {activity.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
