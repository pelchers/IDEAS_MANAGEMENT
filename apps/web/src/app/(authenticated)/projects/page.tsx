import Link from "next/link";

/* ── Mock Data (from pass-1 app.js) ── */
const PROJECTS = [
  {
    id: 1,
    title: "MOBILE APP REDESIGN",
    desc: "Complete overhaul of the mobile experience with new navigation patterns and gesture controls.",
    status: "active" as const,
    progress: 72,
    tasks: 24,
    dueDate: "2026-04-15",
  },
  {
    id: 2,
    title: "API V3 MIGRATION",
    desc: "Migrate all endpoints to v3 with improved rate limiting and authentication flow.",
    status: "active" as const,
    progress: 45,
    tasks: 18,
    dueDate: "2026-05-01",
  },
  {
    id: 3,
    title: "DESIGN SYSTEM 2.0",
    desc: "New component library with brutalist design tokens and accessibility-first approach.",
    status: "review" as const,
    progress: 88,
    tasks: 32,
    dueDate: "2026-03-20",
  },
  {
    id: 4,
    title: "AI INTEGRATION",
    desc: "Natural language processing pipeline for idea categorization and smart suggestions.",
    status: "planning" as const,
    progress: 15,
    tasks: 12,
    dueDate: "2026-06-01",
  },
  {
    id: 5,
    title: "PERFORMANCE AUDIT",
    desc: "Core Web Vitals optimization, bundle splitting, and lazy loading implementation.",
    status: "active" as const,
    progress: 60,
    tasks: 8,
    dueDate: "2026-03-30",
  },
  {
    id: 6,
    title: "ONBOARDING FLOW",
    desc: "Interactive tutorial system for new users with progressive disclosure of features.",
    status: "paused" as const,
    progress: 30,
    tasks: 14,
    dueDate: "2026-07-01",
  },
];

type ProjectStatus = "active" | "review" | "planning" | "paused";

const STATUS_CLASSES: Record<ProjectStatus, string> = {
  active: "bg-malachite",
  review: "bg-cornflower text-white",
  planning: "bg-lemon",
  paused: "bg-gray-mid text-white",
};

export default function ProjectsPage() {
  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      {/* View header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="nb-view-title">PROJECTS</h1>
        <button className="nb-btn nb-btn--primary">+ NEW PROJECT</button>
      </div>

      {/* Projects grid */}
      <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
        {PROJECTS.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="block bg-white border-4 border-signal-black shadow-nb p-6 transition-[transform,box-shadow] duration-150 cursor-pointer hover:-translate-x-[3px] hover:-translate-y-[3px] hover:rotate-[0.5deg] hover:shadow-nb-xl"
          >
            {/* Status badge */}
            <div className="mb-3">
              <span
                className={`font-mono text-[0.7rem] uppercase font-semibold px-3 py-1 border-2 border-signal-black ${STATUS_CLASSES[project.status]}`}
              >
                {project.status}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-[1.2rem] font-bold uppercase mb-2">
              {project.title}
            </h3>

            {/* Description */}
            <p className="text-[0.9rem] text-gray-mid mb-4 leading-relaxed">
              {project.desc}
            </p>

            {/* Meta row */}
            <div className="flex justify-between font-mono text-[0.75rem] uppercase pt-4 border-t-2 border-dashed border-signal-black">
              <span>{project.tasks} TASKS</span>
              <span>DUE {project.dueDate}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-creamy-milk border-2 border-signal-black mt-2">
              <div
                className="h-full bg-watermelon"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
