"use client";

import { useState } from "react";

/* ── Types ── */
interface Idea {
  id: number;
  title: string;
  body: string;
  tags: string[];
  priority: "high" | "medium" | "low";
  date: string;
  author: string;
}

/* ── Mock data (from pass-1 app.js) ── */
const IDEAS: Idea[] = [
  { id: 1, title: "VOICE COMMAND INTEGRATION", body: "Allow users to capture ideas via voice input with automatic transcription and tagging.", tags: ["feature", "ai"], priority: "high", date: "2 hours ago", author: "Jane D." },
  { id: 2, title: "COLLABORATIVE WHITEBOARD", body: "Real-time multi-user whiteboard with cursor presence and conflict resolution.", tags: ["feature", "collab"], priority: "high", date: "5 hours ago", author: "Alex K." },
  { id: 3, title: "EXPORT TO NOTION", body: "One-click export of project boards and ideas to Notion workspace with formatting preserved.", tags: ["integration"], priority: "medium", date: "1 day ago", author: "Sam R." },
  { id: 4, title: "SMART TAGGING SYSTEM", body: "ML-powered auto-tagging that learns from user behavior and suggests relevant tags.", tags: ["ai", "feature"], priority: "medium", date: "1 day ago", author: "Jane D." },
  { id: 5, title: "OFFLINE MODE", body: "Progressive web app capabilities with local storage sync when connection resumes.", tags: ["feature", "performance"], priority: "low", date: "2 days ago", author: "Chris M." },
  { id: 6, title: "THEME MARKETPLACE", body: "Community-driven theme system where users can create and share custom UI themes.", tags: ["feature", "design"], priority: "low", date: "3 days ago", author: "Pat L." },
  { id: 7, title: "GANTT CHART VIEW", body: "Timeline visualization for project planning with dependency tracking and milestone markers.", tags: ["feature"], priority: "high", date: "3 days ago", author: "Alex K." },
  { id: 8, title: "WEBHOOK SYSTEM", body: "Custom webhook endpoints for integrating with external services and automation tools.", tags: ["integration", "feature"], priority: "medium", date: "4 days ago", author: "Sam R." },
];

const FILTERS = ["ALL", "FEATURE", "BUG FIX", "RESEARCH", "DESIGN"] as const;

/* ── Priority badge helper ── */
function priorityClasses(p: Idea["priority"]): string {
  switch (p) {
    case "high":
      return "bg-watermelon text-white";
    case "medium":
      return "bg-lemon text-signal-black";
    case "low":
      return "bg-cornflower text-white";
  }
}

export default function IdeasPage() {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const filtered =
    activeFilter === "ALL"
      ? IDEAS
      : IDEAS.filter((idea) =>
          idea.tags.some(
            (t) => t.toUpperCase() === activeFilter.toUpperCase()
          )
        );

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      {/* View header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="nb-view-title">IDEAS</h1>
        <button className="nb-btn nb-btn--primary">+ CAPTURE IDEA</button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`font-bold text-[0.8rem] uppercase px-4 min-h-[44px] border-[3px] border-signal-black cursor-pointer transition-all duration-150 ${
              activeFilter === filter
                ? "bg-signal-black text-malachite shadow-nb"
                : "bg-white text-signal-black hover:bg-creamy-milk hover:-translate-y-[2px]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Ideas grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-6">
        {filtered.map((idea) => (
          <div
            key={idea.id}
            className="bg-white border-4 border-signal-black shadow-nb p-6 relative transition-all duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-nb-lg"
          >
            {/* Priority badge */}
            <span
              className={`absolute top-0 right-0 font-mono text-[0.7rem] uppercase px-3 py-1 border-l-[3px] border-b-[3px] border-signal-black ${priorityClasses(idea.priority)}`}
            >
              {idea.priority}
            </span>

            {/* Title */}
            <h3 className="text-[1.1rem] font-bold mb-2 pr-[70px] uppercase">
              {idea.title}
            </h3>

            {/* Body */}
            <p className="text-[0.9rem] text-gray-mid leading-relaxed mb-4">
              {idea.body}
            </p>

            {/* Tags */}
            <div className="flex gap-1 flex-wrap mb-4">
              {idea.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[0.65rem] uppercase px-2 py-[2px] border-2 border-signal-black bg-creamy-milk"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Meta: author + date */}
            <div className="flex justify-between font-mono text-[0.75rem] uppercase pt-3 border-t-2 border-dashed border-signal-black text-gray-mid">
              <span>{idea.author}</span>
              <span>{idea.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
