"use client";

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

/* ── Mock Data (from pass-1) ── */
const ACTIVITIES = [
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
        font: { family: "'IBM Plex Mono'", weight: "600" as const, size: 11 },
        color: "#282828",
      },
      grid: { color: "rgba(0,0,0,0.1)" },
      border: { color: "#282828", width: 3 },
    },
    y: {
      ticks: {
        font: { family: "'IBM Plex Mono'", weight: "600" as const, size: 11 },
        color: "#282828",
      },
      grid: { color: "rgba(0,0,0,0.1)" },
      border: { color: "#282828", width: 3 },
    },
  },
};

/* ── Stats data ── */
const STATS = [
  { number: "47", label: "TOTAL IDEAS", trend: "+12%", up: true, variant: "border-l-watermelon" },
  { number: "6", label: "ACTIVE PROJECTS", trend: "+2", up: true, variant: "border-l-malachite" },
  { number: "18", label: "TASKS IN PROGRESS", trend: "-3", up: false, variant: "border-l-amethyst" },
  { number: "89%", label: "COMPLETION RATE", trend: "+5%", up: true, variant: "border-l-cornflower" },
];

export default function DashboardPage() {
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
            className={`bg-white border-4 border-signal-black shadow-nb p-6 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:rotate-[-1deg] hover:shadow-nb-lg border-l-8 ${stat.variant}`}
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
            {ACTIVITIES.map((activity, i) => (
              <li
                key={i}
                className={`flex items-start gap-4 py-4 ${
                  i < ACTIVITIES.length - 1 ? "border-b-2 border-dashed border-signal-black" : ""
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
