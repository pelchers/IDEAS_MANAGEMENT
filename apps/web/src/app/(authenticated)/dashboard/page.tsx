"use client";

import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/* ── Fallback mock data (shown when no real data yet) ── */
const MOCK_ACTIVITIES = [
  { text: 'Jane Doe created project "Mobile App Redesign"', time: "10 min ago", type: "create" },
  { text: 'Alex Kim moved "Setup CI/CD" to In Progress', time: "25 min ago", type: "move" },
  { text: 'Sam Rivera added idea "Export to Notion"', time: "1 hour ago", type: "idea" },
  { text: "Design System 2.0 marked for review", time: "2 hours ago", type: "review" },
  { text: "Chris Miller closed 3 tasks in Performance Audit", time: "3 hours ago", type: "complete" },
  { text: 'New comment on "AI Integration" project', time: "4 hours ago", type: "comment" },
  { text: 'Pat Lee shared whiteboard "Auth Flow v2"', time: "5 hours ago", type: "share" },
  { text: "Weekly sprint planning meeting scheduled", time: "6 hours ago", type: "event" },
  { text: "Alex Kim updated schema for Tasks entity", time: "8 hours ago", type: "update" },
  { text: "Backup completed successfully", time: "12 hours ago", type: "system" },
];

const ACTIVITY_ICONS: Record<string, string> = {
  create: "➕",
  move: "↔️",
  idea: "💡",
  review: "👁️",
  complete: "✅",
  comment: "💬",
  share: "🔗",
  event: "📅",
  update: "🔄",
  system: "⚙️",
  "project.created": "➕",
  "project.updated": "🔄",
  "auth.signin": "🔑",
  "auth.signup": "👤",
  "ai.openrouter_connected": "🤖",
};

const chartData = {
  labels: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
  datasets: [
    {
      label: "Ideas Created",
      data: [4, 7, 3, 8, 5, 2, 6],
      backgroundColor: "#FF5E54",
      borderColor: "#282828",
      borderWidth: 3,
    },
    {
      label: "Tasks Completed",
      data: [6, 3, 5, 4, 9, 1, 4],
      backgroundColor: "#2BBF5D",
      borderColor: "#282828",
      borderWidth: 3,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        font: { family: "'Space Grotesk'", weight: "bold" as const, size: 12 },
        color: "#282828",
        usePointStyle: true,
        padding: 16,
      },
    },
  },
  scales: {
    x: {
      ticks: {
        font: { family: "'IBM Plex Mono'", weight: "bold" as const, size: 11 },
        color: "#282828",
      },
      grid: { color: "rgba(0,0,0,0.1)" },
      border: { color: "#282828", width: 3 },
    },
    y: {
      ticks: {
        font: { family: "'IBM Plex Mono'", weight: "bold" as const, size: 11 },
        color: "#282828",
      },
      grid: { color: "rgba(0,0,0,0.1)" },
      border: { color: "#282828", width: 3 },
    },
  },
};

/* ── Types ── */
interface DashboardStats {
  totalIdeas: number;
  activeProjects: number;
  tasksInProgress: number;
  completionRate: number;
}

interface ActivityItem {
  text: string;
  time: string;
  type: string;
}

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
  const [stats, setStats] = useState<DashboardStats>({
    totalIdeas: 47,
    activeProjects: 6,
    tasksInProgress: 18,
    completionRate: 89,
  });
  const [activities, setActivities] = useState<ActivityItem[]>(MOCK_ACTIVITIES);
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
          // If no real activity, keep mock data as demo content
        }
      })
      .catch(() => {
        // Keep mock data on error
      })
      .finally(() => setLoading(false));
  }, []);

  const STATS = [
    { number: String(stats.totalIdeas), label: "TOTAL IDEAS", trend: "+12%", up: true, variant: "border-l-watermelon" },
    { number: String(stats.activeProjects), label: "ACTIVE PROJECTS", trend: "+2", up: true, variant: "border-l-malachite" },
    { number: String(stats.tasksInProgress), label: "TASKS IN PROGRESS", trend: "-3", up: false, variant: "border-l-amethyst" },
    { number: `${stats.completionRate}%`, label: "COMPLETION RATE", trend: "+5%", up: true, variant: "border-l-cornflower" },
  ];

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      {/* View header */}
      <div className="mb-8">
        <h1 className="nb-view-title">DASHBOARD</h1>
        <p className="nb-view-subtitle mt-1">System overview and recent activity</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className={`bg-white border-4 border-signal-black shadow-nb p-6 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:rotate-[-1deg] hover:shadow-nb-lg border-l-8 ${stat.variant} ${loading ? "animate-pulse" : ""}`}
          >
            <div className="font-bold text-3xl font-mono">{stat.number}</div>
            <div className="font-mono text-xs uppercase tracking-wider text-gray-mid mt-1">
              {stat.label}
            </div>
            <div
              className={`font-mono text-sm font-semibold mt-2 ${
                stat.up ? "text-malachite" : "text-watermelon"
              }`}
            >
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard grid: chart + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        {/* Chart card */}
        <div className="nb-card">
          <h2 className="font-bold uppercase tracking-wider text-lg mb-4 pb-2 border-b-2 border-signal-black">
            WEEKLY ACTIVITY
          </h2>
          <div className="h-[300px]">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Activity card */}
        <div className="nb-card">
          <h2 className="font-bold uppercase tracking-wider text-lg mb-4 pb-2 border-b-2 border-signal-black">
            RECENT ACTIVITY
          </h2>
          <ul>
            {activities.map((activity, i) => (
              <li
                key={i}
                className={`flex items-start gap-4 py-4 ${
                  i < activities.length - 1 ? "border-b-2 border-dashed border-signal-black" : ""
                }`}
              >
                <span className="text-lg mt-0.5">{ACTIVITY_ICONS[activity.type] || "•"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug">{activity.text}</p>
                  <p className="font-mono text-xs text-gray-mid mt-1 uppercase">{activity.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
