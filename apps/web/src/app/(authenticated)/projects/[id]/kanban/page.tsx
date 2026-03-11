"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Sortable from "sortablejs";

/* ── Types ── */
type ColumnId = "backlog" | "todo" | "progress" | "done";

interface KanbanCard {
  id: number;
  title: string;
  tags: string[];
}

interface ColumnDef {
  id: ColumnId;
  label: string;
  headerClass: string;
}

/* ── Column definitions ── */
const COLUMNS: ColumnDef[] = [
  {
    id: "backlog",
    label: "BACKLOG",
    headerClass: "bg-creamy-milk",
  },
  {
    id: "todo",
    label: "TO DO",
    headerClass: "bg-watermelon text-white",
  },
  {
    id: "progress",
    label: "IN PROGRESS",
    headerClass: "bg-malachite",
  },
  {
    id: "done",
    label: "DONE",
    headerClass: "bg-signal-black text-white",
  },
];

/* ── Mock data (matching pass-1) ── */
const INITIAL_CARDS: Record<ColumnId, KanbanCard[]> = {
  backlog: [
    { id: 1, title: "Setup CI/CD pipeline", tags: ["feature"] },
    { id: 2, title: "Fix auth token refresh", tags: ["bug", "urgent"] },
    { id: 3, title: "Design onboarding screens", tags: ["feature"] },
  ],
  todo: [
    { id: 4, title: "Implement dark mode toggle", tags: ["feature"] },
    { id: 5, title: "Add keyboard shortcuts", tags: ["feature"] },
    { id: 6, title: "Fix mobile nav overflow", tags: ["bug"] },
  ],
  progress: [
    { id: 7, title: "Build kanban drag-drop", tags: ["feature"] },
    { id: 8, title: "Schema validation layer", tags: ["feature"] },
    { id: 9, title: "Memory leak in whiteboard", tags: ["bug", "urgent"] },
  ],
  done: [
    { id: 10, title: "User profile page", tags: ["feature"] },
    { id: 11, title: "Setup Convex backend", tags: ["feature"] },
    { id: 12, title: "Landing page design", tags: ["feature"] },
  ],
};

/* ── Tag color helper ── */
function getTagClasses(tag: string): string {
  switch (tag) {
    case "urgent":
      return "bg-watermelon text-white";
    case "feature":
      return "bg-malachite";
    case "bug":
      return "bg-amethyst text-white";
    default:
      return "bg-creamy-milk";
  }
}

/* ── Component ── */
export default function KanbanPage() {
  const params = useParams();
  const [columns, setColumns] = useState<Record<ColumnId, KanbanCard[]>>(
    () => structuredClone(INITIAL_CARDS)
  );

  // Refs for each column's card container
  const columnRefs = useRef<Record<ColumnId, HTMLDivElement | null>>({
    backlog: null,
    todo: null,
    progress: null,
    done: null,
  });

  // Sortable instances ref for cleanup
  const sortableInstances = useRef<Sortable[]>([]);

  // Sync state from DOM after drag
  const syncStateFromDOM = useCallback(() => {
    const newColumns: Record<ColumnId, KanbanCard[]> = {
      backlog: [],
      todo: [],
      progress: [],
      done: [],
    };

    // Build a lookup of all cards by id
    const allCards: Record<number, KanbanCard> = {};
    for (const col of Object.values(INITIAL_CARDS)) {
      for (const card of col) {
        allCards[card.id] = card;
      }
    }
    // Also include any cards from current state
    for (const col of Object.values(columns)) {
      for (const card of col) {
        allCards[card.id] = card;
      }
    }

    // Read order from DOM
    for (const colId of Object.keys(newColumns) as ColumnId[]) {
      const container = columnRefs.current[colId];
      if (!container) continue;
      const cardEls = container.querySelectorAll("[data-card-id]");
      cardEls.forEach((el) => {
        const cardId = Number(el.getAttribute("data-card-id"));
        if (allCards[cardId]) {
          newColumns[colId].push(allCards[cardId]);
        }
      });
    }

    setColumns(newColumns);
  }, [columns]);

  // Attach SortableJS after mount
  useEffect(() => {
    // Clean up previous instances
    sortableInstances.current.forEach((s) => s.destroy());
    sortableInstances.current = [];

    for (const colId of Object.keys(columnRefs.current) as ColumnId[]) {
      const container = columnRefs.current[colId];
      if (!container) continue;

      const instance = Sortable.create(container, {
        group: "kanban",
        animation: 200,
        ghostClass: "kanban-card--ghost",
        chosenClass: "kanban-card--chosen",
        dragClass: "kanban-card--drag",
        onEnd: () => {
          syncStateFromDOM();
        },
      });

      sortableInstances.current.push(instance);
    }

    return () => {
      sortableInstances.current.forEach((s) => s.destroy());
      sortableInstances.current = [];
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      {/* View header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="nb-view-title">KANBAN</h1>
        <button className="nb-btn nb-btn--primary">+ ADD CARD</button>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[max(500px,calc(100vh-60px-160px))]">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className="border-4 border-signal-black bg-white flex flex-col"
          >
            {/* Column header */}
            <div
              className={`flex items-center justify-between p-4 uppercase font-bold ${col.headerClass}`}
            >
              <h3 className="text-[1.25rem]">{col.label}</h3>
              <span className="font-mono text-[0.85rem] w-7 h-7 flex items-center justify-center border-2 border-current">
                {columns[col.id].length}
              </span>
            </div>

            {/* Cards container */}
            <div
              ref={(el) => {
                columnRefs.current[col.id] = el;
              }}
              className="flex-1 p-2 min-h-[100px] flex flex-col gap-2"
            >
              {columns[col.id].map((card) => (
                <div
                  key={card.id}
                  data-card-id={card.id}
                  className="border-[3px] border-signal-black p-4 bg-white shadow-nb-kanban cursor-grab active:cursor-grabbing transition-[transform,box-shadow] duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:rotate-[-0.5deg] hover:shadow-nb-kanban-hover"
                >
                  <div className="font-bold text-[0.9rem] mb-1">
                    {card.title}
                  </div>
                  {card.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`font-mono text-[0.65rem] uppercase px-2 py-[2px] border-2 border-signal-black ${getTagClasses(tag)}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
